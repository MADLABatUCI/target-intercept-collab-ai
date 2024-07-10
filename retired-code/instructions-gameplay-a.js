/*
game.js

    Author      :   Sheer Karny, Mark Steyvers
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)


Game Page JS file (metadata and functionality).

This file should contain all variables and functions needed for
the game.
*/

$("#full-game-container").attr("hidden", false);
$("#survey-workload-container").attr("hidden", true);
$("#survey-full-container").attr("hidden", true);
$("#complete-page-content-container").attr("hidden", true);

// //****************************************** FIREBASE FUNCTIONALITY **********************************************//

// Importing functions and variables from the FirebasePsych library
import { writeRealtimeDatabase,writeURLParameters,readRealtimeDatabase,
    blockRandomization,finalizeBlockRandomization,
    initializeRealtimeDatabase,initializeSecondRealtimeDatabase } from "./firebasepsych1.1.js";

// Define the configuration file for first database

const firebaseConfig_db1 = {
    apiKey: "AIzaSyAZKFzh1o0fytvilXTs3sJu_AfvFfAZDGk",
    authDomain: "uci-hri-exp2.firebaseapp.com",
    databaseURL: "https://uci-hri-exp2-default-rtdb.firebaseio.com",
    projectId: "uci-hri-exp2",
    storageBucket: "uci-hri-exp2.appspot.com",
    messagingSenderId: "1074930278032",
    appId: "1:1074930278032:web:34a303f487af2cd82f4215"
  };

// Get the reference to the two databases using the configuration files
const [ db1 , firebaseUserId1 ] = await initializeRealtimeDatabase( firebaseConfig_db1 );
// const [ db2 , firebaseUserId2 ] = await initializeSecondRealtimeDatabase( firebaseConfig_db2 );

// console.log("Firebase UserId=" + firebaseUserId);

function getDebugParams(){
    const urlParams = new URLSearchParams(window.location.search);
    let debugBoolean = Boolean(urlParams.get('debug'));
    // console.log(debugBoolean);
    return debugBoolean;
}

var DEBUG  = getDebugParams();   // Always start coding in DEBUG mode
var STATICOBJDEBUG = false; // Set to true to use static object locations for debugging

let studyId = 'placeHolder';

if (DEBUG){
   studyId    = "uci-hri-experiment-drt2-debug";
} else {
    studyId   = "uci-hri-experiment-drt2";
}

// WRITE PROLIFIC PARTICIPANT DATA TO DB1
let pathnow = studyId + '/participantData/' + firebaseUserId1 + '/participantInfo';
writeURLParameters(db1, pathnow);

// database write function
function writeGameDatabase(){
    // Connecting to the sister database
    // let pathUID1 = studyId + '/participantData/' + firebaseUserId2 + '/keyUID';
    // let pathUID2 = studyId + '/participantData/' + firebaseUserId1 + '/keyUID';
    // writeRealtimeDatabase(db2, pathUID1, firebaseUserId1);
    // writeRealtimeDatabase(db1, pathUID2, firebaseUserId2);

    if (DEBUG) console.log("Writing to database from block", currentBlock, "round", currentRound);

    // console.log("Writing to database");
    let path1   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/spawnData';
    let path2   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/caughtTargets';
    let path3   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/eventStream'; 
    let path4   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/playerClicks';
    let path5   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/playerLocation';
    let path6   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/settings';
    let path7   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/roundTime';
    let path8   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/AIcaughtTargets';
    let path9   = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/AIClicks';
    let path10  = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/aiScore';
    let path11  = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/playerScore';
    let path12  = studyId + '/participantData/' + firebaseUserId1 + '/condition' + '/blockCondition';
    let path13  = studyId + '/participantData/' + firebaseUserId1 + '/condition' + '/seedCondition';
    let path14  = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/AIClicks_Adjusted';
    let path15  = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/DRTresponses';
    let path16  = studyId + '/participantData/' + firebaseUserId1 + '/block' + currentBlock + '/round' + currentRound + '/DRTfalseAlarm';

    writeRealtimeDatabase(db1, path1, spawnData);
    writeRealtimeDatabase(db1, path2, caughtTargets);
    writeRealtimeDatabase(db1, path3, eventStream); 
    writeRealtimeDatabase(db1, path4, playerClicks);
    writeRealtimeDatabase(db1, path5, playerLocation);
    writeRealtimeDatabase(db1, path6, roundSettings);
    writeRealtimeDatabase(db1, path7, roundTime);
    writeRealtimeDatabase(db1, path8, AIcaughtTargets);
    writeRealtimeDatabase(db1, path9, aiClicks);
    writeRealtimeDatabase(db1, path10, aiScore);
    writeRealtimeDatabase(db1, path11, score);
    writeRealtimeDatabase(db1, path12, currentCondition);
    writeRealtimeDatabase(db1, path13, curSeeds);
    writeRealtimeDatabase(db1, path14, aiClicks_adjusted);
    writeRealtimeDatabase(db1, path15, drtResponses);
    writeRealtimeDatabase(db1, path16, drtFalseAlarm);
}

//************************************************ ENVIRONMENT INITIALIZATION ********************************************//
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreCanvas = document.getElementById('scoreCanvas');
const scoreCtx = scoreCanvas.getContext('2d');
const world = { width: 800, height: 800 };
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let observableRadius = 390; // Radius for positioning objects

let roundSettings = {};

// *********************************************** EXPERIMENTAL PARAMETERS ***********************************************// 

// NOTE: AI MODE FOR EXPERIMENT 1 SHOULD BE === 0 (NO ASSISTANCE)
// NOTE: Start with default parameters --> make changes that are critical between rounds (to remove duplication)

// change game to complete based on 2 minutes of frame counts at 60 fps

function getDifficultySettingsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let settings = {
        AIMode: parseInt(urlParams.get('maxTargets'), 10) || 1,                             // MS4: 0=no assistance; 1=always on; 2=adaptive
        AIDisplayMode: parseInt(urlParams.get('maxTargets'), 10) || 1,                      // MS4: 0=show movement path; 1=show where to click; 2=show which targets to intercept 
        AIMaxDisplayLength: parseInt(urlParams.get('maxTargets'), 10) || 3,                 // MS4: can be used to truncate the AI path length shown
        visualizeAIPlayer: parseInt(urlParams.get('maxTargets'), 10) || 0,                  // MS5: 0:default; 1=visualize AI player running in background
        AIStabilityThreshold: parseFloat(urlParams.get('AIStabilityThreshold')) || 1.2,     // MS7: minimum proportional improvement before recommendation changes 
        alpha: parseFloat(urlParams.get('alpha')) || 0.9,                                   // MS8: discounting parameter for AI planner
        AIadviceThresholdHigh: parseFloat(urlParams.get('AIadviceThresholdHigh')) || 0.7,   // MS6: threshold on value to give AI advice in adaptive AI setting
        AIadviceAngleThreshold: parseFloat(urlParams.get('AIadviceThresholdHigh')) || 20,   // MS6: angle tolerance for accepting move in adaptive AI setting
        AIthresholdnumframesaftercaughttarget: parseInt(urlParams.get('visualizeAIPlayer'), 10) || 30, // MS6: for adaptive AI, how many frames to wait with advice after player catches target 
        maxTargets: parseInt(urlParams.get('maxTargets'), 10) || 8,                         // MS2: added this parameter to limit total number of targets
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

let settings = {
    maxSeconds: 180,            // maximum number of seconds per round --> 3 minutes
    AIMode:1,                   // MS4: 0=no assistance; 1=always on; 2=adaptive
    alpha: 0.9,                 // MS8: discounting parameter for AI planner
    AIDisplayMode: 1,           // MS4: 0=show movement path; 1=show where to click; 2=show which targets to intercept
    AIMaxDisplayLength: 3,      // MS4: can be used to truncate the AI path length shown
    visualizeAIPlayer: 0,       // MS5: 0:default; 1=visualize AI player running in background
    AIStabilityThreshold: 1.2,  // MS7: minimum proportional improvement before recommendation changes
    AIadviceThresholdHigh: 0.7, // MS6: threshold on value to give AI advice in adaptive AI setting
    AIadviceAngleThreshold: 30, // MS6: angle tolerance for accepting move in adaptive AI setting
    AIframeDelay: 30,           // Delaying advice so that it doesn't overwhelm the player
    spawnProbability:  1.0,
    spawnInterval: 10,
    valueSkew: 1,
    valueLow: 0,
    valueHigh:  1,
    playerSpeed: 3,
    maxTargets: 2,
    speedLow:  1.5,             // lowest end of object speed distribution
    speedHigh: 2.99,               // highest end of object speed distribution
};

let difficultySettings = {
    // CONDITION 1
    1: {0: {1: {AIMode: 0,                  // MS4: 0=no assistance; 1=always on; 2=adaptive
                AIStabilityThreshold: 1.2,
                maxTargets: 5},  // MS7: minimum proportional improvement before recommendation changes,
            2: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 5}},
        1: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 10},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 10}},
        2: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 15},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 15}}},
    // CONDITION 2
    2: {0: {1: {AIMode: 0,                  // MS4: 0=no assistance; 1=always on; 2=adaptive
                AIStabilityThreshold: 1.2, 
                maxTargets: 5},
            2: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 5}},
        1: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 15},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 15}},
        2: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 10},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 10}}},
    3: {0: {1: {AIMode: 0,                  // MS4: 0=no assistance; 1=always on; 2=adaptive
                AIStabilityThreshold: 1.2, 
                maxTargets: 10},
            2: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 10}},
        1: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 5},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 5}},
        2: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 15},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 15}}},
    4: {0: {1: {AIMode: 0,                  // MS4: 0=no assistance; 1=always on; 2=adaptive
                AIStabilityThreshold: 1.2, 
                maxTargets: 10},
            2: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 10}},
        1: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 15},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 15}},
        2: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 5},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 5}}},
    5: {0: {1: {AIMode: 0,                  // MS4: 0=no assistance; 1=always on; 2=adaptive
                AIStabilityThreshold: 1.2, 
                maxTargets: 15},
            2: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 15}},
        1: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 5},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 5}},
        2: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 10},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 10}}},
    6: {0: {1: {AIMode: 0,                  // MS4: 0=no assistance; 1=always on; 2=adaptive
                AIStabilityThreshold: 1.2, 
                maxTargets: 15},
            2: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 15}},
        1: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 10},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 10}},
        2: {1: {AIMode: 0, 
                AIStabilityThreshold: 1.2,
                maxTargets: 5},
            2: {AIMode: 0,
                AIStabilityThreshold: 1.2,
                maxTargets: 5}}},
};

