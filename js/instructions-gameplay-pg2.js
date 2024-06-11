/*
instructions-gameplay.js

    Author      :   Sheer Karny, Mark Steyvers
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Integrity pledge (or Comprehension Quiz) Page METADATA file.

This file should contain static variables and functions for
to conduct the comprehension quiz.

There will be no quiz, rather an integrity pledge to sign.
*/


//******************************META VARIABLES **********************************//
let understandingCheckPassed = false;
let understandingCheckFailed = false;
let passCounter              = 0; 
let failedCounter            = 0;
let highValueTargetCaught    = false;
let fastObjectSpawned = false;
let fastObjectCaught = false;
let slowObjectCaught = false;

// //**************************FIREBASE FUNCTIONALITY****************************//
// /// Importing functions and variables from the Firebase Psych library
// import { 
//     writeRealtimeDatabase,writeURLParameters,readRealtimeDatabase,
//     blockRandomization,finalizeBlockRandomization,firebaseUserId 
// } from "./firebasepsych1.0.js";

// console.log("Firebase UserId=" + firebaseUserId);

const studyId = 'gameTest1';

// // Example: storing a numeric value
// // The result of this is stored on the path: "[studyId]/participantData/[firebaseUserId]/trialData/trial1/ResponseTime"


// MS: adding a random number generator
function lcg(seed) {
    const a     = 1664525;
    const c     = 1013904223;
    const m     = Math.pow(2, 32);
    let current = seed;
  
    return function() {
      current   = (a * current + c) % m;
      return current / m;
    };
}
  
// Initialize with a seed --> different seed for the introduction exercise.
const randomGenerator = lcg(123456);

//let randomValue1 = randomGenerator();

//**************************GAME INITIALIZATION*******************************//

// World Building Elements
const canvas            = document.getElementById('gameCanvas');
const ctx               = canvas.getContext('2d');
const scoreCanvas       = document.getElementById('scoreCanvas');
const scoreCtx          = scoreCanvas.getContext('2d');
const world             = { width: 800, height: 800 };
const center            = { x: canvas.width / 2, y: canvas.height / 2 };
let observableRadius    = 390; // Radius for positioning objects


let settings = {
    spawnProbability:   .1,
    spawnInterval:      10,
    numSpawnLocations:  10,
    valueSkew:          1,
    valueLow:           0,
    valueHigh:          1,
    playerSpeed:        1.5,
    speedLow:           0.5, // lowest end of object speed distribution
    speedHigh:          0.5 // highest end of object speed distribution
}

// Timing variables
let gameInterval, gameStartTime, elapsedTime;
let isPaused         = false;
const gameTime       = 200000; // Two minutes in milliseconds
let isGameRunning    = false;
let frameCount       = 0;
let frameCountGame   = -1; // MS: number of updates of the scene
const fps            = 60; // Desired logic updates per second
const updateInterval = 1000 / fps; // How many milliseconds per logic update

// Data collection variables
let objects         = [];
let spawnData       = [];
let caughtTargets   = [];
let missedTargets   = [];
let playerClicks    = [];
let playerLocation  = [];

// Variables for cursor
let cursorSize  = 40;

// Varaiables for HTML elements
let score       = 0;

// Player and View Initialization (related to one another)
const playerSize = 50;
const shapeSize  = 15;
const player = {
    color:"rgba(255, 0, 0, 0.5)", 
    x:          canvas.width/2, //center the x,y in the center of the player.
    y:          canvas.height/2,
    moving:     false,
    targetX:    0,
    targetY:    0,
    velocity:   1.5,
    angle:      0,
    speed:      1.5, 
    width:      50, 
    height:     50,
};

let humanImg = new Image();
humanImg.src = './images/human-head-small.png'; // Path to your robot head image

const camera = {
    x:          world.width / 2,
    y:          world.height / 2,
    width:      canvas.width,
    height:     canvas.height
};

// ****************************UPDATE FUNCTIONS***************************//
let currentRound    = 1;
let maxRounds       = 5;
let spawnLocations  = [];

// Initialization code for starting page
// initializeStartingPage();
// Start Game function
function startGame(round) {
    currentRound    = round || currentRound; // Start at the specified round, or the current round
    //getDifficultySettingsFromURL();
    // settings = difficultySettings[currentRound];

    // Reset game canvas visibility
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'block';

    if (!isGameRunning) {
        setupCanvas();
        
        // if (!understandingCheckPassed) {
        //     spawnUnderstandingCheckObjects(); // Spawn understanding check objects
        //     console.log("Status of Understanding Check", understandingCheckPassed);
        // }

        gameStartTime   = Date.now();
        gameInterval    = setInterval(() => endGame(true), gameTime); // Pass a flag if the game ends naturally
        isGameRunning   = true;
        gameLoop();
        player.x        = canvas.width / 2;
        player.y        = canvas.height / 2;
        player.targetX  = canvas.width / 2;
        player.targetY  = canvas.height / 2;
        spawnUnderstandingCheckObjects();
        // console.log('Settings being passed into gameLoop', settings);
    }
    // conditional on if game ran already and failed comprehension clear game interval and canvas to restart.
}
startGame();

