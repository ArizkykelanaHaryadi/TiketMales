import { useState, useCallback } from "react";
import { useDJKITicket } from "../../context/djki/DJKITicketContext";

const FONT      = "'Times New Roman', Times, serif";
const FONT_SIZE = "12px";

const SEVERITY_COLOR = {
  high:     { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  medium:   { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  low:      { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  critical: { bg: "#fae8ff", text: "#701a75", border: "#e879f9" },
};

function SeverityBadge({ value }) {
  const key = (value || "").toLowerCase();
  const c   = SEVERITY_COLOR[key] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: "999px", padding: "2px 10px", fontSize: FONT_SIZE, fontFamily: FONT, fontWeight: 600, whiteSpace: "nowrap" }}>
      {value || "-"}
    </span>
  );
}

function StatusBadge({ value }) {
  const v      = (value || "").toLowerCase();
  const isOpen = v.includes("open") || v.includes("new");
  return (
    <span style={{ background: isOpen ? "#fef3c7" : "#dcfce7", color: isOpen ? "#92400e" : "#166534", border: `1px solid ${isOpen ? "#fcd34d" : "#86efac"}`, borderRadius: "999px", padding: "2px 10px", fontSize: FONT_SIZE, fontFamily: FONT, fontWeight: 600, whiteSpace: "nowrap" }}>
      {value || "-"}
    </span>
  );
}

