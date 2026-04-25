import { createContext, useContext, useState, useCallback } from "react";

const KiTTicketContext = createContext(null);

// ─── helpers (safe - no dynamic RegExp) ──────────────────────────────────────

/** Get inline value after "Label : value" */
function getInline(raw, re, fallback = "-") {
  const m = raw.match(re);
  if (m && m[1] && m[1].trim()) return m[1].trim();
  return fallback;
}

/** Get first non-empty line in the block after a label */
function getBlockFirst(raw, re, fallback = "-") {
  const m = raw.match(re);
  if (!m) return fallback;
  const after = raw.slice(m.index + m[0].length);
  for (const line of after.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (/^={3,}/.test(t)) break;
    if (/^[A-Za-z][\w &.()\-]+\s*:/.test(t)) break;
    return t;
  }
  return fallback;
}

// ─── parser ───────────────────────────────────────────────────────────────────

function parseTicketKiT(raw) {

  // Ticket Id → Kode Report
  const kodeReport = getInline(raw, /Ticket\s*Id\s*:\s*(.+)/i);

  // Signature → Alert Type
  const alertType = getInline(raw, /Signature\s*:\s*(.+)/i);

  // Severity
  const severity = getInline(raw, /Severity\s*:\s*(.+)/i);

  // Tactic
  const tactic = getInline(raw, /Tactic\s*:\s*(.+)/i);

  // Technique → Exploit Signature
  const exploitSignature = getInline(raw, /Technique\s*:\s*(.+)/i);

  // Rule Level → Alert Score
  const alertScore = getInline(raw, /Rule\s*Level\s*:\s*(.+)/i);

  // Detection Source
  const detectionSource = getInline(raw, /Detection\s*Source\s*:\s*(.+)/i);

  // Timestamp → DATE + EVENT TIME
  // Format: "Apr 25, 2026 @ 22:22:09"
  const tsRaw = getInline(raw, /Timestamp\s*:\s*(.+)/i);
  let eventDate = "-", eventTime = "-";
  if (tsRaw !== "-") {
    const atIdx = tsRaw.indexOf("@");
    if (atIdx !== -1) {
      eventTime = tsRaw.slice(atIdx + 1).trim();
      const dateRaw = tsRaw.slice(0, atIdx).trim(); // "Apr 25, 2026"
      try {
        const d = new Date(dateRaw);
        if (!isNaN(d.getTime())) {
          const months = ["January","February","March","April","May","June",
                          "July","August","September","October","November","December"];
          const dd  = String(d.getDate()).padStart(2, "0");
          const mon = months[d.getMonth()];
          const yy  = String(d.getFullYear()).slice(-2);
          eventDate = `${dd}-${mon}-${yy}`;
        } else {
          eventDate = dateRaw;
        }
      } catch (_) {
        eventDate = dateRaw;
      }
    } else {
      eventDate = tsRaw;
    }
  }

  // Source IP + Country
  // Format: "IP Address : 47.251.118.34 (United States)"
  let ipSource = "-", country = "-";
  const ipLineM = raw.match(/IP\s*Address\s*:\s*([\d.]+)\s*\(([^)]+)\)/i);
  if (ipLineM) {
    ipSource = ipLineM[1].trim();
    country  = ipLineM[2].trim();
  } else {
    // fallback: IP only without country
    const ipOnlyM = raw.match(/IP\s*Address\s*:\s*([\d.]+)/i);
    if (ipOnlyM) ipSource = ipOnlyM[1].trim();
  }

  // Source Port
  const srcPort = getInline(raw, /Source\s*Port\s*:\s*(.+)/i);

  // Destination IP (first only)
  let dstIp = "-";
  const dstIpM = raw.match(/Destination\s*IP\s*:\s*([\d.]+)/i);
  if (dstIpM) dstIp = dstIpM[1].trim();

  // Destination Port
  const dstPort = getInline(raw, /Destination\s*Port\s*:\s*(.+)/i);

  // Link
  const linkM = raw.match(/Link\s*:\s*(https?:\/\/\S+)/i);
  const link  = linkM ? linkM[1].trim() : "-";

  return {
    date:            eventDate,
    eventTime,
    ticketDate:      "-",      // manual
    ticketTime:      "-",      // manual
    socResponseTime: "-",      // manual
    kodeReport,
    ticket:          "-",      // manual (nomor tiket internal)
    country,
    srcIp:           ipSource,
    dstIp,
    srcPort,
    dstPort,
    alertScore,
    alertType,
    phaseKillChain:  "-",      // selalu -
    tactic,
    exploitSignature,
    fileName:        "-",
    cve:             "-",
    statusVirusTotal: "-",     // manual
    statusKaspersky:  "-",     // manual
    statusEvent:      "InProgress",
    threatCategory:   "External",
    // extras (tidak di kolom utama)
    severity,
    detectionSource,
    link,
  };
}