// End Game function
async function endGame(advanceRound = false) {
    // display message to allow continuation to the next round.
    await runGameSequence("You passed this comprehension check! Moving on to the next task. Click OK to continue.");

    isGameRunning = false;
    // console.log(gameTime); // Add this line
    clearInterval(gameInterval); 
    // console.log("Game Over!");
  
    // Additional end-game logic here
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'none';
    
    // console.log("Successfully Spawned Objects", spawnData);
    // console.log("Intercepted Targets", caughtTargets);  
    // console.log("Player Clicks Location", playerClicks);
    // console.log("Player Locations During Movement", playerLocation);
    
    $('#comprehension-quiz-main-content').load('html/instructions-gameplay-pg3.html');
    // console.log("Moving on to task 3 of 5");
}

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    elapsedTime = Date.now() - gameStartTime;

    
    // Calculate time since last update
    var deltaTime = timestamp - lastUpdateTime;
    // Check if it's time for the next update
    if (deltaTime >= updateInterval) {
        lastUpdateTime = timestamp - (deltaTime % updateInterval);
        updateObjects(settings); // Update game logic
    }

    render(); 
    requestAnimationFrame(gameLoop); // Schedule the next frame
}

var lastUpdateTime = 0;

// // Render function
// function render() {
//     // console.log('Rendering frame');
//     ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
//     drawMask(ctx, player);
//     drawGrid();                                      // Draw grid
//     ctx.save();
//     // ctx.translate(-canvas.width / 2 + player.x, -canvas.height / 2 + player.y);
//     drawWorldBoundary();    // Draw boundaries
//     drawPlayer();
//     if (player.moving) drawArrowDirection();     // Draw arrow direction
//     // drawTargetLocation();   // Draw target location
//     // drawCursor(mouseX, mouseY); // Draw cursor
//     drawObjects();          // Draw objects
//     ctx.restore();
//     // drawScore();            // Draw score
// }

// Render function
function render() {
    // console.log('Rendering frame');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawMask(ctx, player);
    drawCenterMarker();                               // Draw the center marker
    //drawGrid();                                      // Draw grid
    ctx.save();
    // ctx.translate(-canvas.width / 2 + player.x, -canvas.height / 2 + player.y);
    drawWorldBoundary();    // Draw boundaries
    drawPlayer();
    // if (player.moving) drawArrowDirection();     // Draw arrow direction
    // drawTargetLocation();   // Draw target location
    // drawCursor(mouseX, mouseY); // Draw cursor
    drawObjects();          // Draw objects
    ctx.restore();
    // drawScore();            // Draw score
    // console.log("Current Frame Count:", frameCountGame);
}

// Update game objects
function updateObjects(settings) {
    if (isPaused){
        // console.log("Game is paused");
        return;
    } 
    if (frameCountGame == 0) {
        // console.log("Starting Game");
        runGameSequence("First, Read The Instructions Carefully. After, Click OK to Begin This Task.");
    }

    frameCountGame++; // MS: increment scene update count
    //console.log( 'Scene update count: ' + frameCountGame);

    // console.log("Current Settings", settings)
    // console.log('Updating objects');

    player.velocity = settings.playerSpeed;
 
    // Update player position if it is moving
    if (player.moving) {
        const deltaX = player.targetX - player.x;
        const deltaY = player.targetY - player.y;
        const distanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distanceToTarget < player.velocity) {
            // Player has arrived at the target location
            player.x = player.targetX;
            player.y = player.targetY;
            player.moving = false;
        } else {
            // Move player towards the target
            player.angle = Math.atan2(deltaY, deltaX);
            player.x += player.velocity * Math.cos(player.angle);
            player.y += player.velocity * Math.sin(player.angle);

            playerLocation.push({time: frameCount, x: player.x, y: player.y});
        }
    }

    // Prevent player from moving off-screen
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));

    objects.forEach((obj, index) => {
        if (obj.active) {
            obj.x += obj.vx * obj.speed; // Update x position
            obj.y += obj.vy * obj.speed; // Update y position
            // console.log("Object Location", obj.x, obj.y);

            // Check if the object is outside the observable area
            let dx = obj.x - center.x;
            let dy = obj.y - center.y;
            let distanceFromCenter = Math.sqrt(dx * dx + dy * dy) - 10;

            if (distanceFromCenter > observableRadius) {
                runGameSequence("Target missed! Remember to plan your movements.");
                understandingCheckFailed = true;
                failedCounter += 1;
                // console.log("Object is outside observable area");
                obj.active = false; // Set the object to inactive
                objects = [] // Remove the object from the array
                spawnUnderstandingCheckObjects();
            }

            if (checkCollision(player, obj)) {
                // Collision detected
                obj.active = false;
                objects.splice(index, 1); // Remove the object from the array
                
                // console.log("Collision detected!");
                caughtTargets.push(obj);

                if (obj.fast) {
                    // console.log("High-speed target caught!");
                    fastObjectCaught = true; // set the flag if the high-value object is caught
                }
                else{
                    // console.log("Low-speed target caught!");
                    slowObjectCaught = true; // set the flag if the low-value object is caught
                }

                if (fastObjectCaught && slowObjectCaught){
                    passCounter     += 1;
                    // console.log("pass counter: " + passCounter);
                }

                if (objects.length == 0 && passCounter < 3){
                    // alert("Good Job! Collect all objects " + (3-passCounter) + " more times");
                    runGameSequence("Good Job! Collect all objects " + (3-passCounter) + " more times");
                    spawnUnderstandingCheckObjects();
                }
                else if (objects.length == 0 && passCounter == 3){
                    // console.log("pass counter: " + passCounter);
                    // alert("You passed the comprehension check! Moving on to the next task.");
                    endGame(false);
                }
            }
        }

        // Add to missed array iff : 1) Not Active, 2) Not Tagged, 3) Correct Target Shape.
        if (!obj.active && obj.objType === 'target') {
            // Log missed triangle
            missedTargets.push({ x: obj.x, y: obj.y, time:frameCount});

            // Calls a function cascade to display a message "Target Missed!"
            targetMissed();
        }
    });
}


