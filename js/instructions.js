/*
instructions.js

    Author      :   Sheer Karny, Helio Tejeda
    University  :   University of California, Irvine
    Lab         :   Modeling and Decision-Making Lab (MADLAB)

Instruction Page METADATA file.

This file should contain static experimental metadata such as:
    - Debug (whether or not to activate debug mode)
    - Current instruction page
    - Total instruction pages
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
//     firebaseUserId
// } from "./firebasepsych1.0.js";

/******************************************************************************
    METADATA

        All metadata variables that are relevant to the instructions page.
******************************************************************************/

// BE SURE TO TURN THIS TO FALSE WHENEVER YOU GO LIVE WITH YOUR EXPERIMENT!!!
var DEBUG_INSTRUCTIONS          = false;

// Instruction Metadata
var CURRENT_INSTRUCTION_PAGE    = 1;
var TOTAL_INSTRUCTION_PAGES     = 2;
var PREVIOUS_BUTTON_DISABLED    = true;
var NEXT_BUTTON_PROCEED         = false;

var INSTRUCTION_PAGE_READ       = {
    "page-01": false,
    "page-02": false,
    // "page-03": false,
    // "page-04": false,
    // "page-05": false,
    // "page-06": false,
};

// Database Path
// var INSTRUCTIONS_DB_PATH        = EXPERIMENT_DATABASE_NAME + '/participantData/' + firebaseUserId + '/instructionData';


