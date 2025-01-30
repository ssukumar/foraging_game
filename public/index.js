
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDyeb8xZ2uA6jZxaukBxTo0XWEWGyrOALQ",
//   authDomain: "foraging-game-4b625.firebaseapp.com",
//   databaseURL: "https://foraging-game-4b625-default-rtdb.firebaseio.com",
//   projectId: "foraging-game-4b625",
//   storageBucket: "foraging-game-4b625.appspot.com",
//   messagingSenderId: "548525895337",
//   appId: "1:548525895337:web:bc17cbdb856ec96638c3b8",
//   measurementId: "G-DZ2577L4CE"
// };
//
// const app = firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// db.settings({ignoreUndefinedProperties: true});
// console.log(db);
//

// Set to 'true' if you wish to only test the front-end (will not access databases)
// **TODO** Make sure this is set to false before deploying!
const noSave = true;
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
	keyIncRate: [],
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
	
	
    var actualCode = "rice"; // **TODO: Update depending on the "code" set in index.html
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
        // show('blinking', prevScreen);
		// show('calibration', prevScreen);
		// monitorCalibration(prevScreen);
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
		
		beginBlock(block, shortFirst);
		
		// show('calibration', prevScreen);
		// monitorCalibration(prevScreen);
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

// TO DO: Add to the target json file 
var calibration_score = 0;
var calib_first_score = 0; // first score 
var calibration_block = 0;
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
var totalCalibrationSeconds = 40; // Number of seconds in calibration phase 
var totalTimeMins = 15; // Duration of experiment in minutes
var timeRemaining;
var requiredPresses = 1; // Number of space bar presses required to harvest
var currentPresses = 0; // Current number of presses'
var keyPressIncrements; // Number of required keypresses incremented after each harvest 
var resetTrialTimeout; // Tiemout variable associated with starting a new trial
var keyPressIncGoodBad = [2, 5];
var maxDefocusLim = 3; // maximum number of times a window can be defocussed before a game is quit
var defocusCount = 0;
var inactiveLimSeconds = 45;
var inactiveTimeout;
var enterSpaceDown;
var warningLimSeconds = 25;
var warningTimeout;
var bwBlocksLimSeconds = 300;
var bwBlocksTimeout;
var windowBlur
var svgNS = "http://www.w3.org/2000/svg"; 
const svgCanvas = document.getElementById("basket_svg");
const shapeElement = document.getElementById("basket");
var gameStartTime = new Date();
//gameState variables
var gameState = 'GAMESTART';
var CALIBRATION = 'CALIBRATION';
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
	
	setTimeout(function(){
		windowBlur = false;
	}, 1000);
	return false;
}


function checkInactive(){
	warningTimeout = setTimeout(function(){
		document.getElementById('warning').style.display = 'block';
	}, warningLimSeconds * 1000)
	
	inactiveTimeout = setTimeout(function(){
		defocusCount = 0 // reset so it doesn't interfere and provide an alert
		badGame()
	}, inactiveLimSeconds * 1000)
}


// FOR MAX: CALIBRATION PHASE BASE CODE (USE IT OR LEAVE IT)
function monitorCalibration(curr_html_page){
	
	gameState = CALIBRATION;
	calibration_block += 1; 
	calibration_score = 0;
	
	show('calibration', curr_html_page);
	
	//setup 40 second timer 
	var countDownDate = new Date();
	
	countDownDate.setSeconds(countDownDate.getSeconds() + totalCalibrationSeconds);
	
	// Update the count down every 1 second
	clockUpdateInterval = setInterval(function() {

	  // Get today's date and time
	  var now = new Date().getTime();

	  // Find the distance between now and the count down date
	  timeRemaining =  countDownDate.getTime() - now;

	  // Time calculations for days, hours, minutes and seconds
	  var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
	  var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

	  // Display the result in the element with id="demo"
	  document.getElementById("timer").innerText = minutes + "m :" + seconds + "s ";
	  console.log("Time Remaining = " + timeRemaining)
	  // If the count down is finished, write some text 
	  if (timeRemaining < 0) {
	
		console.log("TIME'S UP!! ENDING THE GAME")
		document.removeEventListener("keydown", handleKeyDownEvents);
		document.removeEventListener("keyup", handleKeyEvents);
	    clearInterval(clockUpdateInterval);
		
		if (calibration_block == 1){
			// show('calib_bw_block', 'calibration')
			transitionCalibration()
		} else {
			// Moving on to the beginning of the block
	        show('blinking', 'calibration');
			beginBlock(block, shortFirst);
		}
	  }

	}, 1000);
	
	// Listen to the keypress 
	document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents)
	
}

