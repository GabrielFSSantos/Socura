/**
 * Cole na console do x.com (logado). Não envia dados a servidores externos.
 * Copie a saída para calibrar headers/queryIds (docs/PLATAFORMAS/x.md).
 */
(async () => {
  const cookieNames = ["auth_token", "ct0", "twid"];
  const cookies = cookieNames.map(name => ({ name, present: document.cookie.includes(`${name}=`) }));

  let bearerFromPage = document.documentElement.innerHTML.match(
    /Bearer\s+(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]+)/,
  )?.[1];
  if (!bearerFromPage) {
    for (const script of document.querySelectorAll("script")) {
      const m = (script.textContent ?? "").match(/(AAAAAAAAAAAAAAAAAAAAA[A-Za-z0-9%]{20,})/);
      if (m?.[1]) {
        bearerFromPage = m[1];
        break;
      }
    }
  }

  const report = { cookies, bearerFromPage: Boolean(bearerFromPage), probes: [] };
  try {
    const ct0Raw = document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/)?.[1] ?? "";
    const ct0 = (() => {
      try {
        return decodeURIComponent(ct0Raw);
      } catch {
        return ct0Raw;
      }
    })();
    const bearer =
      bearerFromPage ??
      "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUgjRCZjsz1k7uOUHRg2W8o%3D1%3B1634725470%3B1634725470";
    const headers = {
      authorization: `Bearer ${bearer}`,
      "x-csrf-token": ct0,
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-active-user": "yes",
      referer: "https://x.com/",
      origin: "https://x.com",
    };

    const probe = await fetch(
      "https://x.com/i/api/1.1/account/verify_credentials.json?skip_status=true",
      { credentials: "include", headers },
    );
    const body = await probe.text();
    report.probes.push({
      label: "verify_credentials",
      status: probe.status,
      bodyPreview: body.slice(0, 200),
    });

    const twid = document.cookie.match(/(?:^|;\s*)twid=([^;]+)/)?.[1] ?? "";
    let viewerId = null;
    try {
      const decoded = decodeURIComponent(twid);
      viewerId =
        decoded.match(/u[=:](\d{5,})/i)?.[1] ?? decoded.match(/(\d{10,})/)?.[1] ?? null;
    } catch {
      viewerId = null;
    }

    if (viewerId) {
      const params = new URLSearchParams({
        user_id: viewerId,
        count: "20",
        skip_status: "true",
        include_user_entities: "false",
      });
      const followers = await fetch(
        `https://x.com/i/api/1.1/followers/list.json?${params.toString()}`,
        { credentials: "include", headers },
      );
      const followersBody = await followers.text();
      report.probes.push({
        label: "followers_list",
        status: followers.status,
        bodyPreview: followersBody.slice(0, 200),
      });
    }
  } catch (e) {
    report.error = String(e);
  }
  console.log("=== Socura — diagnóstico X (sem segredos) ===");
  console.table(cookies);
  console.log(JSON.stringify(report, null, 2));
})();
