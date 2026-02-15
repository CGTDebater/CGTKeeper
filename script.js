let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;

// SADECE BU AUDIO SİSTEMİNİ KULLANIYORUZ
const clapAudio = new Audio("clap.mp3");
const questionAudio = new Audio("question.mp3");

clapAudio.preload = "auto";
questionAudio.preload = "auto";

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            clapAudio.currentTime = 0;
            clapAudio.play().catch(() => {});
        }, i * 900);
    }
}

function playQuestionSound() {
    questionAudio.currentTime = 0;
    questionAudio.play().catch(() => {});
}

// Mobil için audio unlock
function unlockAudio() {
    clapAudio.play().then(() => {
        clapAudio.pause();
        clapAudio.currentTime = 0;
    }).catch(() => {});

    questionAudio.play().then(() => {
        questionAudio.pause();
        questionAudio.currentTime = 0;
    }).catch(() => {});
}

function startTimer() {
    if (interval) return;

    unlockAudio();

    interval = setInterval(() => {

        if (currentSeconds >= totalSeconds) {
            playClap(3);
            clearInterval(interval);
            interval = null;
            return;
        }

        currentSeconds++;
        document.getElementById("timer").innerText = formatTime(currentSeconds);

        if (currentSeconds === 60) playClap(1);
        if (currentSeconds === 360) playClap(1);
        if (currentSeconds === 420) playClap(2);

    }, 1000);
}

function resetTimer() {
    clearInterval(interval);
    clearInterval(questionInterval);

    interval = null;
    questionInterval = null;
    questionActive = false;
    currentSeconds = 0;

    document.getElementById("timer").innerText = "00:00";
    document.getElementById("questionCountdown").innerText = "";
    document.getElementById("questionBtn").disabled = false;
}

function questionTimer() {
    if (questionActive) return;

    questionActive = true;

    let btn = document.getElementById("questionBtn");
    let display = document.getElementById("questionCountdown");

    btn.disabled = true;

    let qTime = 15;
    display.innerText = `Soru: ${qTime}`;

    questionInterval = setInterval(() => {

        qTime--;
        display.innerText = `Soru: ${qTime}`;

        if (qTime <= 0) {
            clearInterval(questionInterval);
            questionInterval = null;
            display.innerText = "";
            questionActive = false;
            btn.disabled = false;

            playQuestionSound();
        }

    }, 1000);
}