function createComposite(settings) {
    if (!settings) {
        console.error("Settings not provided to createComposite");
        return; // Or set default values for settings
    }
    let shapeType = 'circle';

    // minSize + Math.random() * (maxSize - minSize); // Random size within range

    // Sample u ~ Uniform(0,1)
    // adjust u by the skewFloor and skewCeiling
    var valueLow = settings.valueLow;
    var valueHigh = settings.valueHigh;
    var range = valueHigh - valueLow;
    
    //let u = Math.random() * range + valueLow;
    let u = randomGenerator() * range + valueLow;

    // Eta controls the skewness of the value distribution
    let eta = settings.valueSkew || 1; // Default to 1 if not provided
    // Apply the non-linear transformation
    let fillRadius = Math.pow(u, eta) * shapeSize;

    // sample from a distribution of speeds
    let speedRange = settings.speedHigh - settings.speedLow
    // let speedSample = Math.random() * speedRange + settings.speedLow;
    let speedSample = randomGenerator()  * speedRange + settings.speedLow;

    let newObj = {
        ID: frameCount ,
        type: 'composite',
        speed: speedSample, //(),
        x: 0,
        y: 0,
        vx: 0, // initial velocity is zero -->
        vy: 0,
        velAngle: 0, // initial velocity angle is zero --> reset in the setVelocityTowardsObservableArea
        size: shapeSize,
        outerColor: 'rgba(65, 54, 54, 0.5)',
        innerColor: 'orange',
        shape: shapeType, // Add shape type here
        type: 'target',
        //angle: shapeRotation,
        fill: fillRadius,
        fast: false, // this is for the understanding check
        active: true,
        spawnX: 0,
        spawnY: 0
    };
    // console.log(newObj.speed);

    return newObj;
}

function spawnUnderstandingCheckObjects() {
    
    for (let i = 0; i < 2; i++) {
        let newObj = createComposite(settings);
        let angle = randomGenerator() * 2 * Math.PI;

        // get x,y coordinates
        let curXLoc = center.x + observableRadius * Math.cos(angle); // - obj.width / 2;
        let curYLoc = center.y + observableRadius * Math.sin(angle); // - obj.height / 2;
        let location = {x:curXLoc, y:curYLoc, angle:angle, lastSpawnTime:0};

        if (DEBUG) console.log("New Object Spawned", newObj.velocity)

        // works good enough for now
        newObj.x = location.x ;
        newObj.y = location.y ;

        newObj.spawnX = location.x;
        newObj.spawnY = location.y;

        newObj.fill = 0;
        if (!fastObjectSpawned){
            newObj.speed = 1.49;
            fastObjectSpawned = true;
            newObj.fast = true;
        }
        else{
            newObj.speed = 0.5;
            //reset the spawning for the fast object
            fastObjectSpawned = false;
        }

        setVelocityTowardsObservableArea(newObj);
        objects.push(newObj);
    }
  
  
    fastObjectCaught = false;
    slowObjectCaught = false;
    // MS: Generate a random angle between 0 and 2π (0 and 360 degrees)
            //let angle = Math.random() * 2 * Math.PI;
            
    // // Spawn high value object
    // let lowValueObject = createComposite(settings); // Ensure this has high fill radius
    // lowValueObject.fill = 0.1 * shapeSize;
    // lowValueObject.highValue = false; // Set the value to true for the high-value object
    // positionObjectsOnRim(lowValueObject);
    // objects.push(lowValueObject);

    // // Spawn low value object
    // let highValueObject = createComposite(settings); // Ensure this has low fill radius
    // highValueObject.fill = 0.9 * shapeSize;
    // highValueObject.highValue = true; // Set the value to false for the low-value object
    // positionObjectsOnRim(highValueObject);
    // objects.push(highValueObject);
}


