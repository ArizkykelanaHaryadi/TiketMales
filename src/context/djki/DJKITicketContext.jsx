import { createContext, useContext, useState, useCallback } from "react";

const DJKITicketContext = createContext(null);

// ─── helpers ─────────────────────────────────────────────────────────────────

function extractFirst(raw, labelPattern, fallback = "-") {
  const m = raw.match(labelPattern);
  if (m && m[1] && m[1].trim()) return m[1].trim();
  const afterM = raw.match(new RegExp(labelPattern.source.replace(/\(.+\)/, ""), labelPattern.flags));
  if (!afterM) return fallback;
  const after = raw.slice(afterM.index + afterM[0].length);
  for (const line of after.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (/^={3,}/.test(t)) break;
    if (/^[A-Za-z][\w &.]+\s*:/.test(t)) break;
    return t;
  }
  return fallback;
}

function extractBlock(raw, labelPattern) {
  const m = raw.match(labelPattern);
  if (!m) return [];
  const after = raw.slice(m.index + m[0].length);
  const lines = after.split("\n");
  const results = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/^={3,}/.test(t)) break;
    if (/^[A-Za-z][\w &.]+\s*:/.test(t)) break;
    results.push(t);
  }
  return results.filter(Boolean);
}

function parseIpFirst(raw, labelPattern) {
  const mi = raw.match(labelPattern);
  if (mi && mi[1] && /[\d.]+/.test(mi[1])) {
    const ipM = mi[1].match(/([\d.]+)/);
    if (ipM) return ipM[1];
  }
  const block = extractBlock(raw, labelPattern);
  for (const line of block) {
    const ipM = line.match(/([\d.]+)/);
    if (ipM) return ipM[1];
  }
  return "-";
}

// ─── main parser ─────────────────────────────────────────────────────────────

function parseTicketDJKI(raw) {
  // ── Alarms Name ──
  const alarmsName =
    extractFirst(raw, /Sec\.?\s*Event\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Sec\.?\s*Event\s*:\s*(.+)/i)
      : extractFirst(raw, /Security Event\s*:\s*(.+)/i);

  // ── Created By ──
  const createdBy = "";

  // ── Event Date / Event Time (split) ──
  const waktuDeteksi = extractFirst(raw, /Waktu Deteksi\s*:\s*(.+)/i);
  let eventDate = "-", eventTime = "-";
  if (waktuDeteksi !== "-") {
    const parts = waktuDeteksi.split(" ");
    if (parts[0]) eventDate = parts[0];
    if (parts[1]) eventTime = parts[1];
  }

  // ── Ticket Date & Ticket Time — diisi manual di Sheets ──
  const ticketDate = "-";
  const ticketTime = "-";

  // ── SOC Response Time — diisi manual ──
  const socResponseTime = "-";

  // ── Severity ──
  const severity =
    extractFirst(raw, /Category\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Category\s*:\s*(.+)/i)
      : extractFirst(raw, /Severity\s*:\s*(.+)/i);

  // ── DJKI Respond Time (Date + Time sub-kolom) — manual ──
  const djkiRespondDate = "-";
  const djkiRespondTime = "-";

  // ── DJKI Response Time — manual ──
  const djkiResponseTime = "-";

  // ── Ticket ID — manual ──
  const ticketId = "-";

  // ── Event Status ──
  const eventStatus =
    extractFirst(raw, /Status Event\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Status Event\s*:\s*(.+)/i)
      : extractFirst(raw, /Status\s*:\s*(.+)/i);

  // ── Action / Noted ──
  const notedM  = raw.match(/Noted\s*:\s*(.+)/i);
  const actionM = raw.match(/Action\s*:\s*(.+)/i);
  let action = "-";
if (notedM && notedM[1].trim())        action = notedM[1].trim();
else if (actionM && actionM[1].trim()) action = actionM[1].trim();

// 🔥 NORMALIZATION ACTION
const lowerAction = action.toLowerCase();

if (lowerAction.includes("block") && lowerAction.includes("stellar")) {
  action = "Block Manual Stellar";
} else if (lowerAction.includes("soar")) {
  action = "SOAR Action";
}

const noted = "";

  // ── Log Source — manual ──
  const logSource = "-";

  // ── Source IP (first only) ──
  const ipSource = parseIpFirst(raw, /Source IP\s*:\s*(.*)/i);

  // ── Country Code IP Source ──
  let countryCodeIpSource = "-";
  const srcCountryLabel = raw.match(/Source Country\s*:\s*(.+)/i);
  if (srcCountryLabel && srcCountryLabel[1].trim()) {
    countryCodeIpSource = srcCountryLabel[1].trim();
  } else {
    const srcBlock = extractBlock(raw, /Source IP\s*:/i);
    for (const line of srcBlock) {
      const m = line.match(/\(([^)]+)\)/);
      if (m) { countryCodeIpSource = m[1].trim(); break; }
    }
  }

  // ── Destination IP (first only) ──
  const dstBlock = extractBlock(raw, /Destination IP\s*:/i);
  let ipDestination = "-", countryCodeIpDestination = "-";
  for (const line of dstBlock) {
    const ipM = line.match(/([\d.]+)/);
    if (ipM && ipDestination === "-") ipDestination = ipM[1];
    const cM = line.match(/\(([^)]+)\)/);
    if (cM && countryCodeIpDestination === "-") countryCodeIpDestination = cM[1].trim();
  }
  if (ipDestination === "-") {
    const inlineM = raw.match(/Destination IP\s*:\s*([\d.]+)/i);
    if (inlineM) ipDestination = inlineM[1];
  }
  // "(Internal)" bisa di baris terpisah
  if (countryCodeIpDestination === "-") {
    const afterDst = raw.match(/Destination IP\s*:\s*[\n\s\d.]+\(([^)]+)\)/i);
    if (afterDst) countryCodeIpDestination = afterDst[1].trim();
  }

  // ── Destination Port (first only) ──
  const dstPortBlock  = extractBlock(raw, /Destination Port\s*:/i);
  const dstPortInline = extractFirst(raw, /Destination Port\s*:\s*(.+)/i);
  const destinationPort = dstPortBlock[0] || dstPortInline;

  // ── Destination Host ──
  const destinationHost = extractFirst(raw, /Destination Host\s*:\s*(.+)/i);

  // ── Threat Category ──
  const threatCategory =
    extractFirst(raw, /Threat Category\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Threat Category\s*:\s*(.+)/i)
      : "External";

  // ── Stage / Tactic / Technique / Sub Technique ──
  const stage        = extractFirst(raw, /Stage\s*:\s*(.+)/i);
  const tactic       = extractFirst(raw, /Tactic\s*:\s*(.+)/i);
  const technique    = extractFirst(raw, /Technique\s*:\s*(.+)/i);
  const subTechnique = extractFirst(raw, /Sub[-\s]?Technique\s*:\s*(.+)/i);

  return {
    // kolom 1–2
    alarmsName,
    createdBy,
    // Event Time → split Date + Time
    eventDate,
    eventTime,
    // Ticket Date & Time → split Date + Time (manual)
    ticketDate,
    ticketTime,
    // kolom berikutnya
    socResponseTime,
    severity,
    // DJKI Respond Time → sub-kolom Date + Time (manual)
    djkiRespondDate,
    djkiRespondTime,
    // DJKI Response Time (manual)
    djkiResponseTime,
    // Ticket ID (manual)
    ticketId,
    // Event Status
    eventStatus,
    // Action
    action,
    // Log Source (manual)
    logSource,
    // IP fields
    ipSource,
    countryCodeIpSource,
    // Noted
    noted,
    // Destination
    ipDestination,
    countryCodeIpDestination,
    destinationPort,
    destinationHost,
    // Classification
    threatCategory,
    stage,
    tactic,
    technique,
    subTechnique,
  };
}

