const FONT      = "'Times New Roman', Times, serif";
const FONT_SIZE = "12px";

const TENANTS = [
  { name: "KCI",              icon: "🛡", color: "#f97316", desc: "Komunitas Kredit Indonesia",           cols: 37 },
  { name: "DJKI",             icon: "🏛", color: "#0ea5e9", desc: "Direktorat Jenderal Kekayaan Intelektual", cols: 25 },
  { name: "Pupuk Indonesia",  icon: "🌱", color: "#22c55e", desc: "PT Pupuk Indonesia (Persero)",         cols: 0, wip: true },
];

const FEATURES = [
  { icon: "📋", title: "Paste & Parse",   desc: "Tempel teks ticket SOC mentah, langsung diparsing otomatis ke tiap kolom." },
  { icon: "⎘",  title: "Copy ke Sheets",  desc: "Satu klik copy tab-separated — Ctrl+V langsung di Google Sheets." },
  { icon: "↓",  title: "Export CSV",      desc: "Download file .csv untuk diimport ke Sheets atau tools lain." },
  { icon: "🔎", title: "Multi-value",     desc: "IP / Port / Signature lebih dari satu? Otomatis ambil nilai pertama." },
];

export default function DashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: FONT, fontSize: FONT_SIZE, color: "#e2e8f0", padding: "36px 32px" }}>

      {/* ── Title ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc", fontFamily: FONT, marginBottom: 6 }}>
          🛡 SOC Ticket Parser System
        </div>
        <div style={{ fontSize: 13, color: "#64748b", fontFamily: FONT }}>
          Pilih tenant di sidebar untuk mulai parse ticket dan export ke Google Sheets.
        </div>
      </div>

      {/* ── Tenant Cards ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT, marginBottom: 14 }}>
          TENANT AKTIF
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {TENANTS.map((t) => (
            <div key={t.name} style={{ background: "#1e293b", border: `1px solid ${t.wip ? "#334155" : t.color + "44"}`, borderRadius: 14, padding: "20px 24px", flex: "1 1 220px", minWidth: 200, maxWidth: 320, opacity: t.wip ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
              {/* color accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: t.wip ? "#334155" : t.color, borderRadius: "14px 14px 0 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", fontFamily: FONT }}>{t.name}</span>
                {t.wip && <span style={{ fontSize: 10, background: "#334155", color: "#94a3b8", borderRadius: "999px", padding: "2px 8px", fontFamily: FONT }}>Coming Soon</span>}
              </div>
              <div style={{ fontSize: FONT_SIZE, color: "#94a3b8", fontFamily: FONT, marginBottom: 12 }}>{t.desc}</div>
              {!t.wip && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, background: t.color + "22", color: t.color, border: `1px solid ${t.color}44`, borderRadius: "999px", padding: "2px 10px", fontFamily: FONT, fontWeight: 600 }}>
                    {t.cols} kolom
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: FONT, marginBottom: 14 }}>
          FITUR
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "16px 18px", flex: "1 1 180px", minWidth: 160 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", fontFamily: FONT, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: FONT_SIZE, color: "#64748b", fontFamily: FONT, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Guide ── */}
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", fontFamily: FONT, marginBottom: 16 }}>📖 Cara Pakai</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["1", "#3b82f6", "Pilih tenant di sidebar kiri (KCI / DJKI / dll)"],
            ["2", "#0ea5e9", "Paste teks ticket SOC lengkap ke textarea yang tersedia"],
            ["3", "#f97316", "Klik tombol + Parse Ticket — semua field terisi otomatis"],
            ["4", "#22c55e", "Klik ⎘ Copy Semua ke Sheets → buka Google Sheets → A1 → Ctrl+V"],
            ["5", "#a855f7", "Isi kolom manual (Response Time, Ticket ID, dll) langsung di Sheets"],
          ].map(([num, color, text]) => (
            <div key={num} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: color + "22", border: `1px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: FONT }}>{num}</span>
              </div>
              <div style={{ fontSize: FONT_SIZE, color: "#cbd5e1", fontFamily: FONT, lineHeight: 1.7 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}