function getPermutations(array) {
    // Base case: if array is empty, there is only one permutation: an empty array
    if (array.length === 0) return [[]];

    let permutations = [];

    for (let i = 0; i < array.length; i++) {
        let rest = array.slice(0, i).concat(array.slice(i + 1));
        let restPermutations = getPermutations(rest);

        for (let perm of restPermutations) {
            permutations.push([array[i]].concat(perm));
        }
    }

    return permutations;
}

const seedSet = [12, 123, 1234, 12345];
const maxTargetSet = [5, 10, 15];
// const perumutedTargets = getPermutations(maxTargetSet);
// console.log(perumutedTargets);

// Block randomization variables -- placed here for ordering dependency
let currentRound = 1;
let currentBlock = 0;
let currentCondition = null;
let curSeeds = null;   
let noAssignment = true;

let maxRounds = 2;
let roundID = "round + " + currentRound;

// Timing variables
let gameStartTime, elapsedTime;
let isPaused            = false; // flag for pausing the game
let isGameRunning       = false;
let frameCountGame      = 0; // MS: number of updates of the scene
let deltaFrameCount     = 0; // To limit the size of the Event Stream object; 
const fps               = 30; // Desired logic updates per second
let drtCount            = 0; // frame count for the DRT task for displaying the light


let maxFrames = null;
if (DEBUG){
    maxFrames         = 60 * fps;// settings.maxSeconds * fps;
} else{ // set it to whatever you want
    maxFrames         = settings.maxSeconds * fps; //120 * 60; // Two minutes in frames
}

const updateInterval    = 1000 / fps; // How many milliseconds per logic update
let firstRender         = 0;
let roundTime           = 0;

// Data collection variables
let objects         = [];
let spawnData       = [];
let caughtTargets   = [];
let missedTargets   = [];
let playerClicks    = [];
let playerLocation  = [];
let aiClicks        = [];
let aiClicks_adjusted       = [];

let drtResponses    = [];
let drtFalseAlarm   = [];
let drtOnset        = [];
let drtInitFrame    = 0;
let drtMissHigh     = 2.5 * fps; // 2.5 seconds in frames
let drtMissLow      = 0.1 * fps; // 0.1 seconds in frames
let responseTime    = 0;
let randDRTinterval; // init a random interval for DRT probes --> check startGame for init
let DRTmessageinterval = 5 * fps; // 5 seconds in frames
let responded       = false;
let falseAlarmFlag  = false;
let missFlag        = false;   
let drtMissCount    = 0;
let counter = 0;

const eventStreamSize = 720; // 2 minutes of 60 fps updates
let eventStream = Array.from({ length: eventStreamSize }, () => ({}));// preallocate the array

// Variables for cursor
let cursorSize = 40;
let mouseX = 0, mouseY = 0;

// Varaiables for HTML elements
let score = 0;
let aiScore = 0;
let numAIChanges = 0; // MS7 count of number of different targets pursued (measure of "neuroticism" or inverse "inertia")

// Player and View Initialization (related to one another)
const playerSize = 50;
const player = {
    // color:"red", 
    color: 'red',//'rgba(0, 0, 255, 0.5)',
    x: canvas.width/2 , //center the x,y in the center of the player.
    y: canvas.height/2 ,
    moving:false,
    toCenter:false,
    shownAdvice:false, //MS6: flag to show advice
    targetX:canvas.width/2,
    targetY:canvas.height/2,
    velocity: 1.5,
    angle:0,
    speed: 1.5, 
    width:50, 
    height:50,
    score:0
};

const camera = {
    x: world.width / 2,
    y: world.height / 2,
    width: canvas.width,
    height: canvas.height
};

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

function generateRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let randomGenerator;
// MS4: ********************************************** AI PLANNER ****************************************************//

//let sol; // MS7
let firstStep, bestSol, allSol; // MS7  Global variable that holds the solutions of the planner 
let firstStepOffline, bestSolOffline, allSolOffline; // MS7  Global variable that holds the solutions of the planner 

// let sol; // MS4: global variable that contains planned path for current frame

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
    score:0
};
let AIcaughtTargets = [];
let AIplayerLocation = [];
let numFramesPlayernotMoving = 0; // MS6
let numFramesAfterCaughtTarget = 0; // MS6

//**************************************************** BLOCK RANDOMIZATION ******************************************************//

async function initExperimentSettings() {
    const maxCompletionTimeMinutes = 60;

    // Assign random condition (AI Adapt or AI Naive)
    // assignedCondition === 0 means that participant is in the AI Naive condition
    const aiBlockCondition = 'aiCondition'; // a string we use to represent the condition name
    let numConditions = 6; // number of conditions
    let numDraws = 1; // number of draws
    let assignedCondition = await blockRandomization(db1, studyId, aiBlockCondition, numConditions, maxCompletionTimeMinutes, numDraws);

    // random seeds should be randomly grabbed outside of permutation (generate four totally random integer values between 1 and 1000000)

    // const seedCondition = 'seedCondition'; // a string we use to represent the condition name   
    // numConditions = 24; // number of conditions
    // numDraws = 1; // number of draws
    // let assignedSeed = await blockRandomization(db1, studyId, seedCondition, numConditions, maxCompletionTimeMinutes, numDraws);

    var randomValues = [];
    for (var i = 0; i < 6; i++) {
        randomValues.push(generateRandomInt(1, 1000000));
    }

    noAssignment = false;

    currentCondition = assignedCondition[0]+1;
    curSeeds = randomValues;
    // if(DEBUG){
    //     console.log("seed condition num:", assignedSeed);
    // }
}

if (noAssignment){

    // await the asynchroneous function to complete and retrieve the curret
    if (DEBUG){ // adjust value as needed for debuggin default is the same as the main experiment
        await initExperimentSettings();
        curSeeds = [12,123,12345,123456];
        currentCondition = 1;
        console.log('assignedCondition:', currentCondition); // Add this line
        console.log('assignedSeed:', curSeeds); // Add this line
    } else {
        await initExperimentSettings();
        // console.log('assignedCondition:', currentCondition); // Add this line
        // console.log('assignedSeed:', curSeeds); // Add this line
    }
    startGame(currentRound, currentCondition, currentBlock, curSeeds); // Start the next round
    noAssignment = false;
}

let visitedBlocks = 0;
let numSurveyCompleted = 0;

// ****************************************************** UPDATE FUNCTIONS ********************************************************//

// Start Game function
async function startGame(round, condition, block, seeds) {
    currentRound = round; // Start at the specified round, or the current round

    let blockSetting = difficultySettings[condition][block];
    roundSettings = blockSetting[currentRound];

    // reassign default settings to the values grabbed from the current
    settings.AIMode = roundSettings.AIMode;
    settings.AIStabilityThreshold = roundSettings.AIStabilityThreshold;
    settings.maxTargets = roundSettings.maxTargets;
   
    if (currentBlock == 0) {
        settings.randSeed = seeds[currentRound - 1];
    } else if (currentBlock == 1) {
        settings.randSeed = seeds[currentRound + 1];
    } else if (currentBlock == 2){
        settings.randSeed = seeds[currentRound + 3]
       
    }

    if (DEBUG){
        //console.log("Default Settings AI Mode", settings.AIMode);
        console.log("Current AI Mode", roundSettings.AIMode);
        console.log("Current Settings", roundSettings);
        console.log("Current Block", currentBlock);
        console.log("Current Round", currentRound);
        console.log("Current Max Targets", settings.maxTargets);
        console.log("Current Seeds: ", settings.randSeed);
    }
    // Initialize with a seed
    randomGenerator = lcg(settings.randSeed);
    randDRTinterval = Math.floor(randomGenerator() * 3 + 3) * fps; // random interval between 3 and 5 seconds
    isLightOn = false;

    // Reset game canvas visibility
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.style.display = 'block';
    const scoreCanvas = document.getElementById('scoreCanvas');
    scoreCanvas.style.display = 'block';

    if (!isGameRunning) {
        setupCanvas();
        gameStartTime   = Date.now();
        frameCountGame  = 0;
        isGameRunning   = true;
        gameLoop();
    }
}

