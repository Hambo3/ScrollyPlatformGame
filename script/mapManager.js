class MapManger{

    constructor(ctx, md, b){
        this.mapData = null;
        this.lvlData = null;
        this.offset = new Vector2();
        this.planSize = new Vector2(md.size.world.width, md.size.world.height);
        this.mapSize = new Vector2(md.size.world.width, md.size.world.height);
        this.mapSize.Multiply(md.size.tile.width);
        this.screenSize = new Vector2(md.size.screen.width, md.size.screen.height);
        this.screenSize.Multiply(md.size.tile.width);

        this.bounds = new Vector2(this.mapSize.x+b.x,this.mapSize.y+b.y);

        this.tileSize = md.size.tile.width;
        this.scale = 1;
        this.maxScale = 1;
        this.minScale = 0.3;

        this.screenCtx = ctx;

        this.tileCanvas = Util.Context(this.mapSize.x, this.mapSize.y);
        this.osCanvas = Util.Context(this.mapSize.x, this.mapSize.y);

        this.screenCtx.imageSmoothingEnabled = false;        

        this.rend = new Render(this.tileCanvas.ctx);
    }

    get Pos(){
        return {l:this.offset.x, r:this.offset.x+(this.screenSize.x*this.scale)};
    }

    Init(reset, bgData, lvlData){
        if(reset){            
            this.rend.Box(0,0,this.mapSize.x,this.mapSize.y);
        }
        this.mapData = bgData;
        this.lvlData = lvlData;
        this.TileInit();
    }

    Tile(t){
        try {
            for (var i = 0; i < t.t.length; i++) {
                var c = t.t[i];
                var r = t.y;
                this.lvlData[r][c] = 0;

                var p =this.mapData[r][c];
                var pt = new Vector2(c * this.tileSize, r * this.tileSize); 
                var s = GAMEOBJ.find(o=>o.id == p);
                if(s.col){
                    this.rend.Box(pt.x, pt.y,32,32,s.col);
                }
                else{
                    this.rend.Sprite(pt.x+16, pt.y+16, SPRITES.Get(s.src, 0), 1, 0);
                }
            }          
        } catch (error) {
            console.log("Tile" + {error});
        }         
    }

    TileInit(){
        var p,l;
        var col = this.planSize.x;
        var row = this.planSize.y;

        for(var r = 0; r < row; r++) 
        {
            for(var c = 0; c < col; c++) 
            {
                p = this.mapData[r][c];
                l = this.lvlData[r][c];
                var pt = new Vector2(c * this.tileSize, r * this.tileSize);   

                var s = GAMEOBJ.find(o=>o.id == p);
                if(s.col){
                    this.rend.Box(pt.x, pt.y,32,32,s.col);
                }
                else{
                    this.rend.Sprite(pt.x+16, pt.y+16, SPRITES.Get(s.src, 0), 1, 0);
                }

                if(l>0){
                    s = GAMEOBJ.find(o=>o.id == l);
                    if(s.col){
                        this.rend.Box(pt.x, pt.y,32,32,s.col);
                    }
                    else{
                        this.rend.Sprite(pt.x+16, pt.y+16, SPRITES.Get(s.src, 0), 1, 0);
                    }
                }
            }
        }           
    }

    Zoom(rate){
        this.scale = Util.Clamp(this.scale+rate, this.minScale, this.maxScale);
    }

    MaxZoom(){
        this.scale = this.maxScale;
    }

    MinZoom(){
        this.scale = this.minScale;
    }

    ScrollTo(target, lerp){
        var sc = this.screenSize.Clone();
        var bn = this.bounds.Clone();
        sc.Multiply(this.scale);

        var destx = target.x - (sc.x/2);
        var desty = target.y - (sc.y/2);

        if(lerp)
        {
            destx = Util.Lerp(this.offset.x, target.x - (sc.x/2), lerp);
            desty = Util.Lerp(this.offset.y, target.y - (sc.y/2), lerp);
        }

        if(destx < 0){
            destx = 0;
        }
        if(destx > bn.x - (sc.x)){
            destx = bn.x - (sc.x);
        }

        if(desty < 0){
            desty = 0;
        }
        if(desty > bn.y - (sc.y)){
            desty = bn.y - (sc.y);
        }

        this.offset.x = destx;
        this.offset.y = desty;

        return this.offset;
    }

    PreRender(){
        var sc = this.screenSize.Clone();
        sc.Multiply(this.scale);

        this.osCanvas.ctx.drawImage
        (
            this.tileCanvas.canvas, 
            this.offset.x, this.offset.y, sc.x, sc.y,
            0, 0, sc.x, sc.y
        );

        return this.offset;
    }
    
    PostRender(){
        var sc = this.screenSize.Clone();
        sc.Multiply(this.scale);

        this.screenCtx.drawImage
        (
            this.osCanvas.canvas, 
            0, 0, sc.x, sc.y,
            0, 0, this.screenSize.x, this.screenSize.y
        );
    }

    Content(pos){
        var c = Math.floor(pos.x / this.tileSize);
        var r = Math.floor(pos.y / this.tileSize);
        return this.mapData[r][c];
    } 

}