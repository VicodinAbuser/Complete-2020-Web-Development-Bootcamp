// $('h1').css('color', 'orange')
let gamePattern = [];   //Keeps track of the required pattern
let userClickedPattern = [];    //Keeps track of the pattern entered by the user
let buttonColours = ['red', 'blue', 'green', 'yellow'];
let gameStarted = false;
let level = 0;


//Event Listener for a keypress. When a key is pressed, the heading is changed and the nextSequence function is called.

// if (window.matchMedia("(max-width: 700px)").matches) {
//
//     $("h1").text("Press anywhere to Start!");
//     $("body").on("tap", function() {
//         if (gameStarted === false) {
//             nextSequence();
//             $("h1").text("Level " + level);
//             gameStarted = true;
//         }
//     });
// } else {
//     $("h1").text("Press any key to start!");
//     $("body").on("keypress", function() {
//         if (gameStarted === false) {
//             nextSequence();
//             $("h1").text("Level " + level);
//             gameStarted = true;
//         }
//     });
// }

$('button').click(function() {
    if (gameStarted === false) {
        nextSequence();
        $("h1").text("Level " + level);
        gameStarted = true;
    }
});


//Event Listener for a mouse click. The id of the button which is clicked is extracted and pushed to the userClickedPattern array.
//Corresponding sound is played and animation is performed. Finally checkAnswer is called to see if the correct button is clicked.
$('.custom-btn').click(function() {

    let userChosenColour = $(this).attr('id');
    userClickedPattern.push(userChosenColour);
    playSound(userChosenColour);
    animatePress(userChosenColour);

    checkAnswer(userClickedPattern.length-1);

});

//Function to check the answer. The last clicked button is matched with last button of the game pattern. If correct, it is checked if
//the sequence is complete. If yes, nextSequence is called to get the next button to be pressed .
//Else, the Wrong sound is played, heading is changed, and startOver is called so that the game can restart.
function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
        if (userClickedPattern.length === gamePattern.length) {
            setTimeout(function () {
              nextSequence();
            }, 1000);
        }
    } else {
        playSound('wrong');
        $('body').addClass('game-over');
        setTimeout(function () {
            $('body').removeClass('game-over');
        }, 200);
        $('h1').text('Game Over! Press the button to Restart.');
        startOver();
    }
}


//userClickedPattern is set to empty array every time nextSequence is called. Level is incremented by 1 and level heading changed.
//A random number between 0-3 is generated to choose from the 4 buttons. Corresponding button is added to gamePattern.
//Animation is executed for that button and corresponding sound is played.
function nextSequence() {

    userClickedPattern = [];

    level++;
    $('h1').text('Level ' + level);

    let randomNumber = Math.floor(Math.random() * 4);
    let randomChosenColour = buttonColours[randomNumber];
    gamePattern.push(randomChosenColour);

    $('#' + randomChosenColour).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(randomChosenColour);
}

//Function to play audio
function playSound(name) {
    let audio = new Audio('./sounds/' + name + '.mp3');
    audio.play();
}

//Function to perform animation
function animatePress(currentColour) {
    $('#' + currentColour).addClass('pressed');
    setTimeout(function () {
        $('#' + currentColour).removeClass('pressed');
    }, 100);
}

//Function to rest everything back to what it is in the beginning so as to facilitate a restart.
function startOver() {
    gameStarted = false;
    level = 0;
    gamePattern = [];
}
