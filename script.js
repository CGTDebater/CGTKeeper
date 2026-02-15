let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;
let questionCancelled = false;

// AUDIO
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

function timerTick() {

    if (currentSeconds >= totalSeconds) {
        playClap(3);
        clearInterval(interval);
        interval = null;

        document.getElementById("stopBtn").style.display = "none";
        document.getElementById("resumeBtn").style.display = "none";
        document.getElementById("startBtn").style.display = "inline-block";

        return;
    }

    currentSeconds++;
    document.getElementById("timer").innerText = formatTime(currentSeconds);

    if (currentSeconds === 60) playClap(1);
    if (currentSeconds === 360) playClap(1);
    if (currentSeconds === 420) playClap(2);
}

// BAŞLAT
function startTimer() {
    if (interval) return;

    unlockAudio();

    interval = setInterval(timerTick, 1000);

    document.getElementById("startBtn").style.display = "none";
    document.getElementById("stopBtn").style.display = "inline-block";
}

// DURDUR
function stopTimer() {
    if (!interval) return;

    clearInterval(interval);
    interval = null;

    document.getElementById("stopBtn").style.display = "none";
    document.getElementById("resumeBtn").style.display = "inline-block";
}

// DEVAM
function resumeTimer() {
    if (interval) return;

    interval = setInterval(timerTick, 1000);

    document.getElementById("resumeBtn").style.display = "none";
    document.getElementById("stopBtn").style.display = "inline-block";
}

// RESET
function resetTimer() {
    clearInterval(interval);
    clearInterval(questionInterval);

    interval = null;
    questionInterval = null;
    questionActive = false;
    questionCancelled = false;
    currentSeconds = 0;

    document.getElementById("timer").innerText = "00:00";
    document.getElementById("questionCountdown").innerText = "";
    document.getElementById("questionBtn").disabled = false;
    document.getElementById("cancelBtn").style.display = "none";

    document.getElementById("startBtn").style.display = "inline-block";
    document.getElementById("stopBtn").style.display = "none";
    document.getElementById("resumeBtn").style.display = "none";
}

// SORU
function questionTimer() {
    if (questionActive) return;

    questionActive = true;
    questionCancelled = false;

    let btn = document.getElementById("questionBtn");
    let cancelBtn = document.getElementById("cancelBtn");
    let display = document.getElementById("questionCountdown");

    btn.disabled = true;
    cancelBtn.style.display = "inline-block";

    let qTime = 15;
    display.innerText = `Soru: ${qTime}`;

    questionInterval = setInterval(() => {

        qTime--;
        display.innerText = `Soru: ${qTime}`;

        if (qTime <= 0) {
            clearInterval(questionInterval);
            questionInterval = null;

            display.innerText = "";
            cancelBtn.style.display = "none";
            questionActive = false;
            btn.disabled = false;

            if (!questionCancelled) {
                playQuestionSound();
            }
        }

    }, 1000);
}

// İPTAL
function cancelQuestion() {
    if (!questionActive) return;

    questionCancelled = true;

    clearInterval(questionInterval);
    questionInterval = null;

    document.getElementById("questionCountdown").innerText = "";
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("questionBtn").disabled = false;

    questionActive = false;
}