// ─── column definition (urutan sesuai spreadsheet DJKI) ──────────────────────
//
//  Alarms Name | Created By | Event Time (Date+Time) | Ticket Date & Time (Date+Time)
//  | SOC Response Time | Severity | DJKI Respond Time (Date+Time) | DJKI Response Time
//  | Ticket ID | Event Status | Action | Log Source | IP Source | Country Code IP Source
//  | Noted | IP Destination | Country Code IP Destination | Destination Port
//  | Destination Host | Threat Category | Stage | Tactic | Technique | Sub Technique

const COLUMNS = [
  { key: "alarmsName",               label: "Alarms Name" },
  { key: "createdBy",                label: "Created By" },
  // Event Time dipecah 2 kolom
  { key: "eventDate",                label: "Event Time - Date" },
  { key: "eventTime",                label: "Event Time - Time" },
  // Ticket Date & Time dipecah 2 kolom
  { key: "ticketDate",               label: "Ticket Date & Time - Date" },
  { key: "ticketTime",               label: "Ticket Date & Time - Time" },
  { key: "socResponseTime",          label: "SOC Response Time" },
  { key: "severity",                 label: "Severity" },
  // DJKI Respond Time dipecah 2 kolom (sesuai sub-header Date | Time di sheet)
  { key: "djkiRespondDate",          label: "DJKI Respond Time - Date" },
  { key: "djkiRespondTime",          label: "DJKI Respond Time - Time" },
  { key: "djkiResponseTime",         label: "DJKI Response Time" },
  { key: "ticketId",                 label: "Ticket ID" },
  { key: "eventStatus",              label: "Event Status" },
  { key: "action",                   label: "Action" },
  { key: "logSource",                label: "Log Source" },
  { key: "ipSource",                 label: "IP Source" },
  { key: "countryCodeIpSource",      label: "Country Code IP Source" },
  { key: "noted",                    label: "Noted" },
  { key: "ipDestination",            label: "IP Destination" },
  { key: "countryCodeIpDestination", label: "Country Code IP Destination" },
  { key: "destinationPort",          label: "Destination Port" },
  { key: "destinationHost",          label: "Destination Host" },
  { key: "threatCategory",           label: "Threat Category" },
  { key: "stage",                    label: "Stage" },
  { key: "tactic",                   label: "Tactic" },
  { key: "technique",                label: "Technique" },
  { key: "subTechnique",             label: "Sub Technique" },
];

// ─── provider ─────────────────────────────────────────────────────────────────

export function TicketProvider({ children }) {
  const [tickets, setTickets]   = useState([]);
  const [rawInput, setRawInput] = useState("");
  const [error, setError]       = useState("");

  const addTicket = useCallback((raw) => {
    try {
      const parsed = parseTicketDJKI(raw);
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
    a.href = url; a.download = "djki_tickets.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [tickets]);

  return (
    <DJKITicketContext.Provider value={{ tickets, rawInput, setRawInput, error, addTicket, removeTicket, clearAll, exportToCSV, columns: COLUMNS }}>
      {children}
    </DJKITicketContext.Provider>
  );
}

export function useDJKITicket() {
  const ctx = useContext(DJKITicketContext);
  if (!ctx) throw new Error("useDJKITicket must be used inside <TicketProvider>");
  return ctx;
}