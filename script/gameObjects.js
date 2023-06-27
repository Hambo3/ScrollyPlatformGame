class Vector2 
{
    constructor(x=0, y=0) { this.x = x; this.y = y; }
    Copy(v)               { this.x = v.x; this.y = v.y; return this; }
    Clone(s=1)            { return (new Vector2(this.x, this.y)).Multiply(s); }
    CloneAdd(v)           { return (new Vector2(this.x, this.y)).Add(new Vector2(v.x, v.y)); }
	Add(v)                { (v instanceof Vector2)? (this.x += v.x, this.y += v.y) : (this.x += v, this.y += v); return this;  }
	Subtract(v)           { (this.x -= v.x, this.y -= v.y) ; return this;  }
	Multiply(v)           { (v instanceof Vector2)? (this.x *= v.x, this.y *= v.y) : (this.x *= v, this.y *= v); return this;  }
	Set(x, y)             { this.x = x; this.y = y; return this;  }
    AddXY(x, y)           { this.x += x; this.y += y; return this;  }
    Normalize(scale=1)    { let l = this.Length();  return l > 0 ? this.Multiply(scale/l) : this.Set(scale,0);  }
    ClampLength(length)   { let l = this.Length(); return l > length ? this.Multiply(length/l) : this; }
    Rotate(a)             { let c=Math.cos(a);let s=Math.sin(a);return this.Set(this.x*c - this.y*s,this.x*s - this.y*c); }
    rotate (center, angle, x = this.x - center.x, y = this.y - center.y) {
        this.Set(x * Math.cos(angle) - y * Math.sin(angle) + center.x, x * Math.sin(angle) + y * Math.cos(angle) + center.y);
    }
    Round()               { this.x = Math.round(this.x); this.y = Math.round(this.y); return this; }
    Length()              { return Math.hypot(this.x, this.y ); }
    Distance(v)           { return Math.hypot(this.x - v.x, this.y - v.y ); }
    Angle()               { return Math.atan2(this.y, this.x); };
    Rotation()            { return (Math.abs(this.x)>Math.abs(this.y))?(this.x>0?2:0):(this.y>0?1:3); }   
    Lerp(v,p)             { return this.Add(v.Clone().Subtract(this).Multiply(p)); }
    DotProduct(v)         { return this.x*v.x+this.y*v.y; }
}

class Anim{
    constructor(r, m ){
        this.rate = r;
        this.max = m;
        this.count = 0;
    }