function transitionCalibration(){
	// clearInterval(clockUpdateInterval);
	console.log("Entering the Transition Calibration Functions!!!! ")
	calibration_score = 0
	document.getElementById("num_keypresses").innerText = calibration_score;
	show('calib_bw_block', 'calibration')
	monitorCalibration('calib_bw_block');
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
    requiredPresses+=keyPressIncrements;
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
	console.log("")
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

// function to begin a block 
function beginBlock() {
	openFullScreen();
	checkInactive();
	clearTimeout(bwBlocksTimeout)
	score = 0;
	travelTime = chooseTravelTime()
	console.log("Travel Time: "+travelTime)
	
	runTrialLogic();
	return false;
}


// Function to run the trial logic
function runTrialLogic() {
    console.log('start trial')
	show('blinking', 'container-info');
    resetTrial(0);
	
    var d = new Date();
    var current_date = (parseInt(d.getMonth()) + 1).toString() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + "." + d.getMilliseconds();
	gameStartTime = d.getTime();
    // Uploading reach data for this reach onto the database
    subjTrials.id = subject.id.concat(block.toString());;
    subjTrials.currentDate = current_date;
	
	runTimer();
	
	window.addEventListener("blur", checkWinBlur);
	window.addEventListener("focus", checkWinFocus);
	
	document.addEventListener("keydown", handleKeyDownEvents);
	document.addEventListener("keyup", handleKeyEvents)
    return false;
}

      
function runTimer(){
	
	var countDownDate = new Date();
	
	countDownDate.setMinutes(countDownDate.getMinutes() + totalTimeMins);
	
	// Update the count down every 1 second
	clockUpdateInterval = setInterval(function() {

	  // Get today's date and time
	  var now = new Date().getTime();

	  // Find the distance between now and the count down date
	  timeRemaining = countDownDate - now;

	  // Time calculations for days, hours, minutes and seconds
	  var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
	  var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

	  // Display the result in the element with id="demo"
	  document.getElementById("timer").innerText = minutes + "m :" + seconds + "s ";
	  //
	  console.log("Time Remaining")
	  console.log(timeRemaining)
	  //
	  // If the count down is finished, write some text 
	  if (timeRemaining < 0) {
	
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
		// document.getElementById("timer").innerHTML = "EXPIRED";
	  }

	}, 1000);
	
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

// Function to set keydown event true
function handleKeyDownEvents(event){
	if (event.key === "Enter"){
		enterKeyDown = true;
	} else if (event.key === " "){
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
	if (gameState != CALIBRATION){
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
			subjTrials.requiredPresses.push(requiredPresses);
			subjTrials.currentPresses.push(currentPresses);
			subjTrials.score.push(score);
			subjTrials.keyIncRate.push(keyPressIncrements);
		
			// travelTime = chooseTravelTime()
	        resetTrial(travelTime); // Start a new trial
	        // trialCount++;
	    }
	} // no else : no-op during 
}

// Function to handle spacebar press
function handleSpacebarPress(event) {	
	if (enterSpaceDown == true){
		enterSpaceDown = false;
	    if (event.key === " ") {
	        
			
			if (gameState != CALIBRATION){
				currentPresses++;
		        if (checkPresses()) {
		            gameState = HARVEST;
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
					subjTrials.keyIncRate.push(keyPressIncrements);
	            
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
					subjTrials.keyIncRate.push(keyPressIncrements); 
		            updateProgressBar();
		        }
			} else{
				calibration_score += 1;
				document.getElementById("scoreValue").innerText = calibration_score;
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
	$('#scoreValue').empty();
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
	}, bwBlocksLimSeconds*1000)
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