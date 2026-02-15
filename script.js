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

function updatePOI() {
    let poi = document.getElementById("poiStatus");

    if (currentSeconds >= 60 && currentSeconds < 360) {
        poi.innerText = "POI OPEN";
        poi.className = "poi-open";
    } else {
        poi.innerText = "PROTECTED TIME";
        poi.className = "poi-closed";
    }
}

function startTimer() {
    if (interval) return;

    interval = setInterval(() => {

        currentSeconds++;
        document.getElementById("timer").innerText = formatTime(currentSeconds);

        updatePOI();

        if (currentSeconds === 60) playClap(1);
        if (currentSeconds === 360) playClap(1);
        if (currentSeconds === 420) playClap(2);

        if (currentSeconds === 440) {
            playClap(3);
            clearInterval(interval);
            interval = null;
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

    updatePOI();
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

// Başlangıçta doğru gösterim
updatePOI();
