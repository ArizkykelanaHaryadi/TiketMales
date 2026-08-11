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

// ── getMultiBlock: ambil semua nilai dari label, join dengan \n ──────────────
function getMultiBlock(raw, labelPattern, mapFn = (l) => l) {
  const lines = extractBlock(raw, labelPattern);
  const results = lines.map(mapFn).filter(Boolean);
  return results.length > 0
  ? results.join("\r\n")
  : "-";
}

// ─── main parser ─────────────────────────────────────────────────────────────

function parseTicketDJKI(raw) {
  // ── Alarms Name ──
  const alarmsName =
    extractFirst(raw, /Sec\.?\s*Event\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Sec\.?\s*Event\s*:\s*(.+)/i)
      : extractFirst(raw, /Security Event\s*:\s*(.+)/i);

  // ── Signature (bisa lebih dari satu baris, join \n) ──
  const signature = getMultiBlock(raw, /Signature\s*:/i);

  // ── Created By — manual ──
  const createdBy = "";

  // ── Case ID ──
  const caseId =
    extractFirst(raw, /Case ID\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Case ID\s*:\s*(.+)/i)
      : extractFirst(raw, /Ticket ID\s*:\s*(.+)/i);

  // ── Event Time (Date / Time split) ──
  const waktuDeteksi = extractFirst(raw, /Waktu Deteksi\s*:\s*(.+)/i);
  let eventDate = "-", eventTime = "-";
  if (waktuDeteksi !== "-") {
    const parts = waktuDeteksi.split(" ");
    if (parts[0]) eventDate = parts[0];
    if (parts[1]) eventTime = parts[1];
  }

  // ── Ticket Date & Time (Date / Time split) — manual ──
  const ticketDate = "-";
  const ticketTime = "-";

  // ── SOC Response Time — manual ──
  const socResponseTime = "-";

  // ── Time Resolution — manual ──
  const timeResolution = "-";

  // ── Severity ──
  const severity =
    extractFirst(raw, /Category\s*:\s*(.+)/i) !== "-"
      ? extractFirst(raw, /Category\s*:\s*(.+)/i)
      : extractFirst(raw, /Severity\s*:\s*(.+)/i);

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

  // ── Source IP (semua, join \n) ──
  const ipSource = getMultiBlock(raw, /Source IP\s*:/i, (l) => {
    const m = l.match(/([\d.]+)/);
    return m ? m[1] : null;
  });

  // ── Country Code IP Source (semua, join \n) ──
  let countryCodeIpSource = getMultiBlock(raw, /Source Country\s*:/i);
  // fallback: ambil dari kurung di blok Source IP
  if (countryCodeIpSource === "-") {
    countryCodeIpSource = getMultiBlock(raw, /Source IP\s*:/i, (l) => {
      const m = l.match(/\(([^)]+)\)/);
      return m ? m[1].trim() : null;
    });
  }

  // ── Noted — manual ──
  const noted = "";

  // ── Destination IP (semua, join \n) ──
  const ipDestination = getMultiBlock(raw, /Destination IP\s*:/i, (l) => {
    const m = l.match(/([\d.]+)/);
    return m ? m[1] : null;
  });

  // ── Country Code IP Destination (semua, join \n) ──
  // "(Internal)" bisa muncul sebagai baris tersendiri di blok Destination IP
  let countryCodeIpDestination = getMultiBlock(raw, /Destination IP\s*:/i, (l) => {
    const m = l.match(/\(([^)]+)\)/);
    return m ? m[1].trim() : null;
  });
  if (countryCodeIpDestination === "-") {
    const afterDst = raw.match(/Destination IP\s*:\s*[\n\s\d.]+\(([^)]+)\)/i);
    if (afterDst) countryCodeIpDestination = afterDst[1].trim();
  }

  // ── Destination Port (semua, join \n) ──
  const destinationPort = getMultiBlock(raw, /Destination Port\s*:/i);

  // ── Destination Host (semua, join \n) ──
  const destinationHost = getMultiBlock(raw, /Destination Host\s*:/i);

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

  // ── DJKI Respond Time (Date / Time split) — manual ──
  const djkiRespondDate = "-";
  const djkiRespondTime = "-";

  // ── DJKI Response Time — manual ──
  const djkiResponseTime = "-";

  return {
    alarmsName,
    signature,
    createdBy,
    caseId,
    eventDate,
    eventTime,
    ticketDate,
    ticketTime,
    socResponseTime,
    timeResolution,
    severity,
    eventStatus,
    action,
    ipSource,
    countryCodeIpSource,
    noted,
    ipDestination,
    countryCodeIpDestination,
    destinationPort,
    destinationHost,
    threatCategory,
    stage,
    tactic,
    technique,
    subTechnique,
    djkiRespondDate,
    djkiRespondTime,
    djkiResponseTime,
  };
}

// ─── column definition ────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "alarmsName",               label: "Alarms Name" },
  { key: "signature",                label: "Signature" },
  { key: "createdBy",                label: "Created By" },
  { key: "caseId",                   label: "Case ID" },
  { key: "eventDate",                label: "Event Time - Date" },
  { key: "eventTime",                label: "Event Time - Time" },
  { key: "eventDate",                label: "Event Time - Date" },
  { key: "ticketTime",               label: "Ticket Date & Time - Time" },
  { key: "socResponseTime",          label: "SOC Response Time" },
  { key: "timeResolution",           label: "Time Resolution" },
  { key: "timeResolution",           label: "Time Resolution" },
  { key: "severity",                 label: "Severity" },
  { key: "eventStatus",              label: "Event Status" },
  { key: "action",                   label: "Action" },
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
  const rows = tickets.map((t) =>
    COLUMNS.map((c) => `"${(t[c.key] ?? "-").toString().replace(/"/g, '""')}"`).join(",")
  );
  const csv = [header, ...rows].join("\r\n");  // ← CRLF
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });  // ← BOM
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
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