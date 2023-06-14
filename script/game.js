class Blocky{

    constructor(canvas, objects)
    {

        this.editorEnabled = 0;
        this.offset;

        this.gameObjects = new ObjectPool();

        // Gravity
        this.mGravity = new Vector2(0, 100);

        this.plr = new Player( Input,
                new Vector2(2.5*32, 6*32), 32, 32, 2, 0, 0);
        this.gameObjects.Add(this.plr);

        this.gameObjects.Add(
            new StaticBody([],C.ASSETS.GROUND, 
                new Vector2((MAP.planSize.x/2)*32, (MAP.planSize.y*32)+16), 
                            MAP.planSize.x*32, 32, 0, 0.2, .2)
            );
        
        var mapData = this.CreateMap(MAP.planSize.x, MAP.planSize.y);    

        this.CreateLevel(mapData, -18, MAP.planSize.x, MAP.planSize.y);

        this.CreateLevel(mapData, -12, MAP.planSize.x, MAP.planSize.y);

        this.CreateLevel(mapData, -6, MAP.planSize.x, MAP.planSize.y);

        MAP.Init(true, mapData);
        var blocks = Util.UnpackWorldObjects(mapData);

        for (var i = 0; i < blocks.length; i++) 
        {
            var b = blocks[i];
            var w = b.w*32;
            var s = new StaticBody(b, C.ASSETS.PLATFORM, 
                new Vector2((b.x*32)+w/2, (b.y*32)+16), w, 32, 0, 0.2, .2, b.d); 
            this.gameObjects.Add(s);
        }

        var c = new Chaser(this.plr, new Vector2(-400,-100));
        this.gameObjects.Add(c);
        if(this.editorEnabled){
            this.editor = new Editor(canvas, this.gameObjects, objects);        
        }
    }

    CreateMap(w, h){
        var map = [];    
        for (let r=0; r<h; r++){
            var a = new Array(w); for (let i=0; i<w; i++) a[i] = 0;
            map.push(a);
        }
        return map;
    }

    CreateLevel(map, l, w, h){
        var x = 0;
        var y = h+l;
        var t = 0;
        do{
            t = Util.OneOf([t==0?6:0,6]);
            if(t){
                t=Util.OneOf([6,12]);
            }
            var n = Util.RndI(t==0?1:2, t==0?4:6);
            var ys = t==0?0:Util.RndI(-1,2);
            if(y+ys < h){
                y+=ys;
            }
            if(x+n > w){
                n = w-x;
            }

            for (let r=0; r<n; r++){ 
                map[y][x] = t;
                for (let c=y+1; c<h; c++){ 
                    map[c][x] = t==0?0:1;
                }
                x++;
            }
        }while(x<w);        
    }

    PlatformBreak(t){
        for (var i = 0; i < t.t.length; i++) {
            var c = t.t[i];
            var r = t.y;

            var pt = new Vector2(c * MAP.tileSize, r * MAP.tileSize); 
            var d = BlockFactory.Create(this.gameObjects, Util.OneOf([16,17]), pt.x, pt.y, 0, 
                new Vector2(0,0));
            //this.gameObjects.Add(d); 
        }
    }
    Launch(x, y, V){
        var d = BlockFactory.Create(this.gameObjects, Util.OneOf([4,5,7,8,10,11,13,14,15]), x, y, 0, new Vector2(0,0));
        d.V = V; 
        //this.gameObjects.Add(d); 
    }

    AddObject(x, y, V){
        var d = new Shot(new Vector2(x, y));
        d.V = V;    
        this.gameObjects.Add(d);
    }

    Update(dt)
    {   
        this.offset = MAP.ScrollTo(new Vector2(this.plr.C.x, this.plr.C.y));
        
        if(Input.IsDown('x') ) {
            MAP.Zoom(0.01);
        }
        else if(Input.IsDown('z') ) {
            MAP.Zoom(-0.01);
        }

        var objects = this.gameObjects.Get();

        for (var i = 0; i < objects.length; i++) {
            objects[i].Update(dt);
        }

        // Compute collisions
        var p = this.gameObjects.Get([C.ASSETS.NONE],1);
        PHYSICS.Update(p, dt);

        if(this.editorEnabled){
            this.editor.Update(dt);
        }
    }

    Render()
    {

        MAP.PreRender();

        //render objects
        var objects = this.gameObjects.Get();
        for (var i = 0; i < objects.length; i++) {
            objects[i].Render(this.offset.x, this.offset.y);            
        }

        if(this.editorEnabled){
            this.editor.Render(this.offset.x, this.offset.y);       
        }

        MAP.PostRender();
  
        Input.Render();

        DEBUG.Print("O X:",MAP.Pos.l);
        DEBUG.Print("O Y:",MAP.Pos.r);
    }
}