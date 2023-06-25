var EasingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t * t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t * (2 - t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t * t * t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t) * t * t + 1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t * t * t * t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1 - (--t) * t * t * t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t * t * t * t * t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t },
    // elastic bounce effect at the beginning
    easeInElastic: function (t) { return (.04 - .04 / t) * Math.sin(25 * t) + 1 },
    // elastic bounce effect at the end
    easeOutElastic: function (t) { return .04 * t / (--t) * Math.sin(25 * t) },
    // elastic bounce effect at the beginning and end
    easeInOutElastic: function (t) { return (t -= .5) < 0 ? (.01 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 }
}


var Util = {
    PercentChance: function(p){
        return Util.RndI(0,100) < p;
    },
    OneIn: function(c){
        return Util.RndI(0,c)==0;
    },
    OneOf: function(arr){
        return arr[Util.RndI(0,arr.length)];
    },
    Clamp: function(v, min, max){        
        return Util.Min(Util.Max(v, min), max);
    },
    Lerp: function(start, end, amt)
    {
        return (end-start) * amt+start;
    },
    InvLerp: function(start, end, amt)
    {
        return (amt-start) / (end - start);
    },
    Remap: function(origFrom, origTo, targetFrom, targetTo, value)
    {
        var rel = Util.InvLerp(origFrom, origTo, value);
        return Util.Lerp(targetFrom, targetTo, rel);
    },
    //int min to max-1
    RndI: function (min, max){
        return parseInt(Math.random() * (max-min)) + min;
    },
    Rnd: function (max){
        return Math.random() * max;
    }, 
    Min: function(a, b)
    {
        return (a<b)? a : b;
    },
    Max: function(a, b){
        return (a>b)? a : b;
    },
    Randomise: function(arr, index)
    {
        var i = index || 0;
        return arr.slice(0, i).concat(arr.slice(i).sort(() => Math.random() - 0.5));
    },
    // Converts from degrees to radians.
    Radians: function(degrees) {
        return degrees * Math.PI / 180;
    },    
    // Converts from radians to degrees.
    Degrees: function(radians) {
        return radians * 180 / Math.PI;
    }, 
    AngleToTarget: function(prot, perp) {
        var angle = Math.atan2(perp.x - prot.x, perp.y - prot.y);
        angle = angle * 360 / (2*Math.PI);
        if(angle < 0) {
            angle += 360;
        }
        return angle;
    }, 
    PointAngle: function(radius, angle){
        var r = Util.Radians(angle);
        return {x: Math.sin(r) * radius,
                y: Math.cos(r) * radius};
    },
    Wave: function(a,w,x,y){
        //var yp = Wave(20, 0.05, x, y);
        return a * Math.sin(w * x) + y;
    },
    SetRotation: function(dir, val){
        dir += val;
        if(dir > 359){
            dir -= 359;
        }
        if(dir < 0){
            dir += 359;
        }

        return dir;
    },
    Context: function(w, h){
        var canvas = document.createElement('canvas');
        canvas.width = w;
		canvas.height = h;
        return {ctx:canvas.getContext('2d'), canvas:canvas};
    },
    TxtLen: function(txt, sz, c){
        return (c) ? (txt.length*(sz*4.5))/2 : txt.length*(sz*4.5);
    },
    UnpackMap: function(zip){
        var map = [];
        var v, pts;
        var sec = zip.split("|");
        for(var i = 0; i < sec.length; i++){
            pts= sec[i].split(",");
            v = parseInt(pts[0]);
            map.push(v);
            if(pts.length > 1){                
                for(var p = 1; p < pts[1]; p++){
                    map.push(v);
                }
            }
        }

        var mapArr = [];
        var row = [];        
        for (var i = 0; i < map.length; i++) {
            row.push(map[i]);
            if((i+1)%37==0){
                mapArr.push(row);
                row=[];
            }
        }
        return mapArr;
    },
    UnpackWorldObjects: function(m){
        var objs = [];
        for (var r = 0; r < m.length; r++) {
            var last = {};
            var l = 0;
            var sp = 0;
            for (var c = 0; c < m[r].length; c++) {
                sp = GAMEOBJ[m[r][c]];
                if(sp.s && (sp.pid == last.pid || !last.s)){
                    l++;
                }
                else{
                    if(l){
                        objs.push({x:c-l,y:r,w:l,s:last.id,d:last.dm});
                    }
                    l=sp.s?1:0;
                }
                last = sp;
            }
            if(l > 0){
                objs.push({x:c-l,y:r,w:l,s:sp.id,d:sp.dm});
            }            
        }


        for (var i = 0; i < objs.length; i++) {
            var t = [];
            for (var c = 0; c < objs[i].w; c++) {
                t.push(objs[i].x+c);
            }
            objs[i].t = t;
        }

        return objs;
    },
    Unpack: function(zip){
        var map = [];
        var v, pts;
        var sec = zip.split("|");
        for(var i = 0; i < sec.length; i++){
            pts= sec[i].split(",");
            v = parseInt(pts[0]);
            map.push(v);
            if(pts.length > 1){                
                for(var p = 1; p < pts[1]; p++){
                    map.push(v);
                }
            }
        }
        return map;
    }    

}

// a v simple object pooler
var ObjectPool = function () {
    var list = [];

    return {
        Is: function(type){
            for (var i = 0; i < list.length; i++) {
                if (list[i].enabled == false && list[i].type == type)
                {
                    return list[i];
                }
            }
            return null;
        },
        Add: function(obj){
            list.push(obj);
        },
        Get: function(type, not){
            if(type){
                if(not){
                    return list.filter(l => l.enabled && type.indexOf(l.type) == -1);
                }else{
                    return list.filter(l => l.enabled && type.indexOf(l.type) != -1);
                }
            }else{
                return list.filter(l => l.enabled);
            }
        },

        Count: function(all, type){
            if(type){
                return (all) ? list.filter(l => type.indexOf(l.type) != -1).length 
                        : list.filter(l => l.enabled && type.indexOf(l.type) != -1).length;
            }
            else{
                return (all) ? list.length : list.filter(l => l.enabled).length;
            }
        },
        Delete: function(obj){
            var n = list.filter(l => l != obj);
            list = n;
        },
        Remove: function(type, not) {
            var n = [];
            if(not){
                n = list.filter(l => type.indexOf(l.type) != -1);
            }
            else{
                n = list.filter(l => type.indexOf(l.type) == -1);
            }
            
            list = n;
        },
        Clear: function(){
            list = [];
        },
        Select: function(x, y){
            return list.find(l => 
                (x> (l.C.x-(l.W/2)) && x < (l.C.x+(l.W/2))) &&
                (y > (l.C.y-(l.H/2)) && y < (l.C.y+(l.H/2))));
        },
    }
};

