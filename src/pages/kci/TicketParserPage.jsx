import { useState, useCallback } from "react";
import { useTicket } from "../../context/kci/TicketContext";

const SEVERITY_COLOR = {
  high:     { bg: "bg-red-950/60",    text: "text-red-400",    border: "border-red-500/40"    },
  medium:   { bg: "bg-amber-950/60",  text: "text-amber-400",  border: "border-amber-500/40"  },
  low:      { bg: "bg-emerald-950/60",text: "text-emerald-400",border: "border-emerald-500/40"},
  critical: { bg: "bg-purple-950/60", text: "text-purple-400", border: "border-purple-500/40" },
};

function SeverityBadge({ value }) {
  const c = SEVERITY_COLOR[(value || "").toLowerCase()] ?? {
    bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-600",
  };
  return (
    <span className={`inline-block px-2.5 py-px rounded-full text-[10px] font-bold border font-mono whitespace-nowrap ${c.bg} ${c.text} ${c.border}`}>
      {value}
    </span>
  );
}

function StatusBadge({ value }) {
  const isOpen = (value || "").toLowerCase().match(/open|new/);
  return (
    <span className={`inline-block px-2.5 py-px rounded-full text-[10px] font-bold border font-mono whitespace-nowrap
      ${isOpen ? "bg-amber-950/60 text-amber-400 border-amber-500/40" : "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"}`}>
      {value || "-"}
    </span>
  );
}

