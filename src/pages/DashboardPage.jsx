import { useEffect, useRef, useState } from "react";

const TENANTS = [
  { name: "KCI",             icon: "🚆", color: "text-blue-400  border-blue-400",  accent: "#60a5fa", desc: "Kereta Cepat Indonesia",                   cols: 37, status: "ACTIVE" },
  { name: "DJKI",            icon: "🏛",  color: "text-sky-300   border-sky-300",   accent: "#7dd3fc", desc: "Direktorat Jenderal Kekayaan Intelektual", cols: 25, status: "ACTIVE" },
  { name: "KiT",             icon: "⚙",  color: "text-amber-400 border-amber-400", accent: "#fbbf24", desc: "Krakatau Information Technology",          cols: 23, status: "ACTIVE" },
  { name: "Pupuk Indonesia", icon: "🌱", color: "text-slate-500  border-slate-500", accent: "#64748b", desc: "PT Pupuk Indonesia (Persero)",              cols: 0,  status: "STANDBY" },
];

const STEPS = [
  { n: "01", cls: "text-blue-400",  bar: "bg-blue-400/20",  text: "Pilih tenant di sidebar kiri (KCI / DJKI / KiT / dll)" },
  { n: "02", cls: "text-sky-300",   bar: "bg-sky-300/20",   text: "Paste teks ticket SOC lengkap ke textarea" },
  { n: "03", cls: "text-amber-400", bar: "bg-amber-400/20", text: "Klik + Parse Ticket — semua field terisi otomatis" },
  { n: "04", cls: "text-emerald-400", bar: "bg-emerald-400/20", text: "⎘ Copy Semua ke Sheets → Google Sheets → A1 → Ctrl+V" },
  { n: "05", cls: "text-violet-400", bar: "bg-violet-400/20", text: "Isi kolom manual (Response Time, Ticket ID) di Sheets" },
];

const LOG_LINES = [
  { t: "22:14:03", sev: "HIGH", cls: "text-red-400",     msg: "Public-to-Private exploit attempt detected — 185.220.101.178" },
  { t: "22:14:11", sev: "MED",  cls: "text-amber-400",   msg: "Bad Source Reputation Anomaly — 194.88.98.86 (Germany)" },
  { t: "22:14:29", sev: "LOW",  cls: "text-emerald-400", msg: "Scanner Reputation Anomaly — 47.251.118.34 (United States)" },
  { t: "22:15:01", sev: "HIGH", cls: "text-red-400",     msg: "TOR Known Relay/Router traffic detected — 185.220.101.147" },
  { t: "22:15:44", sev: "INFO", cls: "text-blue-400",    msg: "IP blocked via Stellar — Action logged to ticket" },
  { t: "22:16:08", sev: "MED",  cls: "text-amber-400",   msg: "CINS Poor Reputation group 107 triggered — 34.204.10.19" },
  { t: "22:16:33", sev: "HIGH", cls: "text-red-400",     msg: "Exploit Public-Facing Application (T1190) — Initial Access" },
  { t: "22:17:02", sev: "INFO", cls: "text-blue-400",    msg: "SOC analyst acknowledged — ticket 2026/25-04/108 created" },
];

