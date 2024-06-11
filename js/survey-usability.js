/*
survey.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Survey Page JS file (metadata and functionality).

This file should contain all variables and functions
to conduct the post-experiment survey.
*/

/******************************************************************************
    IMPORTS

        Import all FirebaseJS functionality.
******************************************************************************/
/// Importing functions and variables from the Firebase Psych library
import {
    writeRealtimeDatabase,
    firebaseUserId
} from "./firebasepsych1.1.js";


/******************************************************************************
    VARIABLES

        All metadata variables that are relevant to the survey page.
******************************************************************************/
//      Turn ON/OFF Debug Mode
var DEBUG_SURVEY                    = DEBUG;

//      Survey Information
var TOPIC_ABILITY_DICT = {
    "q01"  : null,
    "q02"  : null,
    "q03"  : null,
    "q04"  : null,
    "q05"  : null,
    "q06"  : null,
    "q07"  : null,
    "q08"  : null,
    "q09"  : null,
    "q10" : null
};
var TOPICS_RANKED                   = 0;

// Database Path
var SURVEY_DB_PATH               = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/surveyData/';

var SURVEY_START_TIME = new Date();
writeRealtimeDatabase(
    SURVEY_DB_PATH + "/metadata/surveyStartTime",
    SURVEY_START_TIME.toString()
);
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
        if (TOPIC_ABILITY_DICT[topic_currently_ranked] == null) {
            // If the topic hasn't bee ranked before, increment counter
            TOPICS_RANKED++;
        }

        // Set selection variable
        TOPIC_ABILITY_DICT[topic_currently_ranked] = Number($(this).val());

        if (TOPICS_RANKED == 10) {
            // Enable "Submit" button
            $('#survey-complete-button').prop('disabled', false);
        }
        

        if (DEBUG_SURVEY) {
            console.log(
                "Radio Button Selected\n:",
                "    Topic :", topic_currently_ranked,
                "    Value :", TOPIC_ABILITY_DICT[topic_currently_ranked]
            );
            console.log(
                $(this).attr("name")
            );
        }
    };

    function completeExperiment() {
        /*
            When submit button is clicked (after ranking), experiment is done.

            This will submit the final rankings and then load the
            "Experiment Complete" page.
        */
        let SURVEY_END_TIME = new Date();

        // // WRITE TO DATABASE
        // writeRealtimeDatabase(
        //     SURVEY_DB_PATH + "/selfAssessment/usability",
        //     TOPIC_ABILITY_DICT
        // );
        // writeRealtimeDatabase(
        //     SURVEY_DB_PATH + "/metadata/surveyEndTime",
        //     SURVEY_END_TIME.toString()
        // );
        // writeRealtimeDatabase(
        //     SURVEY_DB_PATH + "/metadata/surveyTotalTime",
        //     SURVEY_END_TIME - SURVEY_START_TIME
        // );
        
        // Hide Instructions
        // $('#survey-main-content').load('html/survey-teaming.html');
        $("#survey-container").attr("hidden", true);
        
    };
    //  Handle Likert Selection for ALL Topics
    $('.likert-topic li input').click(likertTopicAbility);

    //  Handle Submitting Survey
    $('#survey-complete-button').click(completeExperiment);
});