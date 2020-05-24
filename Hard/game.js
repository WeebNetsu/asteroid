// This game was helped made by freeCodeCamp.org on YouTube

const FPS = 30; //Frames per second
const FRICTION = 0.5; //gravity (0 = no graviry, 1 = a lot of gravity)
const GAME_LIVES = 3; //Player lives
const SAVE_KEY_SCORE = "highscore"; //save key for local storage of high score

const LAZER_MAX = 10; //Max num of lazers on screen
const LAZER_DIST = 0.5; //Max distance lazer can travel
const LAZER_SPD = 450; //Speed of lazers (px/s)
const LAZER_EXPLOAD_DUR = 0.1; //lazer expload time

const ROIDS_JAG = 0.3; //uneveness of the astroid (0 = smooth, 1 = very uneven)
const ROIDS_NUM = 4; //Starting number of astroids
const ROIDS_SPD = 60; //Max Starting speed of astroids
const ROIDS_SIZE = 130; //Starting size of astroids (px)
const ROIDS_VERT = 10; //Average number of vertisies on each astroid
const ROIDS_PTS_LGE = 20; //Large astroid = +20pts
const ROIDS_PTS_MED = 50; //Medium astroid = +50pts
const ROIDS_PTS_SML = 100; //Small astroid = +100pts
const ROIDS_PTS_XSML = 150; //EXTRA Small astroid = +150pts

const SHIP__DUR = 3; //ship is invinsible for 3 sec after crash
const SHIP_BLINK_DUR = 0.1; //how fast ship blinks when revived
const SHIP_EXPLOAD_DUR = 0.7; //ship explosion length
const SHIP_INV_DUR = 3; //ship is invinsible for 3 sec after crash
const SHIP_SIZE = 30; //30px
const SHIP_THRUST = 5; //5px/second when moving foreward (The longer you hold the key, the faster it moves)

const TURN_SPEED = 360; //Rotates 360deg per second
const SHOW_CENTER_DOT = false; //Shows dot in center of ship
const SHOW_BOUNDING = false; //Shows circle around astroids
const TEXT_FADE_TIME = 2.5; //Time text takes to fade
const TEXT_SIZE = 40; //40px
const SOUND_ON = true; //Play sound or not
const MUSIC_ON = false;

//Canvas
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d"); //ctx = context

//Canvas size
canv.height = window.innerHeight / 1.035;
canv.width = window.innerWidth / 1.01;

//Sound effects
var fxLazer = new Sound("../sounds/laser.m4a", 5, 0.3);
var fxHit = new Sound("../sounds/hit.m4a", 5);
var fxExplode = new Sound("../sounds/explode.m4a");
var fxThrust = new Sound("../sounds/thrust.m4a", 1, 0.5);

//Background Music
var music = new Music("../sounds/music-low.m4a", "../sounds/music-high.m4a");
var roidsLeft,  roidsTotal;

//Game parameters (levels)
var level, lives, roids, score, scoreHigh, ship, text, textAlpha; //alpha = opacity
newGame();	

//Event handlers (if w click, then move forward...)
document.addEventListener("keydown", keyDown); //when the player presses a key
document.addEventListener("keyup", keyUp); //when the player releases a key

//Game loop
setInterval(update, 1000 / FPS); //Will call update() every 30th of a second

