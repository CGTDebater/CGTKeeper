// script.js

// ─────────────────────────────────────────────
// FORMAT TANIMLARI
// ─────────────────────────────────────────────

const FORMATS = {
    bp: {
        speakers: ["HA1","MA1","HA2","MA2","HK1","MK1","HK2","MK2"],
        // Her konuşmacı için aynı ayar — [zil saniye dizisi, toplam süre, soru aktif mi]
        getSpeakerConfig: function(idx) {
            return {
                bellTimes:    [60, 360, 420, 440],
                totalSeconds: 440,
                questionEnabled: true
            };
        }
    },

    ws: {
        speakers: [
            "Hükümet 1",
            "Muhalefet 1",
            "Hükümet 2",
            "Muhalefet 2",
            "Hükümet 3",
            "Muhalefet 3",
            "Muhalefet Özet",
            "Hükümet Özet"
        ],
        getSpeakerConfig: function(idx) {
            // Son iki konuşmacı (6 ve 7 = Özet'ler)
            if (idx >= 6) {
                return {
                    bellTimes:    [180, 240],  // 3. ve 4. dakika
                    totalSeconds: 240,          // 4 dk
                    questionEnabled: false
                };
            }
            // Diğerleri (Hükümet/Muhalefet 1-3)
            return {
                bellTimes:    [60, 420, 480],  // 1. 7. 8. dakika
                totalSeconds: 480,              // 8 dk
                questionEnabled: true
            };
        }
    },
	
	ap: {
        speakers: [
            "Hükümet 1",
            "Muhalefet 1",
            "Hükümet 2",
            "Muhalefet 2",
            "Hükümet 3",
            "Muhalefet 3",
            "Muhalefet Özet",
            "Hükümet Özet"
        ],
        getSpeakerConfig: function(idx) {
            // Son iki konuşmacı (6 ve 7 = Özet'ler)
            if (idx >= 6) {
                return {
                    bellTimes:    [180, 240],  // 3. ve 4. dakika
                    totalSeconds: 240,          // 4 dk
                    questionEnabled: false
                };
            }
            // Diğerleri (Hükümet/Muhalefet 1-3)
            return {
                bellTimes:    [60, 360, 420],  // 1. 6. 7. dakika
                totalSeconds: 420,              // 7 dk
                questionEnabled: true
            };
        }
    },

	au: {
        speakers: [
            "Hükümet 1",
            "Muhalefet 1",
            "Hükümet 2",
            "Muhalefet 2",
            "Hükümet 3",
            "Muhalefet 3",
            "Muhalefet Özet",
            "Hükümet Özet"
        ],
        getSpeakerConfig: function(idx) {
            // Son iki konuşmacı (6 ve 7 = Özet'ler)
            if (idx >= 6) {
                return {
                    bellTimes:    [180, 240],  // 3. ve 4. dakika
                    totalSeconds: 240,          // 4 dk
                    questionEnabled: false
                };
            }
            // Diğerleri (Hükümet/Muhalefet 1-3)
            return {
                bellTimes:    [360, 480],  // 6. ve 8. dakika
                totalSeconds: 480,              // 7 dk
                questionEnabled: false
            };
        }
    },
    
	other: null  // Kullanıcı tanımlı
};

// ─────────────────────────────────────────────
// DURUM
// ─────────────────────────────────────────────

let currentFormat   = "bp";
let currentSpeaker  = 0;

let totalSeconds    = 440;
let bellTimes       = [60, 360, 420, 440];
let questionEnabled = true;

let currentSeconds    = 0;
let interval          = null;
let questionInterval  = null;
let questionActive    = false;
let questionCancelled = false;

// "Diğer" modu için kullanıcının kaydettiği ayarlar
let customBells = [60, 360, 420, 440];
let customTotal = 440;

// ─────────────────────────────────────────────
// SES
// ─────────────────────────────────────────────

const clapAudio     = new Audio("clap.mp3");
const questionAudio = new Audio("question.mp3");
clapAudio.preload     = "auto";
questionAudio.preload = "auto";

// ─────────────────────────────────────────────
// YARDIMCI
// ─────────────────────────────────────────────

function formatTime(s) {
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

// ─────────────────────────────────────────────
// BİLDİRİM SİSTEMİ
// ─────────────────────────────────────────────

let notifPermission = false;
let activeNotif     = null;
let notifUpdateInterval = null;

async function requestNotifPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
        notifPermission = true;
        return true;
    }
    const result = await Notification.requestPermission();
    notifPermission = result === "granted";
    updateNotifBtnUI();
    return notifPermission;
}

