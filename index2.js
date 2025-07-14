const noSave = false;
var elem;

/* TEMPORARY USE OF ORIGINAL CODE TO TEST THINGS OUT */
try {
    let app = firebase.app();
} catch (e) {
    console.error(e);
}

// Setting up firebase variables
const firestore = firebase.firestore(); // (a.k.a.) db
const firebasestorage = firebase.storage();
const subjectcollection = firestore.collection("prolificlongfirstSubjects"); // short or long
const trialcollection = firestore.collection("prolificlongfirstTrials"); // short or long
// const subjectcollection = firestore.collection("prolificshortfirstSubjects"); // short or long
// const trialcollection = firestore.collection("prolificshortfirstTrials"); // short or long


// Function to switch between HTML pages
function show(shown, hidden) {
	console.log("Entering the show function")
	console.log("Show: " + shown)
    document.getElementById(shown).style.display = 'block';
    document.getElementById(hidden).style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return false;
}
// Function used to enter full screen mode
function openFullScreen() {
    elem = document.getElementById('container-info');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        console.log("enter1")
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
        console.log("enter2")
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        console.log("enter3")
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        console.log("enter4")
    }
}

// Function used to exit full screen mode
function closeFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}


// Object used track subject data (uploaded to database)
var subject = {
    id: null,
    age: null,
    sex: null,
    handedness: null,
    // mousetype: null,
    returner: null,
    // currTrial: 0,
    // tgt_file: null,
    ethnicity: null,
    race: null,
    comments: null,
    distractions: [],
    distracto: null
    // dpi: null
}

// Object used to track reaching data (updated every reach and uploaded to database)
var subjTrials = {
    id: null, //replace with participant ID
	timeStamp:[], //
    validtimeStamp: [],
    travelTime: [], //replace with block type
	block: [], // block number 
    tree: [], // replace with tree number
    treetype: [],
	action: [], // action code - gamestate
    requiredPresses:[],
    currentPresses:[],
	score: [], 
    interval: [],
    startTime: [],
}

// Function used to check if all questions were filled in info form, if so, starts the experiment 
function checkInfo() {
	
    // check what browser is used
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1 - 79
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    if (isOpera) {
        subject.browsertype = 'Opera';
    } else if (isFirefox) {
        subject.browsertype = 'firefox';
    } else if (isIE) {
        subject.browsertype = 'IE';
    } else if (isEdge) {
        subject.browsertype = 'Edge';
    } else if (isChrome) {
        subject.browsertype = 'Chrome';
    } else if (isEdgeChromium) {
        subject.browsertype = 'EdgeChromium';
    } else if (isBlink) {
        subject.browsertype = 'Blink';
    } else if (isSafari) {
        subject.browsertype = 'Safari';
    } else {
        subject.browsertype = 'NotDetected';
    }
	
	
    var actualCode = "apple"; // **TODO: Update depending on the "code" set in index.html
    var values = $("#infoform").serializeArray();

    subject.id = values[0].value;
    subject.age = values[1].value;
    subject.sex = values[2].value;
    subject.handedness = values[3].value;
    // subject.mousetype = values[4].value;
    subject.returner = values[4].value;
    subject.ethnicity = values[5].value;
    subject.race = values[6].value;
	

    if (noSave) {
		
		// show('container-exp', prevScreen);

		gamesetup();
        return;
    }

    console.log(subject.id);
    console.log(subject.handedness);
    console.log(values)

    if (!subject.id || !subject.age || !subject.sex) {
        alert("Please fill out your basic information!");
        return;

    } else {
		createSubject(subjectcollection, subject);
		gamesetup();
    }
	
	// checkWinFocus();
}

// Function used to create/update subject data in the database
function createSubject(collection, subject) {
    if (noSave) {
        return null;
    }
    return collection.doc(subject.id).set(subject)
        .then(function() {
            console.log(subject);
            return true;
        })
        .catch(function(err) {
            console.error(err);
            throw err;
        });
}

// Function used to upload reach data in the database
function recordTrialSubj(collection, subjTrials) {
    if (noSave) {
        return null;
    }
    return collection.doc(subjTrials.id).set(subjTrials)
        .then(function() {
            return true;
        })
        .catch(function(err) {
            console.error(err);
            throw err;
        });
}


// Getting the screen resolution
var screen_height = window.screen.height;
var screen_width = window.screen.width;

// Important variables for coding
var svgContainer;

var time;
var timeleft;
var stoptimer = false;
var practice_time = 1 * 60 * 1000; // duration of practice 
var main_time = 15 * 60 * 1000;

var metro_block = 0;
var metro_time = 10 * 1000;

let audioContext = null;
let notesInQueue = []; // Notes that have been scheduled {note, time}
let tempo = 500 / 1000; // 
let lookahead = 25; // How frequently to call scheduling function (ms)
let scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
let nextNoteTime = 0.0; // When the next note is due
let isRunning = false;
let intervalID = null;
let acceptableLowerRange = 300 / 1000; // lower range (300 mseconds)
let acceptableUpperRange = 900 / 1000; // upper range (900 mseconds)
let lastKeyPressTime = null;

