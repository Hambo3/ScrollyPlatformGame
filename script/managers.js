class SpritePreProcessor{

    constructor(source, definition, onReady){
        this.onReady = onReady;
        this.assets = [];
        this.spriteData = definition;
        this.Init(source);
    }

    Get(tag,frame=0, asset){
        var s = this.spriteData[tag];
        return {
            img: asset || this.assets[s.tag],
            pos:s.src[frame],
            dim:{w:s.w,h:s.h}
        };
    }

    Clone(tag, recol){
        if(recol){
            return GfxUtil.HSLReplace(this.assets[tag], recol);
        }
        else{
            return this.assets[tag];
        }
    }

    Init(spriteSource) {
        if(spriteSource){
            var sprites = spriteSource.filter(s => s.src);
            var numAssets = sprites.length;
            var t = this;
            sprites.forEach(function(sheet) 
            {
                var a = new Image();   

                a.src = sheet.src;
                var tag = sheet.tag;
                a.onload = function() { 
                    t.assets[tag] = a;

                    if(--numAssets == 0)
                    {
                        t.PostProcessing(spriteSource);
                    }
                };
            });
        }
    }

    PostProcessing(spriteSource){
        var sprites = spriteSource.filter(s => s.ref);
        var t = this;
        sprites.forEach(function(sheet) 
        {
            if(sheet.recol)
            {
                t.assets[sheet.tag] = GfxUtil.HSLReplace(t.assets[sheet.ref], sheet.recol);
            }
        });   

        if(this.onReady){
            this.onReady();				
        }
    }
}

class Render{

    constructor(context)
    {
        this.ctx = context;
        this.assets = [];
    }

    PT(p){
        return Math.round(p);
    }

    Poly(x, y, poly, col, size)
    {
        for(var i = 0; i < poly.length; i+=2) 
        {
            this.Plane(x, y, poly[i+1],  col[poly[i]],  size);
        } 
    }

    Plane(x, y, pts, col, sz)
    {
        this.ctx.fillStyle = col;
        this.ctx.beginPath();
        var pt = {x:pts[0]*sz, y:pts[1]*sz};
        this.ctx.moveTo(
            this.PT(pt.x  + x), 
            this.PT(pt.y + y)
            );

        for(var p = 2; p < pts.length; p+=2) {
            pt = {x:pts[p]*sz, y:pts[p+1]*sz};
            this.ctx.lineTo(
                this.PT(pt.x + x), 
                this.PT(pt.y + y)
                ); 
        }

        this.ctx.closePath();
        this.ctx.fill();
    }

    Sprite(x, y, sprite, scale, angle=0, op){
        var dim = sprite.dim;   

        this.ctx.save();
        this.ctx.translate(this.PT(x), this.PT(y));
        this.ctx.rotate(angle);  
        // this.ctx.shadowColor = '#222';
        // this.ctx.shadowBlur = 10;
        // this.ctx.shadowOffsetX = 10;
        // this.ctx.shadowOffsetY = 10;
        if(sprite.pos.m){
            this.ctx.scale(-1,1);
        }

        if(op){
            this.ctx.globalAlpha = op;
        }

        this.ctx.drawImage(sprite.img, sprite.pos.x, sprite.pos.y, dim.w, dim.h,
            -((dim.w* scale)/2), -((dim.h* scale)/2), dim.w * scale, dim.h * scale);
        this.ctx.restore();
    }

    Tile(x, y, sprite, scale){
        var dim = sprite.dim;  

        this.ctx.save();
        this.ctx.translate(this.PT(x), this.PT(y));
        if(sprite.pos.m){
            this.ctx.scale(-1,1);
        }
        this.ctx.drawImage(sprite.img, sprite.pos.x, sprite.pos.y, dim.w, dim.h,
            -((dim.w* scale)/2), -((dim.h* scale)/2), dim.w * scale, dim.h * scale);
        this.ctx.restore();    
    }

    Image(img, pos, size, src, clip, op){
        this.ctx.drawImage
        (
            img, 
            src.x, src.y, clip.x, clip.y,
            pos.x, pos.y, size.x, size.y
        );
    }

    Box(x,y,w,h,c){
        this.ctx.fillStyle = c || '#000000';
        this.ctx.fillRect(x, y, w, h);
    }

    Circle(x,y,r,c){
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = c;
        this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    Text(str, xs, ys, size, sc, col) {

        str = !isNaN(str) ? ""+str : str;
        this.ctx.fillStyle = col || '#000000';

        var cr = xs;
        var blockSize = new Vector2(0,0);

        for (var i = 0; i < str.length; i++) {
            var xp = 0;
            var yp = 0;
            var mx = 0; 

            var chr = str.charAt(i);
            if(chr == '|')
            {
                ys += (size*8);
                xs=cr;
            }
            else
            {
                var l = FONT[str.charAt(i)];
                var chrSize = new Vector2(0,0);
                for (var r = 0; r < l.length; r++) 
                {
                    chrSize.x = 0;
                    xp = 0;
                    var row = l[r];
                    for (var c = 0; c < row.length; c++) 
                    {                    
                        var szx = (sc && c==row.length-1) ? size*2 : size;
                        var szy = (sc && r==l.length-1) ? size*2 : size;
                        if (row[c]) {
                            this.ctx.fillRect(Math.round(xp + xs), Math.round(yp + ys), szx, szy);
                        }
                        xp += szx;
                        chrSize.x += szx;
                    }
                    mx = xp>mx ? xp : mx;
                    yp += szy;
                    chrSize.y += szy;
                }
                blockSize.x += chrSize.x + size;
                blockSize.y = chrSize.y;

                xs += mx + size; 
            }
        }

        return blockSize;
    } 
}
