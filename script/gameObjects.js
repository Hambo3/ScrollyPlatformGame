class Vector2 
{
    constructor(x=0, y=0) { this.x = x; this.y = y; }    
    Clone(s=1)            { return (new Vector2(this.x, this.y)).Multiply(s); }
    CloneAdd(v)           { return (new Vector2(this.x, this.y)).Add(new Vector2(v.x, v.y)); }
	Add(v)                { (v instanceof Vector2)? (this.x += v.x, this.y += v.y) : (this.x += v, this.y += v); return this;  }
	Subtract(v)           { (this.x -= v.x, this.y -= v.y) ; return this;  }
	Multiply(v)           { (v instanceof Vector2)? (this.x *= v.x, this.y *= v.y) : (this.x *= v, this.y *= v); return this;  }
	Set(x, y)             { this.x = x; this.y = y; return this;  }
    AddXY(x, y)           { this.x += x; this.y += y; return this;  }
    Normalize(scale=1)    { let l = this.Length();  return l > 0 ? this.Multiply(scale/l) : this.Set(scale,0);  }
     rotate (center, angle, x = this.x - center.x, y = this.y - center.y) {
        this.Set(x * Math.cos(angle) - y * Math.sin(angle) + center.x, x * Math.sin(angle) + y * Math.cos(angle) + center.y);
    }
    Length()              { return Math.hypot(this.x, this.y ); }
    Distance(v)           { return Math.hypot(this.x - v.x, this.y - v.y ); }
}

class Anim{
    constructor(r, m ){
        this.rate = r;
        this.max = m;
        this.count = 0;
    }

    Next(frame, del){
        if(++this.count == this.rate){
            this.count = 0;
            if(del){
                del();
            }
            if(++frame==this.max)
            {
                return 0;
            }
        }
        return frame;
    }
}

class Timer{
    constructor(t){
        this.start = t;
        this.time = t;
        this.enabled = t>0;
    }

    get Start(){
        return this.start;
    }

    get Value(){
        return this.time;
    }

    Set(t){
        this.time = t;
        this.enabled = t>0;
    }
    Update(dt){
        var r = false;
        if(this.enabled){
            this.time -= dt;

            if(this.time <= 0)
            {
                this.time = 0;
                this.enabled = false;
                r = true;
            }
        }
        return r;
    }
}

class Color
{
    constructor(c,a=1) { 
        var s = c.split(''); 
        var rgb = [];
        for (var i = 1; i < s.length; i++) {
            rgb.push(parseInt(s[i], 16));
        }
        this.r=rgb[0]*16;this.g=rgb[1]*16;this.b=rgb[2]*16;this.a=a; 
    }    
    Clone(s=1) { 
        var r = new Color("#000", this.a*s); 
        r.r = this.r*s;
        r.g = this.g*s;
        r.b = this.b*s; 
        return r;
    }
    Subtract(c)                  { this.r-=c.r;this.g-=c.g;this.b-=c.b;this.a-=c.a; return this; }
    Lerp(c,p)                    { return c.Clone().Subtract(c.Clone().Subtract(this).Clone(1-p)); }
    RGBA()                       { return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
    }
}

class RigidShape{

    constructor(C, mass, F, R, T, B, W, H)
    {        
        this.T = T; // 0 circle / 1 rectangle
        this.C = C; // center
        this.F = F; // friction
        this.R = R; // restitution (bouncing)
        this.M = mass ? 1 / mass : 0; // inverseMass (0 if immobile)
        this.V = new Vector2(0, 0); // velocity (speed)
        this.A = mass ? PHYSICS.mGravity : new Vector2(0, 0); // acceleration
        this.G = 0; // angle
        this.v = 0; // angle velocity
        this.a = 0; // angle acceleration
        this.B = B; // (bounds) radius
        this.W = W; // width
        this.H = H; // height
        this.I = T // inertia
                ? (Math.hypot(W, H) / 2, mass > 0 ? 1 / (mass * (W ** 2 + H ** 2) / 12) : 0) // rectangle
                : (mass > 0 ? (mass * B ** 2) / 12 : 0); // circle
        this.N = []; // face normals array (rectangles)
        this.X = [ // Vertex: 0: TopLeft, 1: TopRight, 2: BottomRight, 3: BottomLeft (rectangles)
                new Vector2(C.x - W / 2, C.y - H / 2),
                new Vector2(C.x + W / 2, C.y - H / 2),
                new Vector2(C.x + W / 2, C.y + H / 2),
                new Vector2(C.x - W / 2, C.y + H / 2)
                ];
        PHYSICS.computeRectNormals(this);
    }
}

