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
const subjectcollection = firestore.collection("prolificLongFirstSubjects");
const trialcollection = firestore.collection("prolificLongFirstTrials");


// Function to switch between HTML pages
function show(shown, hidden) {
	console.log("Entering the show function")
	console.log("Show: " + shown)
    document.getElementById(shown).style.display = 'block';
    document.getElementById(hidden).style.display = 'none';
    return false;
}

// Close window (function no longer in use for this version)
function onexit() {
    window.close();
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
    tgt_file: null,
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
    travelTime: [], //replace with block type
	block: [], // block number 
	requiredPresses:[],
    tree: [], // replace with tree number
	timeRemaining: [], // time Remaining on timer at current action
	action: [], // action code 
    currentPresses:[],
	score: [],
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
    // subject.handedness = values[3].value;
    // subject.mousetype = values[4].value;
    subject.returner = values[3].value;
    var code = values[4].value;
    subject.ethnicity = values[5].value;
    subject.race = values[6].value;
	
	if (block == 0){
		prevScreen = 'container-info'
	} else {
		prevScreen = 'container-bw-blocks'
	}
	
    if (noSave) {
		beginBlock(block, shortFirst);
        return;
    }
    console.log(subject.id);
    console.log(subject.handedness);
    console.log(values)
    if (!subject.id || !subject.age || !subject.sex) {
        alert("Please fill out your basic information!");
        return;
    } else {
		// show('blinking', prevScreen);
		createSubject(subjectcollection, subject);
		
		// beginBlock(block, shortFirst);
		
		show('container-exp', prevScreen);
        openFullScreen();
		gamesetup();
    }
	
	checkWinFocus();
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


// Important variables for coding
var svgContainer;
var screen_height;
var screen_width;

var timeleft;
var stoptimer;
var main_time = 15 * 60 * 1000;

var metro_block = 0;
var metro_time = 30 * 1000;

let audioContext = null;
let notesInQueue = []; // Notes that have been scheduled {note, time}
let tempo = 100;
let lookahead = 25; // How frequently to call scheduling function (ms)
let scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
let nextNoteTime = 0.0; // When the next note is due
let isRunning = false;
let intervalID = null;
let acceptableLowerRange = 60.0 / 120; // 120 BPM lower range (0.5 seconds)
let acceptableUpperRange = 60.0 / 80; // 80 BPM upper range (0.75 seconds)
let lastKeyPressTime = null;

var long_travel = 10;
var short_travel = 5;
var travelTime;
var num_trials = 2000;
var trialCount = 0; // tree or trial counter within a block 
var block = 0; // block counter 
var shortFirst = false; // if true,then the short travel time block is rendered first 
var score = 0; 
var drawn = false; // flag to check if fallen apples are drawn 
var clockUpdateInterval;
var totalTimeMins = 10; // Duration of experiment in minutes
var trialtimeSec = 5;
var timeRemaining;
var requiredPresses = 1; // Number of space bar presses required to harvest
var currentPresses = 0; // Current number of presses'
var keyPressIncrements; // Number of required keypresses incremented after each harvest 
var resetTrialTimeout; // Tiemout variable associated with starting a new trial
var keyPressIncGoodBad = [2, 5];
var maxDefocusLim = 5; // maximum number of times a window can be defocussed before a game is quit
var defocusCount = 0;
var inactiveLimSeconds = 45 * 1000;
var inactiveTimeout;
var enterSpaceDown;
var warningLimSeconds = 45 * 1000;
var warningTimeout;
var bwBlocksLimSeconds = 300 * 1000;
var bwBlocksTimeout;
var windowBlur;

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
var HARVEST = 'HARVEST';
var LEAVE = 'LEAVE';
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
}