function setVelocityTowardsObservableArea(obj) {
    // Calculate angle towards the center
    let angleToCenter = Math.atan2(center.y - obj.y, center.x - obj.x);

    // Define the cone's range (22.5 degrees in radians)
    let coneAngle = 90 * (Math.PI / 180); // Convert degrees to radians

    // Randomly choose an angle within the cone
    //let randomAngleWithinCone = angleToCenter - coneAngle / 2 + Math.random() * coneAngle;
    let randomAngleWithinCone = angleToCenter - coneAngle / 2 + randomGenerator()  * coneAngle;

    // Set velocity based on the angle within the cone
    obj.vx = Math.cos(randomAngleWithinCone);
    obj.vy = Math.sin(randomAngleWithinCone);
    // console.log(`Initial Velocity for object: vx = ${obj.vx}, vy = ${obj.vy}`);
}

// Choose one function
function positionObjectsOnRim(obj) {
    if (!obj) {
        console.error("Invalid object passed to positionObjectsOnRim");
        return;
    }
    // Calculate a random angle
    //let angle = Math.random() * 2 * Math.PI;
    let angle = randomGenerator() * 2 * Math.PI;

    // Position the object on the rim of the camera
    obj.x = center.x + observableRadius * Math.cos(angle);
    obj.y = center.y + observableRadius * Math.sin(angle);

    // console.log(`Initial position for object: x = ${obj.x}, y = ${obj.y}`);

    // Set the object's velocity towards the observable area
    setVelocityTowardsObservableArea(obj);
}

function checkCollision(player, obj) {
    // Calculate the player's bounding box edges from its center
    let playerLeft = player.x - player.width / 2;
    let playerRight = player.x + player.width / 2;
    let playerTop = player.y - player.height / 2;
    let playerBottom = player.y + player.height / 2;

    // Calculate the distance from the center of the player to the center of the object
    let circleDistanceX = Math.abs(obj.x - player.x);
    let circleDistanceY = Math.abs(obj.y - player.y);

    // Check for collision
    if (circleDistanceX > (player.width / 2 + obj.size / 2)) { return false; }
    if (circleDistanceY > (player.height / 2 + obj.size / 2)) { return false; }

    if (circleDistanceX <= (player.width / 2)) { 
        return true; 
    } 
    if (circleDistanceY <= (player.height / 2)) {
        return true; 
    }

    // Check corner collision
    let cornerDistance_sq = (circleDistanceX - player.width / 2) ** 2 + (circleDistanceY - player.height / 2) ** 2;
    if (cornerDistance_sq <= ((obj.size / 2) ** 2)) {
        return true;
    }
    return false;
}

function spawnObject(settings){
    // console.log("number of spawning locations : ",settings.numSpawnLocations);
    // console.log("value type of spawning locations : ", typeof(settings.numSpawnLocations));

    // MS: commenting out loop
    //spawnLocations.forEach(location => { 
        //let randomThreshold = Math.random();
        let randomThreshold = randomGenerator();

        // console.log("Current Location Being Assessed:", location); 

        // only attempt a spawn if the elapsed time is greater than the spawn interval
        // MS: I commented out the next conditiona; as we don't need it any longer

        if (randomThreshold < settings.spawnProbability){
            // console.log("Spawn Threshold Met");
            let newObject = createComposite(settings);
            // assign the object to a random spawn location
            // console.log("Spawn Location Data:", location);
    
            
            
            // MS: Generate a random angle between 0 and 2π (0 and 360 degrees)
            //let angle = Math.random() * 2 * Math.PI;
            let angle = randomGenerator() * 2 * Math.PI;


            // get x,y coordinates
            let curXLoc = center.x + observableRadius * Math.cos(angle); // - obj.width / 2;
            let curYLoc = center.y + observableRadius * Math.sin(angle); // - obj.height / 2;
            let location = {x:curXLoc, y:curYLoc, angle:angle, lastSpawnTime:0};


            // works good enough for now
            newObject.x = location.x ;
            newObject.y = location.y ;

            newObject.spawnX = location.x;
            newObject.spawnY = location.y;
    
            setVelocityTowardsObservableArea(newObject);
    
            // push to objects array in order to render and update
            objects.push(newObject);
            // console.log("New Object Spawned", newObject);
            spawnData.push(newObject)
        }
        location.lastSpawnTime = elapsedTime;
}

// Helper function to clamp a value between a minimum and maximum value
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function positionObjectAtAngle(obj, angle) {
    obj.x = center.x + observableRadius * Math.cos(angle) - obj.width / 2;
    obj.y = center.y + observableRadius * Math.sin(angle) - obj.height / 2;
    setVelocityTowardsObservableArea(obj);
}
// Helper function to determine if an object is within view ***currently not used***

