"use strict";
var MAX_VALUE = 12; // largest number used in a problem
var MAX_TIME = null;
var timer = null;
var currentQuiz = null;
var userAnswers = [];
var userAnswers = [];
var questionIndex = null; // set to 0 if the question text is the zeroeth element of each subarray, and to 1 if the question text is the last element of each subarray
var currentQuestionIndex = null;
var timeLimit = null;
var multipleChoice = null;
var standardQuestionText = null;
var questionOrder = [];
var intervalId = null;

// Quiz objects
var polyatomicIonsQuiz = {title: "Common polyatomic ions",
                          questions: [["C<sub>2</sub>H<sub>3</sub>O<sub>2</sub><sup>-</sup>", "acetate"],
                                      ["CO<sub>3</sub><sup>2-</sup>", "carbonate"],
									  ["ClO<sub>3</sub><sup>-</sup>", "chlorate"],
                                      ["ClO<sub>2</sub><sup>-</sup>", "chlorite"],
                                      ["CrO<sub>4</sub><sup>2-</sup>", "chromate"],
                                      ["CN<sup>-</sup>", "cyanide"],
                                      ["Cr<sub>2</sub>O<sub>7</sub><sup>2-</sup>", "dichromate"],
                                      ["HCO<sub>3</sub><sup>-</sup>", "hydrogen carbonate"],
                                      ["HSO<sub>4</sub><sup>-</sup>", "hydrogen sulfate"],
                                      ["OH<sup>-</sup>", "hydroxide"],
									  ["ClO<sup>-</sup>", "hypochlorite"],
									  ["NO<sub>3</sub><sup>-</sup>", "nitrate"],
									  ["ClO<sub>4</sub><sup>-</sup>", "perchlorate"],
									  ["MnO<sub>4</sub><sup>-</sup>", "permanganate"],
									  ["NH<sub>4</sub><sup>+</sup>", "ammonium"],
                                      ["NH<sub>4</sub><sup>+</sup>", "ammonium"],
                                      ["PO<sub>4</sub><sup>3-</sup>", "phosphate"],
                                      ["SO<sub>4</sub><sup>2-</sup>", "sulfate"],
									  ["SO<sub>3</sub><sup>2-</sup>", "sulfite"],
                                      ["O<sub>2</sub><sup>2-</sup>", "peroxide"]],
                          firstAsQuestionText: "What ion has chemical formula ___?",
                          firstAsQuestionFakeAnswers: ["ammonia", "carbon dioxide", "sulfite", "hypochlorate", "water"],
                          lastAsQuestionText: "What is the chemical formula of ___?",
                          lastAsQuestionFakeAnswers: []};
                          
var stateCapitalsQuiz = {title: "State capitals",
                         questions: [["Alabama", "Montgomery"],
						                ["Alaska", "Juneau"],
										["Arizona", "Phoenix"],
										["Arkansas", "Little Rock"],
										["California", "Sacramento"],
										["Colorado", "Denver"],
										["Connecticut", "Hartford"],
										["Delaware", "Dover"],
										["Florida", "Tallahassee"],
										["Georgia", "Atlanta"],
										["Hawaii", "Honolulu"],
										["Idaho", "Boise"],
										["Illinois", "Springfield"],
										["Indiana", "Indianapolis"],
										["Iowa", "Des Moines"],
										["Kansas", "Topeka"],
										["Kentucky", "Frankfort"],
										["Louisiana", "Baton Rouge"],
										["Maine", "Augusta"],
										["Maryland", "Annapolis"],
										["Massachusetts", "Boston"],
										["Michigan", "Lansing"],
										["Minnesota", "St. Paul", [], ["St Paul", "Saint Paul"]],
										["Mississippi", "Jackson"],
										["Missouri", "Jefferson City"],
										["Montana", "Helena"],
										["Nebraska", "Lincoln"],
										["Nevada", "Carson City"],
										["New Hampshire", "Concord"],
										["New Jersey", "Trenton"],
										["New Mexico", "Santa Fe"],
										["New York", "Albany"],
										["North Carolina", "Raleigh"],
										["North Dakota", "Bismarck"],
										["Ohio", "Columbus"],
										["Oklahoma", "Oklahoma City"],
										["Oregon", "Salem"],
										["Pennsylvania", "Harrisburg"],
										["Rhode Island", "Providence"],
										["South Carolina", "Columbia"],
										["South Dakota", "Pierre"],
										["Tennessee", "Nashville"],
										["Texas", "Austin"],
										["Utah", "Salt Lake City"],
										["Vermont", "Montpelier"],
										["Virginia", "Richmond"],
										["Washington", "Olympia"],
										["West Virginia", "Charleston"],
										["Wisconsin", "Madison"],
										["Wyoming", "Cheyenne"]],
                         firstAsQuestionText: "What is the capital of ___?",
                         lastAsQuestionText: "___ is the capital of which state?"};                        