function createAstroidBelt(){
	var x, y;
	roids = [];

	roidsTotal = (ROIDS_NUM + level) * 7;
	roidsLeft = roidsTotal;

	for(var i = 0; i < ROIDS_NUM + level; i++){
		do{
			x = Math.floor(Math.random() * canv.width); 
			y = Math.floor(Math.random() * canv.height);
		} while(distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
		roids.push(newAstroid(x,y, Math.ceil(ROIDS_SIZE / 2))); //adds to our array
	}
}

function destroyAstroid(index){
	var x = roids[index].x;
	var y = roids[index].y;
	var r = roids[index].r;

	//Split astroid into 2 (if big astroid)
	if(r == Math.ceil(ROIDS_SIZE / 2)){
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 4))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 4))); 	
		score += ROIDS_PTS_LGE;
	}else if(r == Math.ceil(ROIDS_SIZE / 4)){
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 8))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 8))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
		score += ROIDS_PTS_MED;
		}else if(r == Math.ceil(ROIDS_SIZE / 8)){
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16)));
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16)));
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16)));
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16))); //makes new astroid half its original size
		roids.push(newAstroid(x, y, Math.ceil(ROIDS_SIZE / 16)));
		score += ROIDS_PTS_SML;
	}else{
		score += ROIDS_PTS_XSML;
	}

	//check high score
	if(score > scoreHigh){
		scoreHigh = score;
		localStorage.setItem(SAVE_KEY_SCORE, scoreHigh); //Saves high score to local storage
	}

	//Destroy astroid
	roids.splice(index, 1);
	fxHit.play();

	//calc amount of remaining astroids
	roidsLeft--;
	music.setAstroidRatio(roidsLeft = 0 ? 1 : roidsLeft / roidsTotal);

	//New level when no more astroids
	if(roids.length == 0){
		level++;
		newLevel();
	}
}

function distBetweenPoints(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); //says how far astroids should spawn from ship
}

function drawShip(x, y, a, color = "white"){
	ctx.strokeStyle = color; //Ship outline
	ctx.lineWidth = SHIP_SIZE / 20;
	ctx.beginPath(); //Where the first line should begin

	ctx.moveTo( //moveTo(x,y); Nose of the ship
		x + 4 / 3 * ship.r * Math.cos(a), 
		y - 4 / 3 * ship.r * Math.sin(a)
	); 

	ctx.lineTo( //Rear left of ship
		x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)), 
		y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
	);

	ctx.lineTo( //Rear Right of ship
		x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)), 
		y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
	);

	ctx.closePath(); //Pulls the line back to wherever it started, now we have a triangle
	ctx.stroke(); //Draws the lines
}

function exploadShip(){
	ship.exploadTime = Math.ceil(SHIP_EXPLOAD_DUR * FPS);
	fxExplode.play();
}

function gameOver(){
	ship.dead = true;
	text = "Game Over";
	textAlpha = 1.0;
}

function keyDown(ev){
	if(ship.dead){
		return; //won't access any of the keys
	}

	switch(ev.keyCode){
		case 32: //Spacebar (Shoot lazer)
			shootLazer();
		break;

		case 37: //Left key (rotate left)
			ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
		break;

		case 65: //A key (rotate left)
			ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
		break;

		case 38: //up key (moves ship foreward)
			ship.thrusting = true; //Is moving foreward
		break;

		case 87: //W key (moves ship foreward)
			ship.thrusting = true; //Is moving foreward
		break;

		case 39: //Right key (rotate right)
			ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
		break;

		case 68: //D key (rotate right)
			ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
		break;
	}
}

function keyUp(ev){
	if(ship.dead){
		return; //won't access any of the keys
	}

	switch(ev.keyCode){
		case 32: //Spacebar (Allows player to shoot again)
			ship.canShoot = true;
		break;

		case 37: //Left key (Stops rotating)
			ship.rot = 0;
		break;

		case 65: //A key (Stops rotating)
			ship.rot = 0;
		break;

		case 38: //up key (stops moving ship foreward)
			ship.thrusting = false; //Is not moving foreward
		break;

		case 87: //W key (stops moving ship foreward)
			ship.thrusting = false; //Is not moving foreward
		break;

		case 39: //Right key (Stops rotating)
			ship.rot = 0;
		break;

		case 68: //D key (Stops rotating)
			ship.rot = 0;
		break;
	}
}

function newAstroid(x, y, r){
	var lvlMult = 1 + 0.1 * level;
	var roid = {
		x: x,
		y: y,
		xv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() <  0.5 ? 1:-1), //if math.random() is less than 0.5 return 1 else -1
		yv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() <  0.5 ? 1:-1), //y velosity
		r: r, //r = radius
		a: Math.random() * Math.PI * 2, //a = angle
		vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
		offs: [] //offset
	};

	//Create vertex offset
	for(var i = 0; i < roid.vert; i++){
		roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
	}

	return roid;
}

