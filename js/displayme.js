/**
 *  Display a random collage of images
 *  based on user interests.
 *
 *  @author  mod_ave
 *  @version 0.1
 */

/* Model. */

// Store list of words.
var stimuli = [];

// Store list of questions to ask the user.
var questions = [
    "who are you?",
    "what do you like to do?",
    "something that matters?",
    "who do you trust?",
    "what makes you feel safe?",
    "what makes you feel excited?",
    "where would you like to be?",
    "what does it mean to be you?",
    "a favourite place?",
    "something that makes you laugh?",
    "something that makes you sad?",
    "a favourite song?",
    "a sound that you love?",
    "a favourite smell?",
    "what do you want to be?",
    "a great movie?",
    "how do you pass the time?",
    "a reason to wake up?",
    "who is your hero?",
    "something you're scared of?",
    "a treasured item?"
];

// Store the last question asked to prevent a duplicate.
var lastQuestion;

// Store a list of image sources.
var images = [];

/* View. */

var questionField;
var inputField;
var responseField;
var finishField;

var ERROR_SMALL = "...too small";
var ERROR_DUPLICATE = "...deja vu";
var MIN_NUM = 5;

/* Controllers. */

// When the page has loaded.
$(document).ready(function(){

    // Get references to the HTML elements.
    questionField = $('#question');
    inputField = $('#input');
    responseField = $('#response');
    finishField = $('#finish');
    
    // Display a question.
    nextQuestion();
    
    // Register listener for input box.
    $(inputField).bind("keypress", {}, keypressInBox);
    function keypressInBox(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {                       
            e.preventDefault();
            pushResponse();
        }
    };

});

/**
 *  Display the next prompt to the user.
 */
function nextQuestion() {
    
    var tempQuestion = lastQuestion;
    
    while(tempQuestion == lastQuestion) {
        tempQuestion = questions[Math.floor(Math.random() * questions.length)];
    }
    lastQuestion = tempQuestion;       
    questionField.text(lastQuestion);
    
    // Check if the user may be done.
    if(stimuli.length > MIN_NUM) {
        $(finishField).fadeOut(function() {
            $(this).css('visibility', 'visible');
        }).fadeIn();
    }
    
}

/**
 *  Retrieve a resposne from the input field.
 */
function pushResponse() {
    
    // Parse it.
    var userResponse = $(inputField).val()/*.split(" ")[0]*/;
    
    // If the user response existed and is not duplicate... 
    if(userResponse == null || userResponse.length < 3) {        
        $(responseField).fadeOut(function() {
            $(this).text(ERROR_SMALL);
        }).fadeIn();
    }
    else if(stimuli.includes(userResponse)) {
        $(responseField).fadeOut(function() {
            $(this).text(ERROR_DUPLICATE);
        }).fadeIn();
    }
    else {
        // Add it.
        stimuli.push(userResponse);
        $(responseField).fadeOut(function() {
            $(this).text("..." + userResponse);
        }).fadeIn();
        // Remove what's there.
        $(inputField).val('');
        // Move onto the next question.
        nextQuestion();
    }
    
}

/**
 *  Collect images when user is finished
 *  inputting values.
 */
function finish() {
    
    $(finishField).html('..invoking images..');
    getRandomImageWithKeyword(0, stimuli.length);
    
}

/**
 *  Get a random image from Flickr and
 *  store it in the images.
 *
 *  @keyword the lookup string.
 */
function getRandomImageWithKeyword(i, j) {
    
    // If the number of images matches the number of words...
    if(i == j) {
        displayCollage();
        return;
    }
    
    // Use Flickr and jQuery to get a series of random images.
    $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
    {
        tags: stimuli[i],
        tagmode: "any",
        format: "json"
    },
    function(data) {

        // Choose a random picture from that.
        var rnd = Math.floor(Math.random() * data.items.length);
        
        if(data.items.length > 0 &&
          data.items[rnd]['media']['m'].replace("_m", "_b").indexOf("unavailable") == -1) {
            // Get the image source.
            images.push(data.items[rnd]['media']['m'].replace("_m", "_b"));
        }
        
        getRandomImageWithKeyword(i + 1, j);
        
    });
}

/*
 *  Display all of the pictures.
 */
function displayCollage() {
    
    /* Maths! */
    var n = images.length;
    var numColumns = Math.ceil(Math.sqrt(n));
    var cellWidth = 100 / numColumns;
    var numRows = Math.ceil((cellWidth * n) / 100);
    var cellHeight = 100 / numRows;
    cellWidth = cellWidth.toFixed(2);
    cellHeight = cellHeight.toFixed(2);
    var numMissing = (numColumns * numRows) - n;
    
    // Check for missing frames to populate.
    if(numMissing != 0) {
        if(numMissing < stimuli.length) {
            getRandomImageWithKeyword(0, numMissing);
        }
        else {
            getRandomImageWithKeyword(0, stimuli.length);
        }
        return;
    }
    
    // Display them.
    for(var i = 0; i < images.length; i++) { 
        $('#image-container').append(
            $('<div style="width: ' + cellWidth + '%; height: ' + cellHeight + '%"><img src="' + images[i] + '" /></div>').hide().fadeIn(1000).css('display', 'inline-block')
        );   
    }
    
    // Alter display to final state.
    $('#inputs').fadeOut();
    $('#footer').fadeOut();
    $('#finish').fadeOut();
    $('#after').fadeOut(function() {
        $(this).css('display', 'auto');
        $('#text-container').addClass("final");
    }).fadeIn();
    
}