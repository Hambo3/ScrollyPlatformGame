class Editor{

    constructor(canvas, pool, objects)
    {
        this.gameObjects = pool; 

        this.offset = {x:0,y:0};

        this.selected = {
            index:4,
            x:100,
            y:100,
            r:0,
            obj:GAMEOBJ[4],
            src:SPRITES.Get(GAMEOBJ[4].src, 0)
        };

        this.Point = function(clientX, clientY){
            var rect = canvas.getBoundingClientRect(); // abs. size of element
            var scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
            var scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
            var tile = 1;
            var htile = 0;
            if(m.selected.obj.s){
                var tile = 32;
                var htile = 16;                
            }
            var x = ((clientX - rect.left)*scaleX)*MAP.scale;
            var y = ((clientY - rect.top)*scaleY)*MAP.scale;

            x = ((parseInt(x / tile)*tile)+htile) - m.offset.x % tile;
            y = ((parseInt(y / tile)*tile)+htile) - m.offset.y % tile;

            return {x:x, y:y};
        }

        var m = this;

        canvas.addEventListener('mousemove', function (e) {
            var pt = m.Point(e.clientX, e.clientY);
            m.selected.x = pt.x;
            m.selected.y = pt.y;  
         });

         canvas.addEventListener('mouseup', function (e) {
            if(Input.IsDown('Delete')){
                var found = m.gameObjects.Select(m.selected.x+m.offset.x, m.selected.y+m.offset.y);
                m.gameObjects.Delete(found);  

                var col = parseInt((m.selected.x+m.offset.x)/32);
                var row = parseInt((m.selected.y+m.offset.y)/32);

                for (var i = 0; i < found.tiles.length; i++) {
                    col = found.tiles[i];
                    MAP.mapData[row][col] = 0;
                }
                MAP.TileInit();
            }
            else{
                var obj = GAMEOBJ[m.selected.index];

                var b = BlockFactory.Create(obj.id, m.selected.x, m.selected.y, m.selected.r, m.offset);
                m.gameObjects.Add(b);
            }
         });

        for (var i = 0; i < objects.length; i++) {
            for (var j = 0; j < objects[i].i.length; j++) {
                var id = objects[i].id;
                var obj = objects[i].i[j];

                var b = BlockFactory.Create(id, obj.x, obj.y, obj.r || 0, this.offset);
                this.gameObjects.Add(b);
            }
        }
    }

    NormalFloat(f){
        return parseFloat(f.toFixed(1));
    }
    Update(dt)
    {   
        //object select
        if(Input.IsSingle(',')){
            if(this.selected.index > 4)
            {
                this.selected.index--;

                var ass = GAMEOBJ[this.selected.index];
                this.selected.src = SPRITES.Get(ass.src, 0);
                this.selected.obj = ass;
                this.selected.r = 0;
            }
        }
        if(Input.IsSingle('.')){
            if(this.selected.index < GAMEOBJ.length-1)
            {
                this.selected.index++;

                var ass = GAMEOBJ[this.selected.index];
                this.selected.src = SPRITES.Get(ass.src, 0);
                this.selected.obj = ass;
                this.selected.r = 0;
            }
        }
        
        //rotate
        if(Input.IsSingle('Insert')){
            this.selected.r += 0.785;//1.57;//1.5707864466210615
        }
        if(Input.IsSingle('Delete')){
            this.selected.r -= 0.785;//1.57;
        }

        if(Input.IsSingle('p')){
            var objects = this.gameObjects.Get();
            var objs = [];
            var m = MAP.mapData;

            for (var i = 0; i < objects.length; i++) {
                if(objects[i].type != C.ASSETS.GROUND && 
                    objects[i].type != C.ASSETS.WALL &&
                    objects[i].type != C.ASSETS.PLATFORM &&
                    objects[i].type != C.ASSETS.PLAYER)
                {
                    if(objects[i].isStatic){
                        var col = parseInt(objects[i].C.x/32);
                        var row = parseInt(objects[i].C.y/32);
                        m[row][col] = objects[i].spriteId;
                    }
                    else{
                        objs.push({
                            id:objects[i].spriteId, 
                            x:parseInt(objects[i].C.x), 
                            r:objects[i].G,
                            y:parseInt(objects[i].C.y)});
                    }
                }
            }            

            const groupBy = (x,f)=>x.reduce(
                (a,b,i)=>( (a[f(b,i,x)]||=[]).push(b),a ),{});
            var gr = groupBy(objs, o => o.id);

            var p = "objects:[";
            for (var key in gr){
                var value = gr[key];
                p += "{id:"+key+",i:[";
                for (var i = 0; i < value.length; i++) {
                    p += "{";
                    p += "x:" + parseInt(value[i].x);
                    p += ", y:" + parseInt(value[i].y);
                    p += ", r:" + value[i].r.toFixed(3);;
                    p += "}";
                    if(i != value.length-1){ 
                        p += ",";
                    } 
                }
                p += "]},";
            }
            p += "]";            

            var mp = "";
            var last = -1;
            var ct = -1;

            for (var r = 0; r < m.length; r++) {
                for (var c = 0; c < m[r].length; c++) {

                    if(last != -1 && last != m[r][c]){
                        if(ct > 0){
                            mp += "" + last + "," + (ct+1) + "|";
                        }
                        else{
                            mp += "" + last + "|";
                        }
                        ct = 0;
                    }
                    else{
                        ct++;
                    }

                    last = m[r][c];
                }
            }
            if(ct > 0){
                mp += "" + last + "," + (ct+1) + "|";
            }
            else{
                mp += "" + last + "|";
            }
            console.log(p);
            console.log(mp);
        }

        DEBUG.Print("ID",this.selected.index);
        DEBUG.Print("R`",this.selected.r);
        DEBUG.Print("OX",this.offset.x);
        DEBUG.Print("OY",this.offset.y);
    }

    Render(x,y)
    {
        this.offset.x = x;
        this.offset.y = y;
        GFX.Sprite(this.selected.x, this.selected.y, this.selected.src, 1, this.selected.r);
    }
}