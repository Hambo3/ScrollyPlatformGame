class Blocky{//TBA

    constructor()
    {        
        this.lvlSpeed = 60;
        this.score = 0;
        this.lvlScore = 0;
        this.plrStart = 80;

        this.gameTimer = new Timer(0);
        this.gameMode = C.GAMEMODE.TITLE;
        this.level = 0;
        this.offset;
        this.gameObjects = new ObjectPool();
        this.particles = new ObjectPool(); 
        this.introTony = {x:240, y:500, src:'player', sz:0.1, r:0, yv:0, svv:0, lv:0};
        // Gravity
        this.mGravity = new Vector2(0, 100);

        this.Start(0);
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
        var x=this.Section(map, lvl, y, 0, t, h, n,0);
    }

    CreateLevel(map, lvl, l, w, h){        
        var y = h+l;
        var t = [1];
        var stage = 0;
        var x = this.Section(map, lvl, y, 0, t, h, 8,stage);
        var fc = 0;
        var n, ys;
        var o = 0;
        var l2 = null;

        do{
            stage = x>(w/2) ? 1 : 0;
             if(this.level>1 && fc>12){
                fc = 0;
                var f = FEATURE[Util.RndI(1,7)];
                t = f.t;
                n = Util.RndI(f.n[0], f.n[1]);
                o = f.o;
                if(l2==null && f.l2){
                    l2 = {t:[Util.OneOf([1,2])], 
                        y: y+f.l2.y, 
                        x: x+f.l2.x, 
                        n:Util.RndI(3, 6),
                        m:0};
                }
             }
             else{
                var b = t[t.length-1];
                b = (b==0 || b == 2)
                    ? 1
                    : Util.OneOf([0,1,2]); //gap plat brk 0 7 9
                                                        //0 1 2
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

            x = this.Section(map, lvl, y, x, t, h, n,stage);

            if(l2){
                if(l2.x+l2.n > w){
                    l2.n = w-l2.x;
                }

                l2.x = this.Section(map, lvl, l2.y, l2.x, l2.t, 0, l2.n, stage);
                l2.m+=l2.n;
                
                ys=Util.RndI(-1,2);

                if(y-(l2.y+ys) > 4 && y-(l2.y+ys) < 10)
                {
                    l2.y+=ys;
                }

                l2.t=[Util.OneOf([0,1,2])];
                if(l2.m>32){
                    l2=null;
                }
            }
            
            fc += n;
        }while(x<w);
    }

    Section(map, lvl, y, x, tt, h, n, stg){
        var stgt = [7,23,22];
        var stga = [7,25,24];
        for (var r=0; r<n; r++)
        {         
            for (var rr=0; rr<tt.length; rr++)
            {                  
                var f=tt[rr];
                var t = f;
                if(f==2){
                    if(r==0){ 
                        t=8;
                    }
                    else if(r==n-1){
                        t=10;
                    }
                    else{
                        t=9;
                    }
                }
                else if (f==1){
                    t = stgt[stg];
                    if(Util.OneIn(8)){
                        t=stga[stg];
                    }
                }

                 lvl[y][x] = t;
                //              t==9 && r==0 ? t-1 :    //log 
                //             t==9 && r==n-1 ? t+1 :  //ends
                //             t;
                for (var c=y+1; c<h; c++){ 
                    if(t)
                    map[c][x] = 2;//t==0?map[c][x]:2;
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

            //if(this.particle){
                GAME.ParticleGen(pt, {t:[0,1,2],col:[6,8,9]});
            //}
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

    ParticleGen(pos, pt)
    {
        var n = pt.n || Util.RndI(3,6);

        var cols = [];
        var tp = pt ? pt.t : 0;
        pt.col.forEach(c => {
            cols.push(DEFS.spritePal[c]);
        });

        var ln = cols.length;
        var bods = [
            [-2,2, -2,-2, 2,-2, 2,2],
            [-12,-4, 12,-4, -8,4],
            [-14,-1, 0,-4, 12,0, -10,4]
        ];

        for (var i = 0; i < n; i++) {
            var b = this.particles.Is(0);

            if(!b){
                b = new Particle(pos.Clone());
                this.particles.Add(b);
            }
            var l = Util.RndI(1,ln);
            var lb = 0;
            b.pos = pos.Clone();

            b.body = [
                [0,bods[Util.OneOf(tp)]]
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

    Start(lvl){
        var speeds = [60,80,90,100,120];
        this.gameTimer = new Timer(4);
        this.gameObjects.Clear();
        var mapData = this.CreateMap(MAP.planSize.x, MAP.planSize.y);
        var levelData = [];
        this.CreateMapRows(levelData,MAP.planSize.x,0,MAP.planSize.y,0)

        if(lvl){
            this.CreateLevel(mapData, levelData, -6, MAP.planSize.x, MAP.planSize.y);            
        }
        else{
            this.TitleLevel(mapData, levelData, -6, MAP.planSize.x, MAP.planSize.y);
        }
        
        this.lvlSpeed = this.level < 4 ? speeds[this.level] : speeds[4];

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
        var ht = lvl ? this.plr.damage : 500;
        this.plr = new Player( Input,
            new Vector2(this.plrStart, (MAP.planSize.y-7)*32), 32, 32, 2, 0, 0);
        this.gameObjects.Add(this.plr);
        this.plr.enabled = 0;
        this.plr.damage = ht;

        this.chaser = new Chaser(new Vector2(-(MAP.mapSize.x/2),-100), 
            MAP.mapSize.x - 200, this.lvlSpeed);
        this.gameObjects.Add(this.chaser);

        this.gameMode = C.GAMEMODE.GAME;
        this.plr.enabled = 1;
        this.level = lvl;

        if(!lvl){
            this.gameMode = C.GAMEMODE.TITLE;
            this.score = 0;    
            this.plr.enabled = 0;
        }
        this.lvlScore = 0;
        MAP.scale = 1;

        if(lvl){
            MUSIC.Play();
        }
        else{
            MUSIC.Stop();
        }
    } 
    NextLevel(){
        this.score += this.lvlScore;
        this.level ++;
        this.Start(this.level);
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
        this.gameMode = C.GAMEMODE.TITLE;
        this.plr.enabled = 0;
        this.Start(0);
    }

    Update(dt)
    {   
        this.gameTimer.Update(dt);
        
        this.offset = MAP.ScrollTo(new Vector2(
            this.plr.C.x > this.chaser.pos.x ? this.plr.C.x : this.chaser.pos.x, 
            this.plr.C.y));

        if(this.gameMode == C.GAMEMODE.TITLE){
            if(Input.Fire1()){
                this.introTony = {x:240, y:400, src:'player', sz:1, r:0,lv:1};
                this.Start(1);
            }
            if(this.introTony.lv == 0){
                if(this.introTony.sz < 16){
                    this.introTony.svv += 0.38;
                    this.introTony.sz += EasingFunctions.easeInQuad(this.introTony.svv*dt);
                    this.introTony.r += 14.5*dt;
                    if(this.introTony.sz>=16){
                        AUDIO.Play(C.sound.splash);
                    }                
                }
                else if (this.introTony.y<990){
                    this.introTony.yv += 0.1;
                    this.introTony.y += EasingFunctions.easeInQuad(this.introTony.yv*dt);
                }                
            }

        }else if(this.gameMode == C.GAMEMODE.LEVELEND){
            if(!this.gameTimer.enabled){
                this.NextLevel();
            } 

            //BUG ???
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
            this.lvlScore = ps > this.lvlScore ? ps : this.lvlScore;
            
            if(this.plr.C.x > MAP.mapSize.x - 800 && this.boss == null){
                this.boss = new Boss(
                    new Vector2(MAP.mapSize.x - 200, 100), 96, 96, 2, 0, 0);
                this.gameObjects.Add(this.boss);
                this.boss.enabled = 1;
                this.boss.damage = 300;
            }

            if(this.plr.C.x > MAP.mapSize.x - 200){
                this.LevelEnd();
            }
            if(this.gameMode == C.GAMEMODE.GAME && !this.plr.enabled){
                this.GameOver();
            }
            if(this.gameMode == C.GAMEMODE.GAMEOVER){
                if(!this.gameTimer.enabled){
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

        if(this.gameMode != C.GAMEMODE.TITLE){
            SFX.Text("DISTANCE: " + Util.NumericText(this.score+this.lvlScore,5),16, 4, 3, 0, "#fff");
            SFX.Text("HEALTH: " + Util.NumericText(parseInt(this.plr.damage),5),240, 4, 3, 0, "#fff"); 
            SFX.Text("SPEED: " + this.level + ":" + this.lvlSpeed,440, 4, 3, 0, "#fff");   
        }

        if(this.gameMode == C.GAMEMODE.GAME)
        {               
            if(this.gameTimer.enabled){
                SFX.Text("LEVEL " + this.level,300,240,4);
            }
        }
        else if(this.gameMode == C.GAMEMODE.TITLE){
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