function updateNotifBtnUI() {
    const btn = document.getElementById("notifToggleBtn");
    if (!btn) return;
    if (!("Notification" in window)) {
        btn.textContent = "🔕 Desteklenmiyor";
        btn.disabled = true;
        return;
    }
    if (Notification.permission === "granted") {
        btn.textContent = "🔔 Bildirim Açık";
        btn.classList.add("notif-active");
    } else if (Notification.permission === "denied") {
        btn.textContent = "🚫 İzin Reddedildi";
        btn.classList.add("notif-denied");
    } else {
        btn.textContent = "🔔 Bildirimleri Aç";
        btn.classList.remove("notif-active", "notif-denied");
    }
}

async function toggleNotif() {
    if (Notification.permission === "granted") {
        // Kapatma: mevcut bildirimi kapat
        closeActiveNotif();
        notifPermission = false;
        // İzni tarayıcı seviyesinde iptal etmek mümkün değil, sadece bayrağı sıfırla
        updateNotifBtnUI();
    } else {
        await requestNotifPermission();
        if (notifPermission) showTimerNotif();
    }
}

function closeActiveNotif() {
    if (activeNotif) { activeNotif.close(); activeNotif = null; }
    if (notifUpdateInterval) { clearInterval(notifUpdateInterval); notifUpdateInterval = null; }
}

function buildNotifBody() {
    const speakers = getSpeakers();
    const spkName  = speakers[currentSpeaker] || "—";
    const time     = formatTime(currentSeconds);
    let   status   = interval ? "▶ Çalışıyor" : (currentSeconds > 0 ? "⏸ Duraklatıldı" : "⏹ Bekliyor");
    if (questionActive) status = "❓ Soru: " + (document.getElementById("questionCountdown").innerText || "");
    return `${spkName}  ·  ${time}  ·  ${status}`;
}

function showTimerNotif() {
    if (!notifPermission || Notification.permission !== "granted") return;
    closeActiveNotif();

    const speakers = getSpeakers();
    const spkName  = speakers[currentSpeaker] || "—";

    const n = new Notification("⏱ Timekeeper", {
        body: buildNotifBody(),
        tag:  "timekeeper-timer",
        renotify: false,
        silent: true,
        requireInteraction: true,
        actions: buildNotifActions()
    });

    n.onclick = () => { window.focus(); };
    activeNotif = n;

    // Her saniye güncelle
    notifUpdateInterval = setInterval(() => {
        if (!notifPermission) { closeActiveNotif(); return; }
        refreshNotif();
    }, 1000);
}

function buildNotifActions() {
    const acts = [];
    if (interval) {
        acts.push({ action: "stop",   title: "⏸ Durdur" });
    } else if (currentSeconds > 0) {
        acts.push({ action: "resume", title: "▶ Devam Et" });
    } else {
        acts.push({ action: "start",  title: "▶ Başlat" });
    }
    if (questionEnabled && !questionActive) {
        acts.push({ action: "question", title: "❓ Soru" });
    }
    if (questionActive) {
        acts.push({ action: "cancel", title: "✕ İptal" });
    }
    const speakers = getSpeakers();
    if (currentSpeaker < speakers.length - 1) acts.push({ action: "next", title: "▶▶ Sonraki" });
    if (currentSpeaker > 0)                   acts.push({ action: "prev", title: "◀◀ Önceki" });
    return acts;
}

function refreshNotif() {
    if (!notifPermission || Notification.permission !== "granted") return;
    closeActiveNotif();

    const n = new Notification("⏱ Timekeeper", {
        body: buildNotifBody(),
        tag:  "timekeeper-timer",
        renotify: false,
        silent: true,
        requireInteraction: true,
        actions: buildNotifActions()
    });

    n.onclick = () => { window.focus(); };

    // Notification action handler (Service Worker olmadan direkt dinle)
    n.addEventListener("close", () => { activeNotif = null; });
    activeNotif = n;
}

// Service Worker ile action butonları yakala
function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").then(reg => {
        console.log("SW kayıtlı:", reg.scope);
    }).catch(() => {});

    navigator.serviceWorker.addEventListener("message", e => {
        const action = e.data && e.data.action;
        if (!action) return;
        handleNotifAction(action);
    });
}