// ── Galaxy Canvas ─────────────────────────────────────────────────────────────
function GalaxyCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars — each has a slow drift velocity
    const STARS = Array.from({ length: 220 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.3 + 0.2,
      op: Math.random() * 0.55 + 0.2,
      tw: Math.random() * Math.PI * 2,   // twinkle phase
      ts: Math.random() * 0.4 + 0.15,    // twinkle speed
      vx: (Math.random() - 0.9) * 0.5,  // drift x — very slow
      vy: (Math.random() - 0.5) * 0.06,  // drift y — very slow
    }));

    // Nebula — only 3, very faint
    const NEBULAE = [
      { cx: 0.15, cy: 0.2,  rr: 0.25, color: [56,  139, 253, 0.04] },
      { cx: 0.80, cy: 0.65, rr: 0.20, color: [188, 140, 255, 0.03] },
      { cx: 0.50, cy: 0.90, rr: 0.18, color: [88,  166, 255, 0.025] },
    ];

    let t = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Base
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, W, H);

      // Nebulae
      NEBULAE.forEach(({ cx, cy, rr, color: [r, g, b, a] }) => {
        const grd = ctx.createRadialGradient(cx * W, cy * H, 0, cx * W, cy * H, rr * W);
        grd.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      });

      // Scanlines
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = "rgba(99,179,255,0.01)";
        ctx.fillRect(0, y, W, 1);
      }

      // Stars — move + twinkle
      t += 0.016;
      STARS.forEach(s => {
        // drift
        s.x += s.vx;
        s.y += s.vy;
        // wrap around
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;

        const alpha = Math.max(0, Math.min(1, s.op + Math.sin(t * s.ts + s.tw) * 0.2));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,225,255,${alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Terminal Log ──────────────────────────────────────────────────────────────
function TerminalLog() {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setVisible(v => Math.min(v + 1, LOG_LINES.length)), 950);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700/60 bg-[#0d1117]/95">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border-b border-slate-700/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 font-mono text-[10px] text-slate-500">soc-threat-monitor — live feed</span>
      </div>
      <div className="p-3 min-h-[200px] max-h-[220px] overflow-y-auto space-y-1.5">
        {LOG_LINES.slice(0, visible).map((l, i) => (
          <div key={i} className={`flex gap-2.5 font-mono text-[10px] ${i === visible - 1 ? "opacity-100" : "opacity-60"}`}>
            <span className="text-blue-500 shrink-0">[{l.t}]</span>
            <span className={`${l.cls} shrink-0 w-8`}>{l.sev}</span>
            <span className="text-slate-300">{l.msg}</span>
          </div>
        ))}
        {visible < LOG_LINES.length && (
          <span className="font-mono text-[10px] text-blue-500">█</span>
        )}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, sublabel, topColor }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let v = 0;
    const step = Math.ceil(value / 20);
    const id = setInterval(() => {
      v += step;
      if (v >= value) { setCount(value); clearInterval(id); }
      else setCount(v);
    }, 40);
    return () => clearInterval(id);
  }, [value]);

  return (
    <div
      className="flex-1 min-w-[120px] rounded-lg border border-slate-700/60 bg-slate-900/80 px-4 py-3.5"
      style={{ borderTop: `2px solid ${topColor}` }}
    >
      <div className="font-mono text-2xl font-bold tracking-tight" style={{ color: topColor }}>
        {typeof value === "number" ? count : value}
      </div>
      <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-1">{label}</div>
      {sublabel && <div className="font-mono text-[9px] mt-0.5" style={{ color: topColor + "99" }}>{sublabel}</div>}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tick, setTick]   = useState(0);
  const [time, setTime]   = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => { setTick(t => t + 1); setTime(new Date()); }, 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString("id-ID", { hour12: false });
  const dateStr = time.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="relative min-h-screen text-slate-300 text-xs">
      <GalaxyCanvas />

      <div className="relative z-10">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-7 py-2.5 border-b border-slate-700/50 bg-[#0d1117]/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-mono text-[10px] text-blue-400 uppercase tracking-[.15em]">SYSTEM ONLINE</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[10px] text-slate-600">SOC-PARSER-SYS v2.0</span>
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            {dateStr}&nbsp;|&nbsp;<span className="text-blue-400">{timeStr}</span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-7">

          {/* ── Hero ── */}
          <div className="mb-8">
            <p className="font-mono text-[10px] text-blue-500 uppercase tracking-[.2em] mb-2">▸ Threat Operations Center</p>
            <h1 className="font-serif text-[30px] font-bold text-slate-100 leading-tight tracking-tight">
              SOC Ticket<br />
              <span className="text-blue-400">Parser System</span>
            </h1>
            <p className="mt-2.5 font-mono text-[11px] text-slate-600 max-w-md leading-relaxed">
              Automated ticket parsing → Google Sheets export. Pilih tenant di sidebar untuk mulai.
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="flex gap-2.5 mb-7 flex-wrap">
            <StatCard value={3}    label="Active Tenants" sublabel="KCI · DJKI · KiT"    topColor="#60a5fa" />
            <StatCard value={85}   label="Total Columns"  sublabel="across all tenants"   topColor="#fbbf24" />
            <StatCard value={1}    label="Standby"        sublabel="Pupuk Indonesia"       topColor="#64748b" />
            <StatCard value="AUTO" label="Parse Mode"     sublabel="regex engine v2"       topColor="#a78bfa" />
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-2 gap-5 mb-6">

            {/* Tenant Registry */}
            <div>
              <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[.15em] mb-3">▸ Tenant Registry</p>
              <div className="flex flex-col gap-2">
                {TENANTS.map((t) => (
                  <div
                    key={t.name}
                    className={`flex items-center gap-3 rounded-lg border border-slate-700/50 px-3.5 py-2.5 bg-slate-900/75 ${t.status === "STANDBY" ? "opacity-50" : ""}`}
                    style={{ borderLeft: `3px solid ${t.accent}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0 bg-slate-800/80 border border-slate-700/40"
                    >
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-mono text-[11px] font-bold ${t.color.split(" ")[0]}`}>{t.name}</span>
                        <span className={`font-mono text-[8px] px-1.5 py-px rounded border ${
                          t.status === "ACTIVE"
                            ? "text-emerald-400 border-emerald-400/30"
                            : "text-slate-600 border-slate-700"
                        }`}>
                          {t.status}
                        </span>
                        {t.cols > 0 && (
                          <span className="font-mono text-[9px] text-slate-600">{t.cols} cols</span>
                        )}
                      </div>
                      <p className="font-mono text-[9px] text-slate-600 truncate">{t.desc}</p>
                    </div>
                    {t.status === "ACTIVE" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Feed */}
            <div>
              <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[.15em] mb-3">▸ Simulated Threat Feed</p>
              <TerminalLog />
            </div>
          </div>

          {/* ── Procedure ── */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/75 px-5 py-4 mb-5">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[.15em] mb-4">▸ Operational Procedure</p>
            <div className="flex flex-col gap-2.5">
              {STEPS.map((s) => (
                <div key={s.n} className="flex items-start gap-3.5">
                  <span className={`font-mono text-[10px] ${s.cls} shrink-0 w-5`}>{s.n}</span>
                  <div className={`w-px ${s.bar} self-stretch shrink-0 mt-0.5`} />
                  <span className="font-mono text-[11px] text-slate-300 leading-relaxed">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pills ── */}
          <div className="flex gap-2 flex-wrap">
            {[
              { icon: "📋", label: "Paste & Parse",  cls: "text-blue-400  border-blue-400/25"  },
              { icon: "⎘",  label: "Copy ke Sheets", cls: "text-sky-300   border-sky-300/25"   },
              { icon: "↓",  label: "Export CSV",     cls: "text-amber-400 border-amber-400/25" },
              { icon: "🔎", label: "Multi-value",    cls: "text-violet-400 border-violet-400/25"},
              { icon: "🛡", label: "Multi-tenant",   cls: "text-orange-400 border-orange-400/25"},
            ].map((f) => (
              <div key={f.label} className={`flex items-center gap-1.5 rounded-md border bg-slate-900/70 px-3 py-1.5 ${f.cls}`}>
                <span className="text-xs">{f.icon}</span>
                <span className={`font-mono text-[9px] uppercase tracking-wider ${f.cls.split(" ")[0]}`}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="mt-7 pt-3.5 border-t border-slate-800 flex justify-between items-center">
            <span className="font-mono text-[9px] text-slate-800">SOC-PARSER-SYS © 2026 — L1 SOC Analyst Tools</span>
            <span className="font-mono text-[9px] text-slate-800">BUILD 2.0.{String(tick).padStart(4, "0")}</span>
          </div>

        </div>
      </div>
    </div>
  );
}