// End Game function
async function endGame() {
    isGameRunning = false;

    writeGameDatabase();

    if (currentRound < maxRounds && numSurveyCompleted < 3) {
        currentRound++;
        await runGameSequence("You've Completed a Round and earned " + score + " points. Click OK to continue.");
        await resetGame();
        startGame(currentRound, currentCondition, currentBlock, curSeeds); // Start the next round
    } else if (currentRound >= maxRounds && numSurveyCompleted < 3) {

        // All rounds in the current block are completed
        blockInfo.completedBlock++;
        blockInfo.completedBlockOrder.push(currentBlock);
        console.log("Visited Blocks", visitedBlocks);
        currentRound = 1; // Reset the round counter
        currentBlock += 1; // Move to next block
       
        await runGameSequence("You've Completed a Block and earned " + score + " points. Click OK to continue.");
        await resetGame();

        if (settings.AIMode == 0) {
            loadWorkLoadSurvey(); // no ai gets workload-only survey
            $("#survey-workload-container").attr("hidden", false); // survey handles end-of-experiment logic
            $("#full-game-container").attr("hidden", true); 
            visitedBlocks++;

        } else if (settings.AIMode == 1) {
            loadFullSurvey();
            $("#survey-full-container").attr("hidden", false);
            $("#full-game-container").attr("hidden", true);
            visitedBlocks++;
        }
    
        if (visitedBlocks <= 2) {
            startGame(currentRound, currentCondition,currentBlock,curSeeds); // Start the next round
        }
    }
}

async function resetGame(){
    objects                 = null;
    spawnData               = null;
    caughtTargets           = null;
    playerClicks            = null;
    playerLocation          = null;
    score                   = null;
    aiScore                 = null;
    player.score            = null;
    AIplayer.score          = null
    AIcaughtTargets         = null;
    AIplayerLocation        = null;
    aiClicks_adjusted       = null;
    drtOnset                = null;
    drtResponses            = null;
    drtFalseAlarm           = null;

    // then reassign the variables
    eventStream             = Array.from({ length: eventStreamSize }, () => ({}));// preallocate the array
    objects                 = []; // Reset the objects array
    spawnData               = [];
    caughtTargets           = [];
    playerClicks            = [];
    playerLocation          = [];
    score                   = 0;    
    aiScore                 = 0;
    player.score            = 0;
    AIplayer.score          = 0
    aiClicks_adjusted       = [];
    drtOnset                = [];
    drtResponses            = [];
    drtFalseAlarm           = [];

    falseAlarmFlag          = false;
    missFlag                = false;
    counter = 0; // counter on the DRT mistakes
    drtCount = 0;

    AIcaughtTargets         = [];
    AIplayerLocation        = [];
    
    player.x        = canvas.width/2;
    player.y        = canvas.height/2;
    player.targetX  = canvas.width/2;
    player.targetY  = canvas.height/2;
    AIplayer.x, AIplayer.y = canvas.width/2 - playerSize/2; // MS5: Reset the player position
}

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    if (frameCountGame==0){
        firstRender = Date.now();
    }

    if (frameCountGame >= maxFrames) {
        endGame();
        // console.log("Game Over!", frameCountGame);
        return;
    }

    elapsedTime = Date.now() - gameStartTime;
    roundTime = Date.now() - firstRender;

    // console.log('Running game loop at frame count', frameCount);
    // console.log('Time since running:', now - gameStartTime);
    
    // Calculate time since last update
    var deltaTime = timestamp - lastUpdateTime;

    // Check if it's time for the next update
    if (deltaTime >= updateInterval) {
        lastUpdateTime = timestamp - (deltaTime % updateInterval);
        //console.log("Current Obj")
        updateObjects(settings);
         // Update game logic
        // console.log("Game Loop Settings:", settings);
    }
    render(); 

    // Schedule the next frame
    requestAnimationFrame(gameLoop); 
}

var lastUpdateTime = 0;
var isLightOn    = false;

// Render function
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    // drawDRTMask(ctx);   
    drawMask(ctx, player);
    drawCenterMarker();                               // Draw the center marker
    drawRing();                     
    // drawGrid();
    ctx.save();
    // drawCursor();
    drawWorldBoundary();                         
    drawPlayer();                                     
    if (settings.visualizeAIPlayer==1) drawAIPlayer();
    if (player.moving) drawArrowDirection();          // Draw arrow to show player direction
    displayAIstatus();                                // Display AI status -- ON or OFF
    drawAISolution();                                  // Draw AI solution of type specified in settings
    // drawFullAISolutionDEBUG();                     // Draw the full AI solution
    // drawTargetLocation();                             // Draw the X where the player is moving towards
    drawObjects();         
    
    ctx.restore();
    drawScore();                      
}