class GameObject extends RigidShape{

    constructor(C, mass, F, R, T, B, W, H)
    {        
        super(C, mass, F, R, T, B, W, H);

        this.frame = 0; 
        this.enabled = 1;    
        this.size = 1;
        this.type;
        this.hits = null;
        this.dmgIgnore = [];
        this.ignore = [];
        this.isStatic = 0;
        this.spriteId;
        this.body;
        this.damage = 0;
        this.breakPoint = 0;
        this.collidedWith = [];

        this.particle = null;
    }

    Update(dt, ci)
    {   
        if(!this.isStatic && (this.C.y > MAP.mapSize.y || GAME.IsLeftBehind(this.C.x))){
            this.enabled = 0;
        }
        if(this.damage > 0 && ci.length != 0){ 
            for (var i = 0; i < ci.length; i++) {
                var perp = ci[i].P1 != this ? ci[i].P1 : ci[i].P2;
                var C = ci[i].C;
                if(this.dmgIgnore.indexOf(perp.type) == -1 && 
                    this.collidedWith.indexOf(perp) == -1){
                    this.collidedWith.push(perp);
                    if(C.I>3){
                        this.damage -= C.I;
                        if(this.damage <= 0){
                            this.enabled = 0;
                            if(this.particle){
                                GAME.ParticleGen(this.C.Clone(), this.particle);
                            }
                        }
                    }
                } 
            }
        }        
    }

    get Body() {
        return SPRITES.Get(this.body, this.frame);
    }

    Render(x, y)
    {
        GFX.Sprite(this.C.x-x, this.C.y-y, this.Body, this.size, this.G);
    }
}


class StaticBody extends GameObject{

    constructor(tiles, type, center, width, height, mass, friction, restitution, dmg)
    {        
        super(center, mass, friction, restitution, 1, Math.hypot(width, height)/2, width, height);
        this.enabled = 1;
        this.type = type;

        this.dmgIgnore = [C.ASSETS.PLAYER];
        this.deadly = 0;
        this.isStatic = 1;        
        this.damage = dmg||0;
        
        this.tiles = tiles;        
    }

    Update(dt, ci)
    {
        super.Update(dt, ci);

        if(!this.enabled){       
            MAP.Tile(this.tiles);
            GAME.PlatformBreak(this.tiles);
        }
    }

    Render(x,y)
    {
        //super.Render(x, y);
    }
}

class Circle extends GameObject{

    constructor(type, sprId, center, radius, mass, friction, restitution, dmg, pt)
    {        
        super(center, mass, friction, restitution, 0 ,radius);
        this.enabled = 1;
        this.type = type;

        this.spriteId = sprId;
        this.body = GAMEOBJ.find(o=>o.id == sprId).src;
        this.damage = dmg;
        this.breakPoint = this.damage /2;
        this.particle = pt;
    }

    Update(dt, ci)
    {   
        if(this.damage < this.breakPoint){
            this.frame=1;
        }
        super.Update(dt, ci);
    }

    Render(x,y)
    {
        super.Render(x, y);
    }
}

class Rectangle extends GameObject{

    constructor(type, sprId, center, width, height, mass, friction, restitution, dmg, pt)
    {        
        super(center, mass, friction, restitution, 1, Math.hypot(width, height)/2, width, height);
        this.enabled = 1;       
        this.type = type;

        this.spriteId = sprId;
        this.body = GAMEOBJ.find(o=>o.id == sprId).src;
        this.damage = dmg;
        this.breakPoint = this.damage /2;
        this.particle = pt;
    }

    Update(dt, ci)
    {
        if(this.damage < this.breakPoint){
            this.frame=1;
        }
        super.Update(dt, ci);

        if(!this.enabled){
            if(this.spriteId == 6){
                var p = new BadGuy(this.C.Clone(), 20, C.ASSETS.BADGUY);
                GAME.gameObjects.Add(p);
                p.enabled = 1;
                p.damage = 100;
                p.V.y = -(8*dt);
                p.V.x = this.V.x;
            }
            else if(this.spriteId == 27){
                for (var i = 0; i < 3; i++) {
                    var p =new PickUp(this.C.CloneAdd(new Vector2(Util.RndI(-8,8), Util.RndI(-8,8))), 
                                        28, C.ASSETS.PICKUPSHOT);
                    p.V = this.V.Clone();                                           
                    GAME.gameObjects.Add(p);                 
                }
            }
        }
    }

