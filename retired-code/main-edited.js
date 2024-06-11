//**************************FIREBASE FUNCTIONALITY****************************//
// /// Importing functions and variables from the Firebase Psych library
import { 
    writeRealtimeDatabase,writeURLParameters,readRealtimeDatabase,
    blockRandomization,finalizeBlockRandomization,firebaseUserId 
} from "./firebasepsych1.0.js";

// console.log("Firebase UserId=" + firebaseUserId);

const studyId = 'gameTest1';

// // Example: storing a numeric value
// // The result of this is stored on the path: "[studyId]/participantData/[firebaseUserId]/trialData/trial1/ResponseTime"


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
  
  // Initialize with a seed
  const randomGenerator = lcg(12345);

//let randomValue1 = randomGenerator();

//**************************GAME INITIALIZATION*******************************//

// World Building Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreCanvas = document.getElementById('scoreCanvas');
const scoreCtx = scoreCanvas.getContext('2d');
const world = { width: 800, height: 800 };
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let observableRadius = 390; // Radius for positioning objects

let numDecimals = 5;

let settings = {};

function getDifficultySettingsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let settings = {
        AIMode: parseInt(urlParams.get('maxTargets'), 10) || 1, // MS4: 0=no assistance; 1=always on; 2=adaptive
        planNumFramesAhead: parseInt(urlParams.get('maxTargets'), 10) || 5, // MS4: plan solution for display a certain number of frames ahead (to allow human response time) 
        AIDisplayMode: parseInt(urlParams.get('maxTargets'), 10) || 1, // MS4: 0=show movement path; 1=show where to click; 2=show which targets to intercept 
        AIMaxDisplayLength: parseInt(urlParams.get('maxTargets'), 10) || 3, // MS4: can be used to truncate the AI path length shown
        visualizeAIPlayer: parseInt(urlParams.get('maxTargets'), 10) || 0, // MS5: 0:default; 1=visualize AI player running in background
        maxTargets: parseInt(urlParams.get('maxTargets'), 10) || 4, // MS2: added this parameter to limit total number of targets
        spawnProbability: parseFloat(urlParams.get('spawnProbability')) || 1.0,
        spawnInterval: parseInt(urlParams.get('spawnInterval'), 10) || 20,
        valueSkew: parseFloat(urlParams.get('valueSkew')) || 1,
        valueLow: parseFloat(urlParams.get('valueLow')) ||0,
        valueHigh: parseFloat(urlParams.get('valueHigh')) || 1,
        playerSpeed: parseFloat(urlParams.get('playerSpeed')) || 1.5,
        speedLow: parseFloat(urlParams.get('speedLow')) || 0.75, // lowest end of object speed distribution
        speedHigh: parseFloat(urlParams.get('speedHigh')) || 2.5 // highest end of object speed distribution
    };
    return settings;
}

// let engageInstructions = false;

// Timing variables
let gameInterval, gameStartTime, elapsedTime;
const gameTime = 120000; // Two minutes in milliseconds
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
    x: canvas.width/2 - playerSize/2, //center the x,y in the center of the player.
    y: canvas.height/2 - playerSize/2,
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


// MS4: ******************************* AI PLANNER ********************************
//testCase();
let sol; // MS4: global variable that contains planned path for current frame

// MS5
const AIplayerSize = 50;
const AIplayer = {
    color:'rgba(255, 0, 0, 0.5)', 
    x: canvas.width/2 - playerSize/2, //center the x,y in the center of the player.
    y: canvas.height/2 - playerSize/2,
    moving:false,
    targetX:0,
    targetY:0,
    velocity: 1.5,
    angle:0,
    speed: 1.5, 
    width:50, 
    height:50,
};
let AIcaughtTargets = [];
let AIplayerLocation = [];