function newGame(){
	level = 0; //game level
	score = 0;
	lives = GAME_LIVES;
	ship = newShip();

	//Get high score
	var scoreStr = localStorage.getItem(SAVE_KEY_SCORE); //saves your highscore
	if(scoreStr == null){
		scoreHigh = 0;
	}else{
		scoreHigh = parseInt(scoreStr);
	}

	newLevel();
}

function newLevel(){
	text = "Level " + (level + 1);
	textAlpha = 1.0; //text opacity

	createAstroidBelt();
}

function newShip(){
	return{
		x: canv.width / 2,
		y: canv.height / 2, //Puts space ship in middle of the page
		r: SHIP_SIZE / 2, //r = radius
		a: 90 / 180 * Math.PI, //a = angle (which way the ship is looking), 90deg is ↑(up)
		blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
		blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
		exploadTime: 0,
		canShoot: true,
		dead: false,
		lazers: [],
		rot: 0, //rotation = 0
		thrusting: false, //not moving foreward
		thrust: {
			x: 0,
			y: 0
		}
	}
}

function shootLazer(){
	//Make lazer
	if(ship.canShoot && ship.lazers.length < LAZER_MAX){
		ship.lazers.push({ //Shoots from nose of ship
			x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a), 
			y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
			xv: LAZER_SPD * Math.cos(ship.a) / FPS,
			yv: -LAZER_SPD * Math.sin(ship.a) / FPS,
			dist: 0,
			exploadTime: 0
		});

		fxLazer.play(); //Plays lazer sound effect
	}

	//Stop shooting
	ship.canShoot = false;
}

function Music(srcLow, srcHigh){
	this.soundLow = new Audio(srcLow);
	this.soundHigh = new Audio(srcHigh);
	this.low = true;
	this.tempo = 1.0; //speed of music
	this.beatTime = 0; //frames left until next beat

	this.play = function(){
		if(MUSIC_ON){
			if(this.low){
				this.soundLow.play();
			}else{
				this.soundHigh.play();
			}
			this.low = !this.low;
		}
	}

	this.setAstroidRatio = function(ratio){
		this.tempo = 1.0 - 0.75 * (1.0 - ratio);
	}

	this.tick = function(){
		if(this.beatTime == 0){
			this.play();
			this.beatTime = Math.ceil(this.tempo * FPS);
		}else{
			this.beatTime--;
		}
	}
}

function Sound(src, maxStreams = 1, vol = 1.0){
	this.streamNum = 0;
	this.streams = [];

	for(var i = 0; i < maxStreams; i++){
		this.streams.push(new Audio(src));
		this.streams[i].volume = vol;
	}

	this.play = function(){
		if(SOUND_ON){
			this.streamNum = (this.streamNum + 1) % maxStreams;
			this.streams[this.streamNum].play();
		}
	}

	this.stop = function(){
		this.streams[this.streamNum].pause();
		this.streams[this.streamNum].currentTime = 0;
	}
}

