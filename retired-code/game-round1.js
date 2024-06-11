/*
game.js

    Author      :   Sheer Karny, Mark Steyvers
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)


Game Page JS file (metadata and functionality).

This file should contain all variables and functions needed for
the game.
*/


//******************************META VARIABLES **********************************//
let understandingCheckPassed = false;

// //**************************FIREBASE FUNCTIONALITY****************************//
// /// Importing functions and variables from the Firebase Psych library
import { 
    writeRealtimeDatabase,writeURLParameters,readRealtimeDatabase,
    blockRandomization,finalizeBlockRandomization,firebaseUserId 
} from "./firebasepsych1.0.js";

// console.log("Firebase UserId=" + firebaseUserId);

const studyId = 'gameTest1';

// // Example: storing a numeric value
// // The result of this is stored on the path: "[studyId]/participantData/[firebaseUserId]/trialData/trial1/ResponseTime"
let pathnow = studyId + '/participantData/' + firebaseUserId + '/participantInfo';
writeURLParameters(pathnow);

//**************************GAME INITIALIZATION*******************************//

// World Building Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreCanvas = document.getElementById('scoreCanvas');
const scoreCtx = scoreCanvas.getContext('2d');
const world = { width: 800, height: 800 };
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let observableRadius = 390; // Radius for positioning objects

let settings = {};

// change game to complete based on 2 minutes of frame counts at 60 fps

function getDifficultySettingsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let settings = {
        maxTargets: parseInt(urlParams.get('maxTargets'), 10) || 8, // MS2: added this parameter to limit total number of targets
        spawnProbability: parseFloat(urlParams.get('spawnProbability')) || 1.0,
        spawnInterval: parseInt(urlParams.get('spawnInterval'), 10) || 10,
        // numSpawnLocations: parseInt(urlParams.get('numSpawnLocations'), 10) || 10,
        valueSkew: parseFloat(urlParams.get('valueSkew')) || 1,
        valueLow: parseFloat(urlParams.get('valueLow')) ||0,
        valueHigh: parseFloat(urlParams.get('valueHigh')) || 1,
        playerSpeed: parseFloat(urlParams.get('playerSpeed'),10) || 1.5,
        speedLow: parseFloat(urlParams.get('speedLow'),10) || 0.75, // lowest end of object speed distribution
        speedHigh: parseFloat(urlParams.get('speedHigh'),10) || 2.5, // highest end of object speed distribution
        randSeed: parseInt(urlParams.get('randSeed'), 10) || 12345
    };
    return settings;
}

// MS: adding a random number generator
function lcg(seed) {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    let current = seed;
  
    return function() {
      current = (a * current + c) % m;
      return current / m;
    };
  }
  
let randomGenerator;

//let randomValue1 = randomGenerator();

// let engageInstructions = false;

// Timing variables
let gameInterval, gameStartTime, elapsedTime;
let isPaused = false; // flag for pausing the game
const gameTime = 30000; // Two minutes in milliseconds
let isGameRunning = false;
let frameCount = 0;
let frameCountGame = -1; // MS: number of updates of the scene
const fps = 60; // Desired logic updates per second
const updateInterval = 1000 / fps; // How many milliseconds per logic update

// Data collection variables
let objects = [];
let spawnData = [];
let caughtTargets = [];
let missedTargets = [];
let playerClicks = [];
let playerLocation = [];

// Variables for cursor
let cursorSize = 40;
let mouseX = 0, mouseY = 0;

// Varaiables for HTML elements
let score = 0;

// Player and View Initialization (related to one another)
const playerSize = 50;
const player = {
    color:"red", 
    x: canvas.width/2 , //center the x,y in the center of the player.
    y: canvas.height/2 ,
    moving:false,
    targetX:0,
    targetY:0,
    velocity: 1.5,
    angle:0,
    speed: 1.5, 
    width:50, 
    height:50,
};
const camera = {
    x: world.width / 2,
    y: world.height / 2,
    width: canvas.width,
    height: canvas.height
};

// ****************************UPDATE FUNCTIONS***************************//
let currentRound = 1;
let maxRounds = 5;
// let settings = {}
let spawnLocations= [];

// let settings = {};
// let difficultySettings = {
//     1: {spawnProbability:0.9, targetProbability:0.8, numSpawnLocations:5, spawnInterval:3000, fillRadiusSkew:3}//,
//     // Add more settings for each level
// };


// Initialization code for starting page
//initializeStartingPage();
// Start Game function
function startGame(round) {
    currentRound = round || currentRound; // Start at the specified round, or the current round
    settings = getDifficultySettingsFromURL();
    // Initialize with a seed
    randomGenerator = lcg(settings.randSeed);
    // settings = difficultySettings[currentRound];

    // console.log("start game settings", settings);

    // Reset game canvas visibility
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'block';

    if (!isGameRunning) {
        setupCanvas();
        
        // MS: commented out the next line as we are changing the generative process
        //setSpawnLocations(settings);

        // MS: commented out next line as in the new code, spawnObject will be called at the first call for updateObjects
        //spawnObject(settings); // Initialize objects with difficulty settings
        gameStartTime = Date.now();
        gameInterval = setInterval(() => endGame(true), gameTime); // Pass a flag if the game ends naturally
        isGameRunning = true;
        gameLoop();
        // console.log('Settings being passed into gameLoop', settings);
    }
}
startGame();

