
//https://javascript.info/class-inheritance
//https://dev.to/nitdgplug/learn-javascript-through-a-game-1beh
//https://www.minifier.org/
//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe C:\z\Git\WG5\index.htm" --allow-file-access-from-files
var fps = 120;
var rf = (function(){
  return window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(cb){
          window.setTimeout(cb, 1000 / fps);
      };
})();

var lastTime;
var now;
var dt = 0;

var slowMo = 1;
var step = 1 / fps;
var sStep = slowMo * step;

var DEBUG;

var GAME;
var GFX;
var SFX;
var MAP;
var AUDIO;
var SPRITES = [];
var PHYSICS = new World();
var canvas;

var IsTouchDevice = window.ontouchstart !== undefined;

//sprite definitions
var spriteDef = {
	'player':{tag:'sprites16x2',src:[{x:128,y:0}, {x:160,y:0}],w:32,h:32},
	'block32':{tag:'sprites8x4',src:[{x:0,y:0},{x:32,y:0}],w:32,h:32},
	'ice32':{tag:'sprites8x4',src:[{x:64,y:0},{x:80,y:0}],w:32,h:32},
	'ground32':{tag:'sprites8x4',src:[{x:256,y:0}],w:32,h:32},
	'log16l':{tag:'sprites8x2',src:[{x:64,y:0}],w:16,h:16},
	'log16':{tag:'sprites8x2',src:[{x:80,y:0}],w:16,h:16},
	'log16r':{tag:'sprites8x2',src:[{x:96,y:0}],w:16,h:16},
	'log32l':{tag:'sprites8x4',src:[{x:128,y:0}],w:32,h:32},
	'log32':{tag:'sprites8x4',src:[{x:160,y:0}],w:32,h:32},
	'log32r':{tag:'sprites8x4',src:[{x:192,y:0}],w:32,h:32},	
	'shard1':{tag:'sprites8x4',src:[{x:224,y:0}],w:32,h:16},
	'shard2':{tag:'sprites8x4',src:[{x:224,y:16}],w:32,h:16},
	'rock16':{tag:'sprites16x1',src:[{x:0,y:0},{x:16,y:0}],w:16,h:16},
	'rock32':{tag:'sprites16x2',src:[{x:0,y:0},{x:32,y:0}],w:32,h:32},
	'rock64':{tag:'sprites16x4',src:[{x:0,y:0},{x:64,y:0}],w:64,h:64},
	'crate32':{tag:'sprites16x2',src:[{x:64,y:0},{x:96,y:0}],w:32,h:32},
	'log10':{tag:'spritesX',src:[{x:0,y:0}],w:160,h:16},
	};
// var spriteDef = {
// 	'player':{tag:'sprites32',src:[{x:0,y:0}, {x:0,y:32}],w:32,h:32},
// 	'block16':{tag:'sprites16',src:[{x:16,y:0}],w:16,h:16},
// 	'brick16':{tag:'sprites16',src:[{x:32,y:0}],w:16,h:16},	
// 	'box16':{tag:'sprites16',src:[{x:48,y:0}],w:16,h:16},
// 	'ball16':{tag:'sprites16',src:[{x:64,y:0}],w:16,h:16},

// 	'block32':{tag:'sprites32',src:[{x:32,y:0}],w:32,h:32},
// 	'brick32':{tag:'sprites32',src:[{x:64,y:0}],w:32,h:32},
// 	'ground32':{tag:'sprites32',src:[{x:32,y:32}],w:32,h:32},
// 	'box32':{tag:'sprites32',src:[{x:96,y:0}],w:32,h:32},
// 	'ball32':{tag:'sprites32',src:[{x:128,y:0}],w:32,h:32},
// 	'ball32n':{tag:'sprites32n',src:[{x:0,y:0}],w:32,h:32},
// 	'ball64':{tag:'sprites64',src:[{x:0,y:0}],w:64,h:64},
// 	'crate32':{tag:'sprites32n',src:[{x:32,y:0}],w:32,h:32},
// 	'brick10h':{tag:'sprites16.2',src:[{x:0,y:0}],w:160,h:16},
// 	'shard1':{tag:'sprites32',src:[{x:64,y:32}],w:32,h:16},
// 	'shard2':{tag:'sprites32',src:[{x:64,y:48}],w:32,h:16},
// 	};

	var spritePal =[
		"#FCAAFF",
		"#000000",
		"#686969",
		"#828282",
		"#A0A0A0",
		"#FFFFFF",
		"#824520",
		"#985226",
		"#BC5D25",
		"#DD8837",
		"#E99F41",
		"#56B3EE",
		"#74CFF8",
		"#97DBFA",
		"#FF282F",
		"#4248FF",
		"#4F8E55",
		"#36C136",
		"#0ADB00"
	];

	// 	"#0FFF1B",
	// 	"#000000",
	// 	"#494949",
	// 	"#898989",
	// 	"#ADADAD",
	// 	"#C6C6C6",
	// 	"#FFFFFF",
	// 	"#FF1500",
	// 	"#021BFF",
	// 	"#DA792C",
	// 	"#EA8C2E",
	// 	"#FFC166",
	// 	"rgba(100,173,217,0.6)",
	// 	"rgba(92,160,192,0.6)",
	// 	"#298734",
	// 	"#7F0000"
	// ];

