class Blocky{//TBA

    constructor(canvas, objects)
    {
        this.score = 0;
        this.plrStart = 80;

        this.gameTimer = null;
        this.gameMode = C.GAMEMODE.TITLE;
        this.level = 0;
        this.offset;
        this.gameObjects = new ObjectPool();
        this.particles = new ObjectPool(); 
        this.introTony = {x:240, y:500, src:'player', sz:0.1, r:0, yv:0, svv:0};
        // Gravity
        this.mGravity = new Vector2(0, 100);

        this.plr = null;  

        var mapData = this.CreateMap(MAP.planSize.x, MAP.planSize.y);
        var levelData = [];
        this.CreateMapRows(levelData,MAP.planSize.x,0,MAP.planSize.y,0)
        this.TitleLevel(mapData, levelData, -6, MAP.planSize.x, MAP.planSize.y);

        MAP.Init(true, mapData, levelData);

        this.plr = new Player( Input,
            new Vector2(this.plrStart, (MAP.planSize.y-7)*32), 32, 32, 2, 0, 0);
        this.gameObjects.Add(this.plr);
        this.plr.enabled = 0;

        this.chaser = new Chaser(new Vector2(-(MAP.mapSize.x/2),-100), 
            MAP.mapSize.x - 200, 60);
        this.gameObjects.Add(this.chaser);
    }

    CreateMapRows(map,w,s,e,t){
        for (let r=s; r<e; r++){
            var a = new Array(w); 
            for (let i=0; i<w; i++) a[i] = t;
            map.push(a);
        }
    }
    CreateMap(w, h){
        var map = [];   
        this.CreateMapRows(map,w,0,12,0);
        this.CreateMapRows(map,w,12,h,1);
        return map;
    }

    TitleLevel(map, lvl, l, w, h){
        var y = h+l;
        var f = FEATURE[0];
        var t = f.t;
        var n = f.n[0];
        var x=this.Section(map, lvl, y, 0, t, h, n);
    }

    CreateLevel(map, lvl, l, w, h){        
        var y = h+l;
        var t = [7];
        var x = this.Section(map, lvl, y, 0, t, h, 8);
        var fc = 0;
        var n, ys;
        var o = 0;
        var l2 = null;
        do{
             if(fc>12){
                fc = 0;
                var f = FEATURE[Util.RndI(1,7)];
                t = f.t;
                n = Util.RndI(f.n[0], f.n[1]);
                o = f.o;
                if(l2==null && f.l2){
                    l2 = {t:[Util.OneOf([7,9])], 
                        y: y+f.l2.y, 
                        x: x+f.l2.x, 
                        n:Util.RndI(3, 6),
                        m:0};
                }
             }
             else{
                var b = t[t.length-1];
                b = (b==0 || b == 9)
                    ? 7
                    : Util.OneOf([0,7,9]); //gap or plat

                n = Util.RndI(b==0 ? 1 : 2, b==0 ? 4 : 6);
                ys = b==0 ? 0 : Util.RndI(-1,2);
                if(y+ys < h && (l2 == null || l2.y-y>4)){
                    y+=ys;
                }

                o = 0;
                t=[b];
            }

            if(x+n > w){
                n = w-x;
            }

            if(o){
                for (let i=0; i<o.p.length; i++){
                    var d = BlockFactory.Create(o.t, (x*32)+16+o.p[i].x, (y*32)+16+o.p[i].y, 0);
                    this.gameObjects.Add(d);
                }
            }

            x = this.Section(map, lvl, y, x, t, h, n);

            if(l2){
                if(l2.x+l2.n > w){
                    l2.n = w-l2.x;
                }

                l2.x = this.Section(map, lvl, l2.y, l2.x, l2.t, 0, l2.n);
                l2.m+=l2.n;
                
                ys=Util.RndI(-1,2);

                if(y-(l2.y+ys) > 4 && y-(l2.y+ys) < 10)
                {
                    l2.y+=ys;
                }

                l2.t=[Util.OneOf([0,7,9])];
                if(l2.m>32){
                    l2=null;
                }
            }

            fc += n;
        }while(x<w);
    }