var long_travel = 20;
var short_travel = 5;
var practice_travel = 3; 
var travelTime;
var num_trials = 2000;
var trialCount = 1; // tree or trial counter within a block 
var block = -1 ; // block counter ; -1 is practice and 0 and 1 are the two main blocks 
var shortFirst = false; // if true,then the short travel time block is rendered first 
var score = 0;  // flag to check if fallen apples are drawn 
var clockUpdateInterval;
var totalTimeMins = 10; // Duration of experiment in minutes
var trialtimeSec = 5;
var timeRemaining;
var requiredPresses = 1; // Number of space bar presses required to harvest
var currentPresses = 0; // Current number of presses'
var keyPressIncrements; // Number of required keypresses incremented after each harvest 
var resetTrialTimeout; // Tiemout variable associated with starting a new trial

var keyPressIncGoodBad = [2, 5];
var keyPressSequence = [2, 2, 5, 2, 5, 5, 2, 5, 2, 5];
var sequenceIndex = 0;

var maxDefocusLim = 5; // maximum number of times a window can be defocussed before a game is quit
var defocusCount = 0;
var inactiveLimSeconds = 45 * 1000;
var inactiveTimeout;
var enterSpaceDown;
var warningLimSeconds = 30 * 1000;
var warningTimeout;
var bwBlocksLimSeconds = 300 * 1000;
var bwBlocksTimeout;
var windowBlur;

var monkeyposition_x;
var monkeyposition_y;
var topbarrer = 3 / 7.5;
var newHeight;
var treeHeight;
var monkeyImages;
var climbingMonkey;
var monkeyIndex = 0;
var climbingAnimationRunning = false;
var climbinginterval;
var interval;
var currTimeStamp;

// Hard-coded based on eyeballing image on screen
var topOfTree = topbarrer * screen_height;
var bottomOfTree = (8/9) * screen_height;
var treeHeight;

var svgNS = "http://www.w3.org/2000/svg"; 
const svgCanvas = document.getElementById("basket_svg");
const shapeElement = document.getElementById("basket");
var gameStartTime = new Date();

//gameState variables
var gameState = 'GAMESTART';
var METRONOME = 'METRONOME';
var NEWTREE = 'NEWTREE';
var SHOWAPPLES = 'SHOWAPPLES';
var IDLE = 'IDLE';
var PRESS = 'PRESS';
var TOOFAST = 'TOOFAST'
var HARVEST = 'HARVEST';
var LEAVE = 'LEAVE';
var TIMEUP = 'TIMEUP';
var END = 'END';

function checkWinBlur(event){
	console.log('Window lost focus');
	if (!windowBlur){
		if (defocusCount <= maxDefocusLim ){
			defocusCount +=1
			alert('Please return to the game! otherwise you will be removed and will not receive payment');
			windowBlur = true;
		    
		} else {
			windowBlur = true;
			clearInterval(warningTimeout)
			clearInterval(inactiveTimeout)
			badGame()
		}
	}
	return false;
}

function checkWinFocus(event){
	console.log("Window in focus")
	svgContainer.select("#warningl1").attr("display", "none");
	svgContainer.select("#warningl2").attr("display", "none");
}


function checkInactive(){
	warningTimeout = setTimeout(function(){
		// document.getElementById('warning').style.display = 'block';
		svgContainer.select("#warningl1").attr("display", "block");
		svgContainer.select("#warningl2").attr("display", "block");
	}, warningLimSeconds)
	
	inactiveTimeout = setTimeout(function(){
		defocusCount = 0 // reset so it doesn't interfere and provide an alert
		badGame()
	}, inactiveLimSeconds)
}