// TODO: read from web storage???
var quizzes = [polyatomicIonsQuiz, stateCapitalsQuiz];

// Set up the quiz settings menu when the document is ready
$( document ).ready(function(){
    // Set up quizzes menu
    for (var i = 0; i < quizzes.length; i++) {
        var quiz = quizzes[i];
		var quizOption = '<option value="' + i + '">' + quiz.title + '</option>';
        $("#quizzes").append($(quizOption));
		
		// If the user doesn't select anything, go with the first option (default)
		if (i === 0) {
			quizSelected(quiz);
		}
    }
	
	// Load question options for each quiz if it is selected
	$("#quizzes").change(function() {
		var selectedQuizIndex = parseInt($("#quizzes").val());
		var quiz = quizzes[selectedQuizIndex];
		quizSelected(quiz);
	});
	
	$("#start_button").click(startQuiz);
});

// If a quiz is selected, records the quiz, and configures the option regarding what question should be asked.
function quizSelected(quiz) {
	currentQuiz = quiz;
	if (quiz.firstAsQuestionText !== "PROHIBITIED" && quiz.lastAsQuestionText !== "PROHIBITED") {
		var questionOption = '<p>Select the <b>question</b> you want to be asked:<br> <input type="radio" name = "questionOption" id="zero" checked="checked">' + quiz.firstAsQuestionText + 
							   '</input> <br> <input type="radio" name="questionOption" id="one">' + quiz.lastAsQuestionText + '</input></p>';
		$("#select_question").html($(questionOption));
	} else {
		alert("prohibited???");
	}
}

// Starts the quiz.
function startQuiz() {
	// Get the time limit the user requested
    MAX_TIME = parseInt($("#time_limit").val());
	
	// If the user entered a time that was not a number, tell the user to try again
	if (isNaN(MAX_TIME) || MAX_TIME < 0) {
		alert("Sorry, you entered an invalid time limit. Please enter a positive integer for the time limit, or 0 if no limit is desired.");
		return;
	}
	
	// If the user did not desire a time limit, then set it to null
	if (!MAX_TIME || MAX_TIME === 0) {
		MAX_TIME = null;
		$("#time_unit").html("");
	} else {
		$("#time_unit").html(" sec");
	}
	
	// Empty out the table
	$("#results_title").html($(""));
	$("#table").empty();
	currentQuestionIndex = 0;
	
	// Reset stats
	$("#total").text("0");
	$("#correct").text("0");
	$("#percent").text("");
	$("#message").text("");
	
	// Determine the standard question text
    if ($("#zero").prop("checked") == true) {
        questionIndex = 0;
        standardQuestionText = currentQuiz.firstAsQuestionText;
    }
    else {
        questionIndex = 1;
        standardQuestionText = currentQuiz.lastAsQuestionText;
    }
    userAnswers = [];
	
	// Create a random question order
    questionOrder = [];
    for (var i = 0; i < currentQuiz.questions.length; i++) {
        questionOrder.push(i);
    }
    shuffle(questionOrder);
	
	// Check if user selected multiple choice, or fill in the blank
	if ($("#quiz_type").val() === "multiple_choice") {
		multipleChoice = true;
	} else {
		multipleChoice = false;
	}
	
	// Get the next problem
    nextProblem();
	
	// Add a submit button
	var submitButtonHtml = '<button onclick="guessChange()">Submit</button>';
	$("#submit_button").empty();
	$("#submit_button").append($(submitButtonHtml));
	
	// Add any additional buttons/input fields, depending on quiz type
	if (multipleChoice) {
		// If multiple choice, add a submit button
		var submitButtonHtml = '<button onclick="guessChange()">Submit</button>';
		$("#submit_button").empty();
		$("#submit_button").append($(submitButtonHtml));
		$("#press_enter").html("");
	} else {
		// If fill in the blank, add an input box
		var inputBoxHtml = '<input id="guess" type="text" size="15" maxlength="40" />'
		$("#input_space").empty();
		$("#input_space").append($(inputBoxHtml));
		
		// Delete the submit button, but let the user know to press "enter" instead
		$("#submit_button").empty();
		$("#press_enter").html("<em>Press Enter to submit your answer.</em>");
		
		// Tell the input box to execute the "guessChange" function when the enter key is pressed
		$('#guess').keypress(function (e) {
			if (e.which == 13) {
				guessChange();
				return false;
			}
		});
	}
	
	// Add a pause button
	var buttonHtml = '<button onclick="pauseQuiz()">Pause</button>';
	$("#pause_button").empty();
	$("#pause_button").append($(buttonHtml));
	
	// Add a start over button
	var startOverHtml = '<button onclick="startQuiz()">Start over</button>';
	$("#start_over_button").empty();
	$("#start_over_button").append($(startOverHtml));
}

