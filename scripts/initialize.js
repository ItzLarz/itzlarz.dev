// Withhold context menu on right click
document.oncontextmenu = function () {
	return false;
};

// Declaring all variables
const boxSize = 30;
var bombs = 90;
var rows = 20;
var columns = 40;
var edgeSize = 10;
var topBorderSize = rows * 5;
var bottomBorderSize = rows * 1.66;
var buttonSize = bottomBorderSize / 1.2;

var squares = [];
var bombList = [];
var uncoverList = [];
var music = [];
var gameOver = false;
var win = false;
var defeat = false;
var gamePlaying = false;
var bombCount = bombs;
var interval = 0;
var minutes = 0;
var seconds = 0;
var spacer = "0";
var songNum = 0;
var musicState = false;
var homeScreenState = true;
var settingsScreenState = false;
var creditsScreenState = false;
var song;
var bombSlider;
var rowSlider;
var columnSlider;

// Initializing all images
let square0;
let square1;
let square2;
let square3;
let square4;
let square5;
let square6;
let square7;
let square8;
let squareBlank;
let squareFlag;
let squareMine;
let squareNotMine;
let squareRedMine;
let homeButton;
let musicButton;
let noMusicButton;
let nextButton;
let previousButton;
let stock;
let play;
let settings;
let credits;

function preload() {
	// Loading the images
	square0 = loadImage("0.png");
	square1 = loadImage("1.png");
	square2 = loadImage("2.png");
	square3 = loadImage("3.png");
	square4 = loadImage("4.png");
	square5 = loadImage("5.png");
	square6 = loadImage("6.png");
	square7 = loadImage("7.png");
	square8 = loadImage("8.png");
	squareBlank = loadImage("blank.png");
	squareFlag = loadImage("flag.png");
	squareMine = loadImage("mine.png");
	squareNotMine = loadImage("notmine.png");
	squareRedMine = loadImage("redmine.png");
	homeButton = loadImage("home.png");
	musicButton = loadImage("music.png");
	noMusicButton = loadImage("nomusic.png");
	nextButton = loadImage("next.png");
	previousButton = loadImage("previous.png");
	stock = loadImage("stock.png");
	play = loadImage("play.png");
	settings = loadImage("settings.png");
	credits = loadImage("credits.png");

	// Loading the music
	soundFormats("mp3");
	music.push(loadSound("music.mp3"));
	music.push(loadSound("music2.mp3"));
	music.push(loadSound("music3.mp3"));
	music.push(loadSound("music4.mp3"));
	music.push(loadSound("music5.mp3"));
	outputVolume(0.2);
}

function setup() {
	// Creating a canvas
	createCanvas(0, 0);
	homeScreen();
}

function draw() {
	// Creating game timer
	if (!gameOver && !homeScreenState && gamePlaying) {
		if (millis() - interval >= 1000) {
			interval = millis();
			seconds += 1;
			textAlign(CENTER);
			textSize(columns);
			strokeWeight(0);
			fill(200);
			rect(
				edgeSize + (boxSize * columns) / 1.2,
				(topBorderSize + edgeSize) / 1.5,
				columns * 5,
				topBorderSize - topBorderSize / 1.55
			);
			fill(0);

			if (seconds >= 60) {
				minutes += 1;
				seconds = 0;
			}

			if (seconds >= 10) {
				spacer = "";
			} else {
				spacer = 0;
			}

			text(
				minutes + ":" + spacer + seconds,
				edgeSize + (boxSize * columns) / 1.2,
				(topBorderSize + edgeSize) / 1.4
			);
		}
	}
}

