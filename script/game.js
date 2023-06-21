class Blocky{

    constructor(canvas, objects)
    {
        this.offset;

        this.gameObjects = new ObjectPool();
        this.particles = new ObjectPool(); 
    
        // Gravity
        this.mGravity = new Vector2(0, 100);

        this.plr = new Player( Input,
            new Vector2(2.5*32, (MAP.planSize.y-7)*32), 32, 32, 2, 0, 0);
        this.gameObjects.Add(this.plr);  

        this.gameObjects.Add(
            new StaticBody([],C.ASSETS.GROUND, 
                new Vector2((MAP.planSize.x/2)*32, (MAP.planSize.y*32)+16), 
                            MAP.planSize.x*32, 32, 0, 0.2, .2)
            );



        var mapData = this.CreateMap(MAP.planSize.x, MAP.planSize.y);    

        //this.CreateLevel(mapData, -18, MAP.planSize.x, MAP.planSize.y);

        //this.CreateLevel(mapData, -12, MAP.planSize.x, MAP.planSize.y);

        this.CreateLevel
        //this.DebugCreateLevel
        (mapData, -6, MAP.planSize.x, MAP.planSize.y);

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

        this.chaser = new Chaser(this.plr, new Vector2(-400,-100));
        this.gameObjects.Add(this.chaser);
    }

    CreateMap(w, h){
        var map = [];    
        for (let r=0; r<h; r++){
            var a = new Array(w); for (let i=0; i<w; i++) a[i] = 0;
            map.push(a);
        }
        return map;
    }

    DebugCreateLevel(map, l, w, h){
        
        var y = h+l;
        var t = 0;
        var x=this.Section(map, y, 0, 7, h, 18);
       
    }

    CreateLevel(map, l, w, h){
        
        var y = h+l;
        var t = 0;
        var x=this.Section(map, y, 0, 7, h, 8);

        do{
            t = Util.OneOf([t==0?1:0,1]);
            if(t){
                t=Util.OneOf([7,9]);
            }
            var n = Util.RndI(t==0?1:2, t==0?4:6);
            var ys = t==0?0:Util.RndI(-1,2);
            if(y+ys < h){
                y+=ys;
            }
            if(x+n > w){
                n = w-x;
            }

            x=this.Section(map, y, x, t, h, n);
        }while(x<w);        
    }

    Section(map, y, x, t, h, n){
        for (let r=0; r<n; r++){ 

            map[y][x] = t==9 && r==0 ? t-1 :
                        t==9 && r==n-1 ? t+1 :
                        t;
            for (let c=y+1; c<h; c++){ 
                map[c][x] = t==0?0:1;
            }
            x++;
        }
        return x;
    }
    PlatformBreak(t){
        for (var i = 0; i < t.t.length; i++) {
            var c = t.t[i];
            var r = t.y;

            var pt = new Vector2(c * MAP.tileSize, r * MAP.tileSize); 
            var d = BlockFactory.Create(Util.OneOf([12,11]), pt.x, pt.y, 0, 
                new Vector2(0,0));
            this.gameObjects.Add(d); 
        }
    }
    Launch(x, y, V){
        var d = BlockFactory.Create(Util.OneOf([4,5,6,13,14,16]), x, y, 0, 
            new Vector2(0,0));
        d.V = V; 
        d.v = Util.Rnd(1)-0.5;
        this.gameObjects.Add(d); 
    }

    AddObject(x, y, V){
        var d = new Shot(new Vector2(x, y));
        d.V = V;    
        this.gameObjects.Add(d);
    }

    ParticleGen(pos, n, cols, sz)
    {        
        var s = sz || 2;
        var ln = cols.length;
        for (var i = 0; i < n*4; i++) {
            var b = this.particles.Is(0);

            if(!b){
                b = new Particle(pos.Clone());
                this.particles.Add(b);
            }
            var l = Util.RndI(0,ln);
            b.pos = pos.Clone();
            b.body = [
                [0,[-s,s, -s,-s, s,-s, s,s]]
            ];
            b.enabled = 1;
            b.op = 1;
            b.rgb = cols[l] instanceof Object ? cols[l] : new Color(cols[l]);

            var sp = 4 + (parseInt(i/4)*4);
            b.speed = Util.RndI(sp, sp+4);
            b.dir = new Vector2(Util.Rnd(2)-1, Util.Rnd(2)-1);
        }
    }
    
    Update(dt)
    {   
        //TODO zoom depending on how close to the edge
    //     this.offset = MAP.ScrollTo(new Vector2(
    //         this.plr.C.x > this.chaser.pos.x ? this.plr.C.x : this.chaser.pos.x, 
    //         this.plr.C.y));
        this.offset = MAP.ScrollTo(new Vector2(this.plr.C.x, this.plr.C.y));
        
        if(Input.IsDown('x') ) {
            MAP.Zoom(0.01);
        }
        else if(Input.IsDown('z') ) {
            MAP.Zoom(-0.01);
        }

        var objects = this.gameObjects.Get();

        // Compute collisions
        var p = this.gameObjects.Get([C.ASSETS.NONE],1);
        var clx = PHYSICS.Update(p, dt);

        for (var i = 0; i < objects.length; i++) {
            var ci = clx.filter(c=>c.P1 == objects[i] || c.P2 == objects[i]);
            objects[i].Update(dt, ci);
        }

        var p = this.particles.Get();

        for (var i = 0; i < p.length; i++) {
            p[i].Update(dt);
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

        var p = this.particles.Get();
        for (var i = 0; i < p.length; i++) {
            p[i].Render(this.offset.x, this.offset.y);
        }

        MAP.PostRender();
  
        Input.Render();

        DEBUG.Print("O X:",MAP.Pos.l);
        DEBUG.Print("O Y:",MAP.Pos.r);
    }
}