var ct = null;
var game = null;
var FIELD = { w: 384, h: 384, r: 3, c: 3 };
var MOLE_IMG = { w: 100, h: 100, path: 'img/mole1.png', rarePath: 'img/mole2.png' };
var mole = null;
var mole2 = null;

var moleImg = new Image();
	moleImg.src = MOLE_IMG.path;
var moleImgRare = new Image();
	moleImgRare.src = MOLE_IMG.rarePath;

var gridSize = (FIELD.r*FIELD.c);
var cellWidth = FIELD.w/FIELD.c;
var cellHeight = FIELD.h/FIELD.r;
var xCenter = cellWidth/2;
var yCenter = cellHeight/2;

var cells = new Array();
for(var r=0;r<FIELD.r;r++) {
	for(var c=0;c<FIELD.c;c++) {
		cell = {};
		cell.x1 = parseInt((cellWidth * r));
		cell.y1 = parseInt((cellHeight * c));
		cell.x2 = parseInt((cellWidth * r) + cellWidth);
		cell.y2 = parseInt((cellHeight * c) + cellHeight);

		cells.push(cell);
	}
}

function clear() {
	ct.putImageData(blank, 0, 0);
}

function draw() {
	clear();
	game.drawScore();

	if (mole) {
		drawMole(mole);
	}

	if (mole2) {
		drawMole(mole2);
	}
}

function drawMole(mole) {
	var xPad = (cellWidth - MOLE_IMG.w) / 2;
	var yPad = (cellWidth - MOLE_IMG.h) / 2;
	bitmap = moleImg;
	if (mole.rare) {
		bitmap = moleImgRare;
	}
	ct.drawImage(bitmap,mole.hole.x1+xPad,mole.hole.y1+yPad);
}

function hit(x,y) {
	for(var i in cells) {
		if (x>cells[i].x1 && y>cells[i].y1 && x<cells[i].x2 && y<cells[i].y2) {
			return cells[i];
		}
	}
}

function Game() {
	var cache = this;
	this.drawTimer = null;
	this.moleTimer = null;
	this.lifetime = null;
	this.refresh = 80;
	this.moleInterval = 300;
	this.gameLength = 30000;
	this.score = 0;

	this.init = function() {
		this.drawTimer = setInterval(function() {
			draw();
		}, this.refresh);

		this.moleTimer = setInterval(function() {
			moleFactory();
		}, this.moleInterval);

		this.lifetime = setTimeout(function() {
			cache.end();
		}, this.gameLength);
	};

	this.end = function() {
		clearInterval(this.moleTimer);
		clearInterval(this.drawTimer);
		clear();

		this.drawScore();

		ct.font = '16px courier, courier new, monospace';
		ct.fillStyle = 'rgba(0,0,0,1)'
		ct.fillText('GAME OVER',FIELD.w/2-50,FIELD.h/2);
	};

	this.drawScore = function() {
		ct.font = '16px courier, courier new, monospace';
		ct.fillStyle = 'rgba(0,0,0,1)'
		ct.fillText('Score: ' + this.score, 5, 21);
	}

	this.incrementScore = function(points) {
		this.score += points;
	}
}

function Mole(rare) {
	this.alive = true;
	this.lifespan = null;
	this.hole = null;
	this.rare = true == rare;

	this.getLifespan = function() {
		return Math.floor((Math.random()*750)+750)-250;
	}

	this.findHole = function() {
		var r = Math.floor(Math.random()*gridSize);
		return cells[r];
	}

	this.kill = function() {
		this.alive = false;
	}

	this.lifespan = this.getLifespan();
	this.hole = this.findHole();
}

function moleFactory() {
	if (!mole) {
		mole = new Mole();

		setTimeout(function() {
			mole = null;
		}, mole.lifespan);
	}

	spawn = 1 == Math.floor((Math.random()*10));

	if (!mole2 && spawn) {
		mole2 = new Mole(true);
		
		setTimeout(function() {
			mole2 = null;
		}, mole2.lifespan);
	}
}

$(function() {
	var cv = document.getElementById('stage');
	var $cv = $(cv);

	try {
		ct = cv.getContext('2d');
	} catch(e) {
		throw new Error('No canvas');
	}

	cv.width = FIELD.w;
	cv.height = FIELD.h;

	blank = ct.getImageData(0,0,FIELD.w,FIELD.h);

	$cv.click(function(e) {
		var pos = $(this).position();
		x = e.pageX - pos.left;
		y = e.pageY - pos.top;

		clicked = hit(x,y);
		if (mole && mole.alive && clicked == mole.hole) {
			game.incrementScore(100);
			mole.kill();
		}

		if (mole2 && mole2.alive && clicked == mole2.hole) {
			game.incrementScore(150);
			mole2.kill();
		}
	});

	$('#start').click(function() {
		if (!game) {
			game = new Game();
			game.init();
			
			setTimeout(function() {
				game = null;
			}, game.gameLength);
		}
	});
});