    Render(x,y)
    {
        super.Render(x, y);
    }
}

class Player extends GameObject{

    constructor(input, center)
    {        
        var b = GAMEOBJ.find(o=>o.id == 3);

        super(center, b.d, b.f, b.r, 1, Math.hypot(b.w, b.h)/2, b.w, b.h);
        this.type = C.ASSETS.PLAYER;
        this.spriteId = b.id;

        this.body = b.src;
        this.dmgIgnore = [C.ASSETS.PLATFORM];

        this.damage = 0; 
        this.extra = true;
          
        this.ignore = [C.ASSETS.EXTRA];
        this.input = input;
        this.anim = new Anim(16, 2);     
        this.shots = 0;   
    }

    Update(dt, ci)
    {  
        super.Update(dt, ci);

        if(ci.length > 0){
            for (var i = 0; i < ci.length; i++) {
                var perp = ci[i].P1 != this ? ci[i].P1 : ci[i].P2;
                if(perp.enabled && perp.type == C.ASSETS.PICKUPSHOT){
                    this.collidedWith.push(perp);
                    perp.enabled = 0;
                    this.shots+=1;                    
                }
                
            }
            if(this.input.Left() || this.input.Right()){
                GAME.help.mv = 0;
                if(this.input.Left()){
                    this.V.x -=2;
                }
                else{
                    this.V.x +=2;
                } 

                this.frame = this.anim.Next(this.frame, () =>{
                    AUDIO.Play(C.SND.step);
                });                
            }

            this.V.x *=0.9;

            if(this.input.Up()){
                GAME.help.up = 0;
                this.V.y -=28;
            }
        }

        if(this.shots > 0 && this.input.Fire1()){
            this.shots --;
            GAME.help.f = 0;
            GAME.AddObject(15, C.ASSETS.EXTRA, this.C.Clone(), 
                    new Vector2(32,-40));
        }

        if(ci.length != 0){
             this.G = 0;    
        }

        if(this.extra && this.damage < 450){
            this.extra = null;
            GAME.AddObject(26, C.ASSETS.EXTRA, this.C.Clone(), 
                            new Vector2(Util.RndI(-16,16),-32));
        }
    }

    Render(x,y)
    {
        super.Render(x,y);

        if(this.extra){
            var hat = SPRITES.Get('hat', 0);

            var pt = this.C.CloneAdd({x:0,y:-16});
            pt.rotate(this.C, this.G);
            GFX.Sprite(pt.x-x, pt.y-y, hat, this.size, this.G);            
        }
    }
}

class BadGuy extends GameObject{

    constructor(center, id, type)
    {        
        var b = GAMEOBJ.find(o=>o.id == id);

        super(center, b.d, b.f, b.r, 1, Math.hypot(b.w, b.h)/2, b.w, b.h);
        this.type = type;
        this.extra = this.type == C.ASSETS.BOSS;
        this.dmgIgnore = [C.ASSETS.PLATFORM];
        
        this.spriteId = b.id;
        this.body = b.src;
        this.damage = 0;
        this.anim = new Anim(16, 2);
        this.throw = 0;
    }

    Update(dt, ci)
    {  
        if(ci.length > 0){
            if(this.type == C.ASSETS.BOSS){
                if(GAME.plr.C.Distance(this.C) < 100){
                    if(GAME.plr.C.x < this.C.x){
                        this.V.x -=1.1;
                    }
                    else{
                        this.V.x +=1.1;
                    }

                    if(GAME.plr.C.y < (this.C.y-8) && Util.OneIn(8)){
                        this.V.y -=16;
                    }
                }
                else{
                    if(this.throw == 0){
                        if(Util.OneIn(100)){
                            this.throw = 1;
                        }
                    }
                    if(this.throw == 1 && Util.OneIn(100)){
                        this.throw = 0;
                        GAME.Launch(this.C.Clone().AddXY(4,-68), 
                                new Vector2(-Util.RndI(24, 40),-40), 13);
                    }
                }
            }
            else{
                if(GAME.plr.C.x < this.C.x){
                    this.V.x -=1.5;
                }
                else{
                    this.V.x +=1.5;
                }

                if(GAME.plr.C.y < (this.C.y-8) && Util.OneIn(8)){
                    this.V.y -=16;
                }
            }

            this.frame = this.anim.Next(this.frame);

            this.V.x *=0.9;
        }

        if(ci.length != 0){
             this.G = 0;    
        }

        super.Update(dt, ci);
    }

