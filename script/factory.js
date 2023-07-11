var C = {
    ASSETS:{
        NONE:0,
        BALL:1,
        BLOCK:3,
        WALL:5,
        GROUND:6,
        PLAYER:7,
        SHOT:8,
        PLATFORM:9
    },   
    GAMEMODE:
    {
        TITLE:0,
        GAME:1,
        INPLAY:2,
        LEVELENDING:3,
        LEVELEND:4,
        GAMEWON:5,
        GAMEOVER:6
    },
    sound:{
        hop1:0,
        hop2:1,
        fall:3,
        splash:4,
        collect1:5,
        collect2:7,
        collect3:7,
        wibble:6
    }
}

var DEFS = {
    spritePal:[
		"#FAF",
		"#000",
		"#666",
		"#888",
		"#AAA",
		"#FFF",
		"#842",
		"#952",
		"#B52",
		"#D83",
		"#E94",
		"#5BE",
		"#7CF",
		"#9DF",
		"#F22",
		"#44F",
		"#485",
		"#3C3",
		"#0D0"
	],
    spriteDef: {
        'player':{tag:'sprites16x2',src:[{x:128,y:0}, {x:160,y:0}],w:32,h:32},
        'block32':{tag:'sprites8x4',src:[{x:0,y:0},{x:32,y:0}],w:32,h:32},
        'ice32':{tag:'sprites8x4',src:[{x:64,y:0},{x:80,y:0}],w:32,h:32},
        'ground32':{tag:'sprites8x4',src:[{x:256,y:0}],w:32,h:32},
        'log16l':{tag:'sprites8x2',src:[{x:64,y:0},{x:64,y:0}],w:16,h:16},
        'log16':{tag:'sprites8x2',src:[{x:80,y:0},{x:80,y:0}],w:16,h:16},
        'log16r':{tag:'sprites8x2',src:[{x:96,y:0},{x:96,y:0}],w:16,h:16},
        'log32l':{tag:'sprites8x4',src:[{x:128,y:0}],w:32,h:32},
        'log32':{tag:'sprites8x4',src:[{x:160,y:0}],w:32,h:32},
        'log32r':{tag:'sprites8x4',src:[{x:192,y:0}],w:32,h:32},	
        'shard1':{tag:'sprites8x4',src:[{x:224,y:0},{x:224,y:0}],w:32,h:16},
        'shard2':{tag:'sprites8x4',src:[{x:224,y:16},{x:224,y:16}],w:32,h:16},
        'rock16':{tag:'sprites16x1',src:[{x:0,y:0},{x:16,y:0}],w:16,h:16},
        'rock32':{tag:'sprites16x2',src:[{x:0,y:0},{x:32,y:0}],w:32,h:32},
        'rock64':{tag:'sprites16x4',src:[{x:0,y:0},{x:64,y:0}],w:64,h:64},
        'crate32':{tag:'sprites16x2',src:[{x:64,y:0},{x:96,y:0}],w:32,h:32},
        'log10':{tag:'spritesX',src:[{x:0,y:0},{x:0,y:0}],w:160,h:16},
        },
    spriteData: [
            "0|2,6|0,2|2,6|0,2|11,6|0,2|11,6|0,2|7,22|0|8,8|18,8|2|4,6|2,2|4|2|4,3|2,2|11|12,2|13,2|12|13|11|0,3|11|13|11|0,2|7|10,5|8,2|10,6|8,2|10,7|7|8|10,2|7,2|10,2|8|17,8|2|4,6|2,2|4,3|2,2|4|2|11|12,2|13,2|12|13|11,3|12|13,2|12|11,2|7|10|9|8,3|9,6|8,2|9,6|8,2|9|7|8|7|9,4|7|8|17,8|2|4,5|3|2,2|4|2|4,2|2,3|11|12,2|13,2|12|13|11,2|12,2|13,2|12|13|11|7|8,2|9,5|8,3|9,5|10|8,3|9,3|7|8,8|16,8|2|4,4|3,2|2,4|4,2|3,2|2|11|12|13,3|12|13|11|0,2|12|13,2|12|13|11|7|9|10,2|9|8,3|9,5|8,4|9,4|8,2|7|8,8|7,2|16|7,3|16|7|2|4|3|4|3,3|2,2|4|3|2|3|2|3|2|11|12|13,2|12|13,2|11,3|13|11|12|13,2|11|7|9,2|8,2|9,5|8,3|9,5|8,3|9,2|7|8|7|9|10|9|10,2|8|7,8|2|3,6|2,2|3,4|2|3|2|11|13,3|12|13|12|11,2|13|11|0|11|13|12|11|7|8,2|9,4|8,3|9,3|10,2|9|8,2|9,5|7|8|9,3|7,2|9|8|6,8|0|2,6|0,2|2,6|0,2|11,6|0,2|11,2|0|11,3|0,2|7,22|0|8,8|6,8",
            "0,8|2,3|0,13|2,3|0,5|8,19|7,2|8,11|0|14,14|0,2|14,14|0,5|2,4|4,3|2|0,8|2,4|4,3|2|0,4|8|10,7|9,7|8,2|10,4|7,2|10|9,6|7|8|14,2|5,12|14,4|5,12|14,2|0,3|2|4,8|2|0,6|2|4,8|2|0,3|8|10|9,13|8,2|10|9,10|7,2|9|8|14|5,14|14,2|5,14|14|0,2|2|4,10|2|0,4|2,5|4,3|2,4|0,3|8,14|0,2|8,14|0|14|5,14|14,2|5,14|14|0,2|2|4,9|3,2|2|0,3|2|4,2|2|4,2|2,2|4,2|3,2|2|0,2|8|10,3|8|10,2|9,2|8|10,2|9|8|0,2|7,2|10,2|8|10,2|9,2|8|10,2|9|8|0|14|5,3|1,2|5,4|1,2|5,3|14,2|5,3|1,2|5,4|1,2|5,3|14|0|2|4,9|3,4|2|0|2|4,3|2|4,2|2|4,2|3,4|2|0|8|10|9,2|8|10|9,3|8|10|9,2|8|0,4|7,4|9,3|8|10|9|7,2|0|14|5,3|1,2|5,4|1,2|5,3|14,2|5,3|1,2|5,4|1,2|5,3|14|2|4,9|3,5|2,2|4,9|3,5|2|0|8|10|9,2|8|10|9,3|8|9,3|8|0,2|7,3|9|7,2|9,3|8|9|7|0,3|14|5,14|14,2|5,14|14|2|4,9|3,5|2,2|4,9|3,3|2|3|2|0|8|9,3|8|9,4|8|9,3|8|0,2|8|9,3|8|9,4|8|9,2|7,2|0|14|5,14|14,2|5,14|14|2|4,8|3,5|2|0|2|4,4|2,2|4,2|3,4|2,2|0,2|8|9,3|8|9,4|8|9,3|8|0,2|8|9,3|8|9,4|8|9,3|8|0|14|5,6|1,2|5,6|14,2|5,6|1,2|5,6|14|0|2|3|4,5|3,6|2|0,2|2,4|4,3|3,2|2|3,3|2|0,2|8|9,3|8|9,4|8|9,3|8|0,2|7,2|9,2|8|9,4|8|9,2|7|0,2|14|5,14|14,2|5,14|14|0|2|3,12|2|0,2|2|3,9|2,4|0,2|8|9,3|8|9,4|8|9,3|8|0,4|7,2|8|9,4|8|9,3|7|0|15,32|0,2|2|3,11|2|0,3|2|3,3|2|3,7|2|0,2|8|9,3|8|9,4|8|9,3|8|0,2|7,2|9,2|8|9,4|8|9,3|8|0|15,32|0,2|2|3,10|2|0,4|2|3|2,3|3,3|2|3,2|2|0,3|8,14|0,2|8,8|7,6|0|15,32|0,3|2|3,8|2|0,6|2,2|3,5|2|3|2|0,3|8|10,7|9,7|8,2|10,7|9,7|8|15,32|0,4|2,2|3,5|2|0,8|2,2|3,5|2|0,4|8,2|9,13|8,3|9,3|7,3|9,7|8|15,32|0,6|2,5|0,11|2,5|0,5|8,19|7,3|8,10|0,2|15,4|0,4|15,4|0,5|15,4|0,2|15,4|0,3"
        ]
}

