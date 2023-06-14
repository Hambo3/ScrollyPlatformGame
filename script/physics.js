class World{

    constructor()
    {        
        // Gravity

        this.mGravity = new Vector2(0, 6);

        this.smoothing = 8;
    }

    //Vec2 = (x,y) => ({x,y});
    length = v => this.dot(v,v)**.5;
    add = (v,w) => new Vector2(v.x + w.x, v.y + w.y);
    substract = (v,w) => this.add(v, this.scale(w, -1));
    scale = (v,n) => new Vector2(v.x * n, v.y * n);
    dot = (v,w) => v.x * w.x + v.y * w.y;
    cross = (v,w) => v.x * w.y - v.y * w.x;
    rotate = (v, center, angle, x = v.x - center.x, y = v.y - center.y) => 
            new Vector2(x * Math.cos(angle) - y * Math.sin(angle) + center.x, x * Math.sin(angle) + y * Math.cos(angle) + center.y);
    normalize = v => this.scale(v, 1 / (this.length(v) || 1));
    distance = (v,w) => this.length(this.substract(v,w));

    Update(objects, dt)
    {  
        //var collisionInfo = {}; // final collision between two shapes
        for(var k = this.smoothing; k--;){
            for(var i=0, l=objects.length; i<l; i++){   
                //var collisionInfo = null; 
                objects[i].collisionInfo = [];
                for(var j=i+1; j<l; j++){
                    var collisionInfo = {D:null,N:null,S:null,E:null,I:null,T:null};  
                    // Test bounds
                    var p = this.boundTest(objects[i], objects[j]);
                    if(p){
                        //var collisionInfo = {};
                        // Test collision
                        if(this.testCollision(objects[i], objects[j], collisionInfo)){
                            
                            // Make sure the normal is always from object[i] to object[j]
                            if(this.dot(collisionInfo.N, 
                                    this.substract(objects[j].C, objects[i].C)) < 0){
                                collisionInfo = {
                                    D: collisionInfo.D,
                                    N: this.scale(collisionInfo.N, -1),
                                    S: collisionInfo.E,
                                    E: collisionInfo.S
                                };
                            }
                            
                            // Resolve collision
                            this.resolveCollision(objects[i], objects[j], collisionInfo);
                        }
                        if(collisionInfo.D!=null){
                            objects[i].collisionInfo.push(collisionInfo);
                        }
                    } 

                    //objects[j].collisionInfo = collisionInfo;
                }
                
                // Update position/rotation
                objects[i].V = this.add(objects[i].V, this.scale(objects[i].A, dt));
                this.moveShape(objects[i], this.scale(objects[i].V, dt));
                objects[i].v += objects[i].a * dt;
                this.rotateShape(objects[i], objects[i].v * dt);            
            }
        }
    }

    // Collision info setter
    setInfo (collision, D, N, S,I,T)
    {
        collision.D = D; // depth
        collision.N = N; // normal
        collision.S = S; // start
        collision.E = this.add(S, this.scale(N, D)); // end
        collision.I = I;
        collision.T = T;
    }

    // Move a shape along a vector
    moveShape (shape, v, i){

        // Center
        shape.C = this.add(shape.C, v);

        // Rectangle (move vertex)
        if(shape.T){
            for(i = 4; i--;){
                shape.X[i] = this.add(shape.X[i], v);
            }
        }
    }

    // Rotate a shape around its center
    rotateShape (shape, angle, i) {
        // Update angle
        shape.G += angle;
        
        // Rectangle (rotate vertex)
        if(shape.T){
            for(i = 4; i--;){
                shape.X[i] = this.rotate(shape.X[i], shape.C, angle);
            }
            this.computeRectNormals(shape);
        }
    }

    // Test if two shapes have intersecting bounding circles
    boundTest (s1, s2) 
    {
        if(s1.ignore && s1.ignore.indexOf(s2.type) != -1)
        {
            return 0;
        }
        else if(!s1.hits || s1.hits.indexOf(s2.type) != -1)
        {
            return this.length(this.substract(s2.C, s1.C)) <= s1.B + s2.B;
        }
        else{
            return 0;
        }
    }

    // Compute face normals (for rectangles)
    computeRectNormals (shape, i){
        // N: normal of each face toward outside of rectangle
        // 0: Top, 1: Right, 2: Bottom, 3: Left
        for(i = 4; i--;){
            shape.N[i] = this.normalize(this.substract(shape.X[(i+1) % 4], shape.X[(i+2) % 4]));
        }
    }

    // Find the axis of least penetration between two rects
    findAxisLeastPenetration (rect, otherRect, collisionInfo) {
        var n;
        var i;
        var j;
        var supportPoint;
        var bestDistance = 1e9;
        var bestIndex = -1;
        var hasSupport = 1;
        var tmpSupportPoint;
        var tmpSupportPointDist;

        for(i = 4; hasSupport && i--;){
            
            // Retrieve a face normal from A
            n = rect.N[i];

            // use -n as direction and the vertex on edge i as point on edge
            var dir = this.scale(n, -1);
            var ptOnEdge = rect.X[i];
            
            // find the support on B
            var vToEdge;
            var projection;

            tmpSupportPointDist = -1e9;
            tmpSupportPoint = -1;
            
            // check each vector of other object
            for(j = 4; j--;){
                vToEdge = this.substract(otherRect.X[j], ptOnEdge);
                projection = this.dot(vToEdge, dir);
                
                // find the longest distance with certain edge
                // dir is -n direction, so the distance should be positive     
                if(projection > 0 && projection > tmpSupportPointDist){
                    tmpSupportPoint = otherRect.X[j];
                    tmpSupportPointDist = projection;
                }
            }

            hasSupport = (tmpSupportPoint !== -1);
            
            // get the shortest support point depth
            if(hasSupport && tmpSupportPointDist < bestDistance){
                bestDistance = tmpSupportPointDist;
                bestIndex = i;
                supportPoint = tmpSupportPoint;
            }
        }

        if(hasSupport){      
            // all four directions have support point
            this.setInfo(collisionInfo, bestDistance, rect.N[bestIndex], 
                this.add(supportPoint, this.scale(rect.N[bestIndex], bestDistance)));
        }

        return hasSupport;
    }
  
    // Test collision between two shapes
    testCollision (c1, c2, collisionInfo) {
        
        // Circle vs circle
        if(!c1.T && !c2.T){
            var vFrom1to2 = this.substract(c2.C, c1.C);
            var rSum = c1.B + c2.B;
            var dist = this.length(vFrom1to2);
            
            if(dist <= Math.sqrt(rSum * rSum)){      
            //if(dist){        
                // overlapping but not same position
                var normalFrom2to1 = this.normalize(this.scale(vFrom1to2, -1));
                var radiusC2 = this.scale(normalFrom2to1, c2.B);
                this.setInfo(collisionInfo, rSum - dist, 
                    this.normalize(vFrom1to2), this.add(c2.C, radiusC2),
                    (c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                    c2.type
                    );
            //}
            
            /*
            // same position
            else {
                
                if(c1.B > c2.B){
                setInfo(collisionInfo, rSum, Vec2(0, -1), add(c1.C, Vec2(0, c1.B)));
                }
                
                else {
                setInfo(collisionInfo, rSum, Vec2(0, -1), add(c2.C, Vec2(0, c2.B)));
                }
            }
            */
            }
            
            return 1;
        }
        
        // Rect vs Rect
        if(c1.T /*== 1*/ && c2.T /*== 1*/)
        {
            var status1 = 0;
            var status2 = 0;
            var collisionInfoR1 = {}; // temp collision: rect 1 vs rect 2
            var collisionInfoR2 = {}; // temp collision: rect 2 vs rect 1
            // find Axis of Separation for both rectangles
            status1 = this.findAxisLeastPenetration(c1, c2, collisionInfoR1);
            if(status1)
            {
                status2 = this.findAxisLeastPenetration(c2, c1, collisionInfoR2);
                if(status2)
                {                
                    // if both of rectangles are overlapping, choose the shorter normal as the normal     
                    if(collisionInfoR1.D < collisionInfoR2.D)
                    {
                        this.setInfo(collisionInfo, collisionInfoR1.D, collisionInfoR1.N, 
                            this.substract(collisionInfoR1.S, 
                                this.scale(collisionInfoR1.N, collisionInfoR1.D))
                                ,(c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                                c2.type
                                );                       
                    }                    
                    else 
                    {                           
                        this.setInfo(collisionInfo, collisionInfoR2.D, 
                            this.scale(collisionInfoR2.N, -1), collisionInfoR2.S
                            ,(c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                            c2.type
                            );
                    }
                }
            }
            return status1 && status2;
        }
        
        // Rectangle vs Circle
        // (c1 is the rectangle and c2 is the circle, invert the two if needed)
        if(!c1.T && c2.T /*== 1*/){
            [c1, c2] = [c2, c1];
        }
        
        if(c1.T /*== 1*/ && !c2.T)
        {
            var inside = 1;
            var bestDistance = -1e9;
            var nearestEdge = 0;
            var i;
            var v
            var circ2Pos;
            var projection;

            for(i = 4; i--;){
            
                // find the nearest face for center of circle    
                circ2Pos = c2.C;
                v = this.substract(circ2Pos, c1.X[i]);
                projection = this.dot(v, c1.N[i]);

                if(projection > 0){
                    // if the center of circle is outside of c1angle
                    bestDistance = projection;
                    nearestEdge = i;
                    inside = 0;
                    break;
                }
                
                if(projection > bestDistance){
                    bestDistance = projection;
                    nearestEdge = i;
                }
            }
            var dis;
            var normal;
        
            if(inside){      
                // the center of circle is inside of c1angle
                this.setInfo(collisionInfo, c2.B - bestDistance, c1.N[nearestEdge], 
                    this.substract(circ2Pos, this.scale(c1.N[nearestEdge], c2.B))
                    ,(c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                    c2.type);
            }
            else 
            {
                // the center of circle is outside of c1angle
                // v1 is from left vertex of face to center of circle 
                // v2 is from left vertex of face to right vertex of face
                var v1 = this.substract(circ2Pos, c1.X[nearestEdge]);
                var v2 = this.substract(c1.X[(nearestEdge + 1) % 4], c1.X[nearestEdge]);
                var dotp = this.dot(v1, v2);
                if(dotp < 0)
                {                
                    // the center of circle is in corner region of X[nearestEdge]
                    dis = this.length(v1);
                    
                    // compare the distance with radium to decide collision
                    if(dis > c2.B){
                        return;
                    }
                    normal = this.normalize(v1);
                    this.setInfo(collisionInfo, c2.B - dis, normal, 
                        this.add(circ2Pos, this.scale(normal, -c2.B))
                        ,(c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                        c2.type);
                }
                else {            
                    // the center of circle is in corner region of X[nearestEdge+1]
                    // v1 is from right vertex of face to center of circle 
                    // v2 is from right vertex of face to left vertex of face
                    v1 = this.substract(circ2Pos, c1.X[(nearestEdge + 1) % 4]);
                    v2 = this.scale(v2, -1);
                    dotp = this.dot(v1, v2); 
                    if(dotp < 0){
                        dis = this.length(v1);
                        
                        // compare the distance with radium to decide collision
                        if(dis > c2.B){
                            return;
                        }
                        normal = this.normalize(v1);
                        this.setInfo(collisionInfo, c2.B - dis, normal, 
                            this.add(circ2Pos, this.scale(normal, -c2.B))
                            ,(c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                            c2.type);
                    }
                    else {
                        
                        // the center of circle is in face region of face[nearestEdge]
                        if(bestDistance < c2.B){
                            this.setInfo(collisionInfo, c2.B - bestDistance, c1.N[nearestEdge], 
                                this.substract(circ2Pos, 
                                    this.scale(c1.N[nearestEdge], c2.B))
                                    ,(c1.V.Length()*c1.M) + (c2.V.Length()*c2.M),
                                    c2.type);
                        }
                        
                        else {
                            return;
                        }
                    }
                }
            }
            return 1;
        }
    }
  
    resolveCollision (s1, s2, collisionInfo) {
        if(!s1.M && !s2.M){
            return;
        }

        // correct positions
        var num = collisionInfo.D / (s1.M + s2.M) * .8; // .8 = poscorrectionrate = percentage of separation to project objects
        var correctionAmount = this.scale(collisionInfo.N, num);
        var n = collisionInfo.N;
        this.moveShape(s1, this.scale(correctionAmount, -s1.M));
        this.moveShape(s2, this.scale(correctionAmount, s2.M));

        // the direction of collisionInfo is always from s1 to s2
        // but the Mass is inversed, so start scale with s2 and end scale with s1
        var start = this.scale(collisionInfo.S, s2.M / (s1.M + s2.M));
        var end = this.scale(collisionInfo.E, s1.M / (s1.M + s2.M));
        var p = this.add(start, end);
        // r is vector from center of object to collision point
        var r1 = this.substract(p, s1.C);
        var r2 = this.substract(p, s2.C);

        // newV = V + v cross R
        var v1 = this.add(s1.V, new Vector2(-1 * s1.v * r1.y, s1.v * r1.x));
        var v2 = this.add(s2.V, new Vector2(-1 * s2.v * r2.y, s2.v * r2.x));
        var relativeVelocity = this.substract(v2, v1);

        // Relative velocity in normal direction
        var rVelocityInNormal = this.dot(relativeVelocity, n);

        // if objects moving apart ignore
        if(rVelocityInNormal > 0){
            return;
        }

        // compute and apply response impulses for each object  
        var newRestituion = Math.min(s1.R, s2.R);
        var newFriction = Math.min(s1.F, s2.F);

        // R cross N
        var R1crossN = this.cross(r1, n)
        var R2crossN = this.cross(r2, n);

        // Calc impulse scalar
        // the formula of jN can be found in http://www.myphysicslab.com/collision.html
        var jN = (-(1 + newRestituion) * rVelocityInNormal) / 
                (s1.M + s2.M + R1crossN * R1crossN * s1.I + R2crossN * R2crossN * s2.I);

        // impulse is in direction of normal ( from s1 to s2)
        var impulse = this.scale(n, jN);

        // impulse = F dt = m * ?v
        // ?v = impulse / m
        s1.V = this.substract(s1.V, this.scale(impulse, s1.M));
        s2.V = this.add(s2.V, this.scale(impulse, s2.M));
        s1.v -= R1crossN * jN * s1.I;
        s2.v += R2crossN * jN * s2.I;
        var tangent = this.scale(this.normalize(this.substract(relativeVelocity, 
            this.scale(n, this.dot(relativeVelocity, n)))), -1);
        var R1crossT = this.cross(r1, tangent);
        var R2crossT = this.cross(r2, tangent)
        var jT = (-(1 + newRestituion) * this.dot(relativeVelocity, tangent) * newFriction) / (s1.M + s2.M + R1crossT * R1crossT * s1.I + R2crossT * R2crossT * s2.I);

        // friction should less than force in normal direction
        if(jT > jN){
            jT = jN;
        }

        // impulse is from s1 to s2 (in opposite direction of velocity)
        impulse = this.scale(tangent, jT);
        s1.V = this.substract(s1.V, this.scale(impulse, s1.M));
        s2.V = this.add(s2.V, this.scale(impulse,s2.M));
        s1.v -= R1crossT * jT * s1.I;
        s2.v += R2crossT * jT * s2.I;
    }
  
}