function handleNotifAction(action) {
    switch (action) {
        case "start":    startTimer();      break;
        case "stop":     stopTimer();       break;
        case "resume":   resumeTimer();     break;
        case "question": questionTimer();   break;
        case "cancel":   cancelQuestion();  break;
        case "next":     nextSpeaker();     break;
        case "prev":     prevSpeaker();     break;
    }
    // Bildirimi güncelle
    setTimeout(refreshNotif, 300);
}

// Timer fonksiyonlarını notification ile entegre et — wrapper
function withNotifRefresh(fn) {
    return function(...args) {
        fn.apply(this, args);
        if (notifPermission) setTimeout(refreshNotif, 200);
    };
}

// ─────────────────────────────────────────────
// SIDEBAR AÇ / KAPAT
// ─────────────────────────────────────────────

function openSidebar() {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarOpenBtn").classList.add("hidden");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOpenBtn").classList.remove("hidden");
}

// ─────────────────────────────────────────────
// FORMAT SEÇİMİ
// ─────────────────────────────────────────────

function setFormat(fmt) {
    currentFormat  = fmt;
    currentSpeaker = 0;

    // Sekme görünümü
    document.getElementById("fmtBP").classList.toggle("active",    fmt === "bp");
    document.getElementById("fmtWS").classList.toggle("active",    fmt === "ws");
	document.getElementById("fmtAP").classList.toggle("active",    fmt === "ap");
	document.getElementById("fmtAU").classList.toggle("active",    fmt === "au");
    document.getElementById("fmtOther").classList.toggle("active", fmt === "other");

    // Panel görünümleri
    const showCustom  = fmt === "other";
    const showPreset  = fmt !== "other";
    document.getElementById("customBellsPanel").style.display = showCustom ? "flex" : "none";
    document.getElementById("presetInfoPanel").style.display  = showPreset ? "block" : "none";

    if (fmt === "bp") {
        document.getElementById("presetInfoText").innerHTML =
            "⏱ Süre: <b>7:20</b><br>" +
            "🔔 1. zil: 1:00<br>" +
            "🔔 2. zil: 6:00<br>" +
            "🔔 3. zil: 7:00<br>" +
            "🔔 Son zil: 7:20<br>" +
            "💬 Soru: Aktif";
    } else if (fmt === "ws") {
        document.getElementById("presetInfoText").innerHTML =
            "<b>Hükümet / Muhalefet 1-3</b><br>" +
            "⏱ Süre: 8:00<br>" +
            "🔔 Ziller: 1:00 · 7:00 · 8:00<br>" +
            "💬 Soru: Aktif<br><br>" +
            "<b>Özet Konuşmacılar</b><br>" +
            "⏱ Süre: 4:00<br>" +
            "🔔 Ziller: 3:00 · 4:00<br>" +
            "🚫 Soru: devre dışı";
    } else if (fmt === "ap") {
        document.getElementById("presetInfoText").innerHTML =
            "<b>Hükümet / Muhalefet 1-3</b><br>" +
            "⏱ Süre: 7:00<br>" +
            "🔔 Ziller: 1:00 · 6:00 · 7:00<br>" +
            "💬 Soru: Aktif<br><br>" +
            "<b>Özet Konuşmacılar</b><br>" +
            "⏱ Süre: 4:00<br>" +
            "🔔 Ziller: 3:00 · 4:00<br>" +
            "🚫 Soru: Devre dışı";
    } else if (fmt === "au") {
        document.getElementById("presetInfoText").innerHTML =
            "<b>Hükümet / Muhalefet 1-3</b><br>" +
            "⏱ Süre: 8:00<br>" +
            "🔔 Ziller: 6:00 · 8:00<br>" +
            "🚫 Soru: Devre dışı<br><br>" +
            "<b>Özet Konuşmacılar</b><br>" +
            "⏱ Süre: 4:00<br>" +
            "🔔 Ziller: 3:00 · 4:00<br>" +
            "🚫 Soru: Devre dışı";
    }

    applySpeakerConfig();
    updateSpeaker();
    resetTimer();
}

// Mevcut konuşmacıya göre timer ayarlarını uygula
function applySpeakerConfig() {
    if (currentFormat === "other") {
        bellTimes       = [...customBells];
        totalSeconds    = customTotal;
        questionEnabled = true;
    } else {
        const cfg       = FORMATS[currentFormat].getSpeakerConfig(currentSpeaker);
        bellTimes       = cfg.bellTimes;
        totalSeconds    = cfg.totalSeconds;
        questionEnabled = cfg.questionEnabled;
    }

    // Soru butonunu göster/gizle
    const qBtn = document.getElementById("questionBtn");
    qBtn.style.display = questionEnabled ? "inline-block" : "none";
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("questionCountdown").innerText = "";
}