// Choose a random question for the next quiz problem
function nextProblem() {
	// Figure out if this is the 1st, 2nd, ... or nth question
	var nthQuestion = parseInt($("#total").text());
	
	// If all of the questions have been asked, display a summary
    if (nthQuestion >= questionOrder.length) {
        $("#question").text("You completed the quiz! See below for a summary.");
		pauseTimer();
        printResults();
        return;
    }
	
	// Reset the timer to the max time
	if (MAX_TIME) {
		$("#time").text(MAX_TIME);
	} else {
		$("#time").text("No time limit");
	}
	resumeTimer();
	
	// Print the question
	$("#options").empty();
	currentQuestionIndex = questionOrder[parseInt($("#total").text())];
	var questionText = insertQuestionIntoStandardText(standardQuestionText,
                                                      currentQuiz.questions[currentQuestionIndex][questionIndex]);
	$("#question").html(questionText);
	
	if (multipleChoice) {
		printOptions(); // If multiple choice, present the options to choose from
	} else {
		$("#guess").val(""); // If fill-in-the-blank, clear the input box
	}
}

// Inserts the given specific question into the standard question text at the appropriate position.
function insertQuestionIntoStandardText(standardQuestionText, questionText) {
	// Try to find the ___ marker indicating where the actual question should be inserted
	var indexToBeInserted = standardQuestionText.indexOf("___");
	
	// If not found, then attach the question to the end of the standard text
	if (indexToBeInserted == -1) {
		indexToBeInserted = standardQuestionText.length;
	}
	
	// Replace the ___ marker with the specific question text
	return standardQuestionText.substring(0, indexToBeInserted) +
           "<b>" + questionText + "</b>" +
		   standardQuestionText.substring(indexToBeInserted + 3);
}

// Presents options to the user, for a multiple choice question.
function printOptions() {
	currentQuestionIndex = questionOrder[parseInt($("#total").text())];
	
	// Select which choice the correct answer will be 
	var correctAnswer = getCorrectAnswer(questionIndex, currentQuestionIndex)
	var correctOptionPosition = Math.floor(Math.random() * 4);
	var options = ["", "", "", ""];
	options[correctOptionPosition] = correctAnswer;
	
	// Build up a list of fake answers
	var answerIndex = 0;
	var fakeAnswers = currentQuiz.lastAsQuestionFakeAnswers;
	if (questionIndex === 0) {
		answerIndex = 1;
		fakeAnswers = currentQuiz.firstAsQuestionFakeAnswers;
	}
	var allFakeOptions = [];
	for (var i = 0; i < currentQuiz.questions.length; i++) {
		var fakeAnswer = currentQuiz.questions[i][answerIndex];
		if (fakeAnswer !== correctAnswer) {
			allFakeOptions.push(currentQuiz.questions[i][answerIndex]);
		}
	}
	
	// If other fake answers were explicitly defined, add them to the list of possible fake answers
	if (fakeAnswers) {
		for (var j = 0; j < fakeAnswers.length; j++) {
			allFakeOptions.push(fakeAnswers[j]);
		}
	}
	
	// Shuffle the list of fake answers
	shuffle(allFakeOptions);
	
	// Construct the order of options
	var fakeOptionIndex = 0;
	for (var k = 0; k < options.length; k++) {
		if (k !== correctOptionPosition) {
			options[k] = allFakeOptions[fakeOptionIndex];
			fakeOptionIndex++;
		}
	}
	
	// Display options to user
	var multipleChoiceHtml = "<form>";
	for (var i = 0; i < options.length; i++) {
		multipleChoiceHtml += ('<label><input type="radio" name="quizOption" id="' + i + '">' + options[i] + '</input></label><br />');
	}
	multipleChoiceHtml += "</form>";
	$("#options").empty();
	$("#options").append($(multipleChoiceHtml));
}

