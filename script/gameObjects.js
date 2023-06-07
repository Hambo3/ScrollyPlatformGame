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
        this.collisionInfo = [];
        PHYSICS.computeRectNormals(this);

        this.frame = 0; 
    }

    Update(dt)
    {   

    }

    get Body() {
        return SPRITES.Get(this.body, this.frame);
    }

    Render(x, y)
    {
        GFX.Sprite(this.C.x-x, this.C.y-y, this.Body, this.size, this.G);
    }
}

class Circle extends RigidShape{

    constructor(type, sprId, center, radius, mass, friction, restitution, isStatic)
    {        
        super(center, mass, friction, restitution, 0 ,radius);
        this.enabled = 1;
        this.size = 1;
        this.type = type;
        this.hits = null;//[C.ASSETS.GROUND,C.ASSETS.WALL,C.ASSETS.BLOCK];
        this.isStatic = isStatic;

        this.spriteId = sprId;
        this.body = GAMEOBJ.find(o=>o.id == sprId).src;
    }

    Update(dt)
    {   
        super.Update(dt);
    }

    Render(x,y)
    {
        super.Render(x, y);
        //GFX.Sprite(this.C.x-x, this.C.y-y, this.src, this.size, this.G);
    }
}

class StaticBody extends RigidShape{

    constructor(tiles, type, center, width, height, mass, friction, restitution, isStatic)
    {        
        super(center, mass, friction, restitution, 1, Math.hypot(width, height)/2, width, height);
        this.enabled = 1;
        this.size = 1;
        this.type = type;
        this.hits = null;
        this.isStatic = isStatic;
        this.tiles = tiles;
    }

    Update(dt)
    {
    }

    Render(x,y)
    {
        //super.Render(x, y);
        //GFX.Sprite(this.C.x-x, this.C.y-y, this.src, this.size, this.G);
    }
}

class Rectangle extends RigidShape{

    constructor(type, sprId, center, width, height, mass, friction, restitution, isStatic)
    {        
        super(center, mass, friction, restitution, 1, Math.hypot(width, height)/2, width, height);
        this.enabled = 1;        
        
        this.size = 1;
        this.type = type;
        this.hits = null;
        this.isStatic = isStatic;
        this.spriteId = sprId;
        this.body = GAMEOBJ.find(o=>o.id == sprId).src;
        //this.src = SPRITES.Get(s.src, 0);
    }

    Update(dt)
    {
    }

    Render(x,y)
    {
        super.Render(x, y);
        //GFX.Sprite(this.C.x-x, this.C.y-y, this.src, this.size, this.G);
    }
}

class Player extends Rectangle{

    constructor(input, center, width, height, mass, friction, restitution)
    {        
        super(C.ASSETS.PLAYER, 3, center, width, height, mass, friction, restitution, 1);
        this.size = 1;
        this.hits = null;
        this.ignore = [C.ASSETS.SHOT];
        this.input = input;
        this.isStatic = 0;   
        this.anim = new Anim(16, 2);    

    }

    Update(dt)
    {   

        if(this.collisionInfo.length > 0){
            DEBUG.Print("I:", this.collisionInfo[0].I);
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

        if(this.input.Fire1()){
            GAME.AddObject(this.C.x, this.C.y, {x:-32,y:-40});
        }

        if(this.input.Fire2()){
            GAME.AddObject(this.C.x, this.C.y, {x:32,y:-40});
        }

        if(this.collisionInfo.length != 0){
            this.G = 0;               
        }

        super.Update(dt);
    }

    Render(x,y)
    {
        super.Render(x,y);
        DEBUG.Print("L:", this.V.Length());        
    }
}

class Shot extends Circle{

    constructor( center)
    {        
        super(C.ASSETS.SHOT, 10, center, 8, 6, 0.8, 0.8, 1);
        this.size = 1;
        this.hits = null;
        this.ignore = null;
        this.isStatic = 0;
    }

    Update(dt)
    {   
        super.Update(dt);
    }

    Render(x,y)
    {
        super.Render(x,y);
    }
}

class Chaser {

    constructor(target, offset)
    {        
        this.target = target;
        this.pos = new Vector2(0,0);
        this.offset = offset;
        this.timer = new Timer(2);
        this.velocityMin = [32,48];
        this.rate = 1;

        this.enabled = 1;
        this.type = C.ASSETS.NONE;
    }

    Update(dt)
    {   var p = MAP.Pos;
        //this.pos.x = this.target.C.x + this.offset.x;
        //this.pos.y = this.target.C.y + this.offset.y;
        this.timer.Update(dt);

        // if(!this.timer.enabled){
        //     GAME.Launch(Util.RndI(p.l+64, p.r-64), 0, 
        //         {x:Util.RndI(-32, 32),y:0}
        //         );

        //     this.timer.Set(this.rate);
        // }   

    }

    Render(x,y)
    {
    }
}