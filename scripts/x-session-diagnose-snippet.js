/**
 * Cole na console do x.com (logado). Não envia dados a servidores externos.
 * Copie a saída para calibrar headers/queryIds (docs/documentation/18_debug_x_sessao.md).
 */
(async () => {
  const cookieNames = ["auth_token", "ct0", "twid"];
  const cookies = cookieNames.map(name => ({ name, present: document.cookie.includes(`${name}=`) }));
  const bearerMatch = document.documentElement.innerHTML.match(
    /Bearer\s+(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]+)/,
  );
  const report = { cookies, bearerFromPage: Boolean(bearerMatch) };
  try {
    const ct0 = document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/)?.[1] ?? "";
    const bearer =
      bearerMatch?.[1] ??
      "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUgjRCZjsz1k7uOUHRg2W8o%3D1%3B1634725470%3B1634725470";
    const probe = await fetch("https://x.com/i/api/1.1/account/verify_credentials.json?skip_status=true", {
      credentials: "include",
      headers: {
        authorization: `Bearer ${bearer}`,
        "x-csrf-token": decodeURIComponent(ct0),
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-active-user": "yes",
        referer: "https://x.com/",
        origin: "https://x.com",
      },
    });
    const body = await probe.text();
    report.verifyCredentials = {
      status: probe.status,
      bodyPreview: body.slice(0, 200),
    };
  } catch (e) {
    report.verifyCredentials = { error: String(e) };
  }
  console.log("=== Social Unfollowers — diagnóstico X (sem segredos) ===");
  console.table(cookies);
  console.log(JSON.stringify(report, null, 2));
})();
