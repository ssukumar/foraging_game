/*
Skeleton of the basic foraging task

Remember to update necessary fields before starting the game. All fields that require change will be marked by a "**TODO**" comment.
*/

// Set to 'true' if you wish to only test the front-end (will not access databases)
// **TODO** Make sure this is set to false before deploying!
const noSave = true;


var fileName;

/* TEMPORARY USE OF ORIGINAL CODE TO TEST THINGS OUT */
// try {
//     let app = firebase.app();
// } catch (e) {
//     console.error(e);
// }

// Setting up firebase variables//
// const firestore = firebase.firestore(); // (a.k.a.) db
// const firebasestorage = firebase.storage();
// const subjectcollection = firestore.collection("Subjects");
// const trialcollection = firestore.collection("Trials");

// Function to switch between HTML pages
function show(shown, hidden) {
    document.getElementById(shown).style.display = 'block';
    document.getElementById(hidden).style.display = 'none';
    return false;
}

// Important variables for coding

var init_dur = 0.5;
const delay_add = 0.5;
const max_runs = 10;
// from https://stackoverflow.com/questions/29205294/how-to-achieve-blinking-effect-in-svg

var svgNS = "http://www.w3.org/2000/svg"; 
const svgCanvas = document.getElementById("basket_svg");
const shapeElement = document.getElementById("basket");

function createTree(){
// thanks ChatGPT
   // Define the angles for each circle
    var angles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];

    // Create SVG circle elements
	var trunk = document.createElementNS(svgNS, "rect");
	trunk.setAttribute('x', 70);
	trunk.setAttribute('y', 0);
	trunk.setAttribute('width', 10);
	trunk.setAttribute('height', 30);
	trunk.setAttribute('fill', "brown");
	svgCanvas.appendChild(trunk);
	
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

      svgCanvas.appendChild(circle);
  });
}

function createApples(){
	
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

      	svgCanvas.appendChild(circle);
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
		svgCanvas.appendChild(circle);
	}
}

function monitorBasket(dur){
	setTimeout(function(){
			shapeElement.setAttribute("fill","green");
			document.addEventListener("keypress", function(event){
		    if (event.keyCode == 32){
		   		shapeElement.setAttribute("fill","black");
				dur += delay_add;
				monitorBasket(dur);
				console.log("Inside event listener");
				console.log("delay = " + dur);
				clearInterval(keepChecking4Space);
			}
		});
		
	}, dur*1000);
}

createTree();
createApples();
monitorBasket(init_dur);


