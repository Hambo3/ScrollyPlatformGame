
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
	'player':{tag:'sprites32',src:[{x:0,y:0}, {x:0,y:32}],w:32,h:32},
	'block16':{tag:'sprites16',src:[{x:16,y:0}],w:16,h:16},
	'brick16':{tag:'sprites16',src:[{x:32,y:0}],w:16,h:16},	
	'box16':{tag:'sprites16',src:[{x:48,y:0}],w:16,h:16},
	'ball16':{tag:'sprites16',src:[{x:64,y:0}],w:16,h:16},

	'block32':{tag:'sprites32',src:[{x:32,y:0}],w:32,h:32},
	'brick32':{tag:'sprites32',src:[{x:64,y:0}],w:32,h:32},
	'ground32':{tag:'sprites32',src:[{x:32,y:32}],w:32,h:32},
	'box32':{tag:'sprites32',src:[{x:96,y:0}],w:32,h:32},
	'ball32':{tag:'sprites32',src:[{x:128,y:0}],w:32,h:32},
	'ball32n':{tag:'sprites32n',src:[{x:0,y:0}],w:32,h:32},
	'ball64':{tag:'sprites64',src:[{x:0,y:0}],w:64,h:64},
	'crate32':{tag:'sprites32n',src:[{x:32,y:0}],w:32,h:32},
	'brick10h':{tag:'sprites16.2',src:[{x:0,y:0}],w:160,h:16},
	'shard1':{tag:'sprites32',src:[{x:64,y:32}],w:32,h:16},
	'shard2':{tag:'sprites32',src:[{x:64,y:48}],w:32,h:16},
	};

	var spritePal =[
		"#0FFF1B",
		"#000000",
		"#494949",
		"#898989",
		"#ADADAD",
		"#C6C6C6",
		"#FFFFFF",
		"#FF1500",
		"#021BFF",
		"#DA792C",
		"#EA8C2E",
		"#FFC166",
		"rgba(100,173,217,0.6)",
		"rgba(92,160,192,0.6)",
		"#298734",
		"#7F0000"
	];