function init() {
	// Resetting the variables
	if (bombs > round((rows * columns) / 3.5 / 5) * 5) {
		bombs = round((rows * columns) / 3.5 / 5) * 5;
	}

	edgeSize = (columns * rows) / 40;
	if (edgeSize < 10) {
		edgeSize = 10;
	}

	squares = [];
	bombList = [];
	uncoverList = [];
	gameOver = false;
	win = false;
	defeat = false;
	gamePlaying = false;
	bombCount = bombs;
	interval = 0;
	minutes = 0;
	seconds = -1;
	spacer = "0";

	// Initializing new game
	resizeCanvas(
		2 * edgeSize + boxSize * columns,
		topBorderSize + bottomBorderSize + 2 * edgeSize + boxSize * rows
	);
	background(100);
	drawField();
	selectBombs();
	calcValue();
	drawBorders();

	// Printing the field in the console for cheating ;)
	console.log(squares);
}

function homeScreen() {
	// Home screen
	resizeCanvas(1600, 850);
	background(100);
	image(stock, 0, 0, 1600, 850);

	// Playbutton
	imageMode(CENTER);
	image(play, 800, 425, 150, 150);

	// Credits and settings buttons
	imageMode(CORNER);
	image(settings, 20, 730, 100, 100);
	image(credits, 1480, 730, 100, 100);
}

function settingsScreen() {
	// Settings screen
	imageMode(CORNER);
	image(stock, 0, 0, 1600, 850);
	image(homeButton, 1480, 730, 100, 100);

	textAlign(LEFT);
	textSize(45);
	stroke(0);
	fill(0);
	strokeWeight(1);

	// Variable slider number of bombs
	text("Number of Bombs: " + bombs, 30, 150);
	bombSlider = createSlider(0, round((rows * columns) / 3.5 / 5) * 5, bombs, 5);
	bombSlider.class("slider");
	bombSlider.position(540, 120);
	bombSlider.changed(sliderChange);

	// Variable slidedr number of rows
	text("Number of Rows: " + rows, 30, 240);
	rowSlider = createSlider(15, 35, rows, 5);
	rowSlider.class("slider");
	rowSlider.position(540, 210);
	rowSlider.changed(sliderChange);

	// Variable slider number of columns
	text("Number of Columns: " + columns, 30, 330);
	columnSlider = createSlider(30, 70, columns, 5);
	columnSlider.class("slider");
	columnSlider.position(540, 300);
	columnSlider.changed(sliderChange);
}

function creditsScreen() {
	// Credits screen
	imageMode(CORNER);
	image(stock, 0, 0, 1600, 850);
	image(homeButton, 1480, 730, 100, 100);

	textAlign(CENTER);
	textSize(60);
	stroke(0);
	fill(0);
	strokeWeight(2);
	text("Coding and design by:", 800, 100);
	strokeWeight(1);
	text("Lars Kruitwagen", 800, 170);
	text("Emma van Schaik", 800, 240);

	// Referencing no-copyright music
	strokeWeight(2);
	text("Music by:", 800, 680);
	strokeWeight(1);
	text("Eric Matyas", 800, 750);
	text("www.soundimage.org", 800, 820);
	textAlign(LEFT);
}

function gameOverScreen() {
	// Game over screen

	if (defeat) {
		// If player lost
		fill(200);
		stroke(170);
		strokeWeight(5);
		rectMode(CENTER);
		rect(
			edgeSize + (boxSize * columns) / 2,
			(topBorderSize + edgeSize) / 2,
			columns * 6.66,
			topBorderSize - topBorderSize / 10,
			columns
		);

		textAlign(CENTER);
		textSize(columns * 1.3);
		fill(0);
		strokeWeight(0);
		text(
			"Try again?",
			edgeSize + (boxSize * columns) / 2,
			(topBorderSize + edgeSize) / 2
		);
		textAlign(LEFT);
	}

	if (win) {
		// If player won
		fill(200);
		stroke(170);
		strokeWeight(5);
		rectMode(CENTER);
		rect(
			edgeSize + (boxSize * columns) / 2,
			(topBorderSize + edgeSize) / 2,
			columns * 6.66,
			topBorderSize - topBorderSize / 10,
			columns
		);

		textAlign(CENTER);
		textSize(columns * 1.3);
		fill(0);
		strokeWeight(0);
		text(
			"You won!",
			edgeSize + (boxSize * columns) / 2,
			(topBorderSize + edgeSize) / 2
		);
		textAlign(LEFT);
	}
}