    Next(frame){
        if(++this.count == this.rate){
            this.count = 0;
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

class TextSprite{
    constructor(txt, size, style, col){
        //this.text = txt;
        this.enabled = 1;

        var canvas = document.createElement('canvas');
        //canvas.width = 0;
		//canvas.height = 100;
        this.graphics = {ctx:canvas.getContext('2d'), canvas:canvas};
        //this.sky = Util.Context(64,64);
        this.rend = new Render(this.graphics.ctx);
        this.size;	
        this.Create(txt, size, style, col);
    }

    Create(txt, size, style, col){
        this.size = this.rend.Text(txt, 0, 0 ,size, style, col); 

    }

    get TextImg(){
        return this.graphics.canvas;
    }

    get Size(){
        return this.size;
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
        this.isStatic = 0;
        this.spriteId;
        this.body;
        this.damage = 0;
        this.breakPoint = 0;
        this.collidedWith = [];

        this.col = null;
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
                    if(C.I>3){
                        this.collidedWith.push(perp);
                        this.damage -= C.I;
                        if(this.damage <= 0){
                            this.enabled = 0;
                            if(this.col){
                                GAME.ParticleGen(this.C.Clone(), 3, this.col, 5);
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
        this.damage = dmg|0;
        
        this.tiles = tiles;        
    }

    Update(dt, ci)
    {
        super.Update(dt, ci);

        if(!this.enabled){       
            console.log("!") ;
            MAP.Tile(this.tiles);
            GAME.PlatformBreak(this.tiles);
            //particles??
        }
    }

    Render(x,y)
    {
        //super.Render(x, y);
    }
}

class Circle extends GameObject{

    constructor(type, sprId, center, radius, mass, friction, restitution, dmg, col)
    {        
        super(center, mass, friction, restitution, 0 ,radius);
        this.enabled = 1;
        this.type = type;

        this.spriteId = sprId;
        this.body = GAMEOBJ.find(o=>o.id == sprId).src;
        this.damage = dmg;
        this.breakPoint = this.damage /2;
        this.col = col;
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

    constructor(type, sprId, center, width, height, mass, friction, restitution, dmg, col)
    {        
        super(center, mass, friction, restitution, 1, Math.hypot(width, height)/2, width, height);
        this.enabled = 1;       
        this.type = type;

        this.spriteId = sprId;
        this.body = GAMEOBJ.find(o=>o.id == sprId).src;
        this.damage = dmg;
        this.breakPoint = this.damage /2;
        this.col = col;
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

class Player extends GameObject{

    constructor(input, center, width, height, mass, friction, restitution)
    {        
        super(center, mass, friction, restitution, 1, Math.hypot(width, height)/2, width, height);
        this.type = C.ASSETS.PLAYER;

        this.dmgIgnore = [C.ASSETS.PLATFORM];
        this.spriteId = 3;
        this.body = GAMEOBJ.find(o=>o.id == this.spriteId).src;
        this.damage = 500; 
          
        this.ignore = [C.ASSETS.SHOT];
        this.input = input;
        this.anim = new Anim(16, 2);        
    }

    Update(dt, ci)
    {  
        if(ci.length > 0){
            if(this.input.Left() || this.input.Right()){
                if(this.input.Left()){
                    this.V.x -=2;
                }
                else{
                    this.V.x +=2;
                } 

                this.frame = this.anim.Next(this.frame);
            }
            else{
                this.V.x *=0.8;
            }
            this.V.x *=0.9;

            if(this.input.Up()){
                this.V.y -=24;
            }
        }

        // if(this.input.Fire1()){
        //     GAME.AddObject(this.C.x, this.C.y, {x:-32,y:-40});
        // }

        if(this.input.Fire1()){
            GAME.AddObject(this.C.x, this.C.y, new Vector2(32,-40));
        }

        if(ci.length != 0){
             this.G = 0;    
        }

        super.Update(dt, ci);
    }

    Render(x,y)
    {
        super.Render(x,y);
        DEBUG.Print("L:", this.V.Length());   
        DEBUG.Print("D:", this.damage);     
    }
}

class Shot extends GameObject{

    constructor(center)
    {        
        var obj = GAMEOBJ.find(o=>o.id == 15);
        super(center, obj.d, obj.f, obj.r, 0 ,obj.w/2);   

        this.damage = obj.dm;
        this.col = obj.col;
        this.type = C.ASSETS.SHOT;
        this.spriteId = 15;
        this.body = GAMEOBJ.find(o=>o.id == this.spriteId).src;
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

    constructor(target, offset, stop, behind, speed)
    {        
        this.target = target;
        this.pos = new Vector2(0,0);
        this.offset = offset;
        this.timer = new Timer(2);
        this.velocityMin = [32,48];
        this.rate = 1;
        this.stop = stop;
        this.behind = behind;
        this.enabled = 1;
        this.type = C.ASSETS.NONE;
        this.speed = speed || 60;
    }

    get Behind(){
        return this.pos.x - this.behind;
    }

    Update(dt)
    {   
        if(this.pos.x < this.stop){            
            this.pos.x += this.speed*dt;            
        }

        this.timer.Update(dt);

        var p = MAP.Pos;
        if(!this.timer.enabled){
            GAME.Launch(Util.RndI(p.l+64, p.r-64), 0, 
                new Vector2(Util.RndI(-32, 32),0)
                );

            this.timer.Set(this.rate);
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