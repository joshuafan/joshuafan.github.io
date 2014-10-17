//constants
var POSSIBLE_WORDS = ["biology", "chemistry", "classroom", "dictionary", "geography", "internet", "mathematics", "physics", "programming", "textbook", "university"]
var MAX_GUESSES = 6;

//global variables
var word = ""; // word user is trying to guess
var guesses = ""; // letters guessed
var guessCount = MAX_GUESSES; // number of guesses user has left

function newGame() {
	$("message").innerHTML = ""; // clear messages
	var randomIndex = parseInt(Math.random() * POSSIBLE_WORDS.length);
	guessCount = MAX_GUESSES;
	guesses = ""; // clear guess count and guessed letters
	word = POSSIBLE_WORDS[randomIndex];
	updatePage();
}

function guessLetter() {
	$("message").innerHTML = ""; // clear messages
	var letterInputted = document.getElementById("guess");
	var letter = letterInputted.value;
	var clue = document.getElementById("clueText");
	if (letter == "" || guessCount == 0 || clue.innerHTML.indexOf("_") < 0) { // no more guesses
		return;
	}
	if (guesses.indexOf(letter) >= 0) { // letter has already been guessed
		$("message").innerHTML = "Sorry, you already guessed that. Try again.";
		$("guess").select();
		return;
	}
	guesses += letter;
	// check if letter guessed was correct
	if (word.indexOf(letter) < 0) {
		guessCount--; // incorrect guess
	}
	updatePage();
}

// Examines guesses that were made and displays the "clue" as well as guesses
function updatePage() {
	var clueString = "";
	for (var i = 0; i < word.length; i++) {
		var letter = word.charAt(i);
		if (guesses.indexOf(letter) >= 0) { // letter has been guessed; "guesses" string contains it
			clueString += letter += " ";
		} else {
			clueString += "_ ";
		}
	}
	
	$("guess").select(); // clear guess
	
	var clue = document.getElementById("clueText");
	clue.innerHTML = clueString;
	
	var guessesMade = document.getElementById("guessed");
	guessesMade.innerHTML = "Guesses made: " + guesses;
	
	if (guessCount == 0) {
		if (clueString.indexOf("_") >= 0) {
			$("message").innerHTML = "Sorry, you ran out of guesses. The word was '" + word + "'.";
		} else {
			$("message").innerHTML = "Congratulations! You win!";
		}
	} else if (clueString.indexOf("_") < 0) {
		$("message").innerHTML = "Congratulations! You win!";
	}
	var image = document.getElementById("hangmanPic");
	image.src = "hangman" + guessCount + ".png";		
}