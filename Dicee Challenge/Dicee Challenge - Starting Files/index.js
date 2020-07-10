let randomNumberLeft = Math.ceil(Math.random() * 6);
let imageLeft = 'dice' + randomNumberLeft;
document.querySelector('img.img1').setAttribute('src', './images/' + imageLeft + '.png');

let randomNumberRight = Math.ceil(Math.random() * 6);
let imageRight = 'dice' + randomNumberRight;
document.querySelector('img.img2').setAttribute('src', './images/' + imageRight + '.png');


if (randomNumberLeft > randomNumberRight) {
    document.querySelector('h1').textContent = 'Player1 Wins!';
} else if (randomNumberLeft < randomNumberRight) {
    document.querySelector('h1').textContent = 'Player2 Wins!';
} else {
    document.querySelector('h1').textContent = "Draw!"
}
