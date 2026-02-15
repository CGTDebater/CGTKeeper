let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            let clap = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-clapping-crowd-485.mp3");
            clap.play();
        }, i * 700);
    }
}

function startTimer() {
    if (interval) return;

    interval = setInterval(() => {

        if (currentSeconds >= totalSeconds) {
            playClap(3);
            clearInterval(interval);
            interval = null;
            return;
        }

        currentSeconds++;
        document.getElementById("timer").innerText = formatTime(currentSeconds);

        updateQuestionVisibility();

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
    document.getElementById("questionBtn").style.display = "none";
    document.getElementById("questionBtn").disabled = false;
}

// 1–6 dk arası görünür
function updateQuestionVisibility() {
    let btn = document.getElementById("questionBtn");

    if (currentSeconds >= 60 && currentSeconds < 360) {
        btn.style.display = "inline-block";
    } else {
        btn.style.display = "none";
    }
}

// Butona basılınca
function questionTimer() {
    if (questionActive) return;
    startQuestion();
}

function startQuestion() {

    // 6.dk sonrası tamamen kapalı
    if (currentSeconds >= 360) return;

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