    Section(map, lvl, y, x, tt, h, n){
        for (let r=0; r<n; r++)
        {         
            for (let rr=0; rr<tt.length; rr++)
            { 
                var t=tt[rr];
                lvl[y][x] = t==9 && r==0 ? t-1 :    //log 
                            t==9 && r==n-1 ? t+1 :  //ends
                            t;
                for (let c=y+1; c<h; c++){ 
                    map[c][x] = t==0?map[c][x]:2;
                }
                x++;
            }
        }
        return x;
    }
    PlatformBreak(t){
        for (var i = 0; i < t.t.length; i++) {
            var c = t.t[i];
            var r = t.y;

            var pt = new Vector2(c * MAP.tileSize, r * MAP.tileSize); 
            var d = BlockFactory.Create(Util.OneOf([12,11]), pt.x, pt.y, 0);
            this.gameObjects.Add(d); 
        }
    }
    Launch(x, y, V){
        var d = BlockFactory.Create(Util.OneOf([4,5,6,13,14]), x, y, 0);
        d.V = V; 
        d.v = Util.Rnd(1)-0.5;
        this.gameObjects.Add(d); 
    }

    AddObject(x, y, V){
        var d = new Shot(new Vector2(x, y));
        d.V = V;    
        this.gameObjects.Add(d);
    }

    ParticleGen(pos, n, cl, sz)
    {        
        var cols = [];
        cl.forEach(c => {
            cols.push(DEFS.spritePal[c]);
        });

        var s = sz || 2;
        var s2 = s*2;
        var ln = cols.length;
        for (var i = 0; i < n*4; i++) {
            var b = this.particles.Is(0);

            if(!b){
                b = new Particle(pos.Clone());
                this.particles.Add(b);
            }
            var l = Util.RndI(1,ln);
            var lb = 0;
            b.pos = pos.Clone();
            b.body = [
                //[0,[-s,s, -s,-s, s,-s, s,s]],
                [0,[-s2,-s, s2,-s, 0,s]]
            ];
            b.enabled = 1;
            b.op = 1;
            b.rgb = cols[l] instanceof Object ? cols[l] : new Color(cols[l]);
            b.bRgb = cols[lb] instanceof Object ? cols[lb] : new Color(cols[lb]);

            var sp = 4 + (parseInt(i/4)*4);
            b.speed = Util.RndI(sp, sp+4);
            b.dir = new Vector2(Util.Rnd(2)-1, Util.Rnd(2)-1);
        }
    }
    

    IsLeftBehind(x){
        return x < this.chaser.pos.x-(432*MAP.scale);
    }

    Start(){
        this.gameTimer = new Timer(0);
        this.gameObjects.Clear();
        var mapData = this.CreateMap(MAP.planSize.x, MAP.planSize.y);
        var levelData = [];
        this.CreateMapRows(levelData,MAP.planSize.x,0,MAP.planSize.y,0)

        this.CreateLevel(mapData, levelData, -6, MAP.planSize.x, MAP.planSize.y);

        MAP.Init(true, mapData, levelData);

        var blocks = Util.UnpackWorldObjects(levelData);

        for (var i = 0; i < blocks.length; i++) 
        {
            var b = blocks[i];
            var w = b.w*32;
            var s = new StaticBody(b, C.ASSETS.PLATFORM, 
                new Vector2((b.x*32)+w/2, (b.y*32)+16), w, 32, 0, 0.2, .2, b.d); 
            this.gameObjects.Add(s);
        }

        this.plr = new Player( Input,
            new Vector2(this.plrStart, (MAP.planSize.y-7)*32), 32, 32, 2, 0, 0);
        this.gameObjects.Add(this.plr);
        this.plr.enabled = 0;

        this.chaser = new Chaser(new Vector2(-(MAP.mapSize.x/2),-100), 
            MAP.mapSize.x - 200, 60);
        this.gameObjects.Add(this.chaser);

        this.gameMode = C.GAMEMODE.GAME;
        this.plr.enabled = 1;
        this.level = 1;
        this.score = 0;
        MAP.scale = 1;
    } 
    NextLevel(){
        //this.level ++;
        this.Start();
    }
    LevelEnd(){
        this.gameMode = C.GAMEMODE.LEVELEND;
        this.gameTimer = new Timer(4);
    }
    GameOver(){
        this.gameMode = C.GAMEMODE.GAMEOVER;
        this.gameTimer = new Timer(4);
    }
    Quit(){
        //this.gameObjects.Clear();
        this.gameMode = C.GAMEMODE.TITLE;
        this.plr.enabled = 0;
    }