// ─────────────────────────────────────────────
// KONUŞMACI
// ─────────────────────────────────────────────

function getSpeakers() {
    if (currentFormat === "other") {
        return ["Konuşmacı"];   // Diğer modda tek konuşmacı
    }
    return FORMATS[currentFormat].speakers;
}

function updateSpeaker() {
    const spk = getSpeakers();
    document.getElementById("speakerName").innerText = spk[currentSpeaker];
    document.getElementById("prevSpeakerBtn").disabled = currentSpeaker === 0;
    document.getElementById("nextSpeakerBtn").disabled = currentSpeaker === spk.length - 1;
}

function prevSpeaker() {
    if (currentSpeaker > 0) {
        currentSpeaker--;
        applySpeakerConfig();
        updateSpeaker();
        resetTimer();
        if (notifPermission) setTimeout(refreshNotif, 200);
    }
}

function nextSpeaker() {
    const spk = getSpeakers();
    if (currentSpeaker < spk.length - 1) {
        currentSpeaker++;
        applySpeakerConfig();
        updateSpeaker();
        resetTimer();
        if (notifPermission) setTimeout(refreshNotif, 200);
    }
}

// ─────────────────────────────────────────────
// SES & EFEKT
// ─────────────────────────────────────────────

function playClap(times) {
    for (let i = 0; i < times; i++) {
        setTimeout(() => {
            clapAudio.currentTime = 0;
            clapAudio.play().catch(() => {});
        }, i * 900);
    }
}

function playQuestionSound() {
    if (document.getElementById("soundToggle").checked) {
        questionAudio.currentTime = 0;
        questionAudio.play().catch(() => {});
    }
}

function flashScreen() {
    setTimeout(() => document.body.className = "flash1", 0);
    setTimeout(() => document.body.className = "flash2", 300);
    setTimeout(() => document.body.className = "flash3", 600);
    setTimeout(() => document.body.className = "",        900);
}

// ─────────────────────────────────────────────
// TIMER
// ─────────────────────────────────────────────

function timerTick() {
    if (currentSeconds >= totalSeconds) {
        playClap(1);  // Son zil: her zaman 1 çalış (BP "other" modda 3 çalar — aşağıda özel)
        clearInterval(interval);
        interval = null;
        document.getElementById("stopBtn").style.display   = "none";
        document.getElementById("resumeBtn").style.display = "none";
        document.getElementById("startBtn").style.display  = "inline-block";
        return;
    }

    currentSeconds++;
    document.getElementById("timer").innerText = formatTime(currentSeconds);
    checkBells();
}

function checkBells() {
    const s = currentSeconds;

    if (currentFormat === "bp") {
        // BP orijinal davranış: son zilde 3 çalış
        if (s === bellTimes[0]) playClap(1);
        if (s === bellTimes[1]) playClap(1);
        if (s === bellTimes[2]) playClap(2);
        if (s === bellTimes[3]) playClap(3);
    } else if (currentFormat === "ws") {
        // WS: her zil için 1 çalış
        for (let b of bellTimes) {
            if (s === b) { playClap(1); break; }
        }
    } else {
        // Diğer: BP gibi 1-1-2-3
        if (s === bellTimes[0]) playClap(1);
        if (s === bellTimes[1]) playClap(1);
        if (s === bellTimes[2]) playClap(2);
        if (s === bellTimes[3]) playClap(3);
    }
}

function startTimer() {
    if (interval) return;
    interval = setInterval(timerTick, 1000);
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("stopBtn").style.display  = "inline-block";
    if (notifPermission) setTimeout(refreshNotif, 100);
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
    document.getElementById("stopBtn").style.display   = "none";
    document.getElementById("resumeBtn").style.display = "inline-block";
    if (notifPermission) setTimeout(refreshNotif, 100);
}

function resumeTimer() {
    if (interval) return;
    interval = setInterval(timerTick, 1000);
    document.getElementById("resumeBtn").style.display = "none";
    document.getElementById("stopBtn").style.display   = "inline-block";
    if (notifPermission) setTimeout(refreshNotif, 100);
}

