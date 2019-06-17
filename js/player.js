function loadPlayerSequence(rows){
    
    var i = 0,
        player;
    
    function loadPlayer(row){
        
        if(i === rows.length) return;
        
        player = new Player(row, i);
        
        player.load(function(){
            
            players.push(player);
            
            loadPlayer(rows[++i]);
        
        });
        
    }
    
    loadPlayer(rows[i]);
    
};

function Player(row){
    
    var loaded = false;
    
    var self = this;
    
    this.load = function(callback){
        
        var titleWidth = row.querySelector('.artist').offsetWidth;
        
        self.line = waggler.add(1140 - titleWidth, 'scribbleY');
        
        row.addEventListener('mouseenter', function(){
            mixer.play(row.dataset.track, false, self.line.input, 'fadeIn');
        });   
        
        row.addEventListener('mouseleave', function(){
            mixer.pause(row.dataset.track);
        });
        
        if(callback) callback();
        
        /*
        
        this.sound = new Sound();
        
        this.sound.load(row.dataset.track, false, function(){
            
            var titleWidth = row.querySelector('.title').offsetWidth;
        
            self.line = waggler.add(1140 - titleWidth, 'scribbleY');
            
            row.addEventListener('mouseenter', function(){
                //self.sound.fadeIn();
            });
            
            row.addEventListener('mouseleave', function(){
                //self.sound.fadeOut();
            });
            
            loaded = true;
            
            if(callback) callback();
            
        });
        
        */
    };
    
    this.tick = function(now){
        
        if(!loaded) return;
        
        this.sound.step(now);
        this.line.radius = this.sound.volume;
        this.line.step(now);
        
    };
    
    
}