var FEATURE =[
    {t:[7],n:[36,36]},
    {t:[7,0,0],n:[2,5]},
    {t:[7,0],n:[3,6]},
    {t:[7],n:[2,3],
        o:{
            t:4,
            p:[{x:0,y:-32},{x:32,y:-32},{x:16,y:-64}]
        }
    },
    {t:[7],n:[3,4], l2:{x:4,y:-5},
        o:{
            t:4,
            p:[{x:0,y:-32},{x:32,y:-32},{x:64,y:-32},
                {x:16,y:-64},{x:48,y:-64},{x:32,y:-96}]
        }
    },
    {t:[7,0,0,0,7,7,7],n:[1,2],
        o:{
            t:16,
            p:[{x:128,y:-16}]
        }
    },
    {t:[7],n:[1,2],
        o:{
            t:6,
            p:[{x:0,y:-32},{x:0,y:-64},{x:0,y:-96},{x:0,y:-128}]
        }
    }
];

var GAMEOBJ = [
    {id:0,col:"#6DF"},{id:1,col:"#8bf"},{id:2,col:"#731"},
    {
        id:3, src:'player',
        s:0, t:C.ASSETS.BLOCK,
        w:32, h:32, d:2, f:0, r:0, dm:500
    },
    {
        id:4, src:'block32',
        s:0, t:C.ASSETS.BLOCK,
        w:32, h:32, d:16, f:0.2, r:0.2, dm:64, col:[2,3,4]
    },
    {
        id:5, src:'ice32',
        s:0, t:C.ASSETS.BLOCK,
        w:32, h:32, d:8, f:0.2, r:0.2, dm:26, col:[11,12,13]
    },
    {
        id:6, src:'crate32',
        s:0, t:C.ASSETS.BLOCK,
        w:32, h:32, d:12, f:0.2, r:0.2, dm:24, col:[6,8,9]
    },
    {
        id:7, pid:7,src:'ground32',
        s:1, t:C.ASSETS.BLOCK,
        w:32, h:32, dm:0
    },
    {
        id:8, pid:9, src:'log32l',
        s:1, t:C.ASSETS.BLOCK,
        w:32, h:32, dm:16
    },
    {
        id:9, pid:9,src:'log32',
        s:1, t:C.ASSETS.BLOCK,
        w:32, h:32, dm:16
    },
    {
        id:10, pid:9,src:'log32r',
        s:1, t:C.ASSETS.BLOCK,
        w:32, h:32, dm:16
    },
    {
        id:11, src:'shard1',
        s:0, t:C.ASSETS.BLOCK,
        w:32, h:16, d:8, f:0.2, r:0.2, dm:8
    },
    {
        id:12, src:'shard2',
        s:0, t:C.ASSETS.BLOCK,
        w:32, h:16, d:8, f:0.2, r:0.2, dm:8
    },
    {
        id:13, src:'rock32',
        s:0, t:C.ASSETS.BALL,
        w:16, h:16, d:8, f:0.8, r:0.8, dm:64, col:[2,3,4]
    },
    {
        id:14, src:'rock64',
        s:0, t:C.ASSETS.BALL,
        w:32, h:32, d:8, f:0.8, r:0.8, dm:64, col:[2,3,4]
    },
    {
        id:15, src:'rock16',
        s:0, t:C.ASSETS.BALL,
        w:16, h:16, d:4, f:0.8, r:0.8, dm:10, col:[2,3,4]
    },
    {
        id:16, src:'log10',
        s:0, t:C.ASSETS.BLOCK,
        w:160, h:16, d:16, f:0.2, r:0.2, dm:20, col:[6,8,9]
    },
    {
        id:17, src:'log16l',
        s:0, t:C.ASSETS.BLOCK,
        w:16, h:16
    },
    {
        id:18, src:'log16',
        s:0, t:C.ASSETS.BLOCK,
        w:16, h:16
    },
    {
        id:19, src:'log16r',
        s:0, t:C.ASSETS.BLOCK,
        w:16, h:16
    },
];

