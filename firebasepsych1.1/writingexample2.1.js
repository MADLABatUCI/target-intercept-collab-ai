// Importing functions and variables from the FirebasePsych library
import { writeRealtimeDatabase,writeURLParameters,readRealtimeDatabase,
    blockRandomization,finalizeBlockRandomization,
    initializeRealtimeDatabase,initializeSecondRealtimeDatabase } from "./firebasepsych1.1.js";

//-----------------------------------------------------------------------------------------------------
//    demonstration of how to use multiple databases such that data can written to 
//    different databases
// -------------------------------------------------------------------------------------------------------

// const firebaseConfig = {
//     apiKey: "AIzaSyBbJjawzuVIzAWedluckmIIPhLrssvRzVw",
//     authDomain: "uci-hri-main.firebaseapp.com",
//     databaseURL: "https://uci-hri-main-default-rtdb.firebaseio.com",
//     projectId: "uci-hri-main",
//     storageBucket: "uci-hri-main.appspot.com",
//     messagingSenderId: "639884968072",
//     appId: "1:639884968072:web:6da12c23a7ce40673f5f3d"
//   };

// Define the configuration file for first database
const firebaseConfig_db1 = {
    // apiKey: "AIzaSyBPrSINY1oznvrHK1-lG03PxMFor9Z1VyI",
    // authDomain: "myexp-576c8.firebaseapp.com",
    // databaseURL: "https://myexp-576c8-default-rtdb.firebaseio.com",
    // projectId: "myexp-576c8",
    // storageBucket: "myexp-576c8.appspot.com",
    // messagingSenderId: "519995709282",
    // appId: "1:519995709282:web:d23e39af62365cafaafe3b"
    apiKey: "AIzaSyBbJjawzuVIzAWedluckmIIPhLrssvRzVw",
    authDomain: "uci-hri-main.firebaseapp.com",
    databaseURL: "https://uci-hri-main-default-rtdb.firebaseio.com",
    projectId: "uci-hri-main",
    storageBucket: "uci-hri-main.appspot.com",
    messagingSenderId: "639884968072",
    appId: "1:639884968072:web:6da12c23a7ce40673f5f3d"
};

// Define the configuration file for second database
const firebaseConfig_db2 = {
    apiKey: "AIzaSyBbJjawzuVIzAWedluckmIIPhLrssvRzVw",
    authDomain: "uci-hri-main.firebaseapp.com",
    databaseURL: "https://uci-hri-main-event.firebaseio.com",
    projectId: "uci-hri-main",
    storageBucket: "uci-hri-main.appspot.com",
    messagingSenderId: "639884968072",
    appId: "1:639884968072:web:6da12c23a7ce40673f5f3d"
};

// Get the reference to the two databases using the configuration files
const [ db1 , firebaseUserId1 ] = await initializeRealtimeDatabase( firebaseConfig_db1 );
const [ db2 , firebaseUserId2 ] = await initializeSecondRealtimeDatabase( firebaseConfig_db2 );

// Name the study we are running (any string is fine)
const studyId  = 'study1';

// Show the user id that is provided by the Firebase Psych library.
console.log( "Firebase UserId1=" + firebaseUserId1 );
console.log( "Firebase UserId2=" + firebaseUserId2 );

/// Example 1: Storing a JavaScript object in database 1
let pathnow = studyId+'/participantData/'+firebaseUserId1+'/trialData/trial2';
let valuenow = { condition: 2, responseTime: 370, isCorrect: true, answer: 'B' };
writeRealtimeDatabase( db1, pathnow , valuenow );
$('#message').append('Executing example 1...<br>');

/// Example 2: Storing a JavaScript object in database 2
pathnow = studyId+'/participantData/'+firebaseUserId2+'/trialData/trial2';
valuenow = { condition: 1, responseTime: 123, isCorrect: true, answer: 'D' };
writeRealtimeDatabase( db2, pathnow , valuenow );
$('#message').append('Executing example 2...<br>');

// Problem!!: the two databases now use different firebase IDs so they cannot be linked 

// SOLUTION 1: store the firebaseUserIds from one database on the other database 
pathnow = studyId+'/participantData/'+firebaseUserId2+ '/participantInfo/firebaseUserId1';
writeRealtimeDatabase( db2, pathnow , firebaseUserId1 );
pathnow = studyId+'/participantData/'+firebaseUserId1+ '/participantInfo/firebaseUserId2';
writeRealtimeDatabase( db1, pathnow , firebaseUserId2 );

// SOLUTION 2: the prolific ID needs to be stored in each database to provide linkage
// Save URL parameters on the path: "[studyId]/participantData/[firebaseUserId]/participantInfo"
pathnow = studyId+'/participantData/'+firebaseUserId1+ '/participantInfo';
writeURLParameters( db1, pathnow );
$('#message').append('Writing URL parameters...<br>');
pathnow = studyId+'/participantData/'+firebaseUserId2+ '/participantInfo';
writeURLParameters( db2, pathnow );
$('#message').append('Writing URL parameters...<br>');