// ─── column definition ────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "date",             label: "DATE" },
  { key: "eventTime",        label: "EVENT TIME" },
  { key: "ticketDate",       label: "TICKET DATE & TIME - Date" },
  { key: "ticketTime",       label: "TICKET DATE & TIME - Time" },
  { key: "socResponseTime",  label: "SOC RESPONSE TIME" },
  { key: "kodeReport",       label: "KODE REPORT" },
  { key: "ticket",           label: "TICKET" },
  { key: "country",          label: "COUNTRY" },
  { key: "srcIp",            label: "SRC IP" },
  { key: "dstIp",            label: "DST IP" },
  { key: "srcPort",          label: "SRC PORT" },
  { key: "dstPort",          label: "DST PORT" },
  { key: "alertScore",       label: "ALERT SCORE" },
  { key: "alertType",        label: "ALERT TYPE" },
  { key: "phaseKillChain",   label: "PHASE KILL CHAIN" },
  { key: "tactic",           label: "TACTIC" },
  { key: "exploitSignature", label: "EXPLOIT SIGNATURE" },
  { key: "fileName",         label: "FILE NAME" },
  { key: "cve",              label: "CVE" },
  { key: "statusVirusTotal", label: "STATUS VIRUSTOTAL" },
  { key: "statusKaspersky",  label: "STATUS KASPERSKY (CATEGORY TECHNIQUE)" },
  { key: "statusEvent",      label: "STATUS EVENT" },
  { key: "threatCategory",   label: "THREAT CATEGORY" },
];

// ─── provider ─────────────────────────────────────────────────────────────────

export function TicketProvider({ children }) {
  const [tickets, setTickets]   = useState([]);
  const [rawInput, setRawInput] = useState("");
  const [error, setError]       = useState("");

  const addTicket = useCallback((raw) => {
    try {
      const parsed = parseTicketKiT(raw);
      setTickets((prev) => [...prev, parsed]);
      setRawInput("");
      setError("");
    } catch (e) {
      setError("Gagal parse ticket. Pastikan format sudah benar.");
    }
  }, []);

  const removeTicket = useCallback((index) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => { setTickets([]); }, []);

  const exportToCSV = useCallback(() => {
    const header = COLUMNS.map((c) => `"${c.label}"`).join(",");
    const rows   = tickets.map((t) =>
      COLUMNS.map((c) => `"${(t[c.key] ?? "-").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csv  = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "kit_tickets.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [tickets]);

  return (
    <KiTTicketContext.Provider value={{ tickets, rawInput, setRawInput, error, addTicket, removeTicket, clearAll, exportToCSV, columns: COLUMNS }}>
      {children}
    </KiTTicketContext.Provider>
  );
}

export function useKiTTicket() {
  const ctx = useContext(KiTTicketContext);
  if (!ctx) throw new Error("useKiTTicket must be used inside <TicketProvider>");
  return ctx;
}