// Responds to a user's guess.
function guessChange() {
	if (multipleChoice) {
		userGuess = $('input[name="quizOption"]:checked').parent().text();
	} else {
		var userGuess = removeHtmlTags($("#guess").val());
	}
    var correctAnswers = getAllCorrectAnswers(questionIndex, currentQuestionIndex);
	
    // Record what the user guessed
    userAnswers[currentQuestionIndex] = userGuess;
    
    if (compareAnswers(userGuess, correctAnswers)) {
        // If the user was correct, note that
        increment("#correct");
        $("#message").css('color', 'green');
        $("#message").html("Correct!");
    } else {
        // If the user was incorrect, note that
        $("#message").css('color', 'red');
		var questionText = insertQuestionIntoStandardText(standardQuestionText,
                                                      currentQuiz.questions[currentQuestionIndex][questionIndex]);
        $("#message").html('Incorrect. The correct answer to the question "' + questionText + '" was <b>"' + correctAnswers[0] + '"</b>.');
    }
    
    // Move on to next problem
    increment("#total");
    calculatePercent();
    nextProblem();
}

// Helper function that accepts element's ID and increments its value
function increment(id, amount) {
    var number = parseInt($(id).text()) + (amount || 1);
    $(id).text(number);
    return number;
}

// Runs every second to tick down the timer.
function tick() {
    var seconds = increment("#time", -1);
    if (seconds <= 0) { // time up!!!
        increment("#total", 1);
        calculatePercent();
		
		// Record that the user did not provide an answer
        userAnswers[currentQuestionIndex] = "";
		
        // Display a message saying that the user ran out of time 
        var correctAnswer = "";
        if (questionIndex === 0) {
            correctAnswer = currentQuiz.questions[currentQuestionIndex][1];
        } else {
            correctAnswer = currentQuiz.questions[currentQuestionIndex][0];
        }
		$("#message").css('color', 'red');
		var questionText = insertQuestionIntoStandardText(standardQuestionText,
                                                      currentQuiz.questions[currentQuestionIndex][questionIndex]);
        $("#message").html('Sorry, you ran out of time. The correct answer to the question "' + questionText + '" was <b>"' + correctAnswer + '"</b>.');
        nextProblem();
    }
}

// Pauses the quiz.
function pauseQuiz() {
	pauseTimer();
	
	// Replace the "Pause" button with a "Resume" button
	var buttonHtml = '<button onclick="resumeTimer()">Resume</button>';
	$("#pause_button").empty();
	$("#pause_button").append($(buttonHtml));
	$("#pause_message").html('<b>Quiz paused.</b> Press the "resume" button to continue.');
}

// Pauses the timer.
function pauseTimer() {	
	// Set up timer. If the timer is running (intervalId != null), that means that 
	// we need to clear it first.
	if (intervalId != null) {
		clearInterval(intervalId);
	}
}

// Resumes the timer.
function resumeTimer() {
	// If the timer is running (intervalId != null), that means that 
	// we need to clear it first.
	if (intervalId != null) {
		clearInterval(intervalId);
	}
	if (MAX_TIME) {
		intervalId = setInterval(tick, 1000);
	}
	
	// Replace the "Resume" button with a "Pause" button
	var buttonHtml = '<button onclick="pauseQuiz()">Pause</button>';
	$("#pause_button").empty();
	$("#pause_button").append($(buttonHtml));
	$("#pause_message").html("");
}

// Calculates the percentage of questions (out of those asked so far) that the user got right.
function calculatePercent() {
	var percent = parseInt($("#correct").text()) * 100 / parseInt($("#total").text());
    $("#percent").html("(" + Math.round(percent) + "%)");
}

