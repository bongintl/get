var Events = function(parent){
    
    var ev = {};
    
    this.on = function(event, callback){
        
        if(typeof callback === 'string' && parent && parent[callback]) callback = parent[callback];
        
        if(!ev[event]) ev[event] = [];
        
        ev[event].push(callback);
        
        return this;
        
    }
    
    this.off = function(event){
        
        if(!event) ev = {};
        
        if(ev[event]) delete ev[event];
        
        return this;
        
    }
    
    this.fire = function(event){
        
        var events = ev[event];

        if(events){
            
            var cancelled = [];
            
            for(var i = 0; i < events.length; ++i){
                
                if(!events[i].apply(parent)) cancelled.push(i);
                
            }
            
            for(i = 0; i < cancelled.length; ++i){
                
                events.splice(cancelled[i], 1);
                
            }
            
        }
        
        return this;
        
    }
    
}