/******************************************************************************
    RUN ON PAGE LOAD

        Run the following functions as soon as the page is loaded. This will
        render the instructions.html page appropriately.
******************************************************************************/
$(document).ready(function (){
    var INSTRUCTION_START_TIME      = new Date();
    var INSTRUCTION_PAGE_TIME       = null;
    var INSTRUCTION_READ_TIME       = null;

    /******************************************************************************
        FUNCTIONALITY

            All functions that will be used for the instructions page.
    ******************************************************************************/
    function showInstructions() {
        /*
            Show the first page of instructions.
        */
        $('#instruction-page-' + CURRENT_INSTRUCTION_PAGE.toString().padStart(2, '0')).attr("hidden", false);
        INSTRUCTION_PAGE_TIME = new Date();

        // writeRealtimeDatabase(
        //     INSTRUCTIONS_DB_PATH + "/metadata",
        //     {
        //         "instructionStartTime": INSTRUCTION_START_TIME.toString(),
        //         "instructionCompleted": false,
        //     }
        // );
    }

    function finishInstructions() {
        /*
            This function is for DEBUG mode only!

            This gives you, the programmer, the option to skip instructions
            while you are debugging your experiment. It will just simply
            hide the instructions sections of the experiment and move onto
            the comprehension quiz.

            Params
            ------
            skip    :   boolean
                - Skip Instructions or not
        */
        let INSTRUCTION_END_TIME = new Date();
        if (DEBUG_INSTRUCTIONS){
            // writeRealtimeDatabase(
            //     INSTRUCTIONS_DB_PATH + "/metadata/instructionDebugMode",
            //     true
            // );
        };

        // Hide Instructions
        $("#instructions-header").attr("hidden", true);
        $("#instructions-main-content").attr("hidden", true);
        $("#instruction-task-interface").attr("hidden", true);
        // Show Comprehension Quiz
        // $("#comprehension-quiz-header").attr("hidden", false);
        $("#comprehension-quiz-main-content").attr("hidden", false);

        // Load Integrity Pledge
        $('#comprehension-quiz-main-content').load('html/instructions-gameplay-pg1.html');
        // $('#comprehension-quiz-main-content').load('html/integrity-pledge.html');
        

        // Write to Database
        // writeRealtimeDatabase(
        //     INSTRUCTIONS_DB_PATH + "/metadata/instructionCompleted",
        //     true
        // );
        // writeRealtimeDatabase(
        //     INSTRUCTIONS_DB_PATH + "/metadata/instructionEndTime",
        //     INSTRUCTION_END_TIME.toString()
        // );
        // writeRealtimeDatabase(
        //     INSTRUCTIONS_DB_PATH + "/metadata/instructionTotalTime",
        //     INSTRUCTION_END_TIME - INSTRUCTION_START_TIME
        // );
    };

    function replaceClass(element, remove, add) {
        /*
            Use jQuery to replace the class of the given element.
        */
    
        $(element).removeClass(remove);
        $(element).addClass(add);
    };

    // If options are not shown, then it doesn't matter that chatGPT discusses the other options
    // People will not know that it was considering other options. It could just be chatGPT
    // being extra and

    /*
    Look into all participant classifications
    for each category divide by number of participant that selected that category, then we have
    a percentage probability for each category for each image

    we can use this as a ECE graph for humans
    */
    function lowerOpacity() {
        /*
            Lower the opacity of all elements in the experiment example
            conatainer.
        */
        //  Topic Header
        $('#instruction-task-question-container-topic').css("opacity", 0.25);
        //  Question
        $('#instruction-trial-task-container').css("opacity", 0.25);
        //  Options
        $('#instruction-task-options-container').css("opacity", 0.25);
        //  GPT
        $('#instruction-task-gpt-container').css("opacity", 0.25);
        //  Likert
        $('#instruction-task-likert-scale-container').css("opacity", 0.25);
        //  Submit
        $('#instruction-task-submit-button-container').css("opacity", 0.25);
    }

    function restoreOpacity(elementID) {
        /*
            Restore the opacity of a given element.
        */
        $(elementID).css("opacity", 1);
    }

    function restoreAllOpacity() {
        /*
            Restore the opacity of all elements.
        */
        restoreOpacity("#instruction-task-question-container-topic");
        restoreOpacity("#instruction-trial-task-container");
        restoreOpacity("#instruction-task-options-container");
        restoreOpacity("#instruction-task-gpt-container");
        restoreOpacity("#instruction-task-likert-scale-container");
        restoreOpacity("#instruction-task-submit-button-container");
    }

    function removeAllHighlighting() {
        /*
            Remove all highlighting from the instructions.
        */
        highlightTopicHeader(false);
        highlightQuestion(false);
        highlightGPTExplanation(false);
        highlightLikertScale(false);
        highlightLikertScaleButton(false, "25");
        highlightLikertScaleButton(false, "100");
        highlightSubmitButton(false);
        highlightOptions(false);
        highlightOptionsButton(false, "B");

    }

    function highlightTopicHeader(highlight) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-task-question-container-topic').css({
                "background-color": "#f7eb5f",
                "border": "2px solid #f7eb5f",
                "color": "black"
            });
        } else {
            $('#instruction-task-question-container-topic').css({
                "background-color": "#0064a4",
                "border": "2px solid #0064a4",
                "color": "white"
            });
        }
    }

    function highlightQuestion(highlight) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-trial-task-container').css({
                "background-color": "#f7eb5f",
                "border-radius": "5px",
            });
        } else {
            $('#instruction-trial-task-container').css({
                "background-color": "",
                "border-radius": "",
            });
        }
    }

    function highlightGPTExplanation(highlight) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-task-gpt-container').css({
                "background-color": "#f7eb5f",
                "color": "black"
            });
            $('#instruction-task-gpt-header-container').css({
                "background-color": "#f7eb5f",
                "color": "black"
            });
        } else {
            $('#instruction-task-gpt-container').css({
                "background-color": "",
            });
            $('#instruction-task-gpt-header-container').css({
                "background-color": "",
                "color": ""
            });
        }
    }

    function highlightLikertScale(highlight) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-task-likert-scale-subcontainer').css({
                "background-color": "#f7eb5f",
                "border-radius": "5px"
            });
        } else {
            $('#instruction-task-likert-scale-subcontainer').css({
                "background-color": "",
                "border-radius": ""
            });
        }
    }

    function highlightLikertScaleButton(highlight, n) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-likert-button-' + n).css({
                "background-color": "#f7eb5f",
                "border-radius": "5px"
            });
        } else {
            $('#instruction-likert-button-' + n).css({
                "background-color": "",
                "border-radius": ""
            });
        }
    }

    function highlightSubmitButton(highlight) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-proceedMainexperiment').css({
                "background-color": "#f7eb5f",
                "color": "black"
            });
            $('#instruction-proceedMainexperiment').prop("disabled", false);
        } else {
            $('#instruction-proceedMainexperiment').css({
                "background-color": "",
                "color": ""
            });
            $('#instruction-proceedMainexperiment').prop("disabled", true);
        }
    }

    function highlightOptions(highlight) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-task-options-container').css({
                "background-color": "#f7eb5f",
                "border-radius": "5px",
                "color": "black"
            });
        } else {
            $('#instruction-task-options-container').css({
                "background-color": "",
                "border-radius": "",
                "color": ""
            });
        }
    }

    function highlightOptionsButton(highlight, b) {
        /*
            Turn on/off highlighting of the topic header.
        */
        if (highlight) {
            $('#instruction-participant-trial-option-' + b).css({
                "background-color": "#f7eb5f",
                "color": "black"
            });
            $('#instruction-participant-trial-option-' + b).prop("disabled", false);
        } else {
            $('#instruction-participant-trial-option-' + b).css({
                "background-color": "",
                "color": ""
            });
            $('#instruction-participant-trial-option-' + b).prop("disabled", true);
        }
    }

    function determineActionForInstructionPage() {
        if (CURRENT_INSTRUCTION_PAGE == 1){
            $('#instruction-example-task-container').attr("hidden", true);
        } else if (CURRENT_INSTRUCTION_PAGE == 2){
            $('#instruction-example-task-container').attr("hidden", false);
            restoreAllOpacity();
            removeAllHighlighting();
            // $('#comprehension-quiz-main-content').load('html/instructions-gameplay.html');
        } else if (CURRENT_INSTRUCTION_PAGE == 3){
            //lowerOpacity();
            //restoreOpacity("#instruction-task-question-container-topic");
            removeAllHighlighting();
            //highlightTopicHeader(true);
        } else if (CURRENT_INSTRUCTION_PAGE == 4){
            //lowerOpacity();
            //restoreOpacity("#instruction-trial-task-container");
            removeAllHighlighting();
            //highlightQuestion(true);
        } else if (CURRENT_INSTRUCTION_PAGE == 5){
            $('#next-button').prop("disabled", false);
            //lowerOpacity();
            restoreOpacity("#instruction-task-options-container");
            removeAllHighlighting();
            //highlightOptions(true);
        } else if (CURRENT_INSTRUCTION_PAGE == 6){
            $('#instruction-example-task-container').attr("hidden", false);
            //lowerOpacity();
            //restoreOpacity("#instruction-task-options-container");
            $('#next-button').prop("disabled", false);
            removeAllHighlighting();
        }  else if (CURRENT_INSTRUCTION_PAGE == 7){
            replaceClass('#instruction-participant-trial-option-B', "btn-primary", "btn-dark");
            $('#next-button').prop("disabled", false);
            lowerOpacity();
            restoreOpacity("#instruction-task-likert-scale-container");
            removeAllHighlighting();
            //highlightLikertScale(true);
        }
    };

    // Instruction Page Navigation Buttons
    function previousInstructionButton() {
        /*
            Instructions previous button functionality.

            This function will control what is exectued when the "Previous"
            button is selected. Once selected, the previous instruction page
            will be rendered for the participant to see. This will be
            reflected in the variable CURRENT_INSTRUCTION_PAGE.

            NOTE:
                The "Previous" button is disabled whenever a participant is
                on the 1st page of instructions (there is no previous page
                to go to).
        */

        // Decrement current instruction page
        CURRENT_INSTRUCTION_PAGE--;

        // If the current instruction page is 1, then we need to disable
        //  the "Previous" button.
        if (CURRENT_INSTRUCTION_PAGE == 1) {
            $("#previous-button").prop('disabled', PREVIOUS_BUTTON_DISABLED);
            PREVIOUS_BUTTON_DISABLED = true;
            $("#previous-button").prop('disabled', PREVIOUS_BUTTON_DISABLED);
        }

        // Make a note of what the previous instruction page was
        let previous_instruction_number = CURRENT_INSTRUCTION_PAGE + 1;

        // Update the coloring on the pagination section
        $("#instruction-" + previous_instruction_number).css(
            {"color": "#5a6268", "background-color": "#ffffff"}
        );
        $("#instruction-" + CURRENT_INSTRUCTION_PAGE).css(
            {"background-color": "#6c757d", "color": "#ffffff"}
        );

        // Change the instruction page that is being shown to participant
        $("#instruction-page-" + previous_instruction_number.toString().padStart(2, '0')).attr("hidden", true);
        $("#instruction-page-" + CURRENT_INSTRUCTION_PAGE.toString().padStart(2, '0')).attr("hidden", false);
        
        // If we move away from the final instruction page, we need to
        //  change the button color and wording back to "Next" instead
        //  of "Proceed"
        if (NEXT_BUTTON_PROCEED){
            $("#next-button").text("Next");
            $("#next-button").attr("class", "btn btn-secondary");
        }

        determineActionForInstructionPage();
        
        // For DEBUG purposes
        console.log( 'Instruction Number' + CURRENT_INSTRUCTION_PAGE );
    };

    function nextInstructionButton() {
        /*
            Instructions next button functionality.

            This function will control what is exectued when the "Next"
            button is selected. Once selected, the next instruction page
            will be rendered for the participant to see. This will be
            reflected in the variable CURRENT_INSTRUCTION_PAGE.

            NOTE:
                The "Next" button is converted to a "Proceed" button
                whenever the participant has reached the last instruction
                page.
        */
        let instruction_page_already_read = INSTRUCTION_PAGE_READ['page-' + CURRENT_INSTRUCTION_PAGE.toString().padStart(2, '0')];
        console.log(instruction_page_already_read);
        if (! instruction_page_already_read){
            // Finished reading previous instruction page (for the first time)
            INSTRUCTION_READ_TIME = new Date();

            let page_string = 'instructionPage' + CURRENT_INSTRUCTION_PAGE.toString().padStart(2, '0');
            console.log(page_string);
            
            let toWrite = {
                'pageRead': true,
                'readTime': INSTRUCTION_READ_TIME - INSTRUCTION_PAGE_TIME
            };
            // writeRealtimeDatabase(
            //     INSTRUCTIONS_DB_PATH + "/" + page_string,
            //     toWrite
            // );
            INSTRUCTION_PAGE_READ['page-' + CURRENT_INSTRUCTION_PAGE.toString().padStart(2, '0')] = true;
        }
        
        //  Reset input radio buttons
        $('input:checked').prop('checked', false);

        // Increment current instruction page
        CURRENT_INSTRUCTION_PAGE++;

        // Make a note of what the previous instruction page was
        let previous_instruction_number = CURRENT_INSTRUCTION_PAGE - 1;

        // Update the coloring on the pagination section
        $("#instruction-" + previous_instruction_number).css(
            {"color": "#5a6268", "background-color": "#ffffff"}
        );
        $("#instruction-" + CURRENT_INSTRUCTION_PAGE).css(
            {"background-color": "#6c757d", "color": "#ffffff"}
        );

        // Change the instruction page that is being shown to participant
        $("#instruction-page-" + previous_instruction_number.toString().padStart(2, '0')).attr("hidden", true);
        showInstructions();
        // $("#instruction-page-" + CURRENT_INSTRUCTION_PAGE.toString().padStart(2, '0')).attr("hidden", false);
        

        // If we move to the final instruction page, we need to
        //  change the button color and wording back to "Next" button
        //  to be "Proceed"
        if (CURRENT_INSTRUCTION_PAGE == TOTAL_INSTRUCTION_PAGES) {
            // Instructions are done!
            console.log("INSTRUCTIONS DONE!");
            NEXT_BUTTON_PROCEED = true;
            $("#next-button").text("Proceed");
            $("#next-button").attr("class", "btn btn-primary");
        }
        // If we increment greater than the total instruction page count
        //  then we know we have clicked the proceed button and are
        //  done with the instructions completely. We can now move onto
        //  the comprehension quiz section.
        else if (CURRENT_INSTRUCTION_PAGE > TOTAL_INSTRUCTION_PAGES) {
            finishInstructions();
        }

        // Enable the "Previous" button whenever we are past the 1st
        //  instruction page.
        if (CURRENT_INSTRUCTION_PAGE > 1){
            if (PREVIOUS_BUTTON_DISABLED){
                PREVIOUS_BUTTON_DISABLED = false;
                $("#previous-button").prop('disabled', PREVIOUS_BUTTON_DISABLED);
                $("#instruction-task-interface").attr('hidden', false)
            }
        }

        determineActionForInstructionPage();

        // For DEBUG purposes
        console.log( 'Instruction Number' + CURRENT_INSTRUCTION_PAGE );
    };

    function disablePreviousButton() {
        /*
            Disable Previous Button if Instruction Page Number is 1
        */
        if (CURRENT_INSTRUCTION_PAGE == 1){
            $("#previous-button").prop('disabled', PREVIOUS_BUTTON_DISABLED);
        }
    };

    function createPaginationButtons() {
        /*
            Create pagination buttons.

            This will automatically create all of the numbers "button"s for
            all of the indivisual instruction pages. These buttons are
            disabled, but they will allow the participant to visualize
            where they are in the instructions. 

            These numbers will change color to reflect the current instruction
            page the participant is on. The current page will be darker than
            all other options.
        */
        var i;
        for (i = 1; i <= TOTAL_INSTRUCTION_PAGES; i++){
            var disabled;
            var style;
            if (CURRENT_INSTRUCTION_PAGE > i){
                disabled = "";
                style = " style='color: #5a6268'";
            } else if (CURRENT_INSTRUCTION_PAGE == i) {
                disabled = "disabled";
                style = " style='background-color: #6c757d; color: #ffffff'";
            } else {
                disabled = "disabled";
                style = "";
            }
            $("#instruction-pages").append(
            `
            <button id="instruction-` + i + `" name="` + i + `" value="` + i + `" type="submit" class="btn btn-link" ` + disabled + style + `>
                ` + i + `
            </button>
            `
            );
        };
    };

    function debugInstructions() {
        /*
            Turn on instructions debugging.

            This will render the "Skip Instructions" button so that you
            as the programmer can skip this whenever necessary.
        */
        if (DEBUG_INSTRUCTIONS){
            $("#debug-mode-skip-instructions").attr("hidden", false);
            $("#skip-instructions-button").click(finishInstructions);
        } else{
            $("#debug-mode-skip-instructions").html('');
        }
    };

    // Disable the "Previous" button at the start of instructions
    disablePreviousButton();

    // Create the pagination number buttons
    createPaginationButtons();

    showInstructions();

    $('#previous-button').click(previousInstructionButton);
    $('#next-button').click(nextInstructionButton);

    // Determine if we are in DEBUG mode
    debugInstructions();
});