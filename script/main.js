
//https://javascript.info/class-inheritance
//https://dev.to/nitdgplug/learn-javascript-through-a-game-1beh
//https://www.minifier.org/
//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe C:\z\Git\WG5\index.htm" --allow-file-access-from-files
var fps = 60;
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

var GAME;
var GFX;
var SFX;
var MAP;

var MUSIC;
var SPRITES = [];
var PHYSICS = new World();
var canvas;
var AUDIO;

var IsTouchDevice = window.ontouchstart !== undefined;
		
var map = {
	set:"tile",
	size:{
		tile:{width:32, height:32},
		screen:{width:25, height:19},
		world:{width:100, height:32}
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


		MUSIC = new TinyMusic();
		AUDIO = new TinySound();

		//offscreen renderer
		GFX = new Render(MAP.osCanvas.ctx);	
		SFX = new Render(MAP.screenCtx, map.size.screen.width* map.size.tile.width, 
			map.size.screen.height* map.size.tile.height);	

		Input.Init(canvas, IsTouchDevice, SFX);

		SPRITES = new SpritePreProcessor(null, DEFS.spriteDef);	

		preInit();
	}
}

function preInit(){

	Generate(0,'sprites8x2', 111, 2);
	Generate(0,'sprites8x4', 111, 4);
	Generate(1,'sprites16x1', 128, 1);
	Generate(1,'sprites16x2', 128, 2);
	Generate(1,'sprites16x4', 128, 4);
	Generate(2,'sprites24x4', 48, 4);
	Generate1();

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
	
	var spr = Util.Unpack(DEFS.spriteData[index]);

	for (var i = 0; i < spr.length; i++) {
		if(spr[i]>0){
			var c = parseInt(i % w);
			var r = parseInt(i / w);
			gx.Box(c*sz, r*sz, sz, sz, DEFS.spritePal[spr[i]]);
		}
	}

	SPRITES.assets[tagname] = g;
}

function init()
{  
	lastTime = 0;

	GAME = new Blocky();

	FixedLoop();  
}

function SlowMo(mo){
	sStep = mo * step;
}

function FixedLoop(){
	if(Input.IsSingle('Escape') ) {
		GAME.Quit();
	}

//DEBUG
// if(Input.IsSingle('y') ) {
// 	slowMo+=1;
// 	SlowMo(slowMo);		
// }
// else if(Input.IsSingle('t') ) {
// 	if(slowMo-1 > 0){
// 		slowMo-=1;
// 		SlowMo(slowMo);
// 	}
// }
//DEBUG

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