function drawField() {
	// Making JavaScript object for every square in the field
	for (i = 0; i < columns; i++) {
		let tempList = [];
		for (j = 0; j < rows; j++) {
			let object = new Object();
			object.col = i;
			object.row = j;
			object.rawx = edgeSize + i * boxSize;
			object.rawy = topBorderSize + edgeSize + j * boxSize;
			object.bomb = false;
			object.covered = true;
			object.marked = false;
			object.value = 0;
			tempList.push(object);
			image(squareBlank, object.rawx, object.rawy, boxSize, boxSize);
		}
		squares.push(tempList);
	}
}

function selectBombs() {
	// Selecting bombs in random places
	while (bombList.length < bombs) {
		let pickedLine = random(squares);
		let pickedSquare = random(pickedLine);
		// Stopping a square from having two bombs
		if (pickedSquare.bomb != true) {
			bombList.push(pickedSquare);
			pickedSquare.bomb = true;
			pickedSquare.value = null;
		}
	}
}

function calcValue() {
	// Calculating the value of all the squares that aren't bombs
	for (i = 0; i < columns; i++) {
		for (j = 0; j < rows; j++) {
			let countBombs = 0;
			if (squares[i][j].bomb == true) {
				continue;
			}

			if (i > 0) {
				// Left
				if (squares[i - 1][j].bomb == true) {
					countBombs++;
				}
			}

			if (i < columns - 1) {
				// Right
				if (squares[i + 1][j].bomb == true) {
					countBombs++;
				}
			}

			if (j > 0) {
				// Bottom
				if (squares[i][j - 1].bomb == true) {
					countBombs++;
				}
			}

			if (j < rows - 1) {
				// Top
				if (squares[i][j + 1].bomb == true) {
					countBombs++;
				}
			}

			if (i > 0 && j < rows - 1) {
				// Left Top
				if (squares[i - 1][j + 1].bomb == true) {
					countBombs++;
				}
			}

			if (i > 0 && j > 0) {
				// Left Bottom
				if (squares[i - 1][j - 1].bomb == true) {
					countBombs++;
				}
			}

			if (i < columns - 1 && j < rows - 1) {
				// Right Top
				if (squares[i + 1][j + 1].bomb == true) {
					countBombs++;
				}
			}

			if (i < columns - 1 && j < 0) {
				// Right Bottom
				if (squares[i + 1][j - 1].bomb == true) {
					countBombs++;
				}
			}

			// Setting the value of the square
			squares[i][j].value = countBombs;
		}
	}
}

