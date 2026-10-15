/**
 * Cole no x.com LOGADO, depois de abrir sua lista de Seguidores (ou Seguindo)
 * para a SPA disparar requisições /i/api/. Aguarda até 30s.
 */
(function () {
  const KEY = "iu_x_api_header_mirror";
  const allow = new Set([
    "authorization",
    "x-csrf-token",
    "x-client-transaction-id",
    "x-client-uuid",
    "x-twitter-client-language",
    "x-twitter-auth-type",
    "x-twitter-active-user",
  ]);

  const orig = window.fetch;
  let captured = {};
  window.fetch = function (input, init) {
    const url = String(input);
    if (url.includes("/i/api/")) {
      const h = new Headers(init?.headers);
      h.forEach((v, k) => {
        const lower = k.toLowerCase();
        if (allow.has(lower) && v) {
          captured[lower] = v;
        }
      });
      try {
        localStorage.setItem(KEY, JSON.stringify(captured));
      } catch (e) {
        console.warn(e);
      }
    }
    return orig.apply(this, arguments);
  };

  console.log(
    "Socura: capturando headers por 30s. Navegue em Seguidores/Seguindo no X...",
  );
  setTimeout(() => {
    window.fetch = orig;
    console.log("Captura encerrada. Headers salvos em localStorage." + KEY);
    console.log(JSON.stringify(JSON.parse(localStorage.getItem(KEY) ?? "{}"), null, 2));
  }, 30_000);
})();