function gamesetup() {

    /*********************
    * Browser Settings  *
    *********************/
    // Initializations to make the screen full size and black background
    $('html').css('height', '100%');
    $('html').css('width', '100%');
    $('html').css('background-color', 'white');
    $('body').css('background-color', 'white');
    $('body').css('height', '100%');
    $('body').css('width', '100%');

    // SVG container from D3.js to hold drawn items
    svgContainer = d3.select("#container-exp").append("svg")
        .attr("width",  screen_width)
        .attr("height",  screen_height)
        .attr('fill', 'black')
        .attr('id', 'stage');
	
	fixation_cross = "fixation.png";
    appletree = "coconuttree_only.png";
    basket = "basket.png";
    monkey1 = "monkey1.png";
    // monkey2 = "monkey2.png";
    // monkey3 = "monkey3.png";
    monkeyImages = [
        {src: "monkey1.png"},
        {src: "monkey2.png"},
        {src: "monkey3.png"}
      ];
    
    monkey4 = "monkey4.png";
    monkey5 = "monkey5.png";
    nextsign = "next.png";
    
    monkeyposition_x = screen_width * 2.43 / 7;
    monkeyposition_y = screen_height - screen_height / 9;
	

    // Apple tree
    svgContainer.append('image')
        .attr('x', screen_width / 3 - screen_height * 1.03 / 2)
        .attr('y', 0)
        .attr('width', screen_height * 1.11)
        .attr('height', screen_height)
        .attr('href', appletree)
        .attr('id', 'appletree')
        .attr('display', 'none');
    
	topOfTree = topbarrer * svgContainer.select("#appletree").attr("height") //(1/3) * screen_height;
	bottomOfTree = (8/9) * svgContainer.select("#appletree").attr("height") //((8/9) * screen_height;
	treeHeight = bottomOfTree - topOfTree;
	
    // basket
    svgContainer.append('image')
        .attr('x', screen_width / 2 + 50)
        .attr('y', screen_height - screen_height / 8)
        .attr('width', screen_height / 8)
        .attr('height', screen_height / 8)
        .attr('href', basket)
        .attr('id', 'basket')
        .attr('display', 'none');

    // climbing monkey

    svgContainer.append('image')
    .attr('x', monkeyposition_x)
    .attr('y', monkeyposition_y)
    .attr('width', screen_height / (1.25 * 9))
    .attr('height', screen_height / 9)
    .attr('href', monkey1)
    .attr('id', 'monkey1')
    .attr('display', 'none');

    /*
    
        svgContainer.append('image')
        .attr('x', monkeyposition_x)
        .attr('y', monkeyposition_y)
        .attr('width', screen_height / (1.25 * 9))
        .attr('height', screen_height / 9)
        .attr('href', monkey2)
        .attr('id', 'monkey2')
        .attr('display', 'none');

    svgContainer.append('image')
        .attr('x', monkeyposition_x)
        .attr('y', monkeyposition_y)
        .attr('width', screen_height / (1.25 * 9))
        .attr('height', screen_height / 9)
        .attr('href', monkey3)
        .attr('id', 'monkey3')
        .attr('display', 'none');
    */

    svgContainer.selectAll('.monkey-frame')
        .data(monkeyImages)
        .enter()
        .append("image")
        .attr('x', d => monkeyposition_x) // Adjust monkey's x position
        .attr('y', d => monkeyposition_y) // Adjust monkey's y position
        .attr('width', screen_height / (1.25 * 9)) // Adjust size based on screen height
        .attr('height', screen_height / 9) 
        .attr('href', d => d.src) // Set image source dynamically
        .attr('class', 'monkey-frame')
        .attr("opacity", 0)
        .attr('display', 'none');

    // havest monkey
		// put the monkey where the apple/coconut text goes
    svgContainer.append('image')
         // .attr('x', screen_width * 2 / 7 + screen_width / 10 - 8)
		.attr('x', 4 * screen_width / 6)
        .attr('y', screen_height / 3)
        .attr('width', screen_height / 5)
        .attr('height', screen_height / 5)
        .attr('href', monkey4)
        .attr('id', 'monkey4')
        .attr('display', 'none');

    // havest monkey
    svgContainer.append('image')
        .attr('x', screen_width / 2 - screen_height / 30)
        .attr('y', screen_height - screen_height / 9)
        .attr('width', screen_height / 9)
        .attr('height', screen_height / 9)
        .attr('href', monkey5)
        .attr('id', 'monkey5')
        .attr('display', 'none');

    // next tree sign
    svgContainer.append('image')
        .attr('x', screen_width - screen_width / 8)
        .attr('y', screen_height - screen_height / 8)
        .attr('width', (screen_height / 8) * 1.336)
        .attr('height', screen_height / 8)
        .attr('href', nextsign)
        .attr('id', 'nextsign')
        .attr('display', 'none');

    // next trial sign
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2)
        .attr('font-size', '32')
        .attr('fill', 'black')
        .attr('id', 'travelsign')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('Waiting For The Next Tree...');

    // feedback sign
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 4 * screen_width / 5)
        .attr('y', 2 * screen_height / 3)
        .attr('font-size', '60')
        .attr('fill', 'orange')
        .attr('font-weight', 'bold')
        .attr('id', 'feedbacksign')
        .attr('display', 'none')
        .text('TOO FAST!');
    
    // feedback sign
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 4 * screen_width / 5)
        .attr('y', screen_height / 2)
        .attr('font-size', '140')
        .attr('fill', 'red')
        .attr('id', 'harvestsign')
        .attr('display', 'none')
        .text('Yay!\n🥥!');

    // Time
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width - screen_width / 5)
        .attr('y', screen_height / 10)
        .attr('font-size', '40')
        .attr('fill', 'red')
        .attr('font-weight', 'bold')
        .attr('id', 'time')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('Time left:  ' + time);

    // Score
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width - screen_width / 5)
        .attr('y', screen_height / 10 + 50)
        .attr('font-size', '40')
        .attr('fill', 'red')
        .attr('id', 'score')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('Score:  ' + score);

    // Before the main task
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 120)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'metroinstruc1')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('Welcome!');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 60)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'metroinstruc2')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('In this phase, you will hear a metronome (a series of beats at regular intervals).');
    
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'metroinstruc3')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('You have to follow along by tapping the SPACE BAR.');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 + 60)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'metroinstruc4')
        .attr('font-family', 'Arial')
        .attr('display', 'none') 
        .text('Try to match the metronome as well as you can!');

    // Draw the fixation cross
    svgContainer.append('image')
        .attr('x', screen_width / 2 - screen_height / 20)
        .attr('y', screen_height / 2 - screen_height / 20)
        .attr('width', screen_height / 10)
        .attr('height', screen_height / 10)
        .attr('href', fixation_cross)
        .attr('id', 'fixation')
        .attr('display', 'none');

    // Mark the next metro test
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 120)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'nextmetro')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('Great job!');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 60)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'nextmetro2')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('Next, you have to perform the same tapping task with the SPACE BAR.');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'nextmetro3')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('This time you won’t have the metronome to follow along.');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 + 60)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'nextmetro4')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('However, you will receive feedback if you’re too slow or too fast so you can correct your tapping speed.');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 50)
        .attr('font-size', '32')
        .attr('fill', 'black')
        .attr('id', 'aftermetro')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('You are now ready for the main task!');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 70)
        .attr('font-size', '32')
        .attr('fill', 'red')
        .attr('id', 'feedback1')
        .attr('display', 'none')
        .text('TOO FAST!');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 + 80)
        .attr('font-size', '32')
        .attr('fill', 'red')
        .attr('id', 'feedback2')
        .attr('display', 'none')
        .text('TOO SLOW!');

    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height * 2 / 3 + 50)
        .attr('font-size', '30')
        .attr('fill', 'black')
        .attr('id', 'instruc')
        .attr('font-family', 'Arial')
        .attr('display', 'none')
        .text('Press ENTER when you are ready.');
		
	// warning when inactive
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 60)
        .attr('font-size', '50')
		.attr("font-weight", 700)
        .attr('fill', 'red')
        .attr('id', 'warningl1')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('PLEASE REFOCUS YOUR ATTENTION!!');
		
    svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 - 20)
        .attr('font-size', '40')
        .attr('fill', 'red')
        .attr('id', 'warningl2')
        .attr('display', 'none')
        .attr('font-family', 'Arial')
        .text('otherwise the game will exit soon...');
	
	// Bypassing metronome
		
    // showMetronome()
		
	console.log("BEGIN THE PRACTICE BLOCK")
	
	// begin first block
	beginBlock();
}

