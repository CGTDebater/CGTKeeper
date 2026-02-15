let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;

// CLAP BASE
const clapBase = new Audio();
clapBase.src = "clap.mp3";
clapBase.load();

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            const sound = new Audio("clap.mp3");
            sound.play().catch(e => console.log(e));
        }, i * 900);
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

            speakText("Soru süresi doldu");
        }

    }, 1000);
}

function speakText(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "tr-TR";
    window.speechSynthesis.speak(speech);
}
