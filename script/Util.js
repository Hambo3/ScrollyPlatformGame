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
    UnpackWorldObjects: function(m, o){
        var objs = [];
        for (var r = 0; r < m.length; r++) {
            var last = {};
            var l = 0;
            for (var c = 0; c < m[r].length; c++) {
                var sp = GAMEOBJ[m[r][c]];
                if(sp.s)
                {
                    l++;
                }
                else
                {                    
                    if(last.s)
                    {
                        objs.push({x:c-l,y:r,w:l});
                    }
                    l = 0;
                }

                last = sp;//m[r][c];
            }
            if(l > 0){
                objs.push({x:c-l,y:r,w:l});
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
        var s = "";
        for (var i = 0; i < map.length; i++) {
            s+=map[i]+","           
        }

        return map;
    }

}

var GfxUtil = {
    hexToRgb: function(color) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		color = color.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : {
			r: 0,
			g: 0,
			b: 0
		};
    },
    rgbToHsl: function(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
      
        if(max == min){
          h = s = 0; // achromatic
        }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
      
        return({
          h:h,
          s:s,
          l:l,
        });
    }, 
    hue2rgb: function(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
    }, 
    hslToRgb: function(h, s, l){
        var r, g, b;
      
        if(s == 0){
          r = g = b = l; // achromatic
        }else{      
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = GfxUtil.hue2rgb(p, q, h + 1/3);
          g = GfxUtil.hue2rgb(p, q, h);
          b = GfxUtil.hue2rgb(p, q, h - 1/3);
        }
      
        return({
          r:Math.round(r * 255),
          g:Math.round(g * 255),
          b:Math.round(b * 255),
        });
    },
    HSLReplace: function(srcImg, colInfo){
		// create hidden canvas (using image dimensions)
        var tol = 5;
		var canvas = document.createElement("canvas");
		canvas.width = srcImg.width;
		canvas.height = srcImg.height;

		var ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(srcImg,0,0);

		var imageData = ctx.getImageData(0,0, srcImg.width, srcImg.height);

		var data = imageData.data;

        for(var j=0; j < colInfo.length; j++){
            var srcHue = colInfo[j].src;
            var newHue = colInfo[j].hue;
            var newLpc = colInfo[j].lpc;
            for(var i=0; i < data.length; i+=4){
                red = data[i+0];
                green = data[i+1];
                blue = data[i+2];
                alpha = data[i+3];

                // skip transparent/semiTransparent pixels
                if(alpha > 230)
                {
                    var hsl = GfxUtil.rgbToHsl(red,green,blue);
                    var hue = parseInt(hsl.h*360);
                    //var sat = parseInt(hsl.s*100);
                    //var lgt = parseInt(hsl.l*100);

                    if(hue > (srcHue-tol) && hue < (srcHue+tol) )
                    {
                        var newRgb = GfxUtil.hslToRgb(
                            newHue ? newHue/360 : hsl.h, 
                            hsl.s, 
                            newLpc ? hsl.l*newLpc : hsl.l);
                        data[i+0]=newRgb.r;
                        data[i+1]=newRgb.g;
                        data[i+2]=newRgb.b;
                        data[i+3]=alpha;
                    }
                }

            }
        }

        ctx.putImageData(imageData, 0, 0);        

		// replace image source with canvas data
		var destImg = new Image();
        destImg.src = canvas.toDataURL();
        return destImg;
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
        GetCollectable: function(){
            return list.filter(l => l.enabled && l.collectable);
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