class BlockFactory
{
    static Create(id, x, y, r)
    {
        var obj = GAMEOBJ.find(o=>o.id == id);

        if(obj){   
            var b = null;

            if(obj.t==C.ASSETS.BALL || obj.t==C.ASSETS.BALL){
                b =  new Circle(obj.t, obj.id, 
                    new Vector2(x, y), 
                    obj.w, obj.d, obj.f, obj.r, obj.dm, obj.col);
            }
            else{
                b = new Rectangle(obj.t, obj.id, 
                    new Vector2(x, y), 
                    obj.w, obj.h, 
                    obj.d, 
                    obj.f, 
                    obj.r, obj.dm, obj.col);  
            }

            if(r!=0){
                PHYSICS.rotateShape(b, r);
            }

            return b;
        }
    }
}

var SOUNDS = [
    [,,434,.02,.02,.01,2,.23,-0.1,-0.1,-100,,.01,,14,.5,,.9,,.39],//hop1
    [,,876,,.01,.01,2,.13,48,.2,,,,,35,,,.9],//hop2.1
    [,,876,,.01,.01,,.13,48,.2,50,,,,35,,,.9],//hop2.2
    [1.07,,1665,.02,.09,.16,1,.47,-0.3,-6.6,119,.02,,,,.1,,.41,.05,.17],//fall        
    [1.07,,1664,.02,.1,.16,,.37,-0.3,-6.5,119,.02,,.1,2,.1,,.41,.05,.17],//splash
    [1.02,,1590,,.01,.11,1,1.4,,,-161,.04,,,,.1,,.93,.02,.2],//collect
    [1.78,,1341,.21,,.16,1,.34,19,22,-15,.27,.18,,9.5,,.1,.23,.22,.27],
    [,,1851,.01,.05,.2,1,1.09,,-1,,,,,,,,.55,.05,.16]//gold
];

