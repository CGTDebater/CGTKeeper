// sw.js — Timekeeper Service Worker
// Bildirim action butonlarını yakalar ve ana sayfaya iletir

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", function(e) {
    e.notification.close();

    const action = e.action; // "start" | "stop" | "resume" | "question" | "cancel" | "next" | "prev"

    e.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
            if (clients.length > 0) {
                // Mevcut sekmeye mesaj gönder
                clients[0].postMessage({ action: action || "focus" });
                return clients[0].focus();
            }
            // Sekme yoksa aç
            return self.clients.openWindow("/");
        })
    );
});