function drawBorders() {
	// Drawing all buttons and borders around the field
	fill(200);
	stroke(170);
	strokeWeight(5);
	rectMode(CENTER);

	rect(
		edgeSize + (boxSize * columns) / 6,
		(topBorderSize + edgeSize) / 2,
		columns * 6.66,
		topBorderSize - topBorderSize / 10,
		columns
	);
	rect(
		edgeSize + (boxSize * columns) / 2,
		(topBorderSize + edgeSize) / 2,
		columns * 6.66,
		topBorderSize - topBorderSize / 10,
		columns
	);
	rect(
		edgeSize + (boxSize * columns) / 1.2,
		(topBorderSize + edgeSize) / 2,
		columns * 6.66,
		topBorderSize - topBorderSize / 10,
		columns
	);

	textAlign(CENTER, CENTER);
	textSize(columns * 1.5);
	fill(0);
	strokeWeight(0);

	text(
		"Reset",
		edgeSize + (boxSize * columns) / 2,
		(topBorderSize + edgeSize) / 2
	);

	textSize(columns);

	text(
		"Bombs:",
		edgeSize + (boxSize * columns) / 6,
		(topBorderSize + edgeSize) / 2.5
	);
	text(
		bombCount,
		edgeSize + (boxSize * columns) / 6,
		(topBorderSize + edgeSize) / 1.4
	);
	text(
		"Time:",
		edgeSize + (boxSize * columns) / 1.2,
		(topBorderSize + edgeSize) / 2.5
	);
	text(
		"0:00",
		edgeSize + (boxSize * columns) / 1.2,
		(topBorderSize + edgeSize) / 1.4
	);

	imageMode(CENTER);
	image(
		homeButton,
		0.33 * (2 * edgeSize + boxSize * columns),
		(bottomBorderSize - edgeSize) / 2 +
			topBorderSize +
			2 * edgeSize +
			boxSize * rows,
		buttonSize,
		buttonSize
	);

	if (musicState) {
		image(
			musicButton,
			0.66 * (2 * edgeSize + boxSize * columns),
			(bottomBorderSize - edgeSize) / 2 +
				topBorderSize +
				2 * edgeSize +
				boxSize * rows,
			buttonSize,
			buttonSize
		);
		image(
			nextButton,
			0.66 * (2 * edgeSize + boxSize * columns) + buttonSize,
			(bottomBorderSize - edgeSize) / 2 +
				topBorderSize +
				2 * edgeSize +
				boxSize * rows,
			buttonSize / 1.57,
			buttonSize / 1.57
		);
		image(
			previousButton,
			0.66 * (2 * edgeSize + boxSize * columns) - buttonSize,
			(bottomBorderSize - edgeSize) / 2 +
				topBorderSize +
				2 * edgeSize +
				boxSize * rows,
			buttonSize / 1.57,
			buttonSize / 1.57
		);
	} else if (!musicState) {
		image(
			noMusicButton,
			0.66 * (2 * edgeSize + boxSize * columns),
			(bottomBorderSize - edgeSize) / 2 +
				topBorderSize +
				2 * edgeSize +
				boxSize * rows,
			buttonSize,
			buttonSize
		);
	}

	imageMode(CORNER);
	textAlign(LEFT);
}

function toggleMusic() {
	// Toggle music on/off
	song = music[songNum];
	if (song.isLoaded()) {
		if (musicState) {
			song.loop();
		} else if (!musicState) {
			song.pause();
		}
	}
}

function skipMusic(direction) {
	// Skip to next or previous song
	song.stop();

	if (direction == "next") {
		if (songNum == 4) {
			songNum = 0;
			song = music[songNum];
			song.loop();
		} else {
			songNum += 1;
			song = music[songNum];
			song.loop();
		}
	} else if (direction == "prev") {
		if (songNum == 0) {
			songNum = 4;
			song = music[songNum];
			song.loop();
		} else {
			songNum -= 1;
			song = music[songNum];
			song.loop();
		}
	}
}

function sliderChange() {
	// If the bomb, row or column slider changes, the value of that variable changes
	bombs = bombSlider.value();
	rows = rowSlider.value();
	columns = columnSlider.value();
	imageMode(CORNER);
	image(stock, 0, 0, 1600, 850);
	image(homeButton, 1480, 730, 100, 100);

	textAlign(LEFT);
	textSize(45);
	stroke(0);
	fill(0);
	strokeWeight(1);
	text("Number of Bombs: " + bombs, 30, 150);
	text("Number of Rows: " + rows, 30, 240);
	text("Number of Columns: " + columns, 30, 330);

	topBorderSize = columns * 4;
	bottomBorderSize = rows * 1.66;

	if (topBorderSize < 80) {
		topBorderSize = 80;
	}
	if (bottomBorderSize < 40) {
		bottomBorderSize = 40;
	}

	buttonSize = bottomBorderSize / 1.2;
}
