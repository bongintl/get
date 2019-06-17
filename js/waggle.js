// Requires perlin.js

noise.seed(0.4382650712504983);
noise.seed(Math.random());

var TAU = Math.PI * 2;

function Waggles(canvas, lineHeight, speed){
    
    var speedMs = speed / 1000,
        ctx = canvas.getContext('2d');
    
    this.lines = [];
    
    var t = 0;
    
    this.add = function (x, type){
        
        var y = (this.lines.length * lineHeight) + 26//(lineHeight/2);
        
        var line = new Waggle(x, y, type)
        
        this.lines.push(line);
    
        var oldImg = ctx.getImageData(0,0,canvas.width, canvas.height);
        canvas.height += lineHeight;
        ctx.putImageData(oldImg, 0,0);
        
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = night ? 'white' : 'black';
        ctx.moveTo(0,y);
        ctx.lineTo(x,y);
        ctx.stroke();
        
        return line;
        
    }
    
    this.step = function(now, then){
        
        var deltaT = now - then,
            deltaX = Math.min(deltaT * speedMs, speed);
        
        var oldImg = ctx.getImageData(deltaX, 0, canvas.width - deltaX, canvas.height);
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.putImageData(oldImg, 0,0);
        
        ctx.beginPath();
        
        var line;
        
        for(var i = 0; i < this.lines.length; ++i){
            
            line = this.lines[i];
            
            line.step(now);
            
            if(/*line.radius > 0*/ false){
                var to0 = (255 - Math.round(line.radius * 255))
                ctx.strokeStyle = 'rgb(255,'+to0+','+to0+')';
                ctx.moveTo(line.last.x - deltaX, line.last.y);
                ctx.lineTo(line.curr.x, line.curr.y); 
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = 'white';
            } else {
                ctx.moveTo(line.last.x - deltaX, line.last.y);
                ctx.lineTo(line.curr.x, line.curr.y); 
            }
            

        }
        
        ctx.stroke();
        
    }
    
}

function Waggle(x,y,type){
    
    this.radius = 0;
    this.last = {x: x, y: y};
    this.curr = {x: x, y: y};
    
    var center = {x:x, y:y},
        currRadius = 0,
        MAX_RADIUS = 26;
    
    var self = this;
    
    this.input = function(x){
        self.radius = x;
    }
    
    this.step = function(t){
        
        this.last = this.curr;
        
        //if(this.radius > currRadius) currRadius += Math.pow((this.radius - currRadius) / this.radius, 2);
        //if(this.radius < currRadius) currRadius -= .5;
        
        //currRadius = Math.max(currRadius, 0);
        
        currRadius = this.radius * MAX_RADIUS;
        
        if(currRadius === 0) {
            this.curr = center;
            return;
        }
        
        var offset = waves[type](currRadius, t);
        
        this.curr = {
            x: center.x + offset.x,
            y: center.y + offset.y
        }
        
        this.radius = 0;
        
    }
    
    var waves = {
        sine: function(radius, t){
                t /= 300;
                return {
                    x: 0,
                    y: Math.sin(t) * radius
                };
        }, surf: function(radius, t){
            t /= 100;
            return {
                x: Math.cos(t + Math.PI/2)  * radius * 2 + radius * 2,
                y: Math.sin(t) * radius
            };
        }, scribbleY: function(radius, t){
            return {
                x: 0,
                y: noise.simplex2(t/300, 500) * radius
            };
        }, scribbleXY: function(radius, t){
            return {
                x: noise.perlin2(500, t) * radius,
                y: noise.perlin2(t, 500) * radius
            };
        }, level: function(radius, t){
            return {
                x: 0,
                y: -radius
            }
        }
    }
    
}

function Line(w, h, start, end){
    
    var y = h/2,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
        
    canvas.width = w;
    canvas.height = h;
    
    var points = [];
    
    function newPoint(x, y){
        
        var point;
        
        if(Line.pool.length) {
            point = Line.pool.pop();
        } else {
            point = {};
        }
        
        point.x = x;
        point.y = y;
        
        return point;
        
    }
    
    function removePoint(index){
    
        Line.pool.push(points.splice(index, 1));
        
    }
    
    this.idle = function(){
        
    }
    
    this.draw = function(t){
        
        
        
        var pt = newPoint();
        
        ctx.beginPath();
        
        
        
        for(var i = points.length - 1; i >= 0; --i){
            
            pt = points[i];
            
            if(i < points.length - 1) pt.x -= xdelta;
            
            ctx.lineTo(points[i].x, points[i].y);
            
        }
        
    }
    
    var waves = {
        sine: function(radius, t){
                t /= 300;
                return {
                    x: 0,
                    y: Math.sin(t) * radius
                };
        }, surf: function(radius, t){
            t /= 100;
            return {
                x: Math.cos(t + Math.PI/2)  * radius * 2 + radius * 2,
                y: Math.sin(t) * radius
            };
        }, scribbleY: function(radius, t){
            return {
                x: 0,
                y: noise.simplex2(t/300, 500) * radius
            };
        }, scribbleXY: function(radius, t){
            return {
                x: noise.perlin2(500, t) * radius,
                y: noise.perlin2(t, 500) * radius
            };
        }, level: function(radius, t){
            return {
                x: 0,
                y: -radius
            }
        }
    }
    
}

Line.pool = [];