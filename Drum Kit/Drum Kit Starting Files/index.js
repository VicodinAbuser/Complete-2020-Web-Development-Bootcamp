
let drums = document.querySelectorAll('.drum');

let sound = new Audio('./sounds/tom-1.mp3');

for (let i = 0; i < drums.length; i++) {
    drums[i].addEventListener('click', function() { sound.play() });

}
