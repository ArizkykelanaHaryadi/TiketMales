import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import KCIPage from "./pages/kci/TicketParserPage";
import { TicketProvider } from "./context/kci/TicketContext";
import DJKIPage from "./pages/djki/DJKITicketParserPage";
import { TicketProvider as DJKITicketProvider } from "./context/djki/DJKITicketContext";
import KiTPage from "./pages/kit/KiTTicketParserPage";
import { TicketProvider as KiTTicketProvider } from "./context/kit/KiTTicketContext";

function GalaxyCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const STARS = Array.from({ length: 220 }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 1.3 + 0.2,
      op: Math.random() * 0.55 + 0.2,
      tw: Math.random() * Math.PI * 2,
      ts: Math.random() * 0.4 + 0.15,
      vx: (Math.random() - 0.9) * 0.5,
      vy: (Math.random() - 0.5) * 0.06,
    }));

    const NEBULAE = [
      { cx: 0.15, cy: 0.2,  rr: 0.25, color: [56,  139, 253, 0.04] },
      { cx: 0.80, cy: 0.65, rr: 0.20, color: [188, 140, 255, 0.03] },
      { cx: 0.50, cy: 0.90, rr: 0.18, color: [88,  166, 255, 0.025] },
    ];

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, W, H);

      NEBULAE.forEach(({ cx, cy, rr, color: [r, g, b, a] }) => {
        const grd = ctx.createRadialGradient(cx*W, cy*H, 0, cx*W, cy*H, rr*W);
        grd.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      });

      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = "rgba(99,179,255,0.008)";
        ctx.fillRect(0, y, W, 1);
      }

      t += 0.016;
      STARS.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
        const alpha = Math.max(0, Math.min(1, s.op + Math.sin(t * s.ts + s.tw) * 0.2));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,225,255,${alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen text-white p-10">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-slate-400">Halaman ini sedang dalam pengembangan.</p>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState("Dashboard");

  const renderPage = () => {
    switch (selected) {
      case "Dashboard": return <DashboardPage />;
      case "KCI":
        return <TicketProvider><KCIPage /></TicketProvider>;
      case "DJKI":
        return <DJKITicketProvider><DJKIPage /></DJKITicketProvider>;
      case "KiT":
        return <KiTTicketProvider><KiTPage /></KiTTicketProvider>;
      case "Pupuk Indonesia":
        return <PlaceholderPage title="Pupuk Indonesia" />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Galaxy satu canvas, nutup seluruh viewport */}
      <GalaxyCanvas />

      {/* Layout di atas canvas */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar selected={selected} setSelected={setSelected} />
        <div className="flex-1 min-w-0">{renderPage()}</div>
      </div>
    </div>
  );
}