function showMetronome() {

    document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents);

    gameState = METRONOME;
    metro_block = 1;

    svgContainer.select("#metroinstruc1").attr("display", "block");
    svgContainer.select("#metroinstruc2").attr("display", "block");
    svgContainer.select("#metroinstruc3").attr("display", "block");
    svgContainer.select("#metroinstruc4").attr("display", "block");
    svgContainer.select("#instruc").attr("display", "block");
}
function metronomeTraining(){
	metro_block = 2; 
    svgContainer.select("#fixation").attr("display", "block");

    start();

    d3.timer(function(elapsed){
        timeleft = Math.max(0, metro_time - elapsed);

        // End the timer if time is up
        if (timeleft <= 0) {

            stop();

            document.removeEventListener("keydown", handleKeyDownEvents);
            document.removeEventListener("keyup", handleKeyEvents);

            metronomeTransition();
            return true; // Stop recording when time is up
        }
    });
}

function metronomeTransition() {
    metro_block = 3;

    svgContainer.select("#fixation").attr("display", "none");

    document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents);

    svgContainer.select("#nextmetro").attr("display", "block");
    svgContainer.select("#nextmetro2").attr("display", "block");
    svgContainer.select("#nextmetro3").attr("display", "block");
    svgContainer.select("#nextmetro4").attr("display", "block");
    svgContainer.select("#instruc").attr("display", "block");
}

function metronomeTesting() {
	metro_block = 4;
    svgContainer.select("#fixation").attr("display", "block");

    d3.timer(function(elapsed){

        timeleft = Math.max(0, metro_time - elapsed);

        // End the timer if time is up
        if (timeleft <= 0) {

            document.removeEventListener("keydown", handleKeyDownEvents);
            document.removeEventListener("keyup", handleKeyEvents);

            metronome_done();
            return true; // Stop recording when time is up
        }
    });
}

function metronome_done() {

    metro_block = 5;

    svgContainer.select("#fixation").attr("display", "none");

    document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents);

    svgContainer.select("#instruc").attr("display", "block");
    svgContainer.select("#aftermetro").attr("display", "block");
    
}


// Function to increment the required presses after each successful harvest
function incrementRequiredPresses() {
    requiredPresses += keyPressIncrements;
}

// Function to check if enough presses have been made to harvest
function checkPresses() {
    if (currentPresses >= requiredPresses) {
        return true;
    } else {
        return false;
    }
}

// Function to select patch type 
function selectPatchType(){

   	// Randomly select if patch is going to be good or bad 
	// pickIdx = Math.floor(Math.random()*keyPressIncGoodBad.length)
	// return keyPressIncGoodBad[pickIdx]

    var keyvalue = keyPressSequence[sequenceIndex];
    sequenceIndex = (sequenceIndex + 1) % keyPressSequence.length; // loop back to 0
    return keyvalue;
}

// Function to reset the trial
function resetTrial(travelTime) {

    currentPresses = 0;
	keyPressIncrements = selectPatchType();
	console.log("Key Press Increment = "+ keyPressIncrements)
    gameState = NEWTREE;
	console.log("gamestate = "+ gameState)
	document.removeEventListener("keydown", handleKeyDownEvents);
	document.removeEventListener("keyup", handleKeyEvents);

    svgContainer.select("#appletree").attr("display", "none");
    // svgContainer.select("#basket").attr("display", "none");
    svgContainer.select("#nextsign").attr("display", "none");

    svgContainer.select("#monkey1").attr("display", 'none');
    svgContainer.select("#monkey4").attr("display", 'none');
    svgContainer.selectAll(".monkey-frame").attr("display", "none");

    svgContainer.select("#score").attr("display", "none");
    svgContainer.select("#time").attr("display", "none");

    svgContainer.select("#travelsign").attr("display", "block");

    resetTrialTimeout = setTimeout(function() {
	    resetTree();
    }, travelTime * 1000);


}

