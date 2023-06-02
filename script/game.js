class Blocky{

    constructor(canvas, objects)
    {

        this.offset;

        this.gameObjects = new ObjectPool();

        // Gravity
        this.mGravity = new Vector2(0, 100);

        this.plr = new Player( Input,
                new Vector2(12.5*32, 6*32), 32, 32, 2, 0, 0);
        this.gameObjects.Add(this.plr);

        this.gameObjects.Add(
            new StaticBody([],C.ASSETS.GROUND, 
                new Vector2(18.5*32, (24*32)+16), 37*32, 32, 0, 0.2, .2)
            );
        this.gameObjects.Add(
            new StaticBody([],C.ASSETS.WALL, 
                new Vector2(-16, 12*32), 32, 24*32, 0, 0.2, .2)
            );
        this.gameObjects.Add(
            new StaticBody([],C.ASSETS.WALL, 
                new Vector2((37*32)+16, 12*32), 32, 24*32, 0, 0.2, .2)
            );
        
        var blocks = Util.UnpackWorldObjects(MAP.mapData);

        for (var i = 0; i < blocks.length; i++) 
        {
            var b = blocks[i];
            var w = b.w*32;
            var s = new StaticBody(b.t, C.ASSETS.PLATFORM, 
                new Vector2((b.x*32)+w/2, (b.y*32)+16), w, 32, 0, 0.2, .2); 
            this.gameObjects.Add(s);
        }

        this.editor = new Editor(canvas, this.gameObjects, objects);        
    }

    AddObject(x, y, V){
        var d = new Shot(new Vector2(x, y), "X");
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
        PHYSICS.Update(objects, dt);

        this.editor.Update(dt);
    }

    Render()
    {

        MAP.PreRender();

        //render objects
        var objects = this.gameObjects.Get();
        for (var i = 0; i < objects.length; i++) {
            objects[i].Render(this.offset.x, this.offset.y);            
        }

        this.editor.Render(this.offset.x, this.offset.y);       

        MAP.PostRender();
  
        Input.Render();
    }
}