export default function DJKITicketParserPage() {
  const { tickets, rawInput, setRawInput, error, addTicket, removeTicket, clearAll, exportToCSV, columns } = useDJKITicket();
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRow, setCopiedRow] = useState(null);

  const buildTSV = useCallback((rows, includeHeader = true) => {
    const header = columns.map((c) => c.label).join("\t");
    const body   = rows.map((ticket) =>
      columns.map((c) => (ticket[c.key] ?? "-").toString().replace(/\t|\n|\r/g, " ")).join("\t")
    );
    return includeHeader ? [header, ...body].join("\n") : body.join("\n");
  }, [columns]);

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(buildTSV(tickets, true)).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  }, [tickets, buildTSV]);

  const copyRow = useCallback((ticket, idx) => {
    const row = columns.map((c) => (ticket[c.key] ?? "-").toString().replace(/\t|\n|\r/g, " ")).join("\t");
    navigator.clipboard.writeText(row).then(() => {
      setCopiedRow(idx);
      setTimeout(() => setCopiedRow(null), 2500);
    });
  }, [columns]);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: FONT, fontSize: FONT_SIZE, color: "#e2e8f0" }}>

      {/* ── Header ── */}
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏛</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc", fontFamily: FONT }}>SOC Ticket Parser — DJKI</div>
            <div style={{ fontSize: FONT_SIZE, color: "#64748b", fontFamily: FONT }}>Direktorat Jenderal Kekayaan Intelektual</div>
          </div>
        </div>
        {tickets.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={copyAll} style={{ padding: "7px 16px", borderRadius: 8, border: copiedAll ? "1px solid #22c55e" : "1px solid #3b82f6", background: copiedAll ? "#14532d" : "#1e3a5f", color: copiedAll ? "#4ade80" : "#60a5fa", fontSize: FONT_SIZE, fontFamily: FONT, cursor: "pointer", fontWeight: 700 }}>
              {copiedAll ? "✓ Tersalin!" : "⎘ Copy Semua ke Sheets"}
            </button>
            <button onClick={exportToCSV} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontSize: FONT_SIZE, fontFamily: FONT, cursor: "pointer", fontWeight: 700 }}>
              ↓ Export CSV
            </button>
            <button onClick={clearAll} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: FONT_SIZE, fontFamily: FONT, cursor: "pointer" }}>
              Clear All
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1800, margin: "0 auto", padding: "22px 20px" }}>

        {/* ── Hint ── */}
        {tickets.length > 0 && (
          <div style={{ background: "#0c1a2e", border: "1px solid #1d4ed8", borderRadius: 10, padding: "11px 16px", marginBottom: 18, fontSize: FONT_SIZE, fontFamily: FONT, color: "#93c5fd", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span>💡</span>
            <span>
              <b style={{ color: "#bfdbfe" }}>Cara copy ke Google Sheets:</b><br />
              • <b style={{ color: "#60a5fa" }}>⎘ Copy Semua ke Sheets</b> → buka Google Sheets → klik sel <b>A1</b> → <b>Ctrl+V</b>.<br />
              • <b style={{ color: "#60a5fa" }}>⎘</b> per baris → paste di baris kosong sheet yang sudah ada header.<br />
              • Kolom <b>Ticket Date &amp; Time, SOC Response Time, DJKI Respond/Response Time, Ticket ID, Log Source</b> diisi manual di Sheets.
            </span>
          </div>
        )}

        {/* ── Input ── */}
        <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", padding: "20px", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13, fontFamily: FONT, marginBottom: 10 }}>📋 Paste Ticket DJKI</div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"Paste teks ticket DJKI di sini...\n\nSec. Event : Public to Private Exploit Anomaly\nStage : Initial Attempts\nTactic : Initial Access (TA0001)\n..."}
            style={{ width: "100%", minHeight: 220, background: "#0f172a", border: "1px solid #475569", borderRadius: 8, color: "#e2e8f0", fontSize: FONT_SIZE, fontFamily: FONT, padding: "12px", resize: "vertical", outline: "none", lineHeight: 1.8, boxSizing: "border-box" }}
          />
          {error && (
            <div style={{ marginTop: 8, color: "#f87171", fontSize: FONT_SIZE, fontFamily: FONT, background: "#450a0a", borderRadius: 6, padding: "8px 12px" }}>⚠ {error}</div>
          )}
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => rawInput.trim() && addTicket(rawInput)}
              disabled={!rawInput.trim()}
              style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: rawInput.trim() ? "#0ea5e9" : "#0c2340", color: rawInput.trim() ? "#fff" : "#475569", fontWeight: 700, fontSize: 13, fontFamily: FONT, cursor: rawInput.trim() ? "pointer" : "not-allowed" }}
            >
              + Parse Ticket
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {tickets.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Total Tickets", value: tickets.length, color: "#0ea5e9" },
              { label: "High Severity", value: tickets.filter(t => (t.severity || "").toLowerCase() === "high").length, color: "#ef4444" },
              { label: "Closed",        value: tickets.filter(t => (t.eventStatus || "").toLowerCase().includes("closed")).length, color: "#22c55e" },
              { label: "Open",          value: tickets.filter(t => !(t.eventStatus || "").toLowerCase().includes("closed")).length, color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "10px 18px", minWidth: 110, flex: "1 1 auto" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: FONT }}>{s.value}</div>
                <div style={{ fontSize: FONT_SIZE, color: "#64748b", fontFamily: FONT }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        {tickets.length > 0 ? (
          <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #334155", fontSize: FONT_SIZE, fontFamily: FONT, color: "#94a3b8" }}>
              {tickets.length} ticket(s) — format DJKI · {columns.length} kolom
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: FONT_SIZE, fontFamily: FONT }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    <th style={{ padding: "9px 10px", textAlign: "left", color: "#64748b", fontWeight: 700, borderBottom: "1px solid #334155", whiteSpace: "nowrap", fontFamily: FONT, fontSize: FONT_SIZE }}>#</th>
                    {columns.map((col) => (
                      <th key={col.key} style={{ padding: "9px 10px", textAlign: "left", color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #334155", whiteSpace: "nowrap", minWidth: 120, fontFamily: FONT, fontSize: FONT_SIZE }}>
                        {col.label}
                      </th>
                    ))}
                    <th style={{ padding: "9px 10px", color: "#64748b", fontWeight: 700, borderBottom: "1px solid #334155", fontFamily: FONT, fontSize: FONT_SIZE, textAlign: "center", minWidth: 80 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #263348", background: idx % 2 === 0 ? "#1e293b" : "#162032" }}>
                      <td style={{ padding: "9px 10px", color: "#64748b", fontWeight: 700, fontFamily: FONT, fontSize: FONT_SIZE }}>{idx + 1}</td>
                      {columns.map((col) => {
                        const val = ticket[col.key] ?? "-";
                        if (col.key === "severity")    return <td key={col.key} style={{ padding: "9px 10px", whiteSpace: "nowrap" }}><SeverityBadge value={val} /></td>;
                        if (col.key === "eventStatus") return <td key={col.key} style={{ padding: "9px 10px", whiteSpace: "nowrap" }}><StatusBadge value={val} /></td>;
                        return (
                          <td key={col.key} title={val} style={{ padding: "9px 10px", color: val === "-" ? "#475569" : "#e2e8f0", whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT, fontSize: FONT_SIZE }}>
                            {val}
                          </td>
                        );
                      })}
                      <td style={{ padding: "9px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <button onClick={() => copyRow(ticket, idx)} title="Copy baris ini" style={{ background: copiedRow === idx ? "#14532d" : "transparent", border: `1px solid ${copiedRow === idx ? "#22c55e" : "#334155"}`, color: copiedRow === idx ? "#4ade80" : "#60a5fa", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: FONT_SIZE, fontFamily: FONT, marginRight: 5 }}>
                          {copiedRow === idx ? "✓" : "⎘"}
                        </button>
                        <button onClick={() => removeTicket(idx)} title="Hapus baris" style={{ background: "transparent", border: "1px solid #334155", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: FONT_SIZE, fontFamily: FONT }}>
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "56px 20px", color: "#475569", background: "#1e293b", borderRadius: 12, border: "1px dashed #334155" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏛</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b", fontFamily: FONT, marginBottom: 6 }}>Belum ada ticket DJKI</div>
            <div style={{ fontSize: FONT_SIZE, fontFamily: FONT }}>Paste teks ticket di atas lalu klik "Parse Ticket"</div>
          </div>
        )}
      </div>
    </div>
  );
}