// Initialization code for starting page
initializeStartingPage();
// Start Game function
function startGame(round) {
    currentRound = round || currentRound; // Start at the specified round, or the current round
    settings = getDifficultySettingsFromURL();
    // settings = difficultySettings[currentRound];

    // console.log("start game settings", settings);

    // Reset game canvas visibility
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'block';

    // Hide the graph canvas
    const graphCanvas = document.getElementById('missedTargetsGraph');
    graphCanvas.style.display = 'none';

    if (!isGameRunning) {
        setupCanvas();
        
        // MS: commented out the next line as we are changing the generative process
        //setSpawnLocations(settings);

        // MS: commented out next line as in the new code, spawnObject will be called at the first call for updateObjects
        //spawnObject(settings); // Initialize objects with difficulty settings
        gameStartTime = Date.now();
        //gameInterval = setInterval(() => endGame(true), gameTime); // Pass a flag if the game ends naturally
        isGameRunning = true;
        gameLoop();
        // console.log('Settings being passed into gameLoop', settings);
    }
}

// End Game function
function endGame(advanceRound = false) {
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

    let path1 = studyId + '/participantData/' + firebaseUserId + '/spawnData';
    let path2 = studyId + '/participantData/' + firebaseUserId + '/caughtTargets';
    let path3 = studyId + '/participantData/' + firebaseUserId + '/playerClicks';
    let path4 = studyId + '/participantData/' + firebaseUserId + '/playerLocation';

    let path5 = studyId + '/participantData/' + firebaseUserId + '/AIcaughtTargets'; // MS5

    // writeRealtimeDatabase(path1, spawnData);
    // writeRealtimeDatabase(path2, caughtTargets);
    // writeRealtimeDatabase(path3, playerClicks);
    // writeRealtimeDatabase(path4, playerLocation);
    // writeRealtimeDatabase(path4, AIcaughtTargets); // MS5

    if (advanceRound) {
        currentRound++;
        objects = []; // Reset the objects array
        spawnData = [];
        caughtTargets = [];
        playerClicks = [];
        playerLocation = [];

        AIplayerLocation = []; // MS5
        AIcaughtTargets = []; // MS5

        if (currentRound <= Object.keys(difficultySettings).length) {
            console.log("Starting next round", currentRound);
            
            objects = []; // Reset the objects array
            player.x, player.y = canvas.width/2 - playerSize/2; // Reset the player position
            AIplayer.x, AIplayer.y = canvas.width/2 - playerSize/2; // MS5: Reset the player position
            startGame(currentRound); // Start the next round
        } else {
            // Game complete, show results or restart
            console.log("Game complete");
        }
    }
    
    // Hide the sliders and robot image
    document.getElementById('sliderContainer').style.display = 'none';
    document.getElementById('robotContainer').style.display = 'none';

}

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    elapsedTime = Date.now() - gameStartTime;

    //if (elapsedTime >= gameTime) {
    //    endGame(true);
    //    return;
    //}
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
    if (settings.visualizeAIPlayer==1) { // MS5
        drawAIPlayer();
    }
    drawArrowDirection();   // Draw arrow direction
    drawAISolution(); // MS4: draw the path suggested by AI
    drawTargetLocation();   // Draw target location
    // drawCursor(mouseX, mouseY); // Draw cursor
    drawObjects();          // Draw objects
    
    ctx.restore();
    // drawScore();            // Draw score
}