var spriteData = [
	"7|8|7,4|8|7|0|2,6|0|9,8|0|12,6|0,4|2,2|0,4|1,6|0,2|1,6|0|7,2|6,4|7,2|2|3,6|2|9|10,3|9,2|10|9|12|13,6|12|0|2,2|5,2|2,2|0|1|4,3|5,3|1,2|4,3|5,3|1|7|6,6|7|2|3,5|4|2|10|9,2|10,5|12|13,6|12|0|2|5,3|3|2|0|1|4,4|5,2|1,2|4,4|5,2|1|7|6|1|6,2|1|6|7|2|3,5|4|2|9|10|9,6|12|13,6|12|2|5,4|3,2|2|1|4,5|5|1,2|4,5|5|1|7|6,6|7|2|3,3|4,2|5|2|10,8|12|13,6|12|2|5,3|3,3|2|1|4,6|1,2|4,6|1|8,3|1,2|8,3|2|3,2|4,2|5,2|2|9,6|10|9|12|13,6|12|0|2|3,4|2|0|1|4,6|1,2|4,6|1|8,8|2|3|4,2|5,3|2|9|10,6|9|12|13,6|12|0|2,2|3,2|2,2|0|1|4,6|1,2|4,6|1|0|7,2|0,2|7,2|0,2|2,6|0|9,5|10|9,2|0|12,6|0,4|2,2|0,4|1,6|0,2|1,6|0|7|8|7,4|8|7|14,8|10,6|9,2|1,32|7,2|6,4|7,2|14,8|9,8|1,32|7|6|1|6,2|1|6|7|14,8|9,2|10,4|9|10|1,32|7|6,6|7|14,8|9,8|1,32|7|6,2|1,2|6,2|7|14,3|15,2|14,3|9|10,2|9|10,4|1,32|8,3|1,2|8,3|15,8|9,8|1,32|8,8|15,8|10,5|9,3|1,32|0,2|7,4|0,2|15,8|9,8|1,32",
	"0,5|2,6|0,7|9,13|0,5|2|5,7|2|0,4|9|11,6|10,6|9,2|0,3|2|5,3|4,6|2|0,3|9|10,13|9|0,2|2|5,2|4,9|2|0,2|9|10,13|9|0,2|2|5|4,9|3,2|2|0|9,15|0|2|5,2|4,9|3,3|2|9|10|9|11|10|9|11|10|9|11|10|9|10,2|9|0|2|5|4,9|3,4|2|9|10|9|10,2|9|11|10|9|11|10|9|10,2|9|2|5,2|4,8|3,5|2|9|10|9|10,2|9|10,2|9|10,2|9|10,2|9|2|5|4,9|3,5|2|9|10|9|10,2|9|10,2|9|10,2|9|10,2|9|2|4,8|3,7|2|9|10|9|10,2|9|10,2|9|10,2|9|10,2|9|0|2|3,3|4,4|3,7|2|9|10|9|10,2|9|10,2|9|10,2|9|10,2|9|0|2|3,4|4|3,9|2|9,15|0|2|3,13|2|0|9|11,10|10,3|9|0,2|2|3,11|2|0,2|9|10,13|9|0,3|2,2|3,8|2|0,3|9|10,12|9,2|0,5|2,8|0,5|9,13|0"
];

		
var map = {
	set:"tile",
	size:{
		tile:{width:32, height:32},
		screen:{width:25, height:19},
		world:{width:100, height:24}
	},
	objects:[],	
	 //data:"1,117|0|1,36|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,42",
	//objects:[{id:5,i:[{x:222, y:752, r:0.000},{x:267, y:752, r:0.000},{x:628, y:688, r:-0.000},{x:763, y:752, r:-0.000},{x:763, y:720, r:0.000},{x:763, y:688, r:0.000},{x:763, y:656, r:0.000},{x:660, y:752, r:-0.000},{x:661, y:720, r:-0.000},{x:696, y:752, r:-0.000}]},{id:9,i:[{x:199, y:711, r:0.213},{x:920, y:688, r:1.571}]}],
	//data:"1,117|0|1,36|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,8|6|1,2|0,11|6,3|0,12|1,8|6|1,12|6,2|1,19",
	//xobjects:[{id:4,i:[{x:470, y:760},{x:427, y:664},{x:443, y:664},{x:408, y:664},{x:388, y:664},{x:370, y:664},{x:531, y:760},{x:422, y:760},{x:515, y:760},{x:332, y:664},{x:239, y:664},{x:247, y:760},{x:445, y:648},{x:429, y:648},{x:408, y:648},{x:388, y:648},{x:352, y:664},{x:226, y:760}]},{id:5,i:[{x:588, y:752},{x:555, y:752},{x:697, y:688},{x:757, y:720},{x:785, y:752},{x:729, y:688},{x:789, y:720},{x:761, y:688},{x:757, y:656},{x:759, y:624},{x:692, y:656},{x:693, y:624},{x:725, y:656},{x:984, y:752},{x:877, y:752},{x:839, y:752},{x:725, y:624},{x:710, y:592},{x:706, y:560}]},{id:9,i:[{x:546, y:710}]},{id:10,i:[{x:296, y:760},{x:312, y:760},{x:328, y:760},{x:345, y:760},{x:362, y:760},{x:727, y:760},{x:1175, y:760},{x:1159, y:760},{x:1143, y:760},{x:1111, y:760},{x:1127, y:760},{x:1085, y:760},{x:1008, y:760},{x:665, y:760},{x:682, y:760},{x:438, y:760},{x:628, y:760},{x:644, y:760},{x:454, y:760},{x:393, y:760},{x:612, y:760}]},{id:11,i:[{x:705, y:752}]}],
	//data:"1,117|0|1,36|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|6,2|0,2|6,4|0,5|6,2|0,11|1,11|0,3|6|0,11|6,2|0,9|1,13|6|1,14|6|1,13",
	//data:"1,117|0|1,36|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,7|6,3|0,2|12,4|0,10|1,11|6,2|0,2|6,4|0,18|1,11|0,26|1,42",
	//objects:[{id:4,i:[{x:576, y:760},{x:592, y:760}]},{id:5,i:[{x:583, y:736},{x:583, y:704},{x:581, y:672}]},{id:8,i:[{x:205, y:688},{x:691, y:752},{x:689, y:720},{x:684, y:688},{x:749, y:752}]},{id:9,i:[{x:614, y:650}]}],
	//data:"1,117|0|1,36|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,26|1,11|0,6|6,3|0,17|1,11|6,2|0,6|6,2|0,16|1,42",
	data:[],
	xdata:[
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	]
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

	Generate(0,'sprites16', 56, 2);
	Generate(0,'sprites32', 56, 4);
	Generate(1,'sprites32n', 32, 2);
	Generate(1,'sprites64', 32, 4);
	Generate1();
	
	//MAP.Init(true);	
	init();
}


function Generate1(){
	var g = document.createElement('canvas');
	var gctx = g.getContext('2d');
	var gx = new Render(gctx);      

	var s = SPRITES.Get('brick16', 0);
	for (var i = 0; i < 10; i++) {
		gx.Sprite(8+(i*16), 8, s, 1, 0);
	}
	SPRITES.assets['sprites16.2'] = g;
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