// Implementation of Fisher-Yates shuffle, taken from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(arrayToShuffle) {
    var currentIndex = arrayToShuffle.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = arrayToShuffle[currentIndex];
        arrayToShuffle[currentIndex] = arrayToShuffle[randomIndex];
        arrayToShuffle[randomIndex] = temporaryValue;
    }
    return arrayToShuffle;
}

// Prints a summary of the user's results in the last run-through of the quiz.
function printResults() {
	// Stop the timer
	pauseTimer();
	
	// Remove the user input box and multiple choice questions to avoid confusion
	$("#input_space").empty();
	$("#options").empty();
	$("#message").html("");
	$("#pause_button").empty();
	$("#submit_button").empty();
    var resultTitle = "<h3>You got " + $("#correct").html() + " out of " + $("#total").html() + " questions correct.</h3>"
    $("#results_title").html($(resultTitle));
    $("#press_enter").html("");
	
    // Create the table of results
    var tableHtml = "<table><tr><td><b>Question</b></td><td><b>Correct answer</b><td><b>Your answer</b></td></tr>"
	var array = currentQuiz.questions;
    for (var i = 0; i < array.length; i++) {
        var question = array[i][questionIndex];
        var correctAnswers = getAllCorrectAnswers(questionIndex, i);
        var correctOrIncorrectClass;
        if (compareAnswers(userAnswers[i], correctAnswers)) {
            correctOrIncorrectClass = "correct";
        } else {
            correctOrIncorrectClass = "incorrect";
        }
        tableHtml += "<tr class=" + correctOrIncorrectClass + ">" + "<td>" + question + "</td><td>" + correctAnswers[0] + "</td><td>" + userAnswers[i] + "</td><tr>";
    }
	tableHtml += "</table>";
	$("#table").empty();
	$("#table").append($(tableHtml));
}

// Gets the "preferred" correct answer for a given question. Note: more correct answers may be
// accepted, but if you want to simply display one, use this method.
function getCorrectAnswer(questionIndex, currentQuestionIndex) {
	return getAllCorrectAnswers(questionIndex, currentQuestionIndex)[0];
}

// Gets all of the correct answers for a given question, from the quiz array.
function getAllCorrectAnswers(questionIndex, currentQuestionIndex) {
    // Extract the correct answer from the array
	var array = currentQuiz.questions;
	var correctAnswers = [];
    if (questionIndex === 0) {
        correctAnswers.push(array[currentQuestionIndex][1]);
		
		// Add any alternate answers to the list of correct answers
		if (array[currentQuestionIndex].length >= 4) {
			for (var i = 0; i < array[currentQuestionIndex][3].length; i++) {
				correctAnswers.push(array[currentQuestionIndex][3][i]);
			}
		}
    } else {
		correctAnswers.push(array[currentQuestionIndex][0]);
		if (array[currentQuestionIndex].length >= 3) {
			for (var i = 0; i < array[currentQuestionIndex][2].length; i++) {
				correctAnswers.push(array[currentQuestionIndex][2][i]);
			}
		}
    }
	return correctAnswers;
}

// Compares whether the given user answer is equal to a correct answer (using a case-insensitive search
// that also strips out any HTML tags)
function compareAnswers(userAnswer, correctAnswers) {
	// If the user never submitted an answer (i.e. the timer ran out of time), return that
	// the user's answer was incorrect
	if (!userAnswer) {
		return false;
	}
	
	// Check the user's answer against all correct asnwers
	for (var i = 0; i < correctAnswers.length; i++) {
		var lowerCaseUserAnswer = userAnswer.toLowerCase();
		var correctAnswerWithoutHtmlTags = removeHtmlTags(correctAnswers[i]);
		var lowerCaseCorrectAnswer = correctAnswerWithoutHtmlTags.toLowerCase();
		if (lowerCaseUserAnswer === lowerCaseCorrectAnswer) {
			return true;
		}
	}
	
	// The user's answer did not match any correct answer, so return false
	return false;
}

// Removes the HTML tags from a given text string.
function removeHtmlTags(html) {
	var div = document.createElement("div");
	div.innerHTML = html;
	return div.textContent || div.innerText || "";
}