export default function TicketParserPage() {
  const { tickets, rawInput, setRawInput, error, addTicket, removeTicket, clearAll, exportToCSV, columns } = useTicket();
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRow, setCopiedRow] = useState(null);

  const escapeCell = useCallback((val) => {
    const s = (val ?? "-").toString().replace(/\t|\r/g, " ");
    return s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  }, []);

  const buildTSV = useCallback((rows, includeHeader = true) => {
    const header = columns.map((c) => c.label).join("\t");
    const body   = rows.map((ticket) => columns.map((c) => escapeCell(ticket[c.key])).join("\t"));
    return includeHeader ? [header, ...body].join("\n") : body.join("\n");
  }, [columns, escapeCell]);

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(buildTSV(tickets, true)).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  }, [tickets, buildTSV]);

  const copyRow = useCallback((ticket, idx) => {
    const row = columns.map((c) => escapeCell(ticket[c.key])).join("\t");
    navigator.clipboard.writeText(row).then(() => {
      setCopiedRow(idx);
      setTimeout(() => setCopiedRow(null), 2500);
    });
  }, [columns, escapeCell]);

  return (
    <div className="min-h-screen text-slate-300 text-xs font-mono">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-7 py-3.5 border-b border-slate-700/50 bg-[#0d1117]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-lg shrink-0">
            🚆
          </div>
          <div>
            <div className="font-bold text-[13px] text-slate-100 font-serif">KCI Ticket Parser</div>
            <div className="text-[10px] text-slate-600">Ticket → Google Sheets</div>
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copyAll}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold border transition-all
                ${copiedAll
                  ? "border-emerald-500/50 bg-emerald-950/60 text-emerald-400"
                  : "border-blue-500/40 bg-blue-950/50 text-blue-400 hover:bg-blue-900/50"}`}
            >
              {copiedAll ? "✓ Tersalin!" : "⎘ Copy Semua ke Sheets"}
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-1.5 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-md text-[11px] border border-red-500/40 text-red-400 hover:bg-red-950/40 transition-all"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="w-full px-5 py-6 box-border">

        {/* ── Hint Banner ── */}
        {tickets.length > 0 && (
          <div className="flex gap-2.5 items-start bg-blue-950/40 border border-blue-500/25 rounded-lg px-4 py-3 mb-5 text-[11px] text-blue-300 leading-relaxed">
            <span className="shrink-0">💡</span>
            <span>
              <span className="text-blue-200 font-bold">Cara copy ke Google Sheets:</span><br />
              • <span className="text-blue-400 font-bold">⎘ Copy Semua ke Sheets</span> → buka Google Sheets → klik sel <span className="text-blue-400 font-bold">A1</span> → <span className="text-blue-400 font-bold">Ctrl+V</span> (paste dengan header).<br />
              • <span className="text-blue-400 font-bold">⎘</span> per baris → paste di baris kosong pada sheet yang sudah ada header.
            </span>
          </div>
        )}

        {/* ── Input ── */}
        <div className="bg-slate-900/70 border border-slate-700/50 rounded-xl p-5 mb-5">
          <div className="font-bold text-slate-200 text-[13px] font-serif mb-3">📋 Paste Ticket SOC</div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={"Paste teks ticket SOC di sini...\n\nCase ID : 20260414-013\nSecurity Event : Public to Private Exploit Anomaly\nSeverity : High\n..."}
            className="w-full min-h-[200px] bg-[#0d1117]/90 border border-slate-700/60 rounded-lg text-slate-300 text-[11px] font-mono p-3 resize-y outline-none leading-relaxed focus:border-blue-500/50 transition-colors"
          />
          {error && (
            <div className="mt-2 text-red-400 text-[11px] bg-red-950/50 border border-red-500/30 rounded-md px-3 py-2">
              ⚠ {error}
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => rawInput.trim() && addTicket(rawInput)}
              disabled={!rawInput.trim()}
              className={`px-5 py-2 rounded-lg text-[12px] font-bold transition-all
                ${rawInput.trim()
                  ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}
            >
              + Parse Ticket
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {tickets.length > 0 && (
          <div className="flex gap-2.5 mb-5 flex-wrap">
            {[
              { label: "Total Tickets", value: tickets.length,                                                                          color: "text-blue-400",    top: "border-blue-400"    },
              { label: "High Severity", value: tickets.filter(t => (t.severity||"").toLowerCase()==="high").length,                     color: "text-red-400",     top: "border-red-400"     },
              { label: "Closed",        value: tickets.filter(t => (t.statusTicketing||"").toLowerCase().includes("closed")).length,    color: "text-emerald-400", top: "border-emerald-400" },
              { label: "Open",          value: tickets.filter(t => !(t.statusTicketing||"").toLowerCase().includes("closed")).length,   color: "text-amber-400",   top: "border-amber-400"   },
            ].map((s) => (
              <div key={s.label}
                className={`bg-slate-900/70 border border-slate-700/50 rounded-lg px-4 py-3 min-w-[110px] flex-1 border-t-2 ${s.top}`}>
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{s.label}</div>
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
                    <th className="px-3 py-2.5 text-left text-slate-600 font-bold border-b border-slate-700/50 whitespace-nowrap">#</th>
                    {columns.map((col) => (
                      <th key={col.key} className="px-3 py-2.5 text-left text-slate-500 font-bold border-b border-slate-700/50 whitespace-nowrap min-w-[110px]">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-center text-slate-600 font-bold border-b border-slate-700/50 min-w-[80px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr key={idx}
                      className={`border-b border-slate-800/60 ${idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"} hover:bg-slate-700/20 transition-colors`}>
                      <td className="px-3 py-2.5 text-slate-600 font-bold">{idx + 1}</td>
                      {columns.map((col) => {
                        const val = ticket[col.key] ?? "-";
                        if (col.key === "severity")       return <td key={col.key} className="px-3 py-2.5 whitespace-nowrap"><SeverityBadge value={val} /></td>;
                        if (col.key === "statusTicketing") return <td key={col.key} className="px-3 py-2.5 whitespace-nowrap"><StatusBadge value={val} /></td>;
                        return (
                          <td key={col.key} title={val}
                            className={`px-3 py-2.5 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis ${val === "-" ? "text-slate-700" : "text-slate-300"}`}>
                            {val}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => copyRow(ticket, idx)}
                          title="Copy baris ini — paste di Google Sheets"
                          className={`mr-1.5 px-2.5 py-1 rounded border text-[10px] transition-all
                            ${copiedRow === idx
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : "bg-transparent border-slate-700/60 text-blue-400 hover:border-blue-500/40"}`}
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