// Function to choose travel time (currently randomly chosen to be short 50% of the time and long 50% of the time)
function chooseTravelTime() {
    // return Math.random() < 0.5 ? long_travel : short_travel;
	if (block == -1){
		return practice_travel
	}else if ((shortFirst && block == 0) || (!shortFirst && block == 1)) {
		return short_travel
	} else if ((!shortFirst && block == 0) || (shortFirst && block == 1)) {
		return long_travel
	}

}

function beginBlock() {
	
	console.log("ENTERING NEW BLOCK ; block number: "+block)
	// start timeout for keypress inactivity
	checkInactive()
    // Hide the mouse from view 
    $('html').css('cursor', 'none');
    $('body').css('cursor', 'none');
	window.addEventListener("focus", checkWinFocus);
	stoptimer = false
	
	// set/reset required game parameters 
	requiredPresses = 1
	currentPresses = 0
	
	clearTimeout(bwBlocksTimeout);

	score = 0;
    sequenceIndex = 0;
	travelTime = chooseTravelTime()

	
	if (block == -1) {
		prevScreen = 'container-info'
	} else if (block == 0){
		prevScreen = 'container-end-practice'
	} else {
		prevScreen = 'container-bw-blocks'
	}
	
	show('container-exp', prevScreen);
    openFullScreen();

	runTrialLogic();
	return false;
}

// Function to run the trial logic
function runTrialLogic() {

    svgContainer.select("#appletree").attr("display", "block");
    // svgContainer.select("#basket").attr("display", "block");
    svgContainer.select("#nextsign").attr("display", "block");

    svgContainer.select("#monkey1").attr("display", 'block');

    svgContainer.select("#score").attr("display", "block");
    svgContainer.select("#time").attr("display", "block");

    console.log('start trial')

    currentPresses = 0;
	keyPressIncrements = selectPatchType();
	console.log("Key Press Increment = "+ keyPressIncrements);
    gameState = NEWTREE;
	console.log("gamestate = "+ gameState)

    interval = tempo;
    
    var d = new Date();
    var current_date = (parseInt(d.getMonth()) + 1).toString() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + "." + d.getMilliseconds();

    // Uploading reach data for this reach onto the database
    subjTrials.id = subject.id.concat(block.toString());

    subjTrials.startTime = current_date;


    d3.timer(function(elapsed){
        if (stoptimer) {
            return true;
        }
		if (block == -1) {
			time_dur = practice_time
		} else {
			time_dur = main_time
		}

        timeleft = Math.max(0,  time_dur - elapsed);
        let minutes = Math.floor(timeleft / (1000 * 60)); 
        let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

        time = d3.format("02")(minutes) + ":" + d3.format("02")(seconds);

        svgContainer.select("#score")
            .text("Score: " + score);

        svgContainer.select("#time")
            .text("Time Left:  " + time);

        // End the timer if time is up
        if (timeleft <= 0) {
            console.log("TIME'S UP!! ENDING THE GAME")
            document.removeEventListener("keydown", handleKeyDownEvents);
            document.removeEventListener("keyup", handleKeyEvents);
            // clearInterval(clockUpdateInterval);
			// clockUpdateInterval.stop();
			stoptimer = true;
            // endGame()
			
            if (block <= 0){
                endBlock();
            } else {
                endGame();
            }
            return true; // Stop recording when time is up
        }
    });
    
    // window.addEventListener("blur", checkWinBlur);
	// window.addEventListener("focus", checkWinFocus);
	
	document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents);

    return false;
}



// Function to reset the tree after harvest
function resetTree(){
	resetMonkeyPosition();
    svgContainer.select("#travelsign").attr("display", "none");

    currentPresses = 0; // Reset current presses


	console.log("Resetting Tree")
	console.log("gameState = "+ gameState)
	if (gameState == NEWTREE){

        d = new Date();
        current_date = (parseInt(d.getMonth()) + 1).toString() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + "." + d.getMilliseconds();
    
        subjTrials.startTime = current_date;

		requiredPresses = 1;
		console.log("reset tree after travel")
		console.log("requiredPressed = "+ requiredPresses)

        console.log("Travel Time: " + travelTime)

        svgContainer.select("#appletree").attr("display", "block");
        // svgContainer.select("#basket").attr("display", "block");
        svgContainer.select("#nextsign").attr("display", "block");
        svgContainer.select("#monkey1").attr("display", "block");
        svgContainer.select("#score").attr("display", "block");
        svgContainer.select("#time").attr("display", "block");

        document.addEventListener("keydown", handleKeyDownEvents);
        document.addEventListener("keyup", handleKeyEvents);

	} else {
		incrementRequiredPresses(); // Increase required presses for next harvest
		console.log("reset tree after harvest")
		console.log("requiredPressed = "+ requiredPresses)

        setTimeout(function(){
            document.addEventListener("keydown", handleKeyDownEvents);
            document.addEventListener("keyup", handleKeyEvents);
        }, 1000);
	}
}

