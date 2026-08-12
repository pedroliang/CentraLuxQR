/* Centralux QR — service worker
   Recebe arquivos .txt compartilhados via "Compartilhar via" do Android
   (Web Share Target) e entrega para a página importar. */

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (event.request.method === "POST" && url.pathname.endsWith("/share-target")) {
    event.respondWith((async function () {
      try {
        var formData = await event.request.formData();
        var text = "";
        var file = formData.get("file");
        if (file && typeof file.text === "function") {
          text = await file.text();
        }
        if (!text) {
          // sem arquivo: aceita texto compartilhado direto
          text = String(formData.get("text") || "");
        }
        var cache = await caches.open("share-inbox");
        await cache.put(
          "shared-report",
          new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
        );
      } catch (e) { /* segue para a página mesmo sem conteúdo */ }
      return Response.redirect("./index.html?shared=1", 303);
    })());
  }
});