// Update game objects
function updateObjects(settings) {

    frameCountGame++; // MS: increment scene update count
    //console.log( 'Scene update count: ' + frameCountGame);

    // console.log("Current Settings", settings)
    // console.log('Updating objects');

    // Update player position if it is moving
    player.velocity = settings.playerSpeed;
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
            playerLocation.push({time: frameCountGame, x: player.x, y: player.y}); // MS4: check if this line is correct in the new code?????
        }
    }
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x)); // Prevent player from moving off-screen
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    
    // MS5: Update AI player position if it is moving
    AIplayer.velocity = settings.playerSpeed;
    //if (AIplayer.moving) {
        const deltaX = AIplayer.targetX - AIplayer.x;
        const deltaY = AIplayer.targetY - AIplayer.y;
        const distanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distanceToTarget < AIplayer.velocity) {
            // AI Player has arrived at the target location
            AIplayer.x = AIplayer.targetX;
            AIplayer.y = AIplayer.targetY;
            AIplayer.moving = false;
        } else {
            // Move player towards the target
            AIplayer.angle = Math.atan2(deltaY, deltaX);
            AIplayer.x += AIplayer.velocity * Math.cos(AIplayer.angle);
            AIplayer.y += AIplayer.velocity * Math.sin(AIplayer.angle);
            AIplayer.moving = true;
            AIplayerLocation.push({time: frameCountGame, x: AIplayer.x, y: AIplayer.y});
        }
    //}
    //AIplayer.x = Math.max(AIplayer.width / 2, Math.min(canvas.width - player.width / 2, AIplayer.x)); // Prevent player from moving off-screen
    //AIplayer.y = Math.max(AIplayer.height / 2, Math.min(canvas.height - player.height / 2, AIplayer.y));


    if (frameCountGame % settings.spawnInterval === 0) {
        spawnObject(settings);    
    }

    if (frameCountGame % 1000 === 0) {
        console.log( 'test');    
    }
    
    let toRemove = []; // MS4: fixing the splice line that could introduce bugs
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
                //console.log("Object is outside observable area"); 
                obj.active = false; // Set the object to inactive
                toRemove.push( index ); // MS4: push this index to the list of removes
                //objects.splice(index, 1); // MS4: remove this line !!!!!!!!!!!!!!!!!!!!!!!
            }

            if (!obj.intercepted && checkCollision(player, obj)) { // MS2: added a condition
                // Collision detected
                //obj.active = false; // MS2: commented out this line
                //objects.splice(index, 1); // MS2: commented out this line
                obj.intercepted = true; // MS2: added this flag
                
                //console.log("Collision detected!");
                caughtTargets.push(obj);
            }

            if (!obj.AIintercepted && checkCollision(AIplayer, obj)) { // MS5: added a condition
                // Collision detected
                obj.AIintercepted = true; // MS2: added this flag             
                //console.log("AI Collision detected!");
                AIcaughtTargets.push(obj);
            }
        }

        
        // Add to missed array iff : 1) Not Active, 2) Not Tagged, 3) Correct Target Shape.
        if (!obj.active && obj.objType === 'target' && !obj.intercepted) { // MS2: added a condition
            // Log missed triangle
            missedTargets.push({ x: obj.x, y: obj.y, time:frameCount});

            // Calls a function cascade to display a message "Target Missed!"
            targetMissed();
        }

    });

    // MS4: Remove items starting from the end
    for (let i = toRemove.length - 1; i >= 0; i--) {
       objects.splice(toRemove[i], 1);
    }

    // MS4: Run AI planner
    if (settings.AIMode>0) {
        // MS5: Run planner for the AI player
        sol = runAIPlanner( objects, AIplayer , observableRadius , center, 0, 'AI' );
        AIplayer.targetX = sol.interceptLocations[0][0]; // Set target position for the AI player
        AIplayer.targetY = sol.interceptLocations[0][1]; 

        // MS4
        //console.time('functionExecutionTime');
        sol = runAIPlanner( objects, player , observableRadius , center, settings.planNumFramesAhead , 'human' ); 
        //console.timeEnd('functionExecutionTime');
        //console.log( 'Calculated AI path');   
    }
}


function myRound(value,decimals) {
    return +(Math.round(value+ "e+5")  + "e-5");
}