    Update(dt)
    {   
        this.offset = MAP.ScrollTo(new Vector2(
            this.plr.C.x > this.chaser.pos.x ? this.plr.C.x : this.chaser.pos.x, 
            this.plr.C.y));

        if(this.gameMode == C.GAMEMODE.TITLE){
            if(Input.Fire1()){
                this.Start();
            }
            if(this.introTony.sz < 16){
                this.introTony.svv += 0.38;
                this.introTony.sz += EasingFunctions.easeInQuad(this.introTony.svv*dt);
                this.introTony.r += 14.5*dt;
                if(this.introTony.sz>=16){
                    Sound.Play(C.sound.splash);
                }                
            }
            else if (this.introTony.y<990){
                this.introTony.yv += 0.1;
                this.introTony.y += EasingFunctions.easeInQuad(this.introTony.yv*dt);
            }

        }else if(this.gameMode == C.GAMEMODE.LEVELEND){
            if(this.gameTimer.Update(dt)){
                this.NextLevel();
            } 
        }else if(this.gameMode == C.GAMEMODE.GAME || this.gameMode == C.GAMEMODE.GAMEOVER){
            if(this.plr.C.x < (this.chaser.pos.x-340) && MAP.scale < MAP.maxScale){
                MAP.Zoom(0.002);
            }
            else if(MAP.scale > 1){
                MAP.Zoom(-0.002);
            }

            //this.offset = MAP.ScrollTo(new Vector2(this.plr.C.x, this.plr.C.y));

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

            var ps = parseInt((this.plr.C.x - this.plrStart)/10);
            this.score = ps > this.score ? ps : this.score;

            if(this.plr.C.x > MAP.mapSize.x - 200){
                this.LevelEnd();
            }
            if(this.gameMode == C.GAMEMODE.GAME && !this.plr.enabled){
                this.GameOver();
            }
            if(this.gameMode == C.GAMEMODE.GAMEOVER){
                if(this.gameTimer.Update(dt)){
                    this.Quit();
                }            
            }
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
  
        SFX.Text("DISTANCE: " + Util.NumericText(this.score,5),16, 4, 3, 0, "#fff");
        SFX.Text("HEALTH: " + Util.NumericText(parseInt(this.plr.damage),5),240, 4, 3, 0, "#fff");

        if(this.gameMode == C.GAMEMODE.TITLE){
            //SFX.Box(0,0,800,600, "rgba(100,173,217,0.6)");
            SFX.Sprite(this.introTony.x, this.introTony.y, 
                SPRITES.Get(this.introTony.src, 0), this.introTony.sz, this.introTony.r);

            SFX.Text("TONY",240,100,16,1); 
            SFX.Text("FIRE TO START",300,240,4);               
        }else if(this.gameMode == C.GAMEMODE.LEVELEND){
            //SFX.Box(0,0,800,600, "rgba(100,173,217,0.6)");
            SFX.Text("YOUR A REAL HERO NOW",100,100,4,1); 
            //SFX.Text("FIRE TO CONTINUE",300,240,4); 
        }else if(this.gameMode == C.GAMEMODE.GAMEOVER){
            //SFX.Box(0,0,800,600, "rgba(100,173,217,0.6)");
            SFX.Text("GAME OVER",200,100,8,1);   
        }

        Input.Render();
    }
}