function update(){
	var blinkOn = ship.blinkNum % 2 == 0;
	var exploading = ship.exploadTime > 0;

	//tick the music
	music.tick();

	//Draw Space
	ctx.fillStyle = "black"; //Makes background black
	ctx.fillRect(0, 0, canv.width, canv.height);

	//Thrust the ship
	if(ship.thrusting && !ship.dead){
		ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
		ship.thrust.y += SHIP_THRUST * Math.sin(ship.a) / FPS;
		fxThrust.play();

		//Draw the thruster
		if(!exploading && blinkOn){
			ctx.fillStyle = "red"; //makes inside red
			ctx.strokeStyle = "yellow"; //fruster outline
			ctx.lineWidth = SHIP_SIZE / 10;
			ctx.beginPath(); 

			ctx.moveTo( //rear left
				ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)), 
				ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
			); 

			ctx.lineTo( //rear center
				ship.x - ship.r * 5 / 3 * Math.cos(ship.a), 
				ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
			);

			ctx.lineTo(
				ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)), 
				ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
			);

			ctx.closePath(); 
			ctx.fill();
			ctx.stroke(); //Draws the lines
		}

	}else{ //Slows down ship if youre not pressing the up key
		ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
		ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
		fxThrust.stop();
	}

	//Draw Triangular Space Ship
	if(!exploading){
		if(blinkOn && !ship.dead){
			drawShip(ship.x,ship.y,ship.a);
		}

		//handle blinking
		if(ship.blinkNum > 0){
			//reduse blink time
			ship.blinkTime--;

			//reduse blink num
			if(ship.blinkTime == 0){
				ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
				ship.blinkNum--;
			}
		}

	}else{
		//draw explosion
		ctx.fillStyle = "darkred";
		ctx.beginPath();
		ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "yellow";
		ctx.beginPath();
		ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
		ctx.fill();
	}

	//Sircle around ship
	if(SHOW_BOUNDING){
		ctx.strokeStyle = "lime";
		ctx.beginPath();
		ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
		ctx.stroke();
	}

	//Draw the lazers
	for (var i = 0; i < ship.lazers.length; i++){
		if(ship.lazers[i].exploadTime == 0){ //if(lazer is not exploading)
			ctx.fillStyle = "salmon";
			ctx.beginPath();
			ctx.arc(ship.lazers[i].x, ship.lazers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
			ctx.fill();
		}else{
			//draw explosion
			ctx.fillStyle = "orangered";
			ctx.beginPath();
			ctx.arc(ship.lazers[i].x, ship.lazers[i].y, ship.r * 0.75, Math.PI * 2, false);
			ctx.fill();

			ctx.fillStyle = "salmon";
			ctx.beginPath();
			ctx.arc(ship.lazers[i].x, ship.lazers[i].y, ship.r * 0.5, Math.PI * 2, false);
			ctx.fill();

			ctx.fillStyle = "pink";
			ctx.beginPath();
			ctx.arc(ship.lazers[i].x, ship.lazers[i].y, ship.r * 0.25, Math.PI * 2, false);
			ctx.fill();
		}
	}

	//Detect when lazer hits astroid
	var ax, ay, ar, lx, ly;

	for(var i = roids.length - 1; i >= 0; i--){
		//astroid propperties
		ax = roids[i].x;
		ay = roids[i].y;
		ar = roids[i].r;

		//loop over lazers (remove lazer after hit)
		for(var j = ship.lazers.length - 1; j >= 0; j--){
			//lazer properties
			lx = ship.lazers[j].x;
			ly = ship.lazers[j].y;

			//detect hits
			if(ship.lazers[j].exploadTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar){
				//remove astroid and expload lazer
				destroyAstroid(i);
				ship.lazers[j].exploadTime = Math.ceil(LAZER_EXPLOAD_DUR * FPS);
				break;
			}
		}
	}

	//Draw Astroids
	var x, y, r, a, vert, offs;
	for(var i = 0; i < roids.length; i++){
		ctx.strokeStyle = "slategray";
		ctx.lineWidth = SHIP_SIZE / 20;

		//Get astroids properties
		x = roids[i].x;
		y = roids[i].y;
		r = roids[i].r;
		a = roids[i].a;
		vert = roids[i].vert;
		offs = roids[i].offs;

		//Draw Path
		ctx.beginPath();

		ctx.moveTo(
			x + r * offs[0] * Math.cos(a),
			y + r * offs[0] * Math.sin(a)
		);

		//Draw Polygon
		for(var j = 1; j < vert; j++){
			ctx.lineTo(
				x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
				y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
			);
		}
		ctx.closePath();
		ctx.stroke();

		//Sircle around astroids
		if(SHOW_BOUNDING){
			ctx.strokeStyle = "lime";
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2, false);
			ctx.stroke();
		}
	}

	//Check for astroid collision
	if(!exploading && !ship.dead){
		if(ship.blinkNum == 0){ //makes ship invincible
			for(var i = 0; i < roids.length; i++){
				if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r){
					exploadShip();
					destroyAstroid(i);
					break;
				}
			}
		}

		//Rotate Space Ship
		ship.a += ship.rot;

		//Move Space Ship
		ship.x += ship.thrust.x;
		ship.y -= ship.thrust.y;
	}else{
		ship.exploadTime--;
		if(ship.exploadTime == 0){
			lives--;

			if(lives == 0){
				gameOver();
			}else{
				ship = newShip();
			}
		}
	}

	//Draw game text
	if(textAlpha >= 0){
		ctx.textAlign = "center";
		ctx.textBaseLine = "middle";
		ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
		ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono"; //dejavi - font
		ctx.fillText(text, canv.width / 2, canv.height * 0.75);
		textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
	}else if(ship.dead){
		newGame();
	}

	//Draw Lives
	var lifeColor;

	for(var i = 0; i < lives; i++){
		lifeColor = exploading && i == lives - 1 ? "red" : "white"; //if(exploading && i = lives - 1){lifeColor == red}else{lifeColor = white}
		drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor);
	}

	//Draw the score
	ctx.textAlign = "right";
	ctx.textBaseLine = "middle";
	ctx.fillStyle = "white";
	ctx.font = (TEXT_SIZE - 5) + "px dejavu sans mono";
	ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

	//Draw the high score
	ctx.textAlign = "center";
	ctx.textBaseLine = "middle";
	ctx.fillStyle = "white";
	ctx.font = (TEXT_SIZE * 0.75) + "px dejavu sans mono";
	ctx.fillText("BEST: " + scoreHigh, canv.width / 2, SHIP_SIZE);

	//Off Screen (makes ship appear back on screen when player flies off)
	if(ship.x < 0 - ship.r){
		ship.x = canv.width + ship.r;
	}else if(ship.x > canv.width + ship.r){
		ship.x = 0 - ship.r;
	}

	if(ship.y < 0 - ship.r){
		ship.y = canv.height + ship.r;
	}else if(ship.y > canv.height + ship.r){
		ship.y = 0 - ship.r;
	}

	for(var i = 0; i < roids.length; i++){
		//move astroid
		roids[i].x += roids[i].xv;
		roids[i].y += roids[i].yv;

		//Edge of screen (so the dont go off screen)
		if(roids[i].x < 0 - roids[i].r){
			roids[i].x = canv.width + roids[i].r;
		}else if(roids[i].x > canv.width + roids[i].r){
			roids[i].x = 0 - roids[i].r;
		}

		if(roids[i].y < 0 - roids[i].r){
			roids[i].y = canv.height + roids[i].r;
		}else if(roids[i].y > canv.height + roids[i].r){
			roids[i].y = 0 - roids[i].r;
		}
	}

	//move the lazer
	for(var i = ship.lazers.length - 1; i >= 0; i--){
		//check distance travled
		if(ship.lazers[i].dist > LAZER_DIST * canv.width){
			ship.lazers.splice(i, 1);
			continue; //skips rest of command and continues with rest of for loop
		}

		//handle the explosion
		if(ship.lazers[i].exploadTime > 0){
			ship.lazers[i].exploadTime--;

			//destroy lazer
			if(ship.lazers[i].exploadTime == 0){
				ship.lazers.splice(i, 1);
				continue;
			}
		}else{
			//move lazer
			ship.lazers[i].x += ship.lazers[i].xv;
			ship.lazers[i].y += ship.lazers[i].yv;

			//Calc dist traveled
			//a(pow of 2) + b(pow of 2) = c(pow of 2)
			ship.lazers[i].dist += Math.sqrt(Math.pow(ship.lazers[i].xv, 2)) + Math.sqrt(Math.pow(ship.lazers[i].yv, 2)); 
		}

		//Edge of screen
		if(ship.lazers[i].x < 0){
			ship.lazers[i].x = canv.width;
		}else if(ship.lazers[i].x > canv.width){
			ship.lazers[i].x = 0;
		}

		if(ship.lazers[i].y < 0){
			ship.lazers[i].y = canv.height;
		}else if(ship.lazers[i].y > canv.height){
			ship.lazers[i].y = 0;
		}
	}

	//Center dot
	ctx.fillStyle = 'red';
	if(SHOW_CENTER_DOT){
		ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2); //Moves the . downwards, closer to center
	}
}