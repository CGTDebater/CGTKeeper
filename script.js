let totalSeconds = 440; // 7:20
let currentSeconds = 0;
let interval = null;

let questionInterval = null;
let questionActive = false;

// AUDIO DOSYALARI
const clapBase = new Audio("clap.mp3");
clapBase.preload = "auto";

const questionBase = new Audio("question.mp3");
questionBase.preload = "auto";

const clapAudio = document.getElementById("clapAudio");
const questionAudio = document.getElementById("questionAudio");

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            const sound = clapBase.cloneNode();
            sound.play().catch(e => console.log("Clap error:", e));
        }, i * 900);
    }
}

function playQuestionSound() {
    const sound = questionBase.cloneNode();
    sound.play().catch(e => console.log("Question sound error:", e));
}

function startTimer() {
    if (interval) return;

    // AUDIO UNLOCK (çok önemli)
    Promise.all([
        clapBase.play().then(() => {
            clapBase.pause();
            clapBase.currentTime = 0;
        }).catch(() => {}),
        questionBase.play().then(() => {
            questionBase.pause();
            questionBase.currentTime = 0;
        }).catch(() => {})
    ]);

    interval = setInterval(() => {

        if (currentSeconds >= totalSeconds) {
            playClap(3); // 7:20
            clearInterval(interval);
            interval = null;
            return;
        }

        currentSeconds++;
        document.getElementById("timer").innerText = formatTime(currentSeconds);

        if (currentSeconds === 60) playClap(1);   // 1:00
        if (currentSeconds === 360) playClap(1);  // 6:00
        if (currentSeconds === 420) playClap(2);  // 7:00

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

            playQuestionSound(); // MP3 ÇALIYOR
        }

    }, 1000);
}

