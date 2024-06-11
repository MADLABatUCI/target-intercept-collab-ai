/*
complete.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Complete Page JS file (metadata and functionality).

This file should contain all variables and functions needed for
the end of the experiment.
*/

/******************************************************************************
    IMPORTS

        Import all FirebaseJS functionality.
******************************************************************************/
/// Importing functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase
} from "./firebasepsych1.1.js";

import {studyId, firebaseUserId1, firebaseUserId2, db1, db2} from "./firebaseconfig.js";

console.log("Database and firebaseuid: ", db1, firebaseUserId1);
/******************************************************************************
    DEBUG

        For now we are in DEBUG mode. Turn off DEBUG mode in js/metadata.js.
******************************************************************************/
//      Turn ON/OFF Debug Mode
var DEBUG_COMPLETE     = false;


/******************************************************************************
    VARIABLES

        All metadata variables that are relevant to the survey page.
******************************************************************************/
console.log("Database and firebaseuid: ", db1, firebaseUserId1); 
// Database Path
var COMPLETE_DB_PATH        = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId1 + '/userFeedback';


/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
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
        writeRealtimeDatabase(
            COMPLETE_DB_PATH,
            {
                "feedbackTime": Date().toString(),
                "feedbackText": $('#user-feedback-text').val()
            }
        );

        replaceClass('#user-feedback-button', "btn-secondary", "btn-primary");
    };
    //  Copy Unique Code to Clipboard
    $('#unique-code-copy-button').click(redirectToProlific);

    //  Determine if there is User Feedback to be Submitted
    $('#user-feedback-text').on('keyup', feedbackToSubmit);

    //  Submit User Feedback
    $('#user-feedback-button').click(submitFeedback);
});