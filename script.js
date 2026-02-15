let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;

// CLAP AUDIO (LOCAL)
const clapBase = new Audio("clapping.m4a");
clapBase.preload = "auto";

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            const clap = clapBase.cloneNode();
            clap.play().catch(err => console.log("Clap error:", err));
        }, i * 800);
    }
}

function startTimer() {
    if (interval) return;

    // AUDIO UNLOCK
    clapBase.play().then(() => {
        clapBase.pause();
        clapBase.currentTime = 0;
    }).catch(() => {});

    interval = setInterval(() => {

        if (currentSeconds >= totalSeconds) {
            playClap(3); // 7:20
            clearInterval(interval);
            interval = null;
            return;
        }

        currentSeconds++;
        document.getElementById("timer").innerText = formatTime(currentSeconds);

        if (currentSeconds === 60) {
            playClap(1); // 1:00
        }

        if (currentSeconds === 360) {
            playClap(1); // 6:00
        }

        if (currentSeconds === 420) {
            playClap(2); // 7:00
        }

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

            speakText("Soru süresi doldu");
        }

    }, 1000);
}

function speakText(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "tr-TR";
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}