var spriteData = [
	"0|2,6|0,2|2,6|0,2|11,6|0,2|11,6|0,2|7,22|0|8,8|18,8|2|4,6|2,2|4|2|4,3|2,2|11|12,2|13,2|12|13|11|0,3|11|13|11|0,2|7|10,5|8,2|10,6|8,2|10,7|7|8|10,2|7,2|10,2|8|17,8|2|4,6|2,2|4,3|2,2|4|2|11|12,2|13,2|12|13|11,3|12|13,2|12|11,2|7|10|9|8,3|9,6|8,2|9,6|8,2|9|7|8|7|9,4|7|8|17,8|2|4,5|3|2,2|4|2|4,2|2,3|11|12,2|13,2|12|13|11,2|12,2|13,2|12|13|11|7|8,2|9,5|8,3|9,5|10|8,3|9,3|7|8,8|16,8|2|4,4|3,2|2,4|4,2|3,2|2|11|12|13,3|12|13|11|0,2|12|13,2|12|13|11|7|9|10,2|9|8,3|9,5|8,4|9,4|8,2|7|8,8|7,2|16|7,3|16|7|2|4|3|4|3,3|2,2|4|3|2|3|2|3|2|11|12|13,2|12|13,2|11,3|13|11|12|13,2|11|7|9,2|8,2|9,5|8,3|9,5|8,3|9,2|7|8|7|9|10|9|10,2|8|7,8|2|3,6|2,2|3,4|2|3|2|11|13,3|12|13|12|11,2|13|11|0|11|13|12|11|7|8,2|9,4|8,3|9,3|10,2|9|8,2|9,5|7|8|9,3|7,2|9|8|6,8|0|2,6|0,2|2,6|0,2|11,6|0,2|11,2|0|11,3|0,2|7,22|0|8,8|6,8",
	"0,8|2,3|0,13|2,3|0,5|8,19|7,2|8,11|0|14,14|0,2|14,14|0,5|2,4|4,3|2|0,8|2,4|4,3|2|0,4|8|10,7|9,7|8,2|10,4|7,2|10|9,6|7|8|14,2|5,12|14,4|5,12|14,2|0,3|2|4,8|2|0,6|2|4,8|2|0,3|8|10|9,13|8,2|10|9,10|7,2|9|8|14|5,14|14,2|5,14|14|0,2|2|4,10|2|0,4|2,5|4,3|2,4|0,3|8,14|0,2|8,14|0|14|5,14|14,2|5,14|14|0,2|2|4,9|3,2|2|0,3|2|4,2|2|4,2|2,2|4,2|3,2|2|0,2|8|10,3|8|10,2|9,2|8|10,2|9|8|0,2|7,2|10,2|8|10,2|9,2|8|10,2|9|8|0|14|5,3|1,2|5,4|1,2|5,3|14,2|5,3|1,2|5,4|1,2|5,3|14|0|2|4,9|3,4|2|0|2|4,3|2|4,2|2|4,2|3,4|2|0|8|10|9,2|8|10|9,3|8|10|9,2|8|0,4|7,4|9,3|8|10|9|7,2|0|14|5,3|1,2|5,4|1,2|5,3|14,2|5,3|1,2|5,4|1,2|5,3|14|2|4,9|3,5|2,2|4,9|3,5|2|0|8|10|9,2|8|10|9,3|8|9,3|8|0,2|7,3|9|7,2|9,3|8|9|7|0,3|14|5,14|14,2|5,14|14|2|4,9|3,5|2,2|4,9|3,3|2|3|2|0|8|9,3|8|9,4|8|9,3|8|0,2|8|9,3|8|9,4|8|9,2|7,2|0|14|5,14|14,2|5,14|14|2|4,8|3,5|2|0|2|4,4|2,2|4,2|3,4|2,2|0,2|8|9,3|8|9,4|8|9,3|8|0,2|8|9,3|8|9,4|8|9,3|8|0|14|5,6|1,2|5,6|14,2|5,6|1,2|5,6|14|0|2|3|4,5|3,6|2|0,2|2,4|4,3|3,2|2|3,3|2|0,2|8|9,3|8|9,4|8|9,3|8|0,2|7,2|9,2|8|9,4|8|9,2|7|0,2|14|5,14|14,2|5,14|14|0|2|3,12|2|0,2|2|3,9|2,4|0,2|8|9,3|8|9,4|8|9,3|8|0,4|7,2|8|9,4|8|9,3|7|0|15,32|0,2|2|3,11|2|0,3|2|3,3|2|3,7|2|0,2|8|9,3|8|9,4|8|9,3|8|0,2|7,2|9,2|8|9,4|8|9,3|8|0|15,32|0,2|2|3,10|2|0,4|2|3|2,3|3,3|2|3,2|2|0,3|8,14|0,2|8,8|7,6|0|15,32|0,3|2|3,8|2|0,6|2,2|3,5|2|3|2|0,3|8|10,7|9,7|8,2|10,7|9,7|8|15,32|0,4|2,2|3,5|2|0,8|2,2|3,5|2|0,4|8,2|9,13|8,3|9,3|7,3|9,7|8|15,32|0,6|2,5|0,11|2,5|0,5|8,19|7,3|8,10|0,2|15,4|0,4|15,4|0,5|15,4|0,2|15,4|0,3"
];

		
var map = {
	set:"tile",
	size:{
		tile:{width:32, height:32},
		screen:{width:25, height:19},
		world:{width:100, height:24}
	}
};

