/**
 * UNIFIED AUTOMATED BPB & ZEUS PANEL - PART 1
 */

const AUTOMATED_SOURCES = {
  PROXY_BANKS: [
    "https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/normal/vless"
  ],
  CLEAN_IP_POOLS: [
    "104.21.24.70", "104.16.0.1", "104.17.0.1", "104.18.0.1", "162.159.0.1",
    "172.64.0.1", "104.20.10.1", "zula.ir", "snapp.ir", "digikala.com", "mci.ir"
  ],
  PORTS: [443, 8443, 2053, 2083, 2087, 2096]
};

const LOCATIONS = [
  { loc: "loc-1", flag: "🇳🇱", name: "NL-Amsterdam" },
  { loc: "loc-2", flag: "🇩🇪", name: "DE-Frankfurt" },
  { loc: "loc-3", flag: "🇫🇷", name: "FR-Paris" },
  { loc: "loc-4", flag: "🇬🇧", name: "GB-London" },
  { loc: "loc-5", flag: "🇺🇸", name: "US-NewYork" }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const host = url.hostname;

    const uuid = (env.BPB_ZEUS_KV && await env.BPB_ZEUS_KV.get("UUID")) || env.UUID || "50414e45-4c5f-5a45-5553-664a0bcb3212";
    const shortUuid = uuid.split("-").pop() || "664a0bcb3212";

    if (pathname === "/panel" || pathname === "/admin") {
      return renderDashboard(request, uuid);
    }

    if (pathname.startsWith("/sub")) {
      const generatedConfigs = [];

      LOCATIONS.forEach((item, index) => {
        const cleanIp = AUTOMATED_SOURCES.CLEAN_IP_POOLS[index % AUTOMATED_SOURCES.CLEAN_IP_POOLS.length];
        const port = AUTOMATED_SOURCES.PORTS[index % AUTOMATED_SOURCES.PORTS.length];
        const pathEncoded = encodeURIComponent(`/stream/PANEL_ZEUS/${shortUuid}/${item.loc}`);
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const tagEncoded = encodeURIComponent(`ZEUS | ${item.flag} ${item.name}:${port} | ${randomNumber}`);

        const vlessConfig = `vless://${uuid}@${cleanIp}:${port}?path=${pathEncoded}&security=tls&encryption=none&insecure=0&host=${host}&fp=unsafe&type=ws&allowInsecure=0&sni=${host}#${tagEncoded}`;
        generatedConfigs.push(vlessConfig);
      });const externalProxies = await fetchAutoProxies();
      const finalSubscription = [...generatedConfigs, ...externalProxies].join("\n");

      return new Response(btoa(unescape(encodeURIComponent(finalSubscription))), {
        headers: { 
          "Content-Type": "text/plain; charset=utf-8", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    return new Response("Zeus Multi-Port & Multi-IP Worker Active", { status: 200 });
  }
};

async function fetchAutoProxies() {
  try {
    const res = await fetch(AUTOMATED_SOURCES.PROXY_BANKS[0]);
    if (!res.ok) return [];
    const text = await res.text();
    let decoded = text;
    try { decoded = atob(text.trim()); } catch (e) {}
    return decoded.split("\n").map(l => l.trim()).filter(l => l.startsWith("vless://")).slice(0, 3);
  } catch (e) {
    return [];
  }
}

function renderDashboard(request, uuid) {
  const html = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>پنل اختصاصی Zeus</title>
      <style>
        body { font-family: Tahoma, sans-serif; background: #0b132b; color: #fff; padding: 30px; text-align: center; }
        .card { background: #1c2541; padding: 25px; border-radius: 12px; max-width: 600px; margin: 0 auto; }
        .info { background: #0b132b; padding: 10px; border-radius: 6px; margin: 10px 0; font-family: monospace; text-align: right; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>پنل یکپارچه با پورت‌ها و لوکیشن‌های متنوع</h2>
        <div class="info">UUID: ${uuid}</div>
        <br>
        <a href="/sub" style="color: #38bdf8;">دریافت خروجی لینک اشتراک (/sub)</a>
      </div>
    </body>
    </html>
  `;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