// End Game function
// End Game function
async function endGame(advanceRound = false) {
    // display message to allow continuation to the next round.
    await runGameSequence("You passed this comprehension check! Moving on to the next task. Click OK to continue.");

    isGameRunning = false;
    // console.log(gameTime); // Add this line
    clearInterval(gameInterval); 
    console.log("Game Over!");
  
    // Additional end-game logic here
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'none';
    
    console.log("Successfully Spawned Objects", spawnData);
    console.log("Intercepted Targets", caughtTargets);  
    console.log("Player Clicks Location", playerClicks);
    console.log("Player Locations During Movement", playerLocation);
    
    $('#task-main-content').load('html/game-round2.html');
    console.log("Moving on to task 3 of 5");
}
// async function endGame(advanceRound = false) {
   
//     await runGameSequence("Moving on to round 2 of 6. Click OK to continue.");

//     isGameRunning = false;
//     // console.log(gameTime); // Add this line
//     clearInterval(gameInterval);
//     console.log("Game Over!");

//     // Additional end-game logic here
//     const gameCanvas = document.getElementById('gameCanvas');
//     gameCanvas.style.display = 'none';
//     console.log("Successfully Spawned Objects", spawnData);
//     console.log("Intercepted Targets", caughtTargets);  
//     console.log("Player Clicks Location", playerClicks);
//     console.log("Player Locations During Movement", playerLocation);

//     // $('#comprehension-quiz-main-content').load('html/integrity-pledge.html');
//     // console.log("Moving on to the integrity pledge and then the full game");

//     let path1 = studyId + '/participantData/' + firebaseUserId + '/spawnData';
//     let path2 = studyId + '/participantData/' + firebaseUserId + '/caughtTargets';
//     let path3 = studyId + '/participantData/' + firebaseUserId + '/playerClicks';
//     let path4 = studyId + '/participantData/' + firebaseUserId + '/playerLocation';

//     // writeRealtimeDatabase(path1, spawnData);
//     // writeRealtimeDatabase(path2, caughtTargets);
//     // writeRealtimeDatabase(path3, playerClicks);
//     // writeRealtimeDatabase(path4, playerLocation);

//     if (advanceRound) {
//         currentRound++;
//         objects = []; // Reset the objects array
//         spawnData = [];
//         caughtTargets = [];
//         playerClicks = [];
//         playerLocation = [];

//         if (currentRound <= Object.keys(settings).length) {
//             console.log("Starting next round", currentRound);
            
//             objects = []; // Reset the objects array
//             player.x, player.y = canvas.width/2 - playerSize/2; // Reset the player position
//             startGame(currentRound); // Start the next round
//         } else {
//             // Game complete, show results or restart
//             console.log("Game complete");
//         }
//     }
    
//     // Hide the sliders and robot image
//     document.getElementById('sliderContainer').style.display = 'none';
//     document.getElementById('robotContainer').style.display = 'none';

// }

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    elapsedTime = Date.now() - gameStartTime;

    frameCount++;

    // console.log('Running game loop at frame count', frameCount);
    // console.log('Time since running:', now - gameStartTime);
    
    // Calculate time since last update
    var deltaTime = timestamp - lastUpdateTime;
    // Check if it's time for the next update
    if (deltaTime >= updateInterval) {
        lastUpdateTime = timestamp - (deltaTime % updateInterval);
        updateObjects(settings); // Update game logic
        // console.log("Game Loop Settings:", settings);
    }
    render(); 
    requestAnimationFrame(gameLoop); // Schedule the next frame
}
var lastUpdateTime = 0;

// Render function
function render() {
    // console.log('Rendering frame');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawMask(ctx, player);
    drawGrid();                                      // Draw grid
    ctx.save();
    // ctx.translate(-canvas.width / 2 + player.x, -canvas.height / 2 + player.y);
    drawWorldBoundary();    // Draw boundaries
    drawPlayer();
    drawArrowDirection();   // Draw arrow direction
    drawTargetLocation();   // Draw target location
    // drawCursor(mouseX, mouseY); // Draw cursor
    drawObjects();          // Draw objects
    ctx.restore();
    drawScore();            // Draw score
}

