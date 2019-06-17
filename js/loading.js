var Loading = function(on, off, delay){
    
    var delay = delay === undefined ? 1000 : delay,
        timer = false,
        thingsLoading = 0;
    
    this.start = function(){
        
        if(++thingsLoading >= 2) return;
        
        timer = setTimeout(function(){
            timer = false;
            on();
        }, delay);
        
    };
    
    this.stop = function(){
        
        if(--thingsLoading >= 1) return;
        
        if(timer){
            timer = clearTimeout(timer);
        } else {
            off();
        }
        
    }
    
};