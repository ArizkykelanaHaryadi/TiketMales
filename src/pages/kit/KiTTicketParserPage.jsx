import { useState, useCallback } from "react";
import { useKiTTicket } from "../../context/kit/KiTTicketContext";

const MANUAL_COLS = new Set([
  "ticketDate", "ticketTime", "socResponseTime",
  "ticket", "statusVirusTotal", "statusKaspersky", "statusEvent",
]);

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
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-serif font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {value || "-"}
    </span>
  );
}

export default function KiTTicketParserPage() {
  const { tickets, rawInput, setRawInput, error, addTicket, removeTicket, clearAll, exportToCSV, columns } = useKiTTicket();
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
    <div className="min-h-screen text-slate-300 text-xs font-mono">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-7 py-3.5 border-b border-slate-700/50 bg-[#0d1117]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-lg shrink-0">
            ⚙
          </div>
          <div>
            <div className="font-bold text-[15px] text-slate-50 font-serif">
              SOC Ticket Parser — KiT
            </div>
            <div className="text-xs text-slate-500 font-serif">
              Krakatau Information Technology
            </div>
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copyAll}
              className={[
                "px-4 py-1.5 rounded-lg text-xs font-serif font-bold cursor-pointer transition-colors",
                copiedAll
                  ? "border border-emerald-500 bg-emerald-950 text-emerald-400"
                  : "border border-blue-500 bg-blue-950 text-blue-400 hover:bg-blue-900",
              ].join(" ")}
            >
              {copiedAll ? "✓ Tersalin!" : "⎘ Copy Semua ke Sheets"}
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-serif font-bold cursor-pointer hover:bg-emerald-400 transition-colors"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-lg border border-red-500 bg-transparent text-red-400 text-xs font-serif cursor-pointer hover:bg-red-950/40 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1800px] mx-auto px-5 py-[22px]">

        {/* ── Hint ── */}
        {tickets.length > 0 && (
          <div className="flex gap-2.5 items-start bg-blue-950/40 border border-blue-500/25 rounded-lg px-4 py-3 mb-5 text-[11px] text-blue-300 leading-relaxed">
            <span className="shrink-0">💡</span>
            <span>
              <b className="text-blue-200">Cara copy ke Google Sheets:</b><br />
              • <b className="text-blue-400">⎘ Copy Semua ke Sheets</b> → buka Google Sheets → klik sel <b>A1</b> → <b>Ctrl+V</b>.<br />
              • <b className="text-blue-400">⎘</b> per baris → paste di baris kosong sheet yang sudah ada header.<br />
              • Kolom <b className="text-amber-400">kuning</b> diisi manual di Sheets: Ticket Date &amp; Time, SOC Response Time, Ticket, Status VirusTotal, Status Kaspersky, Status Event.
            </span>
          </div>
        )}

        {/* ── Input ── */}
        <div className="bg-slate-900/70 border border-slate-700/50 rounded-xl p-5 mb-5">
          <div className="font-bold text-slate-200 text-[13px] font-serif mb-3">📋 Paste Ticket SOC</div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"Paste teks ticket Krakatau IT di sini...\n\nTicket Id : 2026/25-04/108\nSignature : ET CINS Active Threat Intelligence Poor Reputation IP group 81\nSeverity : Low\n..."}
            className="w-full min-h-[200px] bg-[#0d1117]/90 border border-slate-700/60 rounded-lg text-slate-300 text-[11px] font-mono p-3 resize-y outline-none leading-relaxed focus:border-blue-500/50 transition-colors"
          />
          {error && (
            <div className="mt-2 text-red-400 text-[11px] bg-red-950 border border-red-900 rounded-md px-3 py-2">
              ⚠ {error}
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => rawInput.trim() && addTicket(rawInput)}
              disabled={!rawInput.trim()}
              className={[
                "px-5 py-2 rounded-lg text-[12px] font-bold transition-all",
                rawInput.trim()
                  ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed",
              ].join(" ")}
            >
              + Parse Ticket
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {tickets.length > 0 && (
          <div className="flex gap-2.5 mb-5 flex-wrap">
            {[
              { label: "Total Tickets", value: tickets.length,                                                                          color: "text-amber-400"   },
              { label: "High",          value: tickets.filter(t => (t.severity || "").toLowerCase() === "high").length,                 color: "text-red-400"     },
              { label: "Medium",        value: tickets.filter(t => (t.severity || "").toLowerCase() === "medium").length,               color: "text-orange-400"  },
              { label: "Low",           value: tickets.filter(t => (t.severity || "").toLowerCase() === "low").length,                  color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-[10px] px-[18px] py-2.5 min-w-[100px] flex-1">
                <div className={`text-xl font-bold font-serif ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-serif">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        {tickets.length > 0 ? (
          <div className="bg-slate-900/70 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 text-[10px] text-slate-500">
              {tickets.length} ticket(s) — copy per baris atau semua sekaligus
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-[#0d1117]/80">
                    <th className="px-3 py-2.5 text-left text-slate-600 font-bold border-b border-slate-700/50 whitespace-nowrap">
                      #
                    </th>
                    {columns.map((col) => (
                      <th key={col.key} className="px-3 py-2.5 text-left text-slate-500 font-bold border-b border-slate-700/50 whitespace-nowrap min-w-[110px]">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-center text-slate-600 font-bold border-b border-slate-700/50 min-w-[80px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr
                      key={idx}
                      className={[
                        "border-b border-slate-800/60 hover:bg-slate-700/20 transition-colors",
                        idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20",
                      ].join(" ")}
                    >
                      <td className="px-3 py-2.5 text-slate-600 font-bold">{idx + 1}</td>
                      {columns.map((col) => {
                        const val = ticket[col.key] ?? "-";
                        if (col.key === "severity") return (
                          <td key={col.key} className="px-3 py-2.5 whitespace-nowrap">
                            <SeverityBadge value={val} />
                          </td>
                        );
                        return (
                          <td
                            key={col.key}
                            title={val}
                            className={[
                              "px-3 py-2.5 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis",
                              val === "-" ? "text-slate-700" : "text-slate-300",
                            ].join(" ")}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => copyRow(ticket, idx)}
                          title="Copy baris ini — paste di Google Sheets"
                          className={[
                            "mr-1.5 px-2.5 py-1 rounded border text-[10px] transition-all",
                            copiedRow === idx
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : "bg-transparent border-slate-700/60 text-blue-400 hover:border-blue-500/40",
                          ].join(" ")}
                        >
                          {copiedRow === idx ? "✓" : "⎘"}
                        </button>
                        <button
                          onClick={() => removeTicket(idx)}
                          title="Hapus baris"
                          className="px-2.5 py-1 rounded border border-slate-700/60 text-red-400 hover:border-red-500/40 hover:bg-red-950/40 text-[10px] transition-all"
                        >
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
          <div className="text-center py-14 bg-slate-900/50 border border-dashed border-slate-700/40 rounded-xl">
            <div className="text-4xl mb-3">📄</div>
            <div className="text-[13px] font-bold text-slate-500 font-serif mb-1.5">Belum ada ticket</div>
            <div className="text-[11px] text-slate-600">Paste teks ticket SOC di atas lalu klik "Parse Ticket"</div>
          </div>
        )}

      </div>
    </div>
  );
}