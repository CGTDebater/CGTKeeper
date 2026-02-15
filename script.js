let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;

// LOCAL CLAP
let clapSound = new Audio("clapping.m4a");
clapSound.preload = "auto";

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            let sound = new Audio("clapping.m4a");
            sound.play().catch(() => {});
        }, i * 900);
    }
}

function startTimer() {
    if (interval) return;

    // Audio unlock (çok önemli)
    clapSound.play().then(() => {
        clapSound.pause();
        clapSound.currentTime = 0;
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

        updateQuestionVisibility();

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
    document.getElementById("questionBtn").style.display = "none";
    document.getElementById("questionBtn").disabled = false;
}

function updateQuestionVisibility() {
    let btn = document.getElementById("questionBtn");

    if (currentSeconds >= 60 && currentSeconds < 360) {
        btn.style.display = "inline-block";
    } else {
        btn.style.display = "none";
    }
}

function questionTimer() {
    if (questionActive) return;
    startQuestion();
}

function startQuestion() {

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
    window.speechSynthesis.speak(speech);
}