// Update game objects
function updateObjects(settings) {
    if (isPaused){
        // console.log("Game is paused");
        return;
    } 
    if (frameCountGame == 0) {
        // console.log("Starting Game");
        runGameSequence("This is Round " + currentRound + " of " + maxRounds + " of this Section. Click to Begin.");
    }
    if (deltaFrameCount == 10){
        deltaFrameCount = 0;
    }

    if (deltaFrameCount == 0){
        const index =  (frameCountGame)/10;
        if (index >= 0){
            let newEventObject      = {frame: frameCountGame, time: roundTime, player: {}, aiPlayer: {}, objects:{}, aiSuggestions: {}}; 
            // append current game condition given the frame
            // write player data
            let curPlayerdata       = {x: player.x, y: player.y, targetX: player.targetX, targetY: player.targetY, advice: player.shownAdvice};
            newEventObject.player   = JSON.parse(JSON.stringify(curPlayerdata));
            // write ai data
            // let curAIdata           = AIplayer;
            let curAIdata           = {x: AIplayer.x, y: AIplayer.y, targetX: AIplayer.targetX, targetY: AIplayer.targetY, id: AIplayer.ID};
            newEventObject.aiPlayer = JSON.parse(JSON.stringify(curAIdata));
            // write all objects on screen
            let curObjs             = objects.filter(obj => obj.active);
            // go into each object and only grab variable data
            newEventObject.objects  = JSON.parse(JSON.stringify(curObjs));
            // console.log("Event Stream Index", index)

            // MS7
            let curSuggestion       = firstStep; 
            if (firstStep != undefined){
                curSuggestion = JSON.parse(JSON.stringify(curSuggestion));
                newEventObject.aiSuggestions = curSuggestion;
                //console.log("AI Suggestion", curSuggestion);
            }

            eventStream[index]      = newEventObject;
        }
    }
    
    // Engage DRT after some pseudo-random interval between 3 & 5 seconds
    if (DEBUG) console.log("DRT Interval", randDRTinterval);
    
    if (drtCount == randDRTinterval){
        // turn on light
        isLightOn = true;
        drtInitFrame = frameCountGame;
        drtOnset.push(drtInitFrame);

        //reset the counter and random time
        randDRTinterval = Math.floor(randomGenerator() * 3 + 3) * fps;
        drtCount = 0;
    }

    // If the light has been on more than 2.5 seconds, then turn off the light and record an invalid trial.
    if (drtCount >= drtMissHigh && isLightOn){//(responseTime >=  drtMissHigh){
        let response = {frame: frameCountGame, responseTime: null, initFrame: drtInitFrame, valid: false};
        drtResponses.push(response);
        isLightOn = false;
        drtCount = 0;
        missFlag = true;
    }

    // Turn off the false alarm and/or miss flag after 90 frames --> triggers removal of warning caption
    if (counter >= 90 && falseAlarmFlag){
        falseAlarmFlag = false;
    } else if (counter >= 90 && missFlag){
        missFlag = false;
    }
    
    frameCountGame++;                           // MS: increment scene update count
    deltaFrameCount++;                          // Limit the amount of data pushes
    drtCount++;                                 // Increment the DRT interval counter   
    if (missFlag || falseAlarmFlag) counter++;  // Increment the counter for the warning caption
    
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
            numFramesPlayernotMoving = 0; // MS6
            player.angle = Math.atan2(deltaY, deltaX);
            player.x += player.velocity * Math.cos(player.angle);
            player.y += player.velocity * Math.sin(player.angle);

            // console.log("Player Speed", player.velocity);

            playerLocation.push({frame: frameCountGame, x: player.x, y: player.y});
        }
    } else {
        numFramesPlayernotMoving++; // MS6
    }

    // Prevent player from moving off-screen
    player.x                = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y                = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));

    // MS5: Update AI player position if it is moving
    AIplayer.velocity       = settings.playerSpeed;

    const deltaX            = AIplayer.targetX - AIplayer.x;
    const deltaY            = AIplayer.targetY - AIplayer.y;
    const distanceToTarget  = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distanceToTarget < AIplayer.velocity) {
        // AI Player has arrived at the target location
        AIplayer.x         = AIplayer.targetX;
        AIplayer.y         = AIplayer.targetY;
        AIplayer.moving    = false;
    } else {
        // Move player towards the target
        AIplayer.angle      = Math.atan2(deltaY, deltaX);
        AIplayer.x         += AIplayer.velocity * Math.cos(AIplayer.angle);
        AIplayer.y         += AIplayer.velocity * Math.sin(AIplayer.angle);
        AIplayer.moving     = true;
        AIplayerLocation.push({time: frameCountGame, x: AIplayer.x, y: AIplayer.y});
    }

    // MS: and inserted the following code
    if (frameCountGame % settings.spawnInterval === 0) {
        spawnObject(settings);    
    }

    let toRemove = [];
    let caughtAnything = false; // MS6
    objects.forEach((obj, index) => {
        if (obj.active) {
            obj.x += obj.vx * obj.speed; // Update x position
            obj.y += obj.vy * obj.speed; // Update y position
            // console.log("Object Location", obj.x, obj.y);

            // Check if the object is outside the observable area
            let dx                 = obj.x - center.x;
            let dy                 = obj.y - center.y;
            let distanceFromCenter = Math.sqrt(dx * dx + dy * dy) - 10;

            // if (distanceFromCenter > observableRadius) {
            //     // console.log("Object is outside observable area");
            //     obj.active = false; // Set the object to inactive
            //     toRemove.push( index );
            // }
            if (distanceFromCenter > observableRadius) {
                runGameSequence("Target missed! Remember to plan your movements.");
                understandingCheckFailed = true;
                failedCounter += 1;
                // console.log("Object is outside observable area");
                obj.active = false; // Set the object to inactive
                objects = [] // Remove the object from the array
                toRemove.push( index );
                spawnUnderstandingCheckObjects();
            }
            // Check for object collision with player
            if (!obj.intercepted && checkCollision(player, obj)) { // MS2: added a condition
                // Collision detected
                obj.intercepted   = true; // MS2: added this flag
                score            += obj.value;
                player.score     += obj.value;

                let caughtObj     = {frame: frameCountGame, target: obj}
                
                // console.log("Collision detected!");
                caughtTargets.push(caughtObj);
                caughtAnything   = true; //MS6
            }

            if (!obj.AIintercepted && checkCollision(AIplayer, obj)) { // MS5: added a condition
                // Collision detected
                obj.AIintercepted = true; // MS2: added this flag             
                //console.log("AI Collision detected!");
                let caughtObj     = {frame: frameCountGame, target: obj}   
                AIcaughtTargets.push(caughtObj);

                aiScore           += obj.value;
                AIplayer.score    += obj.value;
                // console.log("AI Score: ", aiScore);
                 // MS7
                // console.log("AI Score: " +  aiScore + " Average Score per frame " + ( aiScore / frameCountGame).toFixed(4) + 
                // "  Number of target changes: " + numAIChanges + "  Prob Change Target per Frame: " + (numAIChanges/frameCountGame).toFixed(6) );
            }
        }
        
        //spawnObject(settings); // MS: I don't understand why this function was called within this loop over targets; this be called outside of this loop???

        // Add to missed array iff : 1) Not Active, 2) Not Tagged, 3) Correct Target Shape.
        if (!obj.active && obj.objType === 'target') {
            // Log missed triangle
            missedTargets.push({ x: obj.x, y: obj.y, time:frameCountGame});

            // Calls a function cascade to display a message "Target Missed!"
            targetMissed();
        }
    });

    if (caughtAnything) numFramesAfterCaughtTarget=0; else numFramesAfterCaughtTarget++; // MS6

    // MS4: Remove items starting from the end
    for (let i = toRemove.length - 1; i >= 0; i--) {
        objects.splice(toRemove[i], 1);
    }

    // // MS7: Run planner for the offline AI player
    // let prevBestSolOffline = bestSolOffline;
    // [firstStepOffline, bestSolOffline, allSolOffline ] = runAIPlanner( objects, AIplayer , observableRadius , center, 'AI', settings.AIStabilityThreshold, prevBestSolOffline, allSolOffline, frameCountGame );
    
    // if ((prevBestSolOffline != null) && (bestSolOffline.ID != prevBestSolOffline.ID)) {
    //     numAIChanges++;
    // }

    // AIplayer.targetX = firstStepOffline.x; // MS7 -- just save the firstStepOffline object to firebase
    // AIplayer.targetY = firstStepOffline.y; 

    // // MS7: Run the planner conditional on the human player
    // [ firstStep, bestSol, allSol ] = runAIPlanner( objects, player , observableRadius , center, 'human', settings.AIStabilityThreshold, bestSol, allSol, frameCountGame ); 

    let prevBestSolOffline = bestSolOffline;
    // MS8
    [ firstStepOffline, bestSolOffline, allSolOffline ] = runAIPlanner( objects, AIplayer , observableRadius , center, 'AI', 
        settings.AIStabilityThreshold, prevBestSolOffline, allSolOffline, frameCountGame, settings.alpha );
    
    // AI intention for click,target pair
    AIplayer.targetX = firstStepOffline.x; // MS7 -- just save the firstStepOffline object to firebase
    AIplayer.targetY = firstStepOffline.y; 
    AIplayer.ID      = firstStepOffline.ID; // MS8 // ID of the object to intercept

    // console.log("AI Target", AIplayer.targetX, AIplayer.targetY, AIplayer.ID);
    
    if ((prevBestSolOffline != null) && (bestSolOffline.ID != prevBestSolOffline.ID)) {
        // push AI intention array
        // aiIntention.push();
        let aiIntention = {frame: frameCountGame, x: AIplayer.targetX, y: AIplayer.targetY, id: bestSolOffline.ID};
        aiClicks.push(aiIntention);
        aiClicks_adjusted.push(aiIntention);
        numAIChanges++;
    } else if (prevBestSolOffline == null) {
        // aiIntention.push
        let aiIntention = {frame: frameCountGame, x: AIplayer.targetX, y: AIplayer.targetY, id: bestSolOffline.ID};
        aiClicks.push(aiIntention);
        aiClicks_adjusted.push(aiIntention);
    }

    // we need to save ()

    // Run the planner conditional on the human player
    // MS8
    [ firstStep, bestSol, allSol ] = runAIPlanner( objects, player , observableRadius , center, 'human', settings.AIStabilityThreshold, bestSol, allSol, frameCountGame, settings.alpha );
    
    if (settings.AIMode>0) {    
        // MS6
        // Calculate the value of the human's current target
        player.shownAdvice = true;

        if (settings.AIMode >= 2) {
            //if ((frameCountGame > 100) & (player.moving)) {
            //    console.log( 'test case');
            //}
            // MS7
            let [ valueHumanPlan , valuesSuggestions ] = calcValueHumanPlan( bestSol , allSol, player , settings.AIadviceAngleThreshold, ctx, objects  ); 
            player.shownAdvice = false;

            const deltaX = player.x - center.x;
            const deltaY = player.y - center.y;
            const distanceToCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if ((numFramesAfterCaughtTarget > settings.AIframeDelay) && (distanceToCenter > 50)) {
                if (!player.moving) {
                    player.shownAdvice = true;
                } else if (player.moving && (valueHumanPlan <= settings.AIadviceThresholdHigh)) {
                    player.shownAdvice = true;
                }
            }
            //console.log( 'Numframesplayernotmoving=' + numFramesPlayernotMoving + ' NumFramesAfterCaughtTarget=' + numFramesAfterCaughtTarget + ' ValuePlan=' + valueHumanPlan);
        }
         
    }
}