const uniformTone = {
    frequency: 880,
    duration: 0.05,
    type: 'sine'
  };



function playUniformTone(when) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = uniformTone.type;
    oscillator.frequency.setValueAtTime(uniformTone.frequency, when);
    
    gainNode.gain.setValueAtTime(0.5, when);
    gainNode.gain.exponentialRampToValueAtTime(0.001, when + uniformTone.duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(when);
    oscillator.stop(when + uniformTone.duration);
  }

// Metronome code
function scheduler() {
    while (nextNoteTime < audioContext.currentTime + 0.1) {
        playUniformTone(nextNoteTime);
    
        nextNoteTime += tempo;
      }
}

function start() {
    if (isRunning) return;

    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    isRunning = true;
    nextNoteTime = audioContext.currentTime + 0.05;
    intervalID = setInterval(() => {
        playUniformTone(audioContext.currentTime);
      }, 60000 / (60 / tempo));
    
}

function stop() {
    isRunning = false;
    clearInterval(intervalID);
}

function startStop() {
    if (isRunning) {
        stop();
    } else {
        start();
    }
}
// Function to set keydown event true
function handleKeyDownEvents(event){
	if (event.key === "Enter"){
		enterKeyDown = true;
	} else if (event.key === " "){
        if (metro_block != 3 && metro_block != 5)
		enterSpaceDown = true;
	}
}

// Function to handle key events
function handleKeyEvents(event) {
	
	svgContainer.select("#warningl1").attr("display", "none");
	svgContainer.select("#warningl2").attr("display", "none");
	
	if (event.key==="Enter" || event.key===" ") { 
		clearTimeout(inactiveTimeout);
		clearTimeout(warningTimeout);
		// document.getElementById('warning').style.display = 'none';
		checkInactive();
	}
	
    handleSpacebarPress(event);
    handleEnterKey(event);
}

// Function to handle Enter key press
function handleEnterKey(event) {
	if (gameState != METRONOME){
	    if (event.key === "Enter" && enterKeyDown == true) {
			gameState = LEAVE;
			enterKeyDown= true;
			clearTimeout(inactiveTimeout);
			clearTimeout(warningTimeout);
			currTimeStamp = new Date().getTime()

            subjTrials.tree = trialCount
            subjTrials.block = block;
            subjTrials.score = score;
            subjTrials.travelTime = travelTime;
            subjTrials.treetype = keyPressIncrements;
            subjTrials.id = subject.id.concat(trialCount.toString());

            subjTrials.timeStamp.push(currTimeStamp);
            subjTrials.validtimeStamp.push(currTimeStamp);
            subjTrials.action.push(gameState);
            subjTrials.requiredPresses.push(requiredPresses);
            subjTrials.currentPresses.push(currentPresses);
            subjTrials.interval.push(interval)

			// travelTime = chooseTravelTime()
	        resetTrial(travelTime); // Start a new trial
	        trialCount++;

            recordTrialSubj(trialcollection, subjTrials);
            createSubject(subjectcollection, subject);

            subjTrials = {
                id: null, //replace with participant ID
                timeStamp:[], //
                validtimeStamp: [],
                travelTime: [], //replace with block type
                block: [], // block number 
                tree: [], // replace with tree number
                treetype: [],
                action: [], // action code - gamestate
                requiredPresses:[],
                currentPresses:[],
                score: [], 
                interval: [],
                startTime: [],
            }

	    }
	}
    
    else {
        if (event.key === "Enter" && enterKeyDown == true) {
        
            if (metro_block === 1) {
                svgContainer.select("#metroinstruc1").attr("display", "none");
                svgContainer.select("#metroinstruc2").attr("display", "none");
                svgContainer.select("#metroinstruc3").attr("display", "none");
                svgContainer.select("#metroinstruc4").attr("display", "none");
                svgContainer.select("#instruc").attr("display", "none");

                metronomeTraining();

            }

            else if (metro_block === 3) {
                svgContainer.select("#nextmetro").attr("display", "none");
                svgContainer.select("#nextmetro2").attr("display", "none");
                svgContainer.select("#nextmetro3").attr("display", "none");
                svgContainer.select("#nextmetro4").attr("display", "none");
                svgContainer.select("#instruc").attr("display", "none");

                metronomeTesting()
            }

            else if (metro_block === 5) {

                svgContainer.select("#instruc").attr("display", "none");
                svgContainer.select("#aftermetro").attr("display", "none");
                
                metro_block = 0;

                beginBlock();
            }
        }

    }
}

