function Sound(id, previewFrom, output, callback){
    
    var TOLERANCE = 250,
        FADE_SPEED = 1500,
        MAX_VOLUME = 100,
        DEFAULT_START = 10000,
        widget = null,
        output = output,
        previewFrom = previewFrom,
        duration = 0,
        currTime = 0,
        volFrom = 0,
        volTo = 0,
        fadeStart = 0,
        fadeEnd = 0,
        onFadeComplete = false,
        cancelLoad = false,
        events = new Events(this);
    
    this.soundId = id;
    this.loaded = false;
    this.playing = false;
    this.volume = 0;

    var self = this;

    this.load = function(callback){
        
        loadIndicator.start();
        
        console.log(this.soundId + ' loading...');
        
        SC.stream('/tracks/' + this.soundId,{
            position: previewFrom || DEFAULT_START,
            autoLoad: true,
            autoPlay: true,
            volume: 0,
            onload: function(sound){
                console.log(self.soundId+' loaded');
            },
            loops: 99999,
            whileplaying: function(pos){

                if(!self.loaded) {
                    
                    console.log(self.soundId+' playable');
                    loadIndicator.stop();
                    self.loaded = true;
                    
                    events.fire('playable');
                    
                }
                
                console.log(self.soundId + ' at position ' + this.position + ', volume ' + self.volume);
            }
        },function(sound){
            widget = sound;
        });
        
        events.on('playable', function(){
            if(typeof callback === 'string' && self[callback]){
                self[callback]();
            } else {
                cb(callback);
            }
        });
        
    }
    
    this.unload = function(callback, quick){
        
        events.off();
        
        if(!this.loaded){
            cb(callback);
            return;
        } 
        
        function ul(){
            widget.destruct();
            self.loaded = false;
            self.playing = false;
            self.volume = 0;
            console.log(self.soundId + " unloaded")
            self.soundId = null;
            if (callback) callback();
        }
        
        if(quick){
            this.volume = 0;
            ul();
        } else {
            this.fadeOut(ul);
        }
        
    }
    
    this.seek = function(time, callback){
        
        if(time < 1) time = duration * time;
        
        widget.setVolume(0);
        widget.play();
        
        widget.unbind(SC.Widget.Events.PLAY_PROGRESS);
        
        widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(progress) {
            
            currTime = progress.currentPosition;
            
            if(currTime <= time - TOLERANCE || currTime >= time + TOLERANCE) {
                
                widget.seekTo(time);
                
            } else {
                
                widget.pause();
                widget.setVolume(this.volume * MAX_VOLUME);
                
                cb(callback);
            
            }
              
        });
        
    };
    
    this.play = function(startTime){
        
        if(!this.loaded || this.playing) return;
        
        widget.play();
        
        this.playing = true;        

    };
    
    this.stop = function(){
        
        if(!this.playing) return;
        
        widget.stop();
        
        this.playing = false;
        
    };
    
    this.step = function(now){
        
        if(output) output(this.volume);

        if(!this.loaded || this.volume === volTo) return;
        
        var now = Date.now();
        
        if (now > fadeEnd){
            
            this.volume = volTo;
            if(onFadeComplete) onFadeComplete();

        } else {
            var progress = (now - fadeStart) / (fadeEnd - fadeStart);
            this.volume = volFrom + (volTo - volFrom) * progress;

        }
        
        widget.setVolume(this.volume * MAX_VOLUME);
        
        var pan = MAX_VOLUME - this.volume * MAX_VOLUME;
        
        widget.setPan(volTo > volFrom ? pan : -pan);
        
        
    }
    
    this.fadeTo = function(toVolume, callback){
        
        if(!this.loaded || toVolume === this.volume) {
            cb(callback);
            return;
        };
        
        fadeStart = Date.now();
        fadeEnd = fadeStart + Math.abs(toVolume - this.volume) * FADE_SPEED;
        volFrom = this.volume;
        volTo = toVolume;
        onFadeComplete = callback || false;
        
        console.log(this.soundId + ' fading from ' + volFrom + ' to ' + volTo);
        
    }
    
    this.fadeIn = function(callback){
        
        if(!this.loaded) return;
        
        this.play();
        this.fadeTo(1, callback);
        
    };
    
    this.fadeOut = function(callback){
        
        if(!this.loaded) {
            events.off('playable');
            this.stop();
            return;
        }

        this.fadeTo(0, function(){
            self.stop();
            cb(callback);
        });
        
    };
    
}

function Mixer(){
        
    var MAX_CHANNELS = 3,
        channels = [];
    
    function getChannelById(id){
        for (var i = 0; i < channels.length; ++i) {
            var ch = channels[i];
            if(ch.soundId === id) return ch;
        }
        return false;
    }
    
    function addChannel(sound){
        
        if(channels.length === MAX_CHANNELS){
            
            var quietest = 1,
                qIndex;
            
            for (var i = 0; i < channels.length; ++i) {
                
                var ch = channels[i];
                
                if(ch.volume <= quietest){
                    quietest = ch.volume;
                    qIndex = i;
                }
                
                if(ch.volume === 0) break;
                
            }
            
            channels[qIndex].unload(false, true);
            channels.splice(qIndex, 1);
            
        }
        
        channels.push(sound);
        
    }
    
    this.play = function(id, startTime, output, callback){
        
        if(muted) return;
        
        var ch = getChannelById(id);
        
        if(ch){
            
            ch[callback]();
            
        } else {
            
            ch = new Sound(id, startTime, output);
            ch.load(callback);
            addChannel(ch);
            
        }
        
    }
    
    this.pause = function(id, callback){
        var ch = getChannelById(id);
        if(ch) ch.fadeOut(callback);
    }
    
    this.step = function(now){
        
        for(var i = 0; i < channels.length; ++i){
            
            channels[i].step(now);
            
        }
        
    }
    
}