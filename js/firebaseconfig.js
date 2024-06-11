// // TEMPLATE Version Config
// // const firebaseConfig = {
// //     apiKey: "AIzaSyCiQVYISpx-PCaWXAw0b0G0LC6GwuNf7ZA",
// //     authDomain: "uci-hri.firebaseapp.com",
// //     projectId: "uci-hri",
// //     storageBucket: "uci-hri.appspot.com",
// //     messagingSenderId: "280050074399",
// //     appId: "1:280050074399:web:072e4acb5df9614783e62a"
// // };

// const firebaseConfig = {
//     apiKey: "AIzaSyBbJjawzuVIzAWedluckmIIPhLrssvRzVw",
//     authDomain: "uci-hri-main.firebaseapp.com",
//     projectId: "uci-hri-main",
//     storageBucket: "uci-hri-main.appspot.com",
//     messagingSenderId: "639884968072",
//     appId: "1:639884968072:web:6da12c23a7ce40673f5f3d"
// };
  
// // DEBUG Version Config
// /*  Add your experiment DEBUG firebase config   */

// // Live Version Config
// /*  Add your experiment LIVE firebase config    */
// Importing functions and variables from the FirebasePsych library
// import {initializeRealtimeDatabase,initializeSecondRealtimeDatabase } from "./firebasepsych1.1.js";

// Define the configuration file for first database
// const firebaseConfig_db1 = {
//     apiKey: "AIzaSyBbJjawzuVIzAWedluckmIIPhLrssvRzVw",
//     authDomain: "uci-hri-main.firebaseapp.com",
//     databaseURL: "https://uci-hri-main-default-rtdb.firebaseio.com",
//     projectId: "uci-hri-main",
//     storageBucket: "uci-hri-main.appspot.com",
//     messagingSenderId: "639884968072",
//     appId: "1:639884968072:web:6da12c23a7ce40673f5f3d"
// };

// // Define the configuration file for second database
// const firebaseConfig_db2 = {
//     apiKey: "AIzaSyBbJjawzuVIzAWedluckmIIPhLrssvRzVw",
//     authDomain: "uci-hri-main.firebaseapp.com",
//     databaseURL: "https://uci-hri-main-event.firebaseio.com",
//     projectId: "uci-hri-main",
//     storageBucket: "uci-hri-main.appspot.com",
//     messagingSenderId: "639884968072",
//     appId: "1:639884968072:web:6da12c23a7ce40673f5f3d"
// };

// // Get the reference to the two databases using the configuration files
// const [ db1 , firebaseUserId1 ] = await initializeRealtimeDatabase( firebaseConfig_db1 );
// const [ db2 , firebaseUserId2 ] = await initializeSecondRealtimeDatabase( firebaseConfig_db2 );


// // console.log("Firebase UserId=" + firebaseUserId);

// function getDebugParams(){
//     const urlParams = new URLSearchParams(window.location.search);
//     let debugBoolean = Boolean(urlParams.get('debug'));

//     // console.log(debugBoolean);

//     return debugBoolean;
// }

// var DEBUG  = getDebugParams();   // Always start coding in DEBUG mode

// let studyId = 'placeHolder';

// if (DEBUG){
//    studyId    = "uci-hri-experiment-3-pilot2-debug";
// } else {
//     studyId   = "uci-hri-experiment-3-pilot2";
// }
// // console.log("Study ID: " + studyId);    

// export {studyId, firebaseUserId1, firebaseUserId2, db1, db2, DEBUG};