// Function to handle spacebar press
function handleSpacebarPress(event) {	
	if (enterSpaceDown == true){
		enterSpaceDown = false;

	    if (event.key === " ") {
	        
			if (gameState != METRONOME){
                
                // currentTime = audioContext.currentTime;
				currentTime = (new Date().getTime() - gameStartTime)/1000;

                if (lastKeyPressTime !== null) {
                    interval = currentTime - lastKeyPressTime;
                    console.log("Interval: ", interval);
                }

                lastKeyPressTime = currentTime;
                

                if (interval < acceptableLowerRange) {

                    console.log("TOO FAST!");
                    gameState = TOOFAST;

                    currTimeStamp = new Date().getTime()

                    subjTrials.timeStamp.push(currTimeStamp);
                    subjTrials.action.push(gameState);
                    subjTrials.requiredPresses.push(requiredPresses);
                    subjTrials.currentPresses.push(currentPresses);
                    subjTrials.interval.push(interval)

                    setTimeout(function() {
                        svgContainer.select("#feedbacksign").attr("display", "block");
                        // Hide the text again after another 0.5 seconds (500 ms)
                        setTimeout(function() {
                            svgContainer.select("#feedbacksign").attr("display", "none");
                        }, 300);
                    }, 0);
                    
                }
                
                if (interval >= acceptableLowerRange) {

                    currentPresses++;

                    if (checkPresses()) {
                        gameState = HARVEST;
                        currTimeStamp = new Date().getTime()
                        
                        subjTrials.timeStamp.push(currTimeStamp);
                        subjTrials.validtimeStamp.push(currTimeStamp);
                        subjTrials.action.push(gameState);
                        subjTrials.requiredPresses.push(requiredPresses);
                        subjTrials.currentPresses.push(currentPresses);
                        subjTrials.interval.push(interval)
                    

                        monkeyposition_y = screen_height - screen_height / 9;
                    
                        // Harvest the apple
                
                        animate_monkeyClimbing();
                            
                        document.removeEventListener("keydown", handleKeyDownEvents);
                        document.removeEventListener("keyup", handleKeyEvents);

                        score += 1;

                        setTimeout(function(){
                            // incrementRequiredPresses(); // Increase required presses for next harvest
                            resetTree()
                        }, 1000);

                    } else {
                        gameState = PRESS;
                        currTimeStamp = new Date().getTime()

                        
            
                        subjTrials.timeStamp.push(currTimeStamp);
                        subjTrials.validtimeStamp.push(currTimeStamp);
                        subjTrials.action.push(gameState);
                        subjTrials.requiredPresses.push(requiredPresses);
                        subjTrials.currentPresses.push(currentPresses);
                        subjTrials.interval.push(interval);
                        
                        animate_monkeyClimbing();
                    }
                }

			} else {
                if (metro_block === 4) {
                    var currentTime = audioContext.currentTime;
                    if (lastKeyPressTime !== null) {
                        interval = currentTime - lastKeyPressTime;
                        console.log("Interval: ", interval);
                        if (interval < acceptableLowerRange) {
                            console.log("TOO FAST!");
                            setTimeout(function() {
                                d3.select('#feedback1').attr('display', 'block');
                                
                                // Hide the text again after another 0.5 seconds (500 ms)
                                setTimeout(function() {
                                    d3.select('#feedback1').attr('display', 'none');
                                }, 300);
                            }, 0);
                        } 
                        else if (interval > acceptableUpperRange) {
                            console.log("TOO SLOW!");
                            setTimeout(function() {
                                d3.select('#feedback2').attr('display', 'block');
                                
                                // Hide the text again after another 0.5 seconds (500 ms)
                                setTimeout(function() {
                                    d3.select('#feedback2').attr('display', 'none');
                                }, 300);
                            }, 0);
                        }
                    }
                    lastKeyPressTime = currentTime;
                }
            }
	}
}}

// update the monkey position and movement
function animate_monkeyClimbing() {
	
	// shruthi change:
	// changed thte *max* y position from 1/9 screen_height to 2/9 screen_ehight so it's lower by anothr 1/9th the screen height when the monkey is at the top of the tree
    // newHeight = (currentPresses / requiredPresses) * (5* screen_height / 9);
    // console.log('newheight: ' + newHeight);
	
	// removed hardcoding of dynamic height
	newHeight = (currentPresses/requiredPresses) * ((1 - topbarrer) * screen_height); 
	console.log('newheight: ' + newHeight);
    if (currentPresses <= requiredPresses){
        newMonkeyY = (8 * screen_height / 9) - newHeight;
    }

    climbinginterval = Math.max(interval, acceptableLowerRange);

    console.log('climbinginterval: ' + climbinginterval)

    climbStep();
}


function climbStep() {

    svgContainer.select("#monkey1").attr("display", "none");

    svgContainer.selectAll(".monkey-frame")
        .attr("display", "none")
        .filter((d, i) => i === monkeyIndex)
        .attr("display", "block")
        .attr("href", d => d.src)
        .attr("y", monkeyposition_y) 
        .attr("opacity", 0)
        .transition()
        .duration(climbinginterval)
        .attr("y", newMonkeyY)
        .attr("opacity", 1)
        .each("end", function () {
            monkeyposition_y = newMonkeyY;
            monkeyIndex = (monkeyIndex + 1) % monkeyImages.length;
    }); 
    

    if (newMonkeyY >= monkeyposition_y) {
        return;
    }
}

function resetMonkeyPosition(){
	// shruthi replaced hardcoded topoftree with variable set in gameSetup()
    if (monkeyposition_y <= topOfTree && gameState === HARVEST) {
        
        svgContainer.selectAll(".monkey-frame").attr("display", "none");

        svgContainer.select('#monkey4').attr('display', 'block');
        // svgContainer.select('#harvestsign').attr('display', 'block');
            
        // Hide the text again after another 0.5 seconds (500 ms)
        setTimeout(function() {
			console.log("Should be clearing the harvest monkey")
            svgContainer.select('#monkey4').attr('display', 'none');
            // svgContainer.select('#harvestsign').attr('display', 'none');
            svgContainer.select("#monkey1").attr("display", "block");

        }, 1000);
    }
}

