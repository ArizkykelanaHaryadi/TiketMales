import { useState } from "react";

export default function Sidebar({ selected, setSelected }) {
  const [isOpen, setIsOpen] = useState(false);

  const menus = ["Dashboard", "KCI", "DJKI", "Pupuk Indonesia"];

  return (
    <>
      {/* Tombol hamburger — muncul hanya di mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg border border-slate-700"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay gelap saat sidebar terbuka di mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40
          w-64 min-h-screen bg-slate-900 border-r border-slate-700 p-6
          flex flex-col flex-shrink-0
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="text-white text-xl font-bold mb-8 mt-8 md:mt-0">
          Tenant Menu
        </h2>

        <div className="space-y-3">
          {menus.map((menu) => (
            <button
              key={menu}
              onClick={() => {
                setSelected(menu);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition text-sm ${
                selected === menu
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {menu}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}