function spawnObject(settings){

    let numObjectsTotal = objects.length; // MS2: count total number of objects (intercepted objects also count)
    
    let randomThreshold = randomGenerator();
    if (randomThreshold < settings.spawnProbability && numObjectsTotal < settings.maxTargets) { // MS2: added this condition
        // console.log("Spawn Threshold Met");
        let newObject = createComposite(settings);
        
        // MS: Generate a random angle between 0 and 2π (0 and 360 degrees)
        //let angle = Math.random() * 2 * Math.PI;
        let angle = randomGenerator() * 2 * Math.PI;

        // get x,y coordinates
        let curXLoc = center.x + observableRadius * Math.cos(angle); // - obj.width / 2;
        let curYLoc = center.y + observableRadius * Math.sin(angle); // - obj.height / 2;

        // if (DEBUG){
        //     // make hte object static
        //     curXLoc = 200;
        //     curYLoc = 500;
        // }

        let location = {x:curXLoc, y:curYLoc, angle:angle, lastSpawnTime:0};

        // works good enough for now
        newObject.x = location.x ;
        newObject.y = location.y ;
        newObject.spawnX = location.x;
        newObject.spawnY = location.y;

        // if (!DEBUG){
        //     setVelocityTowardsObservableArea(newObject);
        // }
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

    let newObj = {
        ID: frameCountGame ,
        type: 'composite',
        speed: speedSample, //(),
        x: 0,
        y: 0,
        vx: 0, // initial velocity is zero -->
        vy: 0,
        velAngle: 0, // initial velocity angle is zero --> reset in the setVelocityTowardsObservableArea
        size: shapeSize,
        outerColor:'blue', //'rgb(170,0,255)',
        innerColor:  'orange', //'rgb(255,170,0)',
        shape: shapeType, // Add shape type here
        type: 'target',
        //angle: shapeRotation,
        fill: fillRadius,
        value: Math.floor(fillRadius),
        active: true,
        intercepted: false, // MS2: Added this flag
        AIintercepted: false, // MS5: Added this flag
        spawnX: 0,
        spawnY: 0,
        clicked: false,
        marked: false
    };
    // console.log(newObj.speed);
 
    return newObj;
}

function spawnUnderstandingCheckObjects() {
    for (let i = 0; i < 3; i++) {
        let newObj = createComposite(settings);
        newObj.fill = 0;

        let angle = randomGenerator() * 2 * Math.PI;
        // Position the object on the rim of the camera
        newObj.x = center.x + randomGenerator()* observableRadius * Math.cos(angle);
        newObj.y = center.y + randomGenerator() * observableRadius * Math.sin(angle);

        objects.push(newObj);

        // works good enough for now
        newObj.x = location.x ;
        newObj.y = location.y ;
        newObj.spawnX = location.x;
        newObj.spawnY = location.y;
    }
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

//*************************************************** DRAWING FUNCTIONS **************************************************//

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
            // MS5: added this; can be removed once code is tested
            if ((obj.AIintercepted) && (settings.visualizeAIPlayer==1)) drawCompositeShapeAI(obj); 
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

// MS5: added this function just for debugging; it shows when AI player has intercepted target
function drawCompositeShapeAI(obj) {
    // Draw the outer circle first
    drawCircle(obj.x, obj.y, obj.size, 'LightGrey' ); // Outer circle

    // Then draw the inner circle on top
    drawCircle(obj.x, obj.y, obj.fill, 'gray' ); // Inner circle, smaller radius
}

function drawCompositeShape(obj) {

    // If the object is clicked, draw a green highlight around it.
    if (obj.marked && !player.toCenter){
        let ringColor = 'rgb(76, 187, 23)';
        let ringRadius = obj.size + 5;
        drawCircle(obj.x, obj.y,ringRadius, ringColor); 
    } 

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

function drawCenterMarker(centerX=400, centerY=400, radius=10, color = "rgba(128, 128, 128, 0.5)"){
    if (player.toCenter) drawCircle(centerX, centerY, 
                                    radius + 5,'rgb(76, 187, 0.25)');
    drawCircle(centerX, centerY, radius, color);
}

// Function that draws one thick ring in around the center of the game
function drawRing(centerX=400, centerY=400, radius=200, thickness=120){
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.stroke();
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
    const innerMaskRadius = maskRadius - 10; // Adjust as necessary

    ctx.save();

    // Draw a black rectangle covering the entire canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Then cut out a circular area from the rectangle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maskRadius, 0, Math.PI * 2, false);
    ctx.fill();

    // Draw a slightly smaller circle inside the cut-out area
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = isLightOn ? 'rgb(255,128,237)' : 'rgba(0, 0, 0, 0)'; // This is transparent black
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerMaskRadius, 0, Math.PI * 2, false);
    ctx.fill();

    // Then cut out a smaller circular area from the inner circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerMaskRadius - 10, 0, Math.PI * 2, false);
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

function drawAISolution() {
    if ((settings.AIMode>0) && (bestSol != null) && (player.shownAdvice)) {  // MS7
        // get the length of the suggested path
        let pathLength = Math.min( bestSol.interceptLocations.length, settings.AIMaxDisplayLength ); // MS7
        if (pathLength > 0) {
            // MS7
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
                    let toX = bestSol.interceptLocations[i][0];
                    let toY = bestSol.interceptLocations[i][1];
                    ctx.lineTo( toX, toY );
                }
                ctx.stroke();
                ctx.restore();
            }

            // MS7: updating code with new variable
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
                    let toX = bestSol.interceptLocations[i][0];
                    let toY = bestSol.interceptLocations[i][1];
                    
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
 
            // MS7
            // if (settings.AIDisplayMode==1 && settings.AIMode==2) {
                /*
            if (settings.AIDisplayMode==1) {
                // Show a cross on where to click next 
                ctx.save();
                ctx.fillStyle = 'yellow'; // Color of the text
                ctx.lineWidth = 5;
                ctx.beginPath();
            
                ctx.moveTo(player.x, player.y );

                let maxError = 600; // Adjust this value as needed
            
                let i = 0;
                let toX = bestSol.interceptLocations[i][0];
                let toY = bestSol.interceptLocations[i][1];
                
                // Calculate the error
                let error = Math.sqrt(Math.pow(player.x - toX, 2) + Math.pow(player.y - toY, 2));
                // Adjust the color based on the error
                let opacity = Math.min(1, error / maxError);
                ctx.strokeStyle = `rgba(255, 255, 0, ${opacity})`;
            
                ctx.lineTo( toX, toY ); 
                ctx.moveTo(toX - 10, toY - 10);
                ctx.lineTo(toX + 10, toY + 10);
                ctx.moveTo(toX + 10, toY - 10);
                ctx.lineTo(toX - 10, toY + 10); 
            
                ctx.stroke();
                ctx.restore();
            }
            */


            if (settings.AIDisplayMode==2) {
                // Highlight the target interception sequence 
                ctx.save();
                ctx.fillStyle = 'black'; // Color of the text
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency
                ctx.lineWidth = 5;
                ctx.beginPath();

                let i = 0;
                for (let i=0; i<pathLength; i++) {
                    let indexNow = bestSol.originalIndex[i];
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

    // MS7
    // Some visualization debugging tools
    let showIDs = false;
    if (showIDs) {
        let numObjects = objects.length;
        for (let i=0; i<numObjects; i++) {
            if (objects[i].intercepted == false) {
                let index = objects[i].ID;
                let targetX = objects[i].x;
                let targetY = objects[i].y;
                ctx.fillStyle = 'black'; // Color of the text
                ctx.fillText(index , targetX + 15, targetY + 15);
            }          
        }
    }
}

// MS6: test function
function drawFullAISolutionDEBUG() {
    if ((settings.AIMode>0) && (sol != null)) {
        // Draw all indices
        let numObjects = objects.length;
        for (let i=0; i<numObjects; i++) {
            let index = i;
            let targetX = objects[index].x;
            let targetY = objects[index].y;
            ctx.fillStyle = 'black'; // Color of the text
            ctx.fillText(index , targetX - 25, targetY + 15);
        }

        let numSuggestions = sol.valueGoingTowardsObject.length;
        for (let i=0; i<numSuggestions; i++) {
            // Show value and index for each target
            let index = sol.originalIndexSuggestions[i];
            let value = sol.valueGoingTowardsObject[i];

            let targetX = center.x;
            let targetY = center.y;
            let valueTarget = 0;
            if (index != -1) { // Not going towards origin
                // if (objects[index] == null) {
                //     // console.log( 'test');
                // }
                targetX = objects[index].x;
                targetY = objects[index].y;
                valueTarget = objects[index].fill / objects[index].size;
            }
            ctx.fillStyle = 'black'; // Color of the text
            ctx.fillText(index , targetX + 25, targetY + 15); 
  
            ctx.fillStyle = 'green'; // Color of the text
            let str = value.toFixed(2) + ' (' + valueTarget.toFixed(2) + ')';
            ctx.fillText(str , targetX + 25, targetY - 15); 

            //if (objects.length != numSuggestions) {
            //    console.log( 'test');
            //}


            if (sol.interceptLocationTowardsObject[i] != null) {
               let toX = sol.interceptLocationTowardsObject[i][0];
               let toY = sol.interceptLocationTowardsObject[i][1];
               
               // Draw interception path for player
               ctx.save();
               ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency 
               ctx.lineWidth = 5;
               // Set the dash pattern: [dashLength, gapLength]
               ctx.setLineDash([10, 15]); // Example: 10 pixels dash, 15 pixels gap
               ctx.beginPath();
               ctx.moveTo(player.x, player.y );
               ctx.lineTo( toX, toY );

               let str = value.toFixed( 2 );
               ctx.fillText(str , toX + 15, toY - 15); 

               // Draw trajectory from target to this interception point
               //let index = sol.originalIndex[i];
               //if (index != -1) {
                  //if (objects[index] == null) {
                  //    console.log( 'test');
                  //} else {                
                    ctx.lineTo( targetX, targetY );           
                  //}
                  
               //}


               ctx.stroke();
               ctx.restore();
            }
            
        }
    }
} 

// Interecept Function -- Original
// function attemptIntercept(playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius) {
//     let success = false;
//     let travelTime = Infinity;
//     let interceptPosX = NaN;
//     let interceptPosY = NaN;
//     let totalDistanceTraveled = Infinity;


//     let adjustedObjectPosX = objectPosX - center.x;
//     let adjustedObjectPosY = objectPosY - center.y;
//     // Check if the object is within the circle initially
//     let initialDistance = Math.sqrt(adjustedObjectPosX ** 2 + adjustedObjectPosY ** 2);

//     if (initialDistance > circleRadius) {
//         console.log('outside observable region', initialDistance);
//         return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
//     }

//     // Initial relative position from the player to the object
//     let relativePosX = objectPosX - playerPosX;
//     let relativePosY = objectPosY - playerPosY;

//     // Solving quadratic equation
//     let A = objectVelX ** 2 + objectVelY ** 2 - playerSpeed ** 2;
//     let B = 2 * (relativePosX * objectVelX + relativePosY * objectVelY);
//     let C = relativePosX ** 2 + relativePosY ** 2;

//     let discriminant = B ** 2 - 4 * A * C;

//     if (discriminant < 0) {
//         // No real solutions, interception not possible
//         return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
//     }

//     // Calculate potential times for interception
//     let t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
//     let t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

//     // Determine the valid and earliest interception time
//     if (t1 >= 0 && (t1 < t2 || t2 < 0)) {
//         travelTime = t1;
//     } else if (t2 >= 0) {
//         travelTime = t2;
//     } else {
//         // No valid interception time found
//         return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
//     }

//     interceptPosX = objectPosX + travelTime * objectVelX;
//     interceptPosY = objectPosY + travelTime * objectVelY;
//     totalDistanceTraveled = travelTime * playerSpeed;

//     // Check if the intercept position is within the circle
//     if (Math.sqrt(interceptPosX ** 2 + interceptPosY ** 2) <= circleRadius) {
//         success = true;
//     }

//     if ((travelTime == null) | (interceptPosX== null) | ( interceptPosX==null) |
//        (totalDistanceTraveled == null) | (success==null)) {
//         console.log( 'Null values');
//     }

//     return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
// }

// Interecept Function -- Adjusted
// function attemptIntercept(playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius) {
//     let success = false;
//     let travelTime = Infinity;
//     let interceptPosX = NaN;
//     let interceptPosY = NaN;
//     let totalDistanceTraveled = Infinity;


//     let adjObjectX = objectPosX - center.x;
//     let adjObjectY = objectPosY - center.y;
//     let adjPlayerX = playerPosX - center.x;
//     let adjPlayerY = playerPosY - center.y;

//     // Initial relative position from the player to the object
//     let relativePosX = adjObjectX - adjPlayerX;
//     let relativePosY = adjObjectY - adjPlayerY;

//     // Check if the object is within the circle initially
//     let initialDistance = Math.sqrt(adjObjectX ** 2 + adjObjectY ** 2);

//     if (initialDistance > circleRadius) {
//         console.log('outside observable region', initialDistance);
//         return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
//     }

//     // Initial relative position from the player to the object
//     // let relativePosX = objectPosX - playerPosX;
//     // let relativePosY = objectPosY - playerPosY;

//     // Solving quadratic equation
//     let A = objectVelX ** 2 + objectVelY ** 2 - playerSpeed ** 2;
//     let B = 2 * (relativePosX * objectVelX + relativePosY * objectVelY);
//     let C = relativePosX ** 2 + relativePosY ** 2;

//     let discriminant = B ** 2 - 4 * A * C;

//     if (discriminant < 0) {
//         // No real solutions, interception not possible
//         return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
//     }

//     // Calculate potential times for interception
//     let t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
//     let t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

//     // Determine the valid and earliest interception time
//     if (t1 >= 0 && (t1 < t2 || t2 < 0)) {
//         travelTime = t1;
//     } else if (t2 >= 0) {
//         travelTime = t2;
//     } else {
//         // No valid interception time found
//         return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
//     }

//     interceptPosX = adjObjectX + travelTime * objectVelX;
//     interceptPosY = adjObjectY + travelTime * objectVelY;
//     totalDistanceTraveled = travelTime * playerSpeed;

//     // Check if the intercept position is within the circle
//     if (Math.sqrt(interceptPosX ** 2 + interceptPosY ** 2) <= circleRadius) {
//         success = true;
//     }

//     if ((travelTime == null) | (interceptPosX== null) | ( interceptPosX==null) |
//        (totalDistanceTraveled == null) | (success==null)) {
//         console.log( 'Null values');
//     }

//     return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
// }

// function attemptIntercept(playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius, center) {
//     // Convert the screen coordinates to normalized coordinates where circle has radius 1 and center is at (0,0)
//     let success = false;
//     let travelTime = Infinity;
//     let interceptPosX = NaN;
//     let interceptPosY = NaN;
//     let totalDistanceTraveled = Infinity;

//     let Center = { x: canvas.width / 2, y: canvas.height / 2 };

//     // Adjust player and Center positions to center-based coordinates
//     console.log("center", Center.x, Center.y)
  
//     let adjObjectX = (objectPosX - Center.x);
//     let adjObjectY = (objectPosY - Center.y);

//     // Calculate the initial distance from the center to the object
//     let initialDistance = Math.sqrt(adjObjectX ** 2 + adjObjectY ** 2);
//     if (initialDistance > circleRadius) {
//         console.log('Outside observable region:', initialDistance);
//         return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
//     }

//     // Relativize position of object to the player
//     let relativePosX = adjObjectX - playerPosX;
//     let relativePosY = adjObjectY - playerPosY;

//     // Solving quadratic equation for intercept
//     let A = objectVelX ** 2 + objectVelY ** 2 - playerSpeed ** 2;
//     let B = 2 * (relativePosX * objectVelX + relativePosY * objectVelY);
//     let C = relativePosX ** 2 + relativePosY ** 2;

//     let discriminant = B ** 2 - 4 * A * C;
//     if (discriminant < 0) {
//         console.log('No real solutions, interception not possible.');
//         return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
//     }

//     if (DEBUG) {
//         console.log("************************************")
//         console.log("DEBUG STATEMENTS Part 1:")
//         console.log("Original Player Position (relative to HTML center -- top left corner): ", playerPosX, playerPosY);
//         console.log("Original Object Positions: ", objectPosX, objectPosY);
//         console.log("Velocities: ", objectVelX, objectVelY);
//         console.log("Player Speed", playerSpeed);
//         console.log("Circle Radius: ", circleRadius);
//         console.log("Center: ", Center.x, Center.y);
//         console.log("************************************")
//         console.log("DEBUG STATEMENTS Part 2:")
//         console.log("Adjusted Player Position: ", adjPlayerX, adjPlayerY);
//         console.log("Adjusted Object Position: ", adjObjectX, adjObjectY);
//         console.log("Relative Position: ", relativePosX, relativePosY);
//         console.log("Coefficients (A, B, C): ", A, B, C);
//         console.log("Discriminant: ", discriminant);
//         console.log("************************************")

//     }

//     // Calculate potential interception times
//     let t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
//     let t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

//     if (DEBUG) {
//         console.log("DEBUG STATEMENTS Part 3:")
//         console.log("Interception Times: ", t1, t2);
//         console.log("************************************")
//     }

//     // Select the valid and earliest interception time
//     if (t1 >= 0 && (t1 < t2 || t2 < 0)) {
//         travelTime = t1;
//     } else if (t2 >= 0) {
//         travelTime = t2;
//     } else {
//         console.log('No valid interception time found.');
//         return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
//     }

//     // Calculate interception position using the chosen time
//     interceptPosX = adjPlayerX + travelTime * objectVelX + Center.x;
//     interceptPosY = adjPlayerY + travelTime * objectVelY + Center.y;
//     totalDistanceTraveled = travelTime * playerSpeed;

//     if (DEBUG) {
//         console.log("DEBUG STATEMENTS Part 4:")
//         console.log("Interception Position: ", interceptPosX, interceptPosY);
//         console.log("Total Distance Traveled: ", totalDistanceTraveled);
//         console.log("************************************")
//     }

//     // Check if the intercept position is within the observable circle
//     let finalDistance = Math.sqrt((interceptPosX - Center.x) ** 2 + (interceptPosY - Center.y) ** 2);
//     if (finalDistance <= circleRadius) {
//         success = true;
//     }

//     if (DEBUG) {
//         console.log("DEBUG STATEMENTS Part 5:")
//         console.log("Final Distance: ", finalDistance);
//         console.log("Success: ", success);
//         console.log("************************************")
//     }

//     return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
// }

// function attemptIntercept(playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius, center) {
//     let success = false;
//     let travelTime = Infinity;
//     let interceptPosX = NaN;
//     let interceptPosY = NaN;
//     let totalDistanceTraveled = Infinity;

//     let Center = { x: canvas.width / 2, y: canvas.height / 2 };


//     // Calculate the initial distance from the center to the object
//     let initialDistance = Math.sqrt(objectPosX ** 2 + objectPosY ** 2);
//     if (initialDistance > circleRadius) {
//         console.log('Outside observable region:', initialDistance);
//         return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
//     }

//     // Relativize position of object to the player
//     let relativePosX = objectPosX - playerPosX;
//     let relativePosY = objectPosY - playerPosY;

//     // Solving quadratic equation for intercept
//     let A = objectVelX ** 2 + objectVelY ** 2 - playerSpeed ** 2;
//     let B = 2 * (relativePosX * objectVelX + relativePosY * objectVelY);
//     let C = relativePosX ** 2 + relativePosY ** 2;

//     let discriminant = B ** 2 - 4 * A * C;
//     if (discriminant < 0) {
//         console.log('No real solutions, interception not possible.');
//         return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
//     }

//     if (DEBUG) {
//         console.log("************************************")
//         console.log("DEBUG STATEMENTS Part 1:")
//         console.log("Original Player Position (relative to HTML center -- top left corner): ", playerPosX, playerPosY);
//         console.log("Original Object Positions: ", objectPosX, objectPosY);
//         console.log("Velocities: ", objectVelX, objectVelY);
//         console.log("Player Speed", playerSpeed);
//         console.log("Circle Radius: ", circleRadius);
//         console.log("Center: ", Center.x, Center.y);
//         console.log("************************************")
//         console.log("DEBUG STATEMENTS Part 2:")
//         // console.log("Adjusted Player Position: ", adjPlayerX, adjPlayerY);
//         // console.log("Adjusted Object Position: ", adjObjectX, adjObjectY);
//         console.log("Relative Position: ", relativePosX, relativePosY);
//         console.log("Coefficients (A, B, C): ", A, B, C);
//         console.log("Discriminant: ", discriminant);
//         console.log("************************************")

//     }

//     // Calculate potential interception times
//     let t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
//     let t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

//     if (DEBUG) {
//         console.log("DEBUG STATEMENTS Part 3:")
//         console.log("Interception Times: ", t1, t2);
//         console.log("************************************")
//     }

//     // Select the valid and earliest interception time
//     if (t1 >= 0 && (t1 < t2 || t2 < 0)) {
//         travelTime = t1;
//     } else if (t2 >= 0) {
//         travelTime = t2;
//     } else {
//         console.log('No valid interception time found.');
//         return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
//     }

//     // Calculate interception position using the chosen time
//     interceptPosX = playerPosX + travelTime * objectVelX + Center.x; // revert to old coordinates
//     interceptPosY = playerPosY + travelTime * objectVelY + Center.y; // revert to told coordinates
//     totalDistanceTraveled = travelTime * playerSpeed;

//     if (DEBUG) {
//         console.log("DEBUG STATEMENTS Part 4:")
//         console.log("Interception Position: ", interceptPosX, interceptPosY);
//         console.log("Total Distance Traveled: ", totalDistanceTraveled);
//         console.log("************************************")
//     }

//     // // Check if the intercept position is within the observable circle
//     // let finalDistance = Math.sqrt((interceptPosX - Center.x) ** 2 + (interceptPosY - Center.y) ** 2);
//     // if (finalDistance <= circleRadius * 2 *Math.PI) {
//     //     success = true;
//     // }
//     // Check if the intercept position is within the circle
//     if (Math.sqrt((interceptPosX-Center.x) ** 2 + (interceptPosY-Center.y) ** 2) <= circleRadius) {
//         success = true;
//     }

//     if (DEBUG) {
//         console.log("DEBUG STATEMENTS Part 5:")
//         //console.log("Final Distance: ", finalDistance);
//         console.log("Success: ", success);
//         console.log("************************************")
//     }

//     return [success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled];
// }

// Original Intercept Function
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

function displayAIstatus(){
    if (settings.AIMode == 0 && !falseAlarmFlag && !missFlag) {
        document.getElementById("aiModeStatus").textContent = "AI is OFF";
        document.getElementById("aiModeStatus").style.color = "white";
        document.getElementById("aiModeStatus").style.backgroundColor = "rgba(255, 0, 0, 0.8)";
        document.getElementById("aiAssistRobot").style.opacity = "0.5";
        document.getElementById("aiAssistRobotCaption").style.opacity = "0.5";
        document.getElementById("aiAssistRobotCaption").style.backgroundColor =  "yellow"; // semi-transparent green
        document.getElementById("aiAssistRobotCaption").textContent = "Hi! I'm your AI assistant. My suggestions are currently OFF.";
    } else if (settings.AIMode == 0 && !falseAlarmFlag && !missFlag) {
        document.getElementById("aiModeStatus").textContent = "AI is ON";
        document.getElementById("aiModeStatus").style.color = "white";
        document.getElementById("aiModeStatus").style.backgroundColor =  "rgba(0, 128, 0, 0.8)"; // semi-transparent green
        document.getElementById("aiAssistRobot").style.opacity = "1";
        document.getElementById("aiAssistRobotCaption").style.opacity = "1";
        document.getElementById("aiAssistRobotCaption").textContent = "Hi! I'm your AI assistant. My movement suggestions will be in yellow!";
    } else if (falseAlarmFlag || missFlag){
        document.getElementById("aiAssistRobotCaption").style.backgroundColor =  "pink"; // semi-transparent green
        document.getElementById("aiAssistRobotCaption").style.opacity = "1";
        document.getElementById("aiAssistRobotCaption").textContent = "Remember to press the spacebar only when the pink light flashes";
    }
}

function drawLight(Xcenter, Ycenter) {
    let somelatentfunction = 0;
    const size = 25;
    const numberOfSides = 5; // For a pentagon
    // const Xcenter = 40;
    // const Ycenter = 40;

    ctx.beginPath();
    ctx.moveTo (Xcenter +  size * Math.cos(0 - Math.PI / 2), Ycenter +  size *  Math.sin(0 - Math.PI / 2));          

    for (let side = 0; side <= numberOfSides; side++) {
        ctx.lineTo (Xcenter + size * Math.cos(side * 2 * Math.PI / numberOfSides - Math.PI / 2), Ycenter + size * Math.sin(side * 2 * Math.PI / numberOfSides - Math.PI / 2));
    }

    ctx.fillStyle = isLightOn ? 'rgb(170,255,0)' : 'gray';
    ctx.fill();
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
// ***************************************** INTERCEPTION ALGO (NEW) ***************************************** //
// Constants
const PLAYER_SPEED = 3;  // Maximum speed of the player
const MAX_LOOKAHEAD = 5; // Max lookahead in seconds

// Helper Functions
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function predictPosition(x, y, vx, vy, t) {
    return {
        x: x + vx * t,
        y: y + vy * t
    };
}

// Calculate the time required to travel a distance at constant speed
function timeToTravel(distance, speed) {
    return distance / speed;
}

// Main Interception Function
function calculateInterception(playerX, playerY, targetX, targetY, targetVx, targetVy) {
    let bestTime = Infinity;
    let bestPoint = { x: targetX, y: targetY };

    const relativeVelocity = Math.sqrt(targetVx ** 2 + targetVy ** 2);
    const timeIncrement = Math.max(0.1, 1 / (relativeVelocity / PLAYER_SPEED + 1));  // Adaptive time increment

    for (let t = 0; t <= MAX_LOOKAHEAD; t += timeIncrement) {
        // Predict target's future position
        let predicted = predictPosition(targetX, targetY, targetVx, targetVy, t);
        // Calculate distance and time required to reach this predicted position
        let dist = distance(playerX, playerY, predicted.x, predicted.y);
        let timeRequired = timeToTravel(dist, PLAYER_SPEED);

        // Check if this is a better solution
        if (timeRequired <= bestTime && timeRequired >= t) {  // Check if player can reach before or as target arrives
            bestTime = timeRequired;
            bestPoint = predicted;
        }
    }

    return {
        x: bestPoint.x,
        y: bestPoint.y,
        time: bestTime
    };
}

// *************************************************** EVENT LISTENERS *************************************************** //
let lastClickedObj = null;
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
        

        playerClicks.push({frame:frameCountGame, targetX:clickX, targetY:clickY, curX:player.x, 
                                curY:player.y, aiX:firstStep.x, aiY:firstStep.y, id:firstStep.ID});

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

                break;

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
            } else{
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

window.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && isLightOn) {
        isLightOn = false;

        responseTime = frameCountGame - drtInitFrame;
        
        // console.log("DRT Response: " + deltaResponse);  
        let response = {frame: frameCountGame, delta: responseTime, initFrame: drtInitFrame, valid: true};

        if (DEBUG) console.log("DRT Response:", response);

        if (responseTime < drtMissLow){
            response.valid = false;
        }

        drtResponses.push(response);
        
    } else if(event.code === 'Space' && !isLightOn) {
        if (DEBUG) console.log("False Alarm DRT Response: ");  

        // counter to limit warning caption, set false alarm flag to trigger caption change
        counter = 0;
        falseAlarmFlag = true;

        // push to the false alarm array the time of the flase alarm
        let response = {frame: frameCountGame};
        drtFalseAlarm.push(response);
    }
});

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

// Helper function to determine if the click is on the center
function isClickOnCenter(clickX,clickY){
    if ( Math.abs(clickX - center.x) <= 10 && Math.abs(clickY - center.y) <= 10 ){
        return true;
    }
}


//************************************************** DATA COLLECTION *****************************************************//
  
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

//**************************************************** SURVEY -- FULL ****************************************************//
function loadFullSurvey(){
    var DEBUG_SURVEY = DEBUG;
    //      Survey Information
    var TOPIC_FULL_DICT = {
        "q01"  : null,
        "q02"  : null,
        "q03"  : null,
        "q04"  : null,
        "q05"  : null,
        "q06"  : null,
        "q07"  : null,
        "q08"  : null,
        "q09"  : null,
        // "q10" : null
    };
    var TOPICS_RANKED = 0;

    $('.likert-topic-full li input').prop('checked', false);

    /******************************************************************************
        RUN ON PAGE LOAD

            Run the following functions as soon as the page is loaded. This will
            render the consent.html page appropriately.
    ******************************************************************************/

    $(document).ready(function (){
        /******************************************************************************
            FUNCTIONALITY

                All functions that will be used for the survey page.
        ******************************************************************************/
        /*
            Function to control Radio Button Selection
        */
        function likertTopicAbility() {
            /*
                Radio Button Selection Contoller.

                Only one likert option can be selected for each topic.
                Keep count of how many topics have been ranked. Once all topics
                have been ranked, then the submit button can become enabled.
            */
            // Retrieve the current topic that was ranked
            let topic_currently_ranked = $(this).attr("name");

            // Determine is that topic has been ranked before or not
            if (TOPIC_FULL_DICT[topic_currently_ranked] == null) {
                // If the topic hasn't bee ranked before, increment counter
                TOPICS_RANKED++;
            }

            // Set selection variable
            TOPIC_FULL_DICT[topic_currently_ranked] = Number($(this).val());

            // if (TOPICS_RANKED == 10) {
            //     // Enable "Submit" button
            //     $('#survey-complete-button').prop('disabled', false);
            //     console.log("All topics ranked");
            // }
            var allClicked = true;
            $('.likert-topic-full').each(function() {
                if ($(this).find('input:checked').length === 0) {
                    allClicked = false;
                    return false; // Exit the loop
                }
            });

           
            // let feedbackText = grabFeedbackText();

            // // Enable the submit button if all likert buttons have been clicked
            // if (allClicked && feedbackText.length > 0) {
            //     $('#survey-complete-button-full').prop('disabled', false);
            //     // console.log("All topics ranked");
            // }

            // Check if all likert buttons have been clicked and feedback text is not empty whenever an input changes
            $('.likert-topic-full li input, #survey-full-user-feedback-text').on('input', function() {
                var allClicked = true;
                $('.likert-topic-full').each(function() {
                    if ($(this).find('input:checked').length === 0) {
                        allClicked = false;
                        return false; // Exit the loop
                    }
                });

                var feedbackText = $('#survey-full-user-feedback-text').val();

                if (allClicked && feedbackText.trim() !== '') {
                    $('#survey-complete-button-full').prop('disabled', false);
                } else {
                    $('#survey-complete-button-full').prop('disabled', true);
                }
            });

            if (DEBUG_SURVEY) {
                console.log(
                    "Radio Button Selected\n:",
                    "    Topic :", topic_currently_ranked,
                    "    Value :", TOPIC_FULL_DICT[topic_currently_ranked]
                );
                console.log(
                    $(this).attr("name")
                );
            }
        };

        function grabFeedbackText(){
            var feedbackText = document.getElementById('survey-full-user-feedback-text').value;
            return feedbackText;
        }
        
        
        async function completeExperiment() {
            /*
                When submit button is clicked (after ranking), experiment is done.

                This will submit the final rankings and then load the
                "Experiment Complete" page.
            */
            numSurveyCompleted++;

            let feedbackText = grabFeedbackText();
            
            if (numSurveyCompleted == 1 && currentCondition == 2) {
                let path = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/full1' ;
                let path2 = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/aiFeedback1' ;
                writeRealtimeDatabase(db1, path, TOPIC_FULL_DICT);
                writeRealtimeDatabase(db1, path2, feedbackText);
                
            } else if (numSurveyCompleted == 2 && currentCondition == 2) {
                let path = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/full2' ;
                let path2 = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/aiFeedback2' ;
                writeRealtimeDatabase(db1, path, TOPIC_FULL_DICT);
                writeRealtimeDatabase(db1, path2, feedbackText);
            } else {
                let path = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/full3' ;
                let path2 = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/aiFeedback' ;
                writeRealtimeDatabase(db1, path, TOPIC_FULL_DICT);
                writeRealtimeDatabase(db1, path2, feedbackText);
            }

            if (numSurveyCompleted == 3) {
                // push them to the final page of the experiment which redirects participants
                // await runGameSequence("Congratulations on Finishing the Main Experiment! Click OK to Continue to the Feedback Survey.");
                // $("#full-game-container").attr("hidden", true);
                finalizeBlockRandomization(db1, studyId, currentCondition);
                // finalizeBlockRandomization(db1, studyId, curSeeds);
                $("#survey-full-container").attr("hidden", true);
                $("#task-header").attr("hidden", true);
                $("#exp-complete-header").attr("hidden", false);
                $("#complete-page-content-container").attr("hidden", false);
                await loadCompletePage();
                // $('#task-complete').load('html/complete.html');
            } else{ // continue to another block
                $("#survey-full-container").attr("hidden", true);
                document.getElementById('survey-full-user-feedback-text').value = '';
                //$("#survey-full-container").remove();
                $("#full-game-container").attr("hidden", false);
                // resizeScoreCanvas()

            }
            // console.log("Submit Button Clicked");
        };

        //  Handle Likert Selection for ALL Topics
        $('.likert-topic-full li input').click(likertTopicAbility);

        //  Handle Submitting Survey
        $('#survey-complete-button-full').off().click(completeExperiment);
    });
}

//*************************************************** SURVEY -- WORKLOAD *************************************************//
function loadWorkLoadSurvey(){
    var DEBUG_SURVEY                    = DEBUG;
    //      Survey Information
    var TOPIC_Workload_DICT = {
        "q01"  : null,
        "q02"  : null,
        "q03"  : null,
    };
    var TOPICS_RANKED = 0;

    // Clear previous inputs
    // $('.likert-topic-workload li input').val('');
    $('.likert-topic-workload li input').prop('checked', false);

    /******************************************************************************
        RUN ON PAGE LOAD

            Run the following functions as soon as the page is loaded. This will
            render the consent.html page appropriately.
    ******************************************************************************/

    $(document).ready(function (){
        /******************************************************************************
            FUNCTIONALITY

                All functions that will be used for the survey page.
        ******************************************************************************/
        /*
            Function to control Radio Button Selection
        */
        function likertTopicAbility() {
            /*
                Radio Button Selection Contoller.

                Only one likert option can be selected for each topic.
                Keep count of how many topics have been ranked. Once all topics
                have been ranked, then the submit button can become enabled.
            */
            // Retrieve the current topic that was ranked
            let topic_currently_ranked = $(this).attr("name");

            // Determine is that topic has been ranked before or not
            if (TOPIC_Workload_DICT[topic_currently_ranked] == null) {
                // If the topic hasn't bee ranked before, increment counter
                TOPICS_RANKED++;
            }

            // Set selection variable
            TOPIC_Workload_DICT[topic_currently_ranked] = Number($(this).val());

            // if (TOPICS_RANKED == 10) {
            //     // Enable "Submit" button
            //     $('#survey-complete-button').prop('disabled', false);
            //     console.log("All topics ranked");
            // }

            var allClicked = true;
            $('.likert-topic-workload').each(function() {
                if ($(this).find('input:checked').length === 0) {
                    allClicked = false;
                    return false; // Exit the loop
                }
            });

            // Enable the submit button if all likert buttons have been clicked
            if (allClicked) {
                $('#survey-complete-button-workload').prop('disabled', false);
                // console.log("All topics ranked");
            }


            if (DEBUG_SURVEY) {
                console.log(
                    "Radio Button Selected\n:",
                    "    Topic :", topic_currently_ranked,
                    "    Value :", TOPIC_Workload_DICT[topic_currently_ranked]
                );
                console.log(
                    $(this).attr("name")
                );
            }
        };

        async function completeExperiment() {
            /*
                When submit button is clicked (after ranking), experiment is done.

                This will submit the final rankings and then load the
                "Experiment Complete" page.
            */
            let SURVEY_END_TIME = new Date();

            numSurveyCompleted++;
            
            if (numSurveyCompleted == 1) {
                let path = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/workload1' ;
                writeRealtimeDatabase(db1, path, TOPIC_Workload_DICT);
            } else if (numSurveyCompleted == 2) {
                let path = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/workload2' ;
                writeRealtimeDatabase(db1, path, TOPIC_Workload_DICT);
            } else {
                let path = studyId + '/participantData/' + firebaseUserId1 + '/selfAssessment/workload3' ;
                writeRealtimeDatabase(db1, path, TOPIC_Workload_DICT);
            }

            if (numSurveyCompleted == 3) {
                // push them to the final page of the experiment which redirects participants
                // await runGameSequence("Congratulations on Finishing the Main Experiment! Click OK to Continue to the Feedback Survey.");
                finalizeBlockRandomization(db1, studyId, currentCondition);
                // finalizeBlockRandomization(db1, studyId, curSeeds);
                $("#survey-workload-container").attr("hidden", true);
                $("#task-header").attr("hidden", true);
                $("#exp-complete-header").attr("hidden", false);
                $("#complete-page-content-container").attr("hidden", false);
                await loadCompletePage();
                // $('#task-complete').load('html/complete.html');
            } else{
                $("#survey-workload-container").attr("hidden", true);
                // $("#survey-workload-container").remove();
                $("#full-game-container").attr("hidden", false);
                // resizeScoreCanvas()
            }

            // console.log("Submit Button Clicked");
        }

        //  Handle Likert Selection for ALL Topics
        $('.likert-topic-workload li input').click(likertTopicAbility);

        //  Handle Submitting Survey
        $('#survey-complete-button-workload').off().click(completeExperiment);
    });
}

//*************************************************** COMPLETE -- REDIRECT ************************************************//
async function loadCompletePage(){
    // try {
    //     let response = await fetch('path/to/complete/page.html');
    //     let text = await response.text();
    //     document.getElementById('complete-page-content-container').innerHTML = text;
    // } catch (error) {
    //     console.error('Error:', error);
    // }

    var DEBUG_COMPLETE     = false;


    /******************************************************************************
        VARIABLES

            All metadata variables that are relevant to the survey page.
    ******************************************************************************/
    // console.log("Database and firebaseuid: ", db1, firebaseUserId1); 
    // Database Path
    var COMPLETE_DB_PATH        = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId1 + '/userFeedback';

    $(document).ready(function (){
        /******************************************************************************
            FUNCTIONALITY
    
                All functions that will be used for the complete page.
        ******************************************************************************/
        function replaceClass(element, remove, add) {
            /*
                Use jQuery to replace the class of the given element.
            */
    
            $(element).removeClass(remove);
            $(element).addClass(add);
        };
        
        function copyCode() {
            /*
                Copy the Unique Code to the clipboard.
    
                Use this function if you will be providing a unique code for
                participants to submit when redirected to Prolific or MTurk.
            */
            var temp = $("<input>");
            $("body").append(temp);
            temp.val($('#code').val()).select();
            document.execCommand("copy");
            alert("Copied the code: " + temp.val());
            temp.remove();
        };
    
        function redirectToProlific() {
            /*
                Redirect participants back to prolific after the study.
            */
            //  Redirect URL for Experiment 02 (explanationstyleN with eplanations file v15) (pilot 10 participants)
            var restart;
            if (confirm("If you click 'OK', you will be redirected to Prolific. If you click 'Cancel' you will stay on this page.")) {
                restart = true;
            } else {
                restart = false;
            }
            
            // The redirect URL should be back to Prolific
            if (restart) {
                if (DEBUG_COMPLETE){
                    window.location.replace("https://skarny0.github.io/target-intercept-exp-3/");
                } else {
                    // This redirect should be updated to Prolific when you are LIVE
                    window.location.replace("https://app.prolific.com/submissions/complete?cc=C683JZHM");
                }
            }
        }
    
        function feedbackToSubmit() {
            /*
                Determine if there is feedback to submit or not.
    
                If there is then the button is enabled.
                If there isn't then the button is disabled.
    
            */
            let content = $("#user-feedback-text").val().trim();
            $('#user-feedback-button').prop('disabled', content === '');
        }
    
        function submitFeedback() {
            /*
                Submit user feedback.

            */

            let feedbacktext = $('#user-feedback-text').val();
            //let path = studyId + '/participantData/' + firebaseUserId1 + 'paricipantInfo/' + 'feedback';
            let currentPath = studyId + '/participantData/' + firebaseUserId1 + '/participantInfo/' + 'feedback'
            writeRealtimeDatabase(db1, currentPath, feedbacktext);
    
            replaceClass('#user-feedback-button', "btn-secondary", "btn-primary");
        };
        //  Copy Unique Code to Clipboard
        $('#unique-code-copy-button').click(redirectToProlific);
    
        //  Determine if there is User Feedback to be Submitted
        $('#user-feedback-text').on('keyup', feedbackToSubmit);
    
        //  Submit User Feedback
        $('#user-feedback-button').click(submitFeedback);
    });
}