function checkInactive(){
	warningTimeout = setTimeout(function(){
		document.getElementById('warning').style.display = 'block';
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
    $('html').css('height', '98%');
    $('html').css('width', '100%');
    $('html').css('background-color', 'white');
    $('body').css('background-color', 'white');
    $('body').css('height', '98%');
    $('body').css('width', '100%');

    // Hide the mouse from view 
    $('html').css('cursor', 'none');
    $('body').css('cursor', 'none');

    // SVG container from D3.js to hold drawn items
    svgContainer = d3.select("body").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('fill', 'black')
        .attr('id', 'stage');

    // Getting the screen resolution
    screen_height = window.screen.availHeight;
    screen_width = window.screen.availWidth;

    fixation_cross = "fixation.png"

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

    // Time
    svgContainer.append('text')
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
        .attr('x', screen_width / 2)
        .attr('y', screen_height / 2 + 60)
        .attr('font-size', '60')
        .attr('fill', 'red')
        .attr('id', 'metroscore')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial')
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


    showMetronome()

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

function createApples(){

	appleDiv = document.getElementById("Apples");
	
		if (!appleDiv.firstChild){
		console.log("Creating Apples")
		console.log(appleDiv.firstChild);
		var angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, 
			(7 * Math.PI) / 4, 0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
		var centerX = 75;
		var centerY = 0;
		var branch_dist = 7.5;
		var radius = 1.5;

	    angles.forEach(function(angle) {
	  
			rand_X_add = Math.random() * 6- 3;
			rand_Y_add = Math.random() * 6 - 3;
	      	var x = centerX + branch_dist * Math.cos(angle) + rand_X_add;
	      	var y = centerY + branch_dist * Math.sin(angle) + rand_Y_add;

	      	var circle = document.createElementNS(svgNS, "circle");
	      	circle.setAttribute("cx", x);
	     	circle.setAttribute("cy", y);
	     	circle.setAttribute("r", radius);
	     	circle.setAttribute("fill", "red");

	      	appleDiv.appendChild(circle);
		});
	
		for (let i = 0; i< 2; i++){
			rand_X_add = Math.random() * 4- 2;
			rand_Y_add = Math.random() * 4 -2;
			var x = centerX +rand_X_add;
			var y = centerY + rand_Y_add;

			var circle = document.createElementNS(svgNS, "circle");
			circle.setAttribute("cx", x);
			circle.setAttribute("cy", y);
			circle.setAttribute("r", radius);
			circle.setAttribute("fill", "red");
			appleDiv.appendChild(circle);
		}
	}
}

function createTree(){
// thanks ChatGPT
   // Define the angles for each circle
	treeDiv = document.getElementById("Tree");
    var angles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];

    // Create SVG circle elements
	var trunk = document.createElementNS(svgNS, "rect");
	trunk.setAttribute('x', 70);
	trunk.setAttribute('y', 0);
	trunk.setAttribute('width', 10);
	trunk.setAttribute('height', 30);
	trunk.setAttribute('fill', "brown");
	treeDiv.appendChild(trunk);
	
	var centerX = 75;
	var centerY = 0;
	var radius = 7.5;
    angles.forEach(function(angle) {
      var x = centerX + radius * Math.cos(angle);
      var y = centerY + radius * Math.sin(angle);

      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", radius);  
      circle.setAttribute("fill", "green");

      treeDiv.appendChild(circle);
  });
  createApples();
}


function removeApples(){
	var appleContainer = document.getElementById("Apples");
	while (appleContainer.firstChild){
		appleContainer.removeChild(appleContainer.firstChild);
	}
}

function drawFallenApples(numApples) {
    var fallenApplesSVG = document.getElementById("FallenApples");
    var trunkCenterX = 75;
    var trunkCenterY = 50;
    var x_maxDistance = 25;
	var y_maxDistance = 8;

    for (var i = 0; i < numApples; i++) {
        var appleRadius = 1.5;
        var angle = Math.random() * Math.PI; // Random angle (0 to PI, to ensure below the tree)
        var x_distance = Math.random() * x_maxDistance; // Random distance within the maximum distance
		var y_distance = Math.random() * y_maxDistance; // Random distance within the maximum distance
        var x = trunkCenterX + x_distance* Math.cos(angle); // Calculate x-coordinate
        var y = trunkCenterY + y_maxDistance; // Calculate y-coordinate

        var circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", appleRadius);
        circle.setAttribute("fill", "red");

        fallenApplesSVG.appendChild(circle);
    }
}

function clearFallenApples() {
	var fallenApplesSVG = document.getElementById("FallenApples");
    while (fallenApplesSVG.firstChild) {
        fallenApplesSVG.removeChild(fallenApplesSVG.firstChild);
    }
    // fallenApples = [];
}

function updateScoreDisplay(){
	document.getElementById("scoreValue").innerText = score;
}

function showAdditionalScoreText(additionalScore) {
    const additionalScoreElement = document.getElementById('additionalScore');
    additionalScoreElement.textContent = `+${additionalScore}`;
    additionalScoreElement.style.display = 'block'; // Show the additional score text

    // Hide the additional score text after 2 seconds
    setTimeout(() => {
        additionalScoreElement.style.display = 'none';
    }, 5000);
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
	pickIdx = Math.floor(Math.random()*keyPressIncGoodBad.length)
	return keyPressIncGoodBad[pickIdx]
}

// Function to reset the trial
function resetTrial(travelTime) {
	
    currentPresses = 0;
	keyPressIncrements = selectPatchType();
	console.log("Key Press Increment = "+ keyPressIncrements)
	trialCount++;
    gameState = NEWTREE;
	console.log("gamestate = "+ gameState)
    removeApples();
    clearFallenApples();
    show('next', 'blinking');
	updateScoreDisplay();
	document.removeEventListener("keydown", handleKeyDownEvents);
	document.removeEventListener("keyup", handleKeyEvents);
    resetTrialTimeout = setTimeout(function() {
	    show('blinking', 'next');
			// requiredPresses = 1;
	        resetTree();
    
    }, travelTime * 1000);


}

// Function to choose travel time (currently randomly chosen to be short 50% of the time and long 50% of the time)
function chooseTravelTime() {
    // return Math.random() < 0.5 ? long_travel : short_travel;
	
	if ((shortFirst && block == 0) || (!shortFirst && block == 1)) {
		return short_travel
	} else if ((!shortFirst && block == 0) || (shortFirst && block == 1)) {
		return long_travel
	}

}

function beginBlock() {
	// checkInactive();
	clearTimeout(bwBlocksTimeout)
	score = 0;
	travelTime = chooseTravelTime()
	console.log("Travel Time: "+travelTime)
	
	runTrialLogic();
	return false;
}

// Function to run the trial logic
function runTrialLogic() {
    const timeDisplay = document.getElementById("timeDisplay");

    console.log('start trial')
	show('blinking', 'container-exp');
    resetTrial(0);
	
    var d = new Date();
    var current_date = (parseInt(d.getMonth()) + 1).toString() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + "." + d.getMilliseconds();
	gameStartTime = d.getTime();
    // Uploading reach data for this reach onto the database
    subjTrials.id = subject.id.concat(block.toString());;
    subjTrials.currentDate = current_date;
    timeDisplay.style.display = "block";

    d3.timer(function(elapsed){
        if (stoptimer) {
            return true;
        }

        timeleft = Math.max(0,  main_time - elapsed);
        let minutes = Math.floor(timeleft / (1000 * 60)); 
        let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

        timeDisplay.textContent = `Time Left: ${d3.format("02")(minutes)}:${d3.format("02")(seconds)}`;

        // End the timer if time is up
        if (timeleft <= 0) {
            console.log("TIME'S UP!! ENDING THE GAME")
            document.removeEventListener("keydown", handleKeyDownEvents);
            document.removeEventListener("keyup", handleKeyEvents);
            clearInterval(clockUpdateInterval);
            // endGame()
            if (block == 0){
                endBlock();
            } else {
                endGame();
            }
            return true; // Stop recording when time is up
        }
    });
    
    window.addEventListener("blur", checkWinBlur);
	window.addEventListener("focus", checkWinFocus);
	
	document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents)
    return false;
}



// Function to reset the tree after harvest
function resetTree(){
	drawn = false
	resetProgressBar();
	createTree();
    currentPresses = 0; // Reset current presses
	createApples();
	console.log("Resetting Tree")
	console.log("gameState = "+ gameState)
	if (gameState == NEWTREE){

		requiredPresses = 1;
		console.log("reset tree after travel")
		console.log("requiredPressed = "+ requiredPresses)
	} else {
		incrementRequiredPresses(); // Increase required presses for next harvest
		console.log("reset tree after harvest")
		console.log("requiredPressed = "+ requiredPresses)
	}
	
	document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents)
	
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
    
        nextNoteTime += 60 / tempo;
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
      }, 60000 / tempo);
    
}