    Render(x,y)
    {
        super.Render(x,y);

        if(this.extra){

            var am = SPRITES.Get('bossarm', 0);
            var pt = this.C.CloneAdd(this.throw?{x:8,y:-10}:{x:0,y:0});
            GFX.Sprite(pt.x-x, pt.y-y, am, this.size, this.throw ? 0 : -1.3); 
            if(this.throw==1){
                var rk = SPRITES.Get('rock32', 0);

                var pt = this.C.CloneAdd({x:4,y:-64});                
                GFX.Sprite(pt.x-x, pt.y-y, rk, this.size, this.G);            
            }          
        }

    }
}

class PickUp extends GameObject{

    constructor(center, id, type)
    {        
        var b = GAMEOBJ.find(o=>o.id == id);
        var t = b.t == C.ASSETS.BLOCK;
        var r = t ? Math.hypot(b.w, b.h)/2 : b.w;
        super(center, b.d, b.f, b.r, t ,r, b.w, b.h);

        this.type = type;
        this.dmgIgnore = [C.ASSETS.PLATFORM];
        this.spriteId = b.id;
        this.body = b.src;
        this.damage = 0;
        this.enabled = 1;
    }

    Update(dt, ci)
    {   
        super.Update(dt, ci);
    }

    Render(x,y)
    {
        super.Render(x,y);
    }
}

class Shot extends GameObject{

    constructor(id, type, center)
    {        
        var b = GAMEOBJ.find(o=>o.id == id);
        var t = b.t == C.ASSETS.BLOCK;
        var r = t ? Math.hypot(b.w, b.h)/2 : b.w;
        super(center, b.d, b.f, b.r, t ,r, b.w, b.h);

        this.damage = b.dm;
        this.particle = b.p;
        this.type = type;
        this.spriteId = id;
        this.body = b.src;
    }

    Update(dt, ci)
    {   
        super.Update(dt, ci);
    }

    Render(x,y)
    {
        super.Render(x,y);
    }
}

class Chaser {

    constructor(start, stop, speed, rate)
    {        
        this.pos = new Vector2(start,0);
        this.timer = new Timer(rate);
        this.rate = rate;
        this.stop = stop;
        this.enabled = 1;
        this.launch = 0;
        this.type = C.ASSETS.NONE;
        this.speed = speed || 60;
    }

    Update(dt)
    {   
        if(this.pos.x < this.stop){
           this.pos.x += this.speed*dt;
        }

        if(this.launch){
            this.timer.Update(dt);

            var p = MAP.Pos;
            if(!this.timer.enabled){
                GAME.Launch(new Vector2(Util.RndI(p.l+200, p.r-200), 0), 
                    new Vector2(Util.RndI(-32, 32),0));

                this.timer.Set(this.rate);
            }            
        }

    }

    Render(x,y)
    {
    }
}

class Particle{

    constructor(pos){
        this.dir;
        this.op = 1;
        this.size = 1;
        this.enabled = 1;
        this.velocity = new Vector2();
        this.damping = 0.8;
        this.speed = 0;
        this.body;
        this.rgb;
        this.bRgb;
        this.motion = 0;
        this.rot = 0
        this.rots = Util.Rnd(0.1)-0.05;
    }

    Body(){
        return this.body[this.motion];
    }

    Update(dt){
        if(this.enabled){
            var acc = this.dir.Clone().Normalize(dt).Multiply(this.speed);
            this.velocity.Add(acc);
            if(this.op>0){
                this.op-=0.01;
                this.rgb.a = this.op;
                this.col = [this.rgb.RGBA()];
                this.bRgb.a = this.op;
                this.bcol = [this.bRgb.RGBA()];
                if(this.op<=0){
                    this.enabled = 0;
                }             
            }
        
            this.pos.Add(this.velocity);

            // apply physics
            this.velocity.Multiply(this.damping);
            this.rot += this.rots;
        }
    }

    Render(x,y){
        if(this.enabled){
            GFX.SpritePoly(this.pos.x-x, this.pos.y-y, 
                this.Body(), this.col, this.size, this.rot, this.bcol);
        }
    }
}