// Helper function to remove rogue svg elements at the end of  a block or a game 
function removeRogueSVGElems(){

    svgContainer.select("#appletree").attr("display", "none");
    svgContainer.select("#nextsign").attr("display", "none");

    svgContainer.select("#monkey1").attr("display", 'none');
    svgContainer.select("#monkey4").attr("display", 'none');
    svgContainer.selectAll(".monkey-frame").attr("display", "none");

    svgContainer.select("#score").attr("display", "none");
    svgContainer.select("#time").attr("display", "none");

    svgContainer.select("#travelsign").attr("display", "none");
	svgContainer.select("#warningl1").attr("display", "none");
	svgContainer.select("#warningl2").attr("display", "none");
	//
   // d3.select("#stage").select("svgContainer").remove()
	
}

// Helper function to end the game regardless good or bad
function helpEnd() {

	// push the data earlier than this at earlier checkpoints
	closeFullScreen();
	removeRogueSVGElems();
    // Show cursor between blocks
    $('html').css('cursor', 'auto');
    $('body').css('cursor', 'auto');
}



function helpEndBlock(){
	// push the data earlier than this at earlier checkpoints
	// document.getElementById("timer").innerText = ''
	closeFullScreen();
	gamestate = 'BETWEEN_BLOCKS'
	 
	removeRogueSVGElems();
	
    // Show cursor between blocks
    $('html').css('cursor', 'auto');
    $('body').css('cursor', 'auto');
	
}
// Function that allows for the premature end of a game
function badGame() {
    helpEnd();
	gamestate = 'ABORT'
	// clearInterval(clockUpdateInterval);
	// clockUpdateInterval.stop();
	stoptimer=true;
	show('container-failed', 'container-exp')
}


// End block normally 
function endBlock() {
	console.log("INSIDE END BLOCK")
	helpEndBlock();

    gameState = TIMEUP;

    currTimeStamp = new Date().getTime()

    subjTrials.tree = trialCount
    subjTrials.block = block;
    subjTrials.score = score;
    subjTrials.travelTime = travelTime;
    subjTrials.treetype = keyPressIncrements;
    subjTrials.id = subject.id.concat(trialCount.toString());

    subjTrials.timeStamp.push(currTimeStamp);
    subjTrials.validtimeStamp.push(currTimeStamp)
    subjTrials.action.push(gameState);
    subjTrials.requiredPresses.push(requiredPresses);
    subjTrials.currentPresses.push(currentPresses);
    subjTrials.interval.push(interval)

    trialCount++;

    recordTrialSubj(trialcollection, subjTrials);
    createSubject(subjectcollection, subject);

    subjTrials = {
        id: null, //replace with participant ID
        timeStamp:[], //
        validtimeStamp: [],
        travelTime: [], //replace with block type
        block: [], // block number 
        tree: [], // replace with tree number
        treetype: [],
        action: [], // action code - gamestate
        requiredPresses:[],
        currentPresses:[],
        score: [], 
        interval: [],
        startTime: [],
    }
	
	clearTimeout(resetTrialTimeout);
	clearTimeout(warningTimeout);
	clearTimeout(inactiveTimeout);
	bwBlocksTimeout = setTimeout(function(){
		beginBlock();
	}, bwBlocksLimSeconds)
	svgContainer.select('#travelsign').attr('display', 'none');
	document.getElementById("num_apples").innerText = score;
	// window.removeEventListener("blur", checkWinBlur);
	window.removeEventListener("focus", checkWinFocus);
	
	if (block == -1) {
		show('container-end-practice', 'container-exp')
	} else {
		show('container-bw-blocks', 'container-exp') // needed to be added to move between blocks
	}


	block += 1;
}

// Function that ends the game appropriately after the experiment has been completed
function endGame() {

	console.log("Entering EndGame() Function")
	console.log("score: "+ score)
    helpEnd();
	clearTimeout(resetTrialTimeout);
	clearTimeout(warningTimeout);
	clearTimeout(inactiveTimeout);
	svgContainer.select('#travelsign').attr('display', 'none');
	// window.removeEventListener("blur", checkWinBlur);
	window.removeEventListener("focus", checkWinFocus);
	show('container-end-block', 'stage')
	document.getElementById("num_apples2").innerText = score;
	// setTimeout(show('container-not-an-ad', 'container-end-block'), 10000)
}


// Function used to save the feedback from the final HTML page
function saveFeedback() {
    var values = $("#feedbackForm").serializeArray();
    if (values[0].value != "") {
        subject.comments = values[0].value;
    } 
    values = $("#distractionForm").serializeArray();
    var i;
    for (i = 0; i < values.length; i++) {
        subject.distractions.push(values[i].value);
        if (values[i].value == "other") {
            subject.distracto = values[i + 1].value;
            break;
        }
    }

    createSubject(subjectcollection, subject);
    show('final-page', 'container-not-an-ad');
}

document.addEventListener('DOMContentLoaded', function() {
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

});