// Update game objects
function updateObjects(settings) {
    if (isPaused){
        console.log("Game is paused");
        return;
    } 
    if (frameCountGame == 0) {
        console.log("Starting Game");
        runGameSequence("This is the main experiment: Round 1 of 6. Click to Begin.");
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

            console.log("Player Speed", player.velocity);

            playerLocation.push({time: frameCount, x: player.x, y: player.y});
        }
    }

    // Prevent player from moving off-screen
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));

    // MS: and inserted the following code
    if (frameCountGame % settings.spawnInterval === 0) {
        spawnObject(settings);    
    }

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
                console.log("Object is outside observable area");
                obj.active = false; // Set the object to inactive
                objects.splice(index, 1); // Remove the object from the array
                //spawnObject(settings); // Spawn a new object
            }
            
            if (!obj.intercepted && checkCollision(player, obj)) { // MS2: added a condition
                // Collision detected
                //obj.active = false; // MS2: commented out this line
                //objects.splice(index, 1); // MS2: commented out this line
                obj.intercepted = true; // MS2: added this flag
                score += obj.value;
                
                console.log("Collision detected!");
                caughtTargets.push(obj);
            }
        }
        
        //spawnObject(settings); // MS: I don't understand why this function was called within this loop over targets; this be called outside of this loop???

        // Add to missed array iff : 1) Not Active, 2) Not Tagged, 3) Correct Target Shape.
        if (!obj.active && obj.objType === 'target') {
            // Log missed triangle
            missedTargets.push({ x: obj.x, y: obj.y, time:frameCount});

            // Calls a function cascade to display a message "Target Missed!"
            targetMissed();
        }
    });
}

function spawnObject(settings){

    let numObjectsTotal = objects.length; // MS2: count total number of objects (intercepted objects also count)
    
    let randomThreshold = randomGenerator();
    if (randomThreshold < settings.spawnProbability && numObjectsTotal < settings.maxTargets) { // MS2: added this condition
        console.log("Spawn Threshold Met");
        let newObject = createComposite(settings);
        
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
        console.log("New Object Spawned", newObject);
        spawnData.push(newObject)

    }
    location.lastSpawnTime = elapsedTime;
}

function createComposite(settings) {
    if (!settings) {
        console.error("Settings not provided to createComposite");
        return; // Or set default values for settings
    }
    let shapeType = 'circle';

    const shapeSize = 15;
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
     //let speedSample = Math.random() * speedRange + settings.speedLow;
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
        outerColor: 'blue',
        innerColor: 'orange',
        shape: shapeType, // Add shape type here
        type: 'target',
        //angle: shapeRotation,
        fill: fillRadius,
        value: Math.floor(fillRadius),
        active: true,
        intercepted: false, // MS2: Added this flag
        spawnX: 0,
        spawnY: 0
    };
    // console.log(newObj.speed);

    return newObj;
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
    console.log(`Initial Velocity for object: vx = ${obj.vx}, vy = ${obj.vy}`);
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

    if (circleDistanceX <= (player.width / 2)) { return true; } 
    if (circleDistanceY <= (player.height / 2)) { return true; }

    // Check corner collision
    let cornerDistance_sq = (circleDistanceX - player.width / 2) ** 2 + (circleDistanceY - player.height / 2) ** 2;

    return (cornerDistance_sq <= ((obj.size / 2) ** 2));
}

// Helper function to clamp a value between a minimum and maximum value
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
}

// Function to draw objects
// Function to draw objects
function drawObjects() {
    objects.forEach(obj => {
        if (obj.active) {
            if (!obj.intercepted) drawCompositeShape(obj); // MS2: added this condition
            // if (obj.intercepted) drawCompositeShapeDEBUG(obj); // MS2: added this; can be removed once code is tested
            // //drawDebugBounds(obj);
        }
    });
}

// MS2: added this function just for debugging; it continues to draw the targets even when intercepted
function drawCompositeShapeDEBUG(obj) {
    // Draw the outer circle first
    drawCircle(obj.x, obj.y, obj.size, 'LightGrey' ); // Outer circle

    // Then draw the inner circle on top
    drawCircle(obj.x, obj.y, obj.fill, 'gray' ); // Inner circle, smaller radius
}

function drawCompositeShape(obj) {
    // Draw the outer circle first
    drawCircle(obj.x, obj.y, obj.size, obj.outerColor); // Outer circle

    // Then draw the inner circle on top
    drawCircle(obj.x, obj.y, obj.fill, obj.innerColor); // Inner circle, smaller radius
}

function drawCircle(centerX, centerY, radius, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
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

// *********************************EVENT LISTENERS********************************* //

$(document).ready( function(){
   // Event listener for player click locations
   canvas.addEventListener('click', function(event) {
    // Get the position of the click relative to the canvas
    // Check not first click so that initializing game doesn't leed to player movement
        //if (clickCount >= 1) {
            const rect   = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            player.targetX = clickX;
            player.targetY = clickY;

            // Calculate the angle from the player to the click position
            const deltaX = clickX - (player.x + player.width / 2);
            const deltaY = clickY - (player.y + player.height / 2);
            player.angle = Math.atan2(deltaY, deltaX);
            player.moving = true;

            playerClicks.push({time: frameCount, targetX: clickX, targetY: clickY, curX: player.x, curY: player.y, angle:player.angle});
        //}
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
    ctx.fillText('Start Game', canvas.width / 2, canvas.height / 2);
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