function resetTimer() {
    clearInterval(interval);
    clearInterval(questionInterval);
    interval          = null;
    questionInterval  = null;
    currentSeconds    = 0;
    questionActive    = false;
    questionCancelled = false;

    document.getElementById("timer").innerText             = "00:00";
    document.getElementById("questionCountdown").innerText = "";

    document.getElementById("startBtn").style.display  = "inline-block";
    document.getElementById("stopBtn").style.display   = "none";
    document.getElementById("resumeBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "none";

    if (questionEnabled) {
        document.getElementById("questionBtn").disabled = false;
    }
}

// ─────────────────────────────────────────────
// SORU ZAMANLAYICISI
// ─────────────────────────────────────────────

function questionTimer() {
    if (!questionEnabled || questionActive) return;
    questionActive    = true;
    questionCancelled = false;

    let qTime = 15;
    document.getElementById("questionBtn").disabled        = true;
    document.getElementById("cancelBtn").style.display     = "inline-block";
    document.getElementById("questionCountdown").innerText = "Soru: 15";

    questionInterval = setInterval(() => {
        qTime--;
        document.getElementById("questionCountdown").innerText = "Soru: " + qTime;

        if (qTime <= 0) {
            clearInterval(questionInterval);
            questionInterval = null;
            document.getElementById("questionCountdown").innerText = "";
            document.getElementById("cancelBtn").style.display     = "none";
            document.getElementById("questionBtn").disabled        = false;
            questionActive = false;

            if (!questionCancelled) {
                playQuestionSound();
                flashScreen();
            }
        }
    }, 1000);
}

function cancelQuestion() {
    questionCancelled = true;
    questionActive    = false;
    clearInterval(questionInterval);
    questionInterval = null;
    document.getElementById("questionCountdown").innerText = "";
    document.getElementById("cancelBtn").style.display     = "none";
    document.getElementById("questionBtn").disabled        = false;
}

// ─────────────────────────────────────────────
// SIDEBAR — GİRİŞ DOĞRULAMA (Diğer modu)
// ─────────────────────────────────────────────

const inputIds = ["b1val","b2val","b3val","blastval"];
const dispIds  = ["b1disp","b2disp","b3disp","blastdisp"];
const errIds   = ["b1err","b2err","b3err","blasterr"];

function sanitizeInput(el) {
    let raw = el.value.replace(/[^0-9]/g, "");
    if (raw === "") { el.value = ""; return 0; }
    let n = parseInt(raw, 10);
    if (n < 1) n = 1;
    el.value = String(n);
    return n;
}

inputIds.forEach((id, i) => {
    const el = document.getElementById(id);

    el.addEventListener("keydown", function (e) {
        const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"];
        if (allowed.includes(e.key)) return;
        if (!/^[0-9]$/.test(e.key)) e.preventDefault();
    });

    el.addEventListener("input", function () {
        const v = sanitizeInput(this);
        document.getElementById(dispIds[i]).innerText = formatTime(v);
    });

    el.addEventListener("paste", function (e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData("text");
        const digits = pasted.replace(/[^0-9]/g, "");
        if (digits) {
            this.value = String(Math.max(1, parseInt(digits, 10)));
            sanitizeInput(this);
            document.getElementById(dispIds[i]).innerText = formatTime(parseInt(this.value) || 0);
        }
    });
});

function applyBells() {
    const vals = inputIds.map(id => parseInt(document.getElementById(id).value) || 0);
    let ok = true;
    errIds.forEach(id => document.getElementById(id).innerText = "");

    for (let i = 1; i < 4; i++) {
        if (vals[i] <= vals[i - 1]) {
            document.getElementById(errIds[i]).innerText =
                (i === 3 ? "Son zil" : "Bu zil") + " öncekinden büyük olmalı!";
            ok = false;
        }
    }
    if (!ok) return;

    customBells  = [...vals];
    customTotal  = vals[3];
    bellTimes    = [...customBells];
    totalSeconds = customTotal;
    resetTimer();

    const btn  = document.querySelector(".sidebar-apply");
    const orig = btn.innerText;
    btn.innerText = "✓ Uygulandı!";
    setTimeout(() => btn.innerText = orig, 1200);
}

// ─────────────────────────────────────────────
// BAŞLANGIÇ
// ─────────────────────────────────────────────

// customBellsPanel flex column olsun
document.getElementById("customBellsPanel").style.flexDirection = "column";
document.getElementById("customBellsPanel").style.gap = "10px";

// Başlangıçta BP modu aktif
setFormat("bp");

// Bildirim butonunu güncelle
updateNotifBtnUI();

// Service Worker kaydet (action butonları için)
registerServiceWorker();
