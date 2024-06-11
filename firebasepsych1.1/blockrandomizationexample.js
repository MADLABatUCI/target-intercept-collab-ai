/// Importing functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase, writeURLParameters, readRealtimeDatabase,
    blockRandomization, finalizeBlockRandomization,initializeRealtimeDatabase
  } from "./firebasepsych1.1.js";
  
  //-------------------------------------------------------------------------------------------------------
  //   Demonstrate block randomization (between subjects)
  //
  //   functions: blockRandomization() and finalizeBlockRandomization()
  //
  //   Goal: Randomly assign participant to a condition with the constraint to balance total counts across conditions
  //
  //   In the example below, we are randomly assigning each participant conditions:
  //   1) Viewpoint: four different levels, assign each participant to one of the levels
  //   2) ObjectType: three different levels, assign each participant to one of the levels
  //   3) imageChoice: twelve different levels, assign each participant to 4 of the 12 levels
  //
  //   Note that the blockrandomization will return conditions indices that are zero-indexed 
  //------------------------------------------------------------------------------------------------------
  
  // Declare which study we are running
  const studyId = 'study1';


  // Define the configuration file
  const firebaseConfig = {
        apiKey: "AIzaSyBPrSINY1oznvrHK1-lG03PxMFor9Z1VyI",
        authDomain: "myexp-576c8.firebaseapp.com",
        databaseURL: "https://myexp-576c8-default-rtdb.firebaseio.com",
        projectId: "myexp-576c8",
        storageBucket: "myexp-576c8.appspot.com",
        messagingSenderId: "519995709282",
        appId: "1:519995709282:web:d23e39af62365cafaafe3b"
        };
      // Initialize database
  const [ db , firebaseUserId ] = await initializeRealtimeDatabase( firebaseConfig );

  console.log("Firebase UserId=" + firebaseUserId);
  
  // How many minutes before a participant will time out (i.e., when we expect them not to finish the study)?
  // We need this (rough) estimate in order to zero out the counts for participants that started the study
  // but did not finish within this time (and will therefore never finish)
  const maxCompletionTimeMinutes = 60;
  
  // Example 1: Assign a random condition for Viewpoint
  const viewPointCondition = 'ViewPoint'; // a string we use to represent the condition name
  let numConditions = 4; // Number of conditions for this variable
  let numDraws = 1; // Number of  assignments (mutually exclusive) we want to sample for this participants
  let assignedCondition = await blockRandomization( db, studyId, viewPointCondition, numConditions,
    maxCompletionTimeMinutes, numDraws); // the await keyword is mandatory
  let msg = viewPointCondition + ": participant is assigned level: " + assignedCondition;
  console.log(msg);
  $('#message').append(msg + '<br>');
  
  // Example 2: Assign a random condition for ObjectType
  const objectTypeCondition = 'ObjectType'; // a string we use to represent the condition name
  numConditions = 3; // Number of conditions for this variable
  numDraws = 1; // Number of  assignments (mutually exclusive) we want to sample for this participants
  assignedCondition = await blockRandomization(db, studyId, objectTypeCondition, numConditions,
    maxCompletionTimeMinutes, numDraws);
  msg = objectTypeCondition + ": participant is assigned level: " + assignedCondition;
  console.log(msg);
  $('#message').append(msg + '<br>');
  
  // Example 3: Sample 4 out of 12 images
  const imageCondition = 'imageChoice'; // a string we use to represent the condition name
  let numImages = 12; // Number of total images
  numDraws = 4; // Number of images to sample for this participant
  let assignedImages = await blockRandomization(db, studyId, imageCondition, numImages,
    maxCompletionTimeMinutes, numDraws); // the await keyword is mandatory
  for (let i = 0; i < numDraws; i++) {
    let msg = "Image " + (i + 1) + " of " + numDraws + ": participant is assigned image index: " + assignedImages[i];
    console.log(msg);
    $('#message').append(msg + '<br>');
  }
  
  
  // Experiment will run here...
  //
  
  // End of experiment has been reached...
  let endofStudy = true;
  
  // Important: at the end of the Experiment, if the participant completes successfully, we have to make some final database updates.
  // Why? Because if a participant completes the experiment, we treat that differently for the purpose of counterbalancing than a participant
  // who aborts the experiment (e.g. times out or navigates to a different page)
  // The following function makes sure that the state for this participant reflects the fact that the participant has completed the experiment.
  
  if (endofStudy) {
    finalizeBlockRandomization(db, studyId, viewPointCondition);
    finalizeBlockRandomization(db, studyId, objectTypeCondition);
    finalizeBlockRandomization(db, studyId, imageCondition);
    $('#message').append('Finalizing block randomization tables...<br>');
  }