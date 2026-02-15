let totalSeconds = 440; // 7 dakika 20 saniye
let currentSeconds = totalSeconds;
let interval = null;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function playClap(times) {
    let clap = document.getElementById("clap");
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            clap.currentTime = 0;
            clap.play();
        }, i * 600);
    }
}

function startTimer() {
    if (interval) return;

    interval = setInterval(() => {
        currentSeconds--;
        document.getElementById("timer").innerText = formatTime(currentSeconds);

        let elapsed = totalSeconds - currentSeconds;

        // 1. dakika (60 sn)
        if (elapsed === 60) playClap(1);

        // 6. dakika (360 sn)
        if (elapsed === 360) playClap(1);

        // 7. dakika (420 sn)
        if (elapsed === 420) playClap(2);

        // 7:20 (440 sn)
        if (elapsed === 440) {
            playClap(3);
            clearInterval(interval);
            interval = null;
        }

    }, 1000);
}

function resetTimer() {
    clearInterval(interval);
    interval = null;
    currentSeconds = totalSeconds;
    document.getElementById("timer").innerText = "07:20";
}

function questionTimer() {
    let questionSound = document.getElementById("questionSound");

    questionSound.currentTime = 0;
    questionSound.play();

    setTimeout(() => {
        questionSound.currentTime = 0;
        questionSound.play();
        alert("Soru süresi doldu!");
    }, 15000);
}