function start_testing() {
    if (isRunning) return;

    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    isRunning = true;
    intervalID = setInterval(() => console.log("Metronome Tick"), 60000 / tempo); // Visual or internal metronome tick
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
	
	if (event.key==="Enter" || event.key===" ") { 
		clearTimeout(inactiveTimeout);
		clearTimeout(warningTimeout);
		document.getElementById('warning').style.display = 'none';
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
			currTimeStamp = new Date().getTime()
		
			subjTrials.timeStamp.push(currTimeStamp);
			subjTrials.tree.push(trialCount)
			subjTrials.action.push(gameState);
			subjTrials.timeRemaining.push(timeRemaining);
			subjTrials.travelTime.push(travelTime);
			subjTrials.block.push(block);
		
			// travelTime = chooseTravelTime()
	        resetTrial(travelTime); // Start a new trial
	        // trialCount++;
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

                beginBlock()
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
				currentPresses++;

                const feedback1_testing = document.getElementById("feedback1_testing");
                const feedback2_testing = document.getElementById("feedback2_testing");

                feedback1_testing.textContent = 'TOO FAST!';
                feedback2_testing.textContent = 'TOO SLOW!';

                let currentTime = audioContext.currentTime;

                if (lastKeyPressTime !== null) {
                    let interval = currentTime - lastKeyPressTime;
                    console.log("Interval: ", interval);
                    if (interval < acceptableLowerRange) {
                        console.log("TOO FAST!");
                        setTimeout(function() {
                            feedback1_testing.style.display = "block";
                            
                            // Hide the text again after another 0.5 seconds (500 ms)
                            setTimeout(function() {
                                feedback1_testing.style.display = "none";
                            }, 300);
                        }, 0);
                    } 
                    else if (interval > acceptableUpperRange) {
                        console.log("TOO SLOW!");
                        setTimeout(function() {
                            feedback2_testing.style.display = "block";
                            
                            // Hide the text again after another 0.5 seconds (500 ms)
                            setTimeout(function() {
                                feedback2_testing.style.display = "none";
                            }, 300);
                        }, 0);
                    }
                }
            
                lastKeyPressTime = currentTime;
                
                
		        if (checkPresses()) {
		            gameState = HARVEST;
					currTimeStamp = new Date().getTime()

                    lastKeyPressTime = null;
		
					subjTrials.timeStamp.push(currTimeStamp);
					subjTrials.tree.push(trialCount)
					subjTrials.action.push(gameState);
					subjTrials.timeRemaining.push(timeRemaining);
					subjTrials.travelTime.push(travelTime);
					subjTrials.block.push(block);
					subjTrials.requiredPresses.push(requiredPresses);
					subjTrials.currentPresses.push(currentPresses);
					subjTrials.score.push(score);
	            
					// Harvest the apple
            
					updateProgressBar();
		            removeApples();
            			
					document.removeEventListener("keydown", handleKeyDownEvents);
					document.removeEventListener("keyup", handleKeyEvents);
		            // Draw a random number of fallen apples (5 to 10)
			
		            const numApples = Math.floor(Math.random() * 6) + 5;
		            if (drawn==false){
			            additionalScore = Math.floor(Math.random() * 3) + 9;
						showAdditionalScoreText(additionalScore);
			            score += additionalScore;
						updateScoreDisplay();
						drawFallenApples(numApples);
						drawn = true;
					} 
		            setTimeout(function(){
						// incrementRequiredPresses(); // Increase required presses for next harvest
						resetTree()
					}, 1000);
		        } else {
		            gameState = PRESS;
					currTimeStamp = new Date().getTime()
		
					subjTrials.timeStamp.push(currTimeStamp);
					subjTrials.tree.push(trialCount)
					subjTrials.action.push(gameState);
					subjTrials.timeRemaining.push(timeRemaining);
					subjTrials.travelTime.push(travelTime);
					subjTrials.block.push(block);
					subjTrials.requiredPresses.push(requiredPresses);
					subjTrials.currentPresses.push(currentPresses);
					subjTrials.score.push(score);
		            updateProgressBar();
		        }
			} else {
                if (metro_block === 4) {
                    let currentTime = audioContext.currentTime;
                    if (lastKeyPressTime !== null) {
                        let interval = currentTime - lastKeyPressTime;
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

// Function to update the progress bar based on current presses and required presses
function updateProgressBar() {
    var progressBar = document.getElementById("progress-bar");
    var progressBarContainer = document.getElementById("progress-bar-container");
    var containerHeight = progressBarContainer.clientHeight;
    var currentHeight = currentPresses / requiredPresses * containerHeight;
    var currentTop = containerHeight - currentHeight;
	
	if (currentPresses <= requiredPresses){
	    progressBar.style.top = currentTop + "px";
	    progressBar.style.height = currentHeight + "px";
	}
}    

//function to reset progress bar
function resetProgressBar() {
    var progressBar = document.getElementById("progress-bar");
    progressBar.style.height = "0px";
    var resetText = document.getElementById("reset-instruction");
    resetText.textContent = "You can now harvest again!"
    setTimeout(function() {
        resetText.textContent = "";
    }, 1000);
}

// Helper function to end the game regardless good or bad
function helpEnd() {
    closeFullScreen();
    $('html').css('cursor', 'auto');
    $('body').css('cursor', 'auto');
    $('body').css('background-color', 'white');
    $('html').css('background-color', 'white');
	$('.score').empty();
	$('#scoreValue1').empty();
    $('#scoreValue2').empty();
    $('#additionalScore').empty()
    $('#reset-instruction').empty();
	$('#progress-bar-container').empty();
    $('#progress-bar').empty();
    $('#next').empty();
    $('#search_too_slow').empty();
	$('.timer_div').empty();
    
	d3.select('#basket_svg').attr('display', 'none');
    d3.select('#Tree').attr('display', 'none');
    d3.select('#Apples').attr('display', 'none');
	d3.select('#FallenApples').attr('display', 'none');

	// push the data earlier than this at earlier checkpoints
    recordTrialSubj(trialcollection, subjTrials);
}

function helpEndBlock(){
	// push the data earlier than this at earlier checkpoints
	closeFullScreen()
	document.getElementById("timer").innerText = ''
    recordTrialSubj(trialcollection, subjTrials);
}
// Function that allows for the premature end of a game
function badGame() {
    helpEnd();
	gamestate = 'ABORT'
	clearInterval(clockUpdateInterval);
    show('container-failed', 'blinking');
}

// End block normally 
function endBlock() {
	helpEndBlock();
	block += 1;
	clearTimeout(resetTrialTimeout);
	clearTimeout(warningTimeout);
	clearTimeout(inactiveTimeout);
	bwBlocksTimeout = setTimeout(function(){
		checkInfo();
	}, bwBlocksLimSeconds)
	document.getElementById('next').style.display = 'none';
	document.getElementById("num_apples").innerText = score;
	show('container-bw-blocks', 'blinking')
}

// Function that ends the game appropriately after the experiment has been completed
function endGame() {
	console.log("Entering EndGame() Function")
	console.log("score: "+ score)
    helpEnd();
	clearTimeout(resetTrialTimeout);
	clearTimeout(warningTimeout);
	clearTimeout(inactiveTimeout);
	document.getElementById('next').style.display = 'none';
	window.removeEventListener("blur", checkWinBlur);
	window.removeEventListener("focus", checkWinFocus);
    show('container-end-block', 'blinking');
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