function spawnObject(settings){

    let numObjectsTotal = objects.length; // MS2: count total number of objects (intercepted objects also count)
    
    let randomThreshold = randomGenerator();
    if (randomThreshold < settings.spawnProbability && numObjectsTotal < settings.maxTargets) { // MS2: added this condition
        //console.log("Spawn Threshold Met");
        let newObject = createComposite(settings);
        
        // MS: Generate a random angle between 0 and 2π (0 and 360 degrees)
        let angle = randomGenerator() * 2 * Math.PI;
        
        // get x,y coordinates
        let curXLoc = center.x + observableRadius * Math.cos(angle); // - obj.width / 2;
        let curYLoc = center.y + observableRadius * Math.sin(angle); // - obj.height / 2;
        //curXLoc = myRound( curXLoc, numDecimals ); // MS3 modification
        //curYLoc = myRound( curYLoc, numDecimals ); // MS3 modification
        let location = {x:curXLoc, y:curYLoc, angle:angle, lastSpawnTime:0};

        // works good enough for now
        newObject.x = location.x ;
        newObject.y = location.y ;
        newObject.spawnX = location.x;
        newObject.spawnY = location.y;
        setVelocityTowardsObservableArea(newObject);

        // push to objects array in order to render and update
        objects.push(newObject);
        //console.log("New Object Spawned", newObject);
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
    //speedSample = myRound( speedSample , numDecimals); //MS3 modification

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
        //outerColor: 'LightGrey', // MS2: by changing the blue to lightgrey, we can simply tell subjects that larger objects get more points
        outerColor: 'blue', // MS2: by changing the blue to lightgrey, we can simply tell subjects that larger objects get more points
        innerColor: 'orange',        
        shape: shapeType, // Add shape type here
        type: 'target',
        //angle: shapeRotation,
        fill: fillRadius,
        active: true,
        intercepted: false, // MS2: Added this flag
        AIintercepted: false, // MS5: Added this flag
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
    //obj.vx = myRound( obj.vx, numDecimals); // MS3
    //obj.vy = myRound( obj.vy, numDecimals); // MS3

    //console.log(`Initial Velocity for object: vx = ${obj.vx}, vy = ${obj.vy}`);
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

    ctx.font = '20px Arial'; // MS4: Font size and style for the text
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

// MS5
function drawAIPlayer() {
    let topLeftX = AIplayer.x - AIplayer.width / 2;
    let topLeftY = AIplayer.y - AIplayer.height / 2;

    ctx.fillStyle = AIplayer.color;
    //ctx.strokeStyle = player.color;
    ctx.fillRect(topLeftX, topLeftY, player.width, player.height);
}

// Function to draw objects
function drawObjects() {
    objects.forEach(obj => {
        if (obj.active) {
            if (!obj.intercepted) drawCompositeShape(obj); // MS2: added this condition
            if ((obj.AIintercepted) && (settings.visualizeAIPlayer==1)) drawCompositeShapeAI(obj); // MS5: added this; can be removed once code is tested
            //drawDebugBounds(obj);
        }
    });
}

// MS5: added this function just for debugging; it shows when AI player has intercepted target
function drawCompositeShapeAI(obj) {
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
    if (player.moving == true) { // MS4: don't think we need to show direction when player has stopped
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

// MS4: draw the path suggested by AI planner
function drawAISolution() {
    if ((settings.AIMode>0) && (sol != null)) {
        // get the length of the suggested path
        let pathLength = Math.min( sol.interceptLocations.length, settings.AIMaxDisplayLength );
        if (pathLength > 0) {
            if (settings.AIDisplayMode==0) {
                // Show where to move with lines
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency 
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(player.x, player.y );
                for (let i=0; i<pathLength; i++) {
                    let transp = (i+1)/3;
                    ctx.strokeStyle = 'rgba(255, 255, 0, ' + transp + ')'; // Adjust the last number for transparency
                    let toX = sol.interceptLocations[i][0];
                    let toY = sol.interceptLocations[i][1];
                    ctx.lineTo( toX, toY );
                }
                ctx.stroke();
                ctx.restore();
            }

            if (settings.AIDisplayMode==1) {
                // Show a cross on where to click next 
                ctx.save();
                ctx.fillStyle = 'yellow'; // Color of the text
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency
                ctx.lineWidth = 5;
                ctx.beginPath();

                ctx.moveTo(player.x, player.y );

                let i = 0;
                //for (let i=0; i<pathLength; i++) {
                    let toX = sol.interceptLocations[i][0];
                    let toY = sol.interceptLocations[i][1];
                    ctx.lineTo( toX, toY ); 
                    ctx.moveTo(toX - 10, toY - 10);
                    ctx.lineTo(toX + 10, toY + 10);
                    ctx.moveTo(toX + 10, toY - 10);
                    ctx.lineTo(toX - 10, toY + 10); 

                    // Draw text
                    // Adjust the text position as needed. Here it's slightly offset from the cross.
                    //ctx.fillText(i+1, toX + 15, toY + 15); 
                //}
                ctx.stroke();
                ctx.restore();
            }
            
            if (settings.AIDisplayMode==2) {
                // Highlight the target interception sequence 
                ctx.save();
                ctx.fillStyle = 'black'; // Color of the text
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency
                ctx.lineWidth = 5;
                ctx.beginPath();

                let i = 0;
                for (let i=0; i<pathLength; i++) {
                    let indexNow = sol.originalIndex[i];
                    if (indexNow != -1) {
                        let toX = objects[indexNow].x;
                        let toY = objects[indexNow].y;                      
                        // Draw text
                        //ctx.fillText(i+1, toX + 25, toY + 25); 

                        // Draw an arrow to the first one
                        if (i==0) {
                            drawFilledArrow(ctx, toX - 25 , toY, 10); 
                        }
                    }
                    
                }
                ctx.stroke();
                ctx.restore();
            }
        }
        
    }
}

// MS4: draw arrow
function drawFilledArrow(ctx, toX, toY, arrowWidth) {
    const arrowLength = arrowWidth * 4; // Adjust the length of the arrow as needed
    const headLength = arrowWidth * 0.6; // Length of the head of the arrow
    const headWidth = arrowWidth * 1.4; // Width of the head of the arrow

    // Starting points for the arrow (adjust as necessary)
    const fromX = toX - arrowLength;
    const fromY = toY;

    // Set the fill color
    //ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    //ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency
    ctx.fillStyle = 'yellow';
    //ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency


    // Begin a new path for the arrow
    ctx.beginPath();

    // Draw the arrow body as a rectangle
    ctx.rect(fromX, fromY - arrowWidth / 2, arrowLength - headLength, arrowWidth);

    // Draw the arrow head as a triangle
    ctx.moveTo(toX - headLength, toY - headWidth / 2);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength, toY + headWidth / 2);

    // Close the path and fill the arrow with the set color
    ctx.closePath();
    ctx.fill();
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
// *********************************EVENT LISTENERS********************************* //



// Move from start page to game
// Event listener for cursor size adjustment
// document.getElementById('cursorSize').addEventListener('input', handleCursorSizeChange);
// document.getElementById('targetProbability').addEventListener('input', handleTargetProbChange);
// document.getElementById('numObjects').addEventListener('input', handleNumObjectsChange);

// document.getElementById('toggleAIAssistance').addEventListener('click', toggleAIAssistance);
// document.getElementById('aiAssistRobot').addEventListener('click', toggleAIAssistance);



// Event listener for starting the game by clicking on the canvas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate the position and size of the "Start Game" text
    const textMetrics = ctx.measureText('Start Game');
    const textWidth = textMetrics.width;
    const textHeight = 30; // Estimate the height or calculate it if needed
    const textX = canvas.width / 2 - textWidth / 2;
    const textY = canvas.height / 2 - textHeight / 2;

    // Check if the click was within the bounds of the "Start Game" text
    if (x > textX && x < textX + textWidth && y > textY && y < textY + textHeight) {
        startGame();
        canvas.removeEventListener('click', startGame); // Remove the event listener after starting the game
    }
});


// Event listener for player click locations
canvas.addEventListener('click', function(event) {
    // Get the position of the click relative to the canvas
    const rect = canvas.getBoundingClientRect();
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
});

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