var FONT = {    
    'A': [
        [, 1, 0],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, , 1]
    ],
    'B': [
        [1, 1, 0],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, 1,0]
    ],
    'C': [
        [1, 1, 1],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1, 1, 1]
    ],
    'D': [
        [1, 1,0],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1,0]
    ],
    'E': [
        [1, 1, 1],
        [1,0,0],
        [1, 1, 1],
        [1,0,0],
        [1, 1, 1]
    ],
    'F': [
        [1, 1, 1],
        [1,0,0],
        [1, 1,1],
        [1,0,0],
        [1,0,0]
    ],
    'G': [
        [, 1, 1,0],
        [1,0,0,0],
        [1, , 1, 1],
        [1, , , 1],
        [, 1, 1,0]
    ],
    'H': [
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, , 1]
    ],
    'I': [
        [1, 1, 1],
        [, 1,0],
        [, 1,0],
        [, 1,0],
        [1, 1, 1]
    ],
    'J': [
        [1, 1, 1],
        [, , 1],
        [, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'K': [
        [1, , , 1],
        [1, , 1,0],
        [1, 1,0,0],
        [1, , 1,0],
        [1, , , 1]
    ],
    'L': [
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1, 1, 1]
    ],
    'M': [
        [1,1,1,1],
        [1,0,1,1],
        [1,0,1,1],
        [1,0,0,1],
        [1,0,0,1]
    ],
    'N': [
        [1, , , 1],
        [1, 1, , 1],
        [1, , 1, 1],
        [1, , , 1],
        [1, , , 1]
    ],
    'O': [
        [1, 1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'P': [
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1],
        [1,0,0],
        [1,0,0]
    ],
    'Q': [
        [0, 1, 1,0],
        [1, , , 1],
        [1, , , 1],
        [1, , 1, 1],
        [1, 1, 1, 1]
    ],
    'R': [
        [1, 1,0],
        [1, , 1],
        [1, , 1],
        [1, 1,0],
        [1, , 1]
    ],
    'S': [
        [1, 1, 1],
        [1,0,0],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    'T': [
        [1,1,1],
        [,1,0],
        [,1,0],
        [,1,0],
        [,1,0]
    ],
    'U': [
        [1,,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,1]
    ],
    'V': [
        [1,,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [0,1,0]
    ],
    'W': [
        [1,,,1],
        [1,,,1],
        [1,,,1],
        [1,,1,1],
        [1,1,1,1]
    ],
    'X': [
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [1,0,1]
    ],
    'Y': [
        [1, , 1],
        [1, , 1],
        [, 1,0],
        [, 1,0],
        [, 1,0]
    ],
    'Z': [
        [1, 1, 1],
        [, , 1],
        [, 1,0],
        [1,0,0],
        [1, 1, 1]
    ],
    '0': [
        [1,1,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,1]
    ],
    '1': [
        [,1,0],
        [,1,0],
        [,1,0],
        [,1,0],
        [,1,0]
    ],
    '2': [
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [1,0,0],
        [1,1,1]
    ],
    '3':[
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '4':[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [0,0,1]
    ],
    '5':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '6':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],
    '7':[
        [1,1,1],
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [0,0,1]
    ],
    '8':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],
    '9':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '/': [
        [,,,,1],
        [,,,1,],
        [,,1,,],
        [,1,,,],
        [1,,,,]
    ],
    '[': [
        [,1,1],
        [,1,],
        [,1,],
        [,1,],
        [,1,1]
    ],
    ']': [
        [1,1,],
        [,1,],
        [,1,],
        [,1,],
        [1,1,]
    ],
    ' ': [
        [,,],
        [,,],
        [,,],
        [,,],
        [,,]
    ],
    '?': [
        [1,1,1],
        [1,0,1],
        [0,1,1],
        [0,1,0],
        [0,1,0]
    ],
    '.': [
        [,,],
        [,,],
        [,,],
        [,,],
        [,1,]
    ],
    '£': [
        [0,1,1],
        [0,1,],
        [1,1,1],
        [0,1,0],
        [1,1,1]
    ],
    '+': [
        [0,0,0],
        [0,1,0],
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    '-': [
        [0,0,0],
        [0,0,0],
        [1,1,1],
        [0,0,0],
        [0,0,0]
    ],
    ':': [
        [,,],
        [,1,],
        [,,],
        [,1,],
        [,,]
    ],
    '|':
    []  //CR
};
