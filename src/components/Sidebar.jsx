import { useState, useEffect } from "react";

const MENU_CONFIG = [
  { name: "Dashboard",       code: "SYS", disabled: false },
  { name: "KCI",             code: "KCI", disabled: false },
  { name: "DJKI",            code: "DJK", disabled: false },
  { name: "KiT",             code: "KIT", disabled: false },
  { name: "Pupuk Indonesia", code: "PKI", disabled: true  },
];

// Warna utama (solid) untuk active state & hover text
const TENANT_COLOR = {
  Dashboard:         "#60a5fa",  // blue-400
  KCI:               "#eab308",  // yellow-500
  DJKI:              "#06b6d4",  // cyan-500
  KiT:               "#3b82f6",  // blue-500
  "Pupuk Indonesia": "#64748b",  // slate-500
};

// Gradient dari-ke untuk hover glow sweep & active background
const TENANT_GRADIENT = {
  Dashboard:         ["#60a5fa", "#3b82f6"],  // blue
  KCI:               ["#eab308", "#a16207"],  // yellow-500 → yellow-700
  DJKI:              ["#06b6d4", "#0e7490"],  // cyan-500  → cyan-700
  KiT:               ["#3b82f6", "#1d4ed8"],  // blue-500  → blue-700
  "Pupuk Indonesia": ["#64748b", "#334155"],  // slate
};

export default function Sidebar({ selected, setSelected }) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [timeStr,   setTimeStr]   = useState("--:--:--");
  const [tick,      setTick]      = useState(0);
  const [hovered,   setHovered]   = useState(null);

  useEffect(() => {
    const update = () => {
      setTimeStr(new Date().toLocaleTimeString("id-ID", { hour12: false }));
      setTick((t) => t + 1);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ── Hamburger (mobile) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-3 z-50 font-mono text-sm text-blue-400 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* ── Overlay (mobile) ── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/70"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:static z-40
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-[220px] min-h-screen flex flex-col shrink-0
          bg-[#0d1117]/50 border-r border-slate-700/30 backdrop-blur-[2px]
        `}
      >
        {/* ── Logo ── */}
        <div className="px-4 pt-5 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-mono text-[9px] text-blue-400 tracking-[.2em] uppercase">Online</span>
          </div>
          <div className="font-serif text-base font-bold text-slate-100 mb-0.5">
            SOC Parser
          </div>
          <div className="font-mono text-[9px] text-slate-600">
            Ticket → Google Sheets
          </div>
          <div className="mt-3 inline-block font-mono text-[10px] text-blue-400 bg-slate-800/80 border border-slate-700/60 rounded px-2 py-0.5">
            {timeStr}
          </div>
        </div>

        {/* ── Section Label ── */}
        <div className="px-4 pt-3 pb-1.5 font-mono text-[9px] text-slate-700 uppercase tracking-[.2em]">
          ▸ Tenant Node
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-2.5 pb-2">
          {MENU_CONFIG.map((menu) => {
            const isActive   = selected === menu.name;
            const isDisabled = menu.disabled;
            const isHovered  = hovered === menu.name;
            const color      = TENANT_COLOR[menu.name]    || "#60a5fa";
            const [c1, c2]   = TENANT_GRADIENT[menu.name] || ["#60a5fa", "#3b82f6"];

            return (
              <button
                key={menu.name}
                onClick={() => {
                  if (!isDisabled) {
                    setSelected(menu.name);
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => !isDisabled && setHovered(menu.name)}
                onMouseLeave={() => setHovered(null)}
                disabled={isDisabled}
                className={`
                  w-full text-left flex items-center gap-2.5
                  rounded-md px-2.5 py-2 mb-1 relative overflow-hidden
                  transition-all duration-200
                  ${isDisabled ? "opacity-35 cursor-not-allowed" : "cursor-pointer"}
                `}
                style={{
                  transform:  isHovered && !isActive ? "translateX(2px)" : "translateX(0)",
                  background: isActive
                    ? `linear-gradient(90deg, ${c1}18, ${c2}08)`
                    : isHovered
                    ? `linear-gradient(90deg, ${c1}12, transparent 80%)`
                    : "transparent",
                  border:     isActive || isHovered
                    ? `1px solid ${c1}35`
                    : "1px solid transparent",
                  borderLeft: isActive
                    ? `3px solid ${c1}`
                    : isHovered
                    ? `3px solid ${c1}80`
                    : "3px solid transparent",
                  boxShadow:  isHovered && !isActive
                    ? `2px 0 14px -5px ${c1}`
                    : "none",
                }}
              >
                {/* Hover sweep shimmer */}
                {isHovered && !isActive && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-md"
                    style={{
                      background: `linear-gradient(90deg, ${c1}08, transparent 60%)`,
                    }}
                  />
                )}

                {/* Code badge */}
                <span
                  className="font-mono text-[9px] rounded px-1.5 py-px min-w-[28px] text-center tracking-wide shrink-0 transition-all duration-200 relative z-10"
                  style={{
                    color:      isActive || isHovered ? c1       : "#334155",
                    background: isActive || isHovered ? `${c1}18` : "#161b22",
                    border:     `1px solid ${isActive || isHovered ? c1 + "40" : "#21262d"}`,
                  }}
                >
                  {menu.code}
                </span>

                {/* Name */}
                <span
                  className="font-mono text-[11px] flex-1 transition-all duration-200 relative z-10"
                  style={{
                    color:      isActive || isHovered ? c1 : "#64748b",
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {menu.name}
                </span>

                {/* Active dot */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 relative z-10"
                    style={{
                      background: `radial-gradient(circle, ${c1}, ${c2})`,
                      boxShadow:  `0 0 6px ${c1}`,
                    }}
                  />
                )}

                {/* Coming soon badge */}
                {isDisabled && (
                  <span className="font-mono text-[8px] text-slate-600 border border-slate-700/50 rounded px-1 py-px relative z-10">
                    SOON
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="px-4 py-3.5 border-t border-slate-800">
          {/* Threat level bar */}
          <div className="mb-3">
            <div className="font-mono text-[9px] text-slate-700 uppercase tracking-widest mb-1.5">
              Threat Level
            </div>
            <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "62%", background: "linear-gradient(90deg, #60a5fa, #fbbf24)" }}
              />
            </div>
            <div className="font-mono text-[9px] text-amber-400 mt-1">ELEVATED</div>
          </div>

          <div className="font-mono text-[9px] text-slate-800 text-center">
            v2.0 · BUILD {String(tick).padStart(4, "0")}
          </div>
        </div>
      </aside>
    </>
  );
}