/*****************************/
function Start(canvasBody)
{	
	// Create the canvas
	canvas = document.createElement("canvas");
	if(canvas.getContext)
	{
		ctx = canvas.getContext("2d");
		canvas.width = (map.size.screen.width * map.size.tile.width);
		canvas.height = (map.size.screen.height * map.size.tile.height);

		var b = document.getElementById(canvasBody);
    	b.appendChild(canvas);

		MAP = new MapManger(ctx, map, new Vector2(0,0));

		if(map.size.world.height > map.size.world.width){
			MAP.maxScale = map.size.world.width/map.size.screen.width;
		}
		else{
			MAP.maxScale = map.size.world.height/map.size.screen.height;
		}

		DEBUG = new DebugEdit(MAP.screenCtx, 400, 600 ,'#fff', 5);

		//offscreen renderer
		GFX = new Render(MAP.osCanvas.ctx);	
		SFX = new Render(MAP.screenCtx, map.size.screen.width* map.size.tile.width, 
			map.size.screen.height* map.size.tile.height);	

		Input.Init(canvas, IsTouchDevice, SFX);

		SPRITES = new SpritePreProcessor(null, spriteDef);	

		preInit();
	}
}

function preInit(){

	Generate(0,'sprites8x2', 72, 2);
	Generate(0,'sprites8x4', 72, 4);
	Generate(1,'sprites16x1', 96, 1);
	Generate(1,'sprites16x2', 96, 2);
	Generate(1,'sprites16x4', 96, 4);
	Generate1();
	
	//MAP.Init(true);	
	init();
}


function Generate1(){
	var g = document.createElement('canvas');
	var gctx = g.getContext('2d');
	var gx = new Render(gctx);      

	var l = SPRITES.Get('log16l', 0);
	var m = SPRITES.Get('log16', 0);
	var r = SPRITES.Get('log16r', 0);
	var i=0;
	gx.Sprite(8+(i*16), 8, l, 1, 0);
	for (i=1; i < 9; i++) {
		gx.Sprite(8+(i*16), 8, m, 1, 0);
	}
	gx.Sprite(8+(i*16), 8, r, 1, 0);
	SPRITES.assets['spritesX'] = g;
}

function Generate(index, tagname, w, sz){
	var g = document.createElement('canvas');
	var gctx = g.getContext('2d');
	var gx = new Render(gctx);      
	
	var spr = Util.Unpack(spriteData[index]);

	for (var i = 0; i < spr.length; i++) {
		if(spr[i]>0){
			var c = parseInt(i % w);
			var r = parseInt(i / w);
			gx.Box(c*sz, r*sz, sz, sz, spritePal[spr[i]]);
		}
	}

	SPRITES.assets[tagname] = g;
}

function init()
{  
	lastTime = 0;

	GAME = new Blocky(canvas, map.objects);

	FixedLoop();  
}

function SlowMo(mo){
	sStep = mo * step;
}

function FixedLoop(){
	if(Input.IsSingle('Escape') ) {

	}

//debug	
if(Input.IsSingle('KeyY') ) {
	slowMo+=1;
	SlowMo(slowMo);		
}
else if(Input.IsSingle('KeyT') ) {
	if(slowMo-1 > 0){
		slowMo-=1;
		SlowMo(slowMo);
	}
}

// if(Input.IsDown('KeyX') ) {
// 	MAP.Zoom(0.01);
// 	GAME.offset = MAP.ScrollTo(new Vector2(17.5*32,13.5*32), 0.01);
// }
// else if(Input.IsDown('KeyZ') ) {
// 	MAP.Zoom(-0.01);
// 	GAME.offset = MAP.ScrollTo(new Vector2(17.5*32,13.5*32), 0.01);
// }
//debug		
	now = timestamp();
	dt = dt + Math.min(1, (now - lastTime) / 1000);
	while (dt > sStep) {
	  dt = dt - sStep;
	  update(step);
	}

	render();
				
	lastTime = now;
	rf(FixedLoop);
}

function timestamp() {
	var wp = window.performance;
	return wp && wp.now ? wp.now() : new Date().getTime();
}

// Update game objects
function update(dt) {
	GAME.Update(dt);
};

function render() {
	GAME.Render();

	DEBUG.Render(true,true);
};

onkeydown = function(e)
{
    Input.Pressed(e, true);
};

onkeyup = function(e)  {
    Input.Pressed(e, false);
    Input.Released(e, true);
};

onblur = function(e)  {
    Input.pressedKeys = {};
};


window.onload = function() {
	Start("canvasBody");
}

