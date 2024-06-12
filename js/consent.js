/*
consent.js

    Author      :   Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Consent Page METADATA file.

This file should contain static experimental metadata such as:
    - Experiment Summary
    - Experiment Estimated Time
    - Compensation
    -
    -
*/

/******************************************************************************
    IMPORTS

        Import all FirebaseJS functionality.
******************************************************************************/
/// Importing functions and variables from the Firebase Psych library
// import {
//     writeRealtimeDatabase,
//     writeURLParameters,
//     firebaseUserId
// } from "./firebasepsych1.1.js";

/******************************************************************************
    METADATA

        All metadata variables that are relevant to the consent page.
******************************************************************************/

/*
    Experiment Summary

        You want your summary to be descriptive but short.

        DEFAULT:
            None! This needs to be modified by you!
*/
var EXPERIMENT_SUMMARY = `
    This experiment tests how people plan and act in quickly changing enviornments. 
    To test this, we built an arcade-like videogame where your goal is to intercept targets that are moving in a 2D space. 
    Your goal will be to maximize your score in the limited time alotted in each round. - You have an AI collaborative player that will help you with the task.
`;

/*
    Time Commitment

        How long will your experiment take (in minutes)?

        Be sure to be as accurate as possible and feel free
        to include a range (40-50 minutes).

        DEFAULT:
            30 minutes
*/
var TIME_COMMITMENT = "30 minutes";

/*
    Benefits and Risks

        List any benefits and risks that may arise from participating
        in your study. If there are multiple, feel free to make a list.

        DEFAULT:
            There are no direct benefits from your participation in this study.
*/
var BENEFITS_AND_RISKS = `
    There are no direct benefits or risks from your participation in this study.
`;

/*
    Eligibility Requirements

        List all eligibility requirements for your study. This includes the
        criteria you use to filter participants while using Prolific or AMT.

        DEFAULT:
            1)  United States citizen
            2)  18 years or older
            3)  English speaker
            4)  HTML-5 compatible web browser (chrome, edge, safari, or firefox)
*/
var ELIGIBILITY_REQUIREMENTS = `
    <span>1)</span>     <span class="pl-2">United States citizen/resident</span>
    <br />
    <span>2)</span>     <span class="pl-2">18 years or older</span>
    <br />
    <span>3)</span>     <span class="pl-2">English speaker</span>
    <br />
    <span>4)</span>     <span class="pl-2">HTML-5 compatible web browser (chrome, edge, safari, or firefox)</span>
`;

/*
    Compensation

        How much will your participants be getting paid?

        DEFAULT:
            $5.00
*/
var COMPENSATION = "$5.00";

/*
    Recruitment Service

        Specify the recruitment service that you are using!

        DEFAULT:
            Amazon Mechanical Turk
*/
var RECRUITMENT_SERVICE = "Prolific";

/*
    Comprehention Quiz

        Specify how many questions will be in the comprehention quiz
        and how many a participant needs to correctly answer in order
        to participate in the study.

        DEFAULT:
            4/5
*/
var COMPREHENTION_QUIZ = "";

/*
    Lead Researcher

        This will be you! Be sure to put your name down and email
        so that participants from your study can contact you if
        needed.

        DEFAULT:
            None...Add your name!
*/
var LEAD_RESEARCHER = "Sheer Karny";
var LEAD_RESEARCHER_EMAIL   = "skarny@uci.edu";


/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the consent.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    /*
    CONSENT DATA
    */
    let CONSENT_DATA = {
        'consented': null,
        'consentTime': null,
    };


    /******************************************************************************
        FUNCTIONALITY

            All functions that will be used for the consent page.
    ******************************************************************************/
    function disableSubmit() {
        /*
            Disable the submit button.

            Submit button should be disabled by default and only enabled once
            a participant has consented to the study.
        */
        if (!document.getElementById("terms").checked) {
            $("#submit-consent").disabled = true;
        }
    };

    function activateButton() {
        /*
            Activate the submit button.

            Activates and deactivates the submit button based on a user checking
            or unchecking the consent box.
        */
        if (this.checked) {
            document.getElementById("submit-consent").disabled = false;
            CONSENT_DATA['consented'] = true;
            CONSENT_DATA['consentTime'] = Date().toString();
        }
        else {
            document.getElementById("submit-consent").disabled = true;
            CONSENT_DATA['consented'] = false;
            CONSENT_DATA['consentTime'] = null;
        }

        if (DEBUG){
            console.log(CONSENT_DATA);
        }
    };

    function submitConsent() {
        /*
            Consent has been submitted and we can move onto the next page.

            Hide all consent page content and activate (show) instruction
            page content.
        */
        // Hide Consent
        $("#consent-header").attr("hidden", true);
        $("#consent-main-content").attr("hidden", true);
        // Show Instructions
        

        if(DEBUG){
            $("#task-header").attr("hidden", false);
            $("#task-main-content").attr("hidden", false);

            // Load Main Experiment
            // $('#task-main-content').load('html/game-main-exp.html');


            // Write to Database
            // writeRealtimeDatabase(INTEGRITY_DB_PATH, INTEGRITY_DATA);

            
            $("#instructions-header").attr("hidden", false);
            $("#instructions-main-content").attr("hidden", false);

            $('#instructions-main-content').load("html/instructions.html");

            // $("#exp-survey-header").attr("hidden", false);
            // $("#survey-main-content").attr("hidden", false);

            // // Show Survey
            // $('#survey-main-content').load('html/survey-workload.html');

            // Write to Database
            //let path = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/consentData';
            // let path = EXPERIMENT_DATABASE_NAME + firebaseUserId + '/consentData';
            //writeRealtimeDatabase(path, CONSENT_DATA);

            // // Load Instructions
            
            
        }else {
            $("#instructions-header").attr("hidden", false);
            $("#instructions-main-content").attr("hidden", false);

            // Write to Database
            //let path = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/consentData';
            //writeRealtimeDatabase(path, CONSENT_DATA);

            // Load Instructions
            $('#instructions-main-content').load("html/instructions.html");
        }
    };
    /*
        Insert METADATA into page appropriately :)
    */

    //      Experiment Summary
    $('#experiment-summary').html(EXPERIMENT_SUMMARY);

    //      Time Commitment
    $('#time-commitment').text(TIME_COMMITMENT);

    //      Benefits and Risks
    $('#benefits-and-risks').html(BENEFITS_AND_RISKS);

    //      Eligibility Requirements
    $('#eligibility-requirements').html(ELIGIBILITY_REQUIREMENTS);

    //      Compensation
    $('#compensation').text(COMPENSATION);
    
    //      Recruitment Service
    $('#recruitment-service').text(RECRUITMENT_SERVICE);

    //      Comprehension Quiz
    $('#comprehension-quiz').text(COMPREHENTION_QUIZ);

    //      Lead Researcher Information
    $('#lead-researcher').text(LEAD_RESEARCHER);
    $('#lead-researcher-email').text(LEAD_RESEARCHER_EMAIL);
    $('#lead-researcher-email').attr(
        "href",
        "mailto:" + LEAD_RESEARCHER_EMAIL + "?Subject=Noisy%20Image%20Classification"
    );

    if (DEBUG){
        console.log("TESTING");
       // console.log("Firebase UserID:", firebaseUserId);
    }
    /*  WRITE TO FIREBASE */
    // Save URL parameters on the path: "[studyId]/participantData/[firebaseUserId]/participantInfo"
    // let pathnow = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/participantInfo';
    // writeURLParameters( pathnow );

    $('#terms').click(activateButton);
    $('#submit-consent').click(submitConsent);
});