function isWithinObservableArea(obj) {
    // Calculate the distance from the object to the player
    let dx = obj.x - player.x;
    let dy = obj.y - player.y;
    let distanceSquared = dx * dx + dy * dy;

    // Check if the object is within the observable radius
    return distanceSquared <= observableRadius * observableRadius;
}

function getObjectSpeed(){
    // return (Math.floor(Math.random() * 4) + 1) * 0.5;
    return 1; // making speed constant for now.
}

//*************************DRAWING FUNCTIONS******************************//

function setupCanvas() {
    // Fill the background of the entire canvas with grey
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Define the game world area with a white rectangle (or any other color your game uses)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, world.width, world.height);
}

function drawWorldBoundary() {
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(0, 0, world.width, world.height);
}



function drawPlayer() {
    let topLeftX = player.x - player.width / 2;
    let topLeftY = player.y - player.height / 2;

    ctx.fillStyle = player.color;
    ctx.fillRect(topLeftX, topLeftY, player.width, player.height);

    ctx.drawImage(humanImg, topLeftX, topLeftY, 50, 50);
}


// Function to draw objects
function drawObjects() {
    objects.forEach(obj => {
        if (obj.active) {
            drawCompositeShape(obj);
            //drawDebugBounds(obj);
            // drawVelocityVector(obj);
        }
    });
}

function drawCompositeShape(obj) {

    // If the object is clicked, draw a green highlight around it.
    if (obj.marked && !player.toCenter){
        let ringColor = 'red';
        let ringRadius = obj.size + 5;
        // drawCircle(obj.x, obj.y,ringRadius, ringColor); 
        drawTargetMarker(obj.x, obj.y, obj.size + 2, obj.size + 12, 10, 'player');
    } 

    // Draw the outer circle first
    drawCircle(obj.x, obj.y, obj.size, obj.outerColor); // Outer circle

    // Then draw the inner circle on top
    drawCircle(obj.x, obj.y, obj.fill, obj.innerColor); // Inner circle, smaller radius
}

function drawTargetMarker(centerX, centerY, radius1, radius2, triangleBase=5, type, offset=0) {
    const context = document.querySelector('canvas').getContext('2d'); // Assuming there's a canvas element in your HTML
    const angles = [0 + offset, Math.PI / 2 + offset, Math.PI + offset, (3 * Math.PI) / 2 + offset]; // angles for the 4 triangles
    const triangleHeight = radius2 - radius1; // Calculate the height of the triangles

    context.save();
    // ctx.fillStyle = color;
    if (type == 'player') ctx.fillStyle = 'red';
    if ((type == 'AI') && settings.AICollab == 0) ctx.fillStyle = 'green';
    if ((type == 'AI') && settings.AICollab == 1) ctx.fillStyle = 'purple';

    angles.forEach((angle) => {
        const tipX = centerX + radius1 * Math.cos(angle);
        const tipY = centerY + radius1 * Math.sin(angle);
        const baseX1 = centerX + radius2 * Math.cos(angle) - triangleBase / 2 * Math.sin(angle);
        const baseY1 = centerY + radius2 * Math.sin(angle) + triangleBase / 2 * Math.cos(angle);
        const baseX2 = centerX + radius2 * Math.cos(angle) + triangleBase / 2 * Math.sin(angle);
        const baseY2 = centerY + radius2 * Math.sin(angle) - triangleBase / 2 * Math.cos(angle);

        // Draw a triangle
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(baseX1, baseY1);
        ctx.lineTo(baseX2, baseY2);
        ctx.closePath();
        ctx.fill();
    });

    ctx.restore();
}


function drawCircle(centerX, centerY, radius, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function drawCenterMarker(centerX=400, centerY=400, radius=10, color = "rgba(128, 128, 128, 0.5)"){
    if (player.toCenter) {
        drawCircle(centerX, centerY, radius + 5,'red');
    } else{
        drawCircle(centerX, centerY, radius, color);
    }
}


function drawVelocityVector(obj) {
    if (isWithinCanvas(obj)) {
        const velocityScale = 1000; // Adjust this value to scale the velocity vector length
        const arrowSize = 5; // Size of the arrowhead

        // Calculate the end point of the velocity vector
        const endX = obj.x + obj.vx * obj.speed * velocityScale;
        const endY = obj.y + obj.vy * obj.speed * velocityScale;

        // Draw the line for the velocity vector
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'blue'; // Color of the velocity vector
        ctx.stroke();

        // Optionally, draw an arrowhead at the end of the velocity vector
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowSize, endY + arrowSize);
        ctx.lineTo(endX + arrowSize, endY + arrowSize);
        ctx.lineTo(endX, endY);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }
}

function isWithinCanvas(obj) {
    return obj.x >= 0 && obj.x <= canvas.width && obj.y >= 0 && obj.y <= canvas.height;
}

function drawDebugBounds(obj) {
    ctx.strokeStyle = 'red'; // Set the boundary color to red for visibility
    ctx.strokeRect(obj.x, obj.y, obj.size, obj.size); // Draw the boundary of the object
}

function drawScore() {
    scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height); // Clear the score canvas
    scoreCtx.font = '16px Roboto';
    scoreCtx.fillStyle = 'black'; // Choose a color that will show on your canvas
    scoreCtx.fillText('Score: ' + score, 10, 20); // Adjust the positioning as needed
}

function drawCursor(x, y) {
    ctx.save(); // Save state
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)'; // Semi-transparent grey
    ctx.beginPath();
    ctx.arc(x, y, cursorSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore(); // Restore state
}

// drawing outer mask
function drawMask(ctx) {
    if (!ctx) {
        console.error('drawMask: No drawing context provided');
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maskRadius = 400; // Adjust as necessary

    ctx.save();

    // Draw a black rectangle covering the entire canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Then cut out a circular area from the rectangle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maskRadius, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

// Function to where the player is heading
function drawArrowDirection() {
    // Define the radial distance from the player
    let radialDistance = 60; // Adjust this value as needed

    // Player dimensions (assuming square for simplicity)
    let playerWidth = 50; // Replace with actual player width
    let playerHeight = 50; // Replace with actual player height

  
    // Calculate the arrow's position around the player center
    let arrowCenterX = player.x + radialDistance * Math.cos(player.angle);
    let arrowCenterY = player.y + radialDistance * Math.sin(player.angle);

    // Define the size of the arrow
    let arrowLength = 20;
    let arrowWidth = 10;

    // Calculate the end point of the arrow
    let endX = arrowCenterX + arrowLength * Math.cos(player.angle);
    let endY = arrowCenterY + arrowLength * Math.sin(player.angle);

    // Calculate the points for the base of the arrow
    let baseX1 = arrowCenterX + arrowWidth * Math.cos(player.angle - Math.PI / 2);
    let baseY1 = arrowCenterY + arrowWidth * Math.sin(player.angle - Math.PI / 2);
    let baseX2 = arrowCenterX + arrowWidth * Math.cos(player.angle + Math.PI / 2);
    let baseY2 = arrowCenterY + arrowWidth * Math.sin(player.angle + Math.PI / 2);

    // Draw the arrow
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(baseX1, baseY1);
    ctx.lineTo(endX, endY);
    ctx.lineTo(baseX2, baseY2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawTargetLocation() {
    // draw an x where the player is aiming
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.targetX - 10, player.targetY - 10);
    ctx.lineTo(player.targetX + 10, player.targetY + 10);
    ctx.moveTo(player.targetX + 10, player.targetY - 10);
    ctx.lineTo(player.targetX - 10, player.targetY + 10);
    ctx.stroke();
    ctx.restore();
}

// AI Assistance...
function highlightAssist(obj) {
    // Assuming the highlight is a circle around the object
    ctx.save();
    ctx.strokeStyle = 'green'; // Color of highlight
    ctx.lineWidth = 2; // Thickness of highlight line
    ctx.beginPath();

    // Set the radius to be larger than the object's size to surround the object
    // The new radius is the object's size divided by the square root of 2 (approximately 1.414)
    // which is the diagonal of the square, plus some padding
    const radius = (obj.size / Math.sqrt(2)) + 5; // Adding 5 for padding

    // Draw an arc centered on the object
    ctx.arc(obj.x + obj.size / 2, obj.y + obj.size / 2, radius, 0, Math.PI * 2);
    
    ctx.stroke();
    ctx.restore();
}

// Draw Grid function
function drawGrid() {
    // Begin path for grid lines
    ctx.beginPath();
    ctx.strokeStyle = '#CCCCCC';
  
    // Calculate the start and end points for the grid lines
    const leftmostLine = camera.x - (camera.x % 100);
    const topmostLine = camera.y - (camera.y % 100);
  
    // Vertical lines
    for (let x = leftmostLine; x < camera.x + canvas.width; x += 100) {
      ctx.moveTo(x - camera.x, 0);
      ctx.lineTo(x - camera.x, canvas.height);
    }
  
    // Horizontal lines
    for (let y = topmostLine; y < camera.y + canvas.height; y += 100) {
      ctx.moveTo(0, y - camera.y);
      ctx.lineTo(canvas.width, y - camera.y);
    }
  
    // Stroke the grid lines
    ctx.stroke();
}

function showTargetMessage(isCaught) {
    var messageBox = document.getElementById('messageBox');
    var gameMessage = document.getElementById('gameMessage');
  
    messageBox.style.display = 'block'; // Show the message box
    gameMessage.textContent = isCaught ? 'Target Caught!' : 'Target Missed!'; // Set the message
  
    // Optionally, hide the message after a delay
    setTimeout(function() {
      messageBox.style.display = 'none';
    }, 2000); // Hide the message after 2 seconds
}

//  CUSTOM ALERT MESSAGE IN ORDER TO PAUSE THE GAME AND DISPLAY TEXT
function showCustomAlert(message) {
    // document.getElementById('customAlertMessage').innerText = message;
    // document.getElementById('customAlert').style.display = 'flex';

    return new Promise((resolve, reject) => {
        // Display the custom alert with the message
        $('#customAlertMessage').text(message);
        $('#customAlert').show();
    
        // Set up the event handlers for the 'X' and 'OK' buttons
        $('#customAlert .custom-alert-close, #customAlert button').one('click', function() {
            $('#customAlert').hide();
            resolve(); // This resolves the Promise allowing code execution to continue
        });
    });
}

function closeCustomAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

// ********************************* NEW INTERCEPT FUNCTIONS ********************************* //

function attemptInterceptLocal(playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius) {
    let success = false;
    let travelTime = Infinity;
    let interceptPosX = NaN;
    let interceptPosY = NaN;
    let totalDistanceTraveled = Infinity;

    // Check if the object is within the circle initially
    if (Math.sqrt(objectPosX ** 2 + objectPosY ** 2) > circleRadius) {
        return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
    }

    // Initial relative position from the player to the object
    let relativePosX = objectPosX - playerPosX;
    let relativePosY = objectPosY - playerPosY;

    // Solving quadratic equation
    let A = objectVelX ** 2 + objectVelY ** 2 - playerSpeed ** 2;
    let B = 2 * (relativePosX * objectVelX + relativePosY * objectVelY);
    let C = relativePosX ** 2 + relativePosY ** 2;

    let discriminant = B ** 2 - 4 * A * C;

    if (discriminant < 0) {
        // No real solutions, interception not possible
        return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
    }

    // Calculate potential times for interception
    let t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    let t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

    // Determine the valid and earliest interception time
    if (t1 >= 0 && (t1 < t2 || t2 < 0)) {
        travelTime = t1;
    } else if (t2 >= 0) {
        travelTime = t2;
    } else {
        // No valid interception time found
        return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
    }

    interceptPosX = objectPosX + travelTime * objectVelX;
    interceptPosY = objectPosY + travelTime * objectVelY;
    totalDistanceTraveled = travelTime * playerSpeed;

    // Check if the intercept position is within the circle
    if (Math.sqrt(interceptPosX ** 2 + interceptPosY ** 2) <= circleRadius) {
        success = true;
    }

    if ((travelTime == null) | (interceptPosX== null) | ( interceptPosX==null) |
       (totalDistanceTraveled == null) | (success==null)) {
        console.log( 'Null values');
    }

    return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
}

// Helper function to determine if the click is on the object
function isClickOnObject(obj, x, y) {
    // Calculate the center of the object
    const centerX = obj.x + obj.size / 2;
    const centerY = obj.y + obj.size / 2;

    // Calculate the distance between the click and the object's center
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    // Check if the distance is less than or equal to the cursor size
    return distance <= cursorSize;
}

// Helper function to determine if the click is on the center
function isClickOnCenter(clickX,clickY){
    if ( Math.abs(clickX - center.x) <= 10 && Math.abs(clickY - center.y) <= 10 ){
        return true;
    } 

    return false;
}

// *********************************EVENT LISTENERS********************************* //


$(document).ready( function(){
    // Event listener for player click locations
    canvas.addEventListener('click', function(event) {
         // Get the position of the click relative to the canvas
         // Check not first click so that initializing game doesn't leed to player movement
         const rect   = canvas.getBoundingClientRect();
         const clickX = event.clientX - rect.left;
         const clickY = event.clientY - rect.top;
         // player.targetX = clickX;
         // player.targetY = clickY;
 
         // Calculate the angle from the player to the click position
         const deltaX = clickX - (player.x + player.width / 2);
         const deltaY = clickY - (player.y + player.height / 2);
         player.angle = Math.atan2(deltaY, deltaX);
         
 
        //  playerClicks.push({frame:frameCountGame, targetX:clickX, targetY:clickY, curX:player.x, 
        //                          curY:player.y, aiX:firstStep.x, aiY:firstStep.y, id:firstStep.ID});
 
         // console.log('Player clicked:', clickX, clickY);
 
         // check if player clicked on a target
         for (let i = 0; i < objects.length; i++) {
             if (isClickOnObject(objects[i], clickX, clickY)) {
                 // The click is on this object
                 objects[i].clicked = true;
                 objects[i].marked = true;
 
                 // unmark the previous target object
                 for (let j = 0; j < objects.length; j++) {
                     if (i !== j) {
                         objects[j].marked = false;
                     }
                 }
 
                 let success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled 
 
                 // let adjustedPlayerX = player.x - center.x ;//+ center.x;
                 // let adjustedPlayerY =  player.y - center.y ;//+ center.y;
 
                 let playerStartX = ( player.x - center.x );
                 let playerStartY = ( player.y - center.y );
 
                 let objectStartX = ( objects[i].x - center.x );
                 let objectStartY = ( objects[i].y - center.y );
 
                 let objectVelX = objects[i].vx * objects[i].speed;
                 let objectVelY = objects[i].vy * objects[i].speed;
 
                 // let cur_radius = 390;
                 let circleRadius = 390;
 
                 [success, travelTime, interceptPosX, 
                 interceptPosY, totalDistanceTraveled] = attemptInterceptLocal(playerStartX,playerStartY, player.velocity, objectStartX, objectStartY, objectVelX, objectVelY, circleRadius);
 
 
                 // let interceptSol = calculateInterception(player.x, player.y,objects[i].x, objects[i].y, objects[i].vx, objects[i].vy);
 
                 // Intercept the clicked object using the optimal intercept location
                 player.targetX = interceptPosX + center.x; //+ center.x;
                 player.targetY = interceptPosY + center.y; //+ center.y;
                 player.moving = true;
 
                 if (totalDistanceTraveled == Infinity){
                     console.log('No interception possible');
                     objects[i].innerColor = 'red'
 
                     // go to the despawn location
                 }
 
                //  break;
 
                 // player.targetX = interceptSolution.x; //+ center.x;
                 // player.targetY = interceptSolution.y; //+ center.y;
                 // player.moving = true;
 
             }  
             // if click is around the center, then allow movement there
             if ( isClickOnCenter(clickX,clickY) ) {
                 player.targetX = 400;
                 player.targetY = 400;
                 player.moving = true;
                 player.toCenter = true;
             } else if (!isClickOnCenter(clickX,clickY)){
                 player.toCenter = false;
             }
         }
     });
 
     window.closeCustomAlert = closeCustomAlert; // Add closeCustomAlert to the global scope
});

async function runGameSequence(message) {
    isPaused = true;
    await showCustomAlert(message);
    isPaused = false;
}

// Function to handle cursor size change
function handleCursorSizeChange(event) {
    cursorSize = Number(event.target.value);
}

function handleTargetProbChange(event){
    targetProbability = Number(event.target.value);
}

function handleNumObjectsChange(event){
    const newNumObjects = Number(event.target.value);
    const difference = newNumObjects - objects.length;
    
    if (difference > 0) {
        // Add more objects if the new number is greater
        for (let i = 0; i < difference; i++) {
            let newObj = createComposite(settings);
            positionObjectsOnRim(newObj);
            objects.push(newObj);
        }
    } else {
        // Remove objects if the new number is smaller
        objects.splice(newNumObjects, -difference);
    }
    // No need to reinitialize or redraw all objects, just adjust the existing array
}

// Toggle AI assistance function
function toggleAIAssistance() {
    aiAssistanceOn = !aiAssistanceOn; // Toggle the state
    const robotImg = document.getElementById('aiAssistRobot');
    const button = document.getElementById('toggleAIAssistance');

    if (aiAssistanceOn) {
        button.style.backgroundColor = 'green';
        button.textContent = 'AI Assistance: ON';
        robotImg.style.filter = 'drop-shadow(0 0 10px green)'; // Add green glow effect
    } else {
        button.style.backgroundColor = 'red';
        button.textContent = 'AI Assistance: OFF';
        robotImg.style.filter = 'none'; // Remove glow effect
    }
    
    // Redraw the canvas to reflect the change in highlighting
    //render();
}

// Function to initialize the starting page
function initializeStartingPage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK HERE TO BEGIN THE TASK.', canvas.width / 2, canvas.height / 2);
}

// Function to handle canvas click
function handleStartCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    if (isStartGameAreaClicked(canvasX, canvasY)) {
        startGame();
    }
}

// Function to check if the start game area is clicked
function isStartGameAreaClicked(x, y) {
    return x > canvas.width / 2 - 100 && x < canvas.width / 2 + 100 &&
           y > canvas.height / 2 - 20 && y < canvas.height / 2 + 20;
}

// Function to handle mouse movement
// function handleMouseMove(event) {
//     const rect = canvas.getBoundingClientRect();
//     mouseX = (event.clientX - rect.left);
//     mouseY = (event.clientY - rect.top);

//     // Clear the previous frame
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // // Create the gradient
//     // gradientRadius = 100;

//     // let gradient = ctx.createRadialGradient(mouseX, mouseY, gradientRadius, mouseX, mouseY, canvas.width);
//     // gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Semi-transparent black at center
//     // gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent at edges

//     // // Draw the fog
//     // ctx.fillStyle = gradient;
//     // ctx.fillRect(0, 0, canvas.width, canvas.height);
// }
//*****************************DATA COLLECTION***************************//
  
function targetMissed() {
    showTargetMessage(false);
}

function targetCaught(obj) {
    showTargetMessage(true);
    caughtTargets.push({ x: obj.x, y: obj.y, time: new Date()});
    console.log("Target was caught and pushed into array.")
}

function distractorCaught(obj){
    caughtDistractors.push({x: obj.x, y: obj.y, time: new Date()});
    console.log("Distractor pushed into array.");
}