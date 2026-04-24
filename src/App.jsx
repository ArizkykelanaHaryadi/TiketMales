import { useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import KCIPage from "./pages/kci/TicketParserPage";
import { TicketProvider } from "./context/kci/TicketContext";
import DJKIPage from "./pages/djki/DJKITicketParserPage";                        // ← tambah ini
import { TicketProvider as DJKITicketProvider } from "./context/djki/DJKITicketContext";

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-slate-400">
        Halaman ini sedang dalam pengembangan.
      </p>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState("Dashboard");

  const renderPage = () => {
    switch (selected) {
      case "Dashboard":
        return <DashboardPage />;

      case "KCI":
        return (
          <TicketProvider>  {/* ← wrap di sini */}
            <KCIPage />
          </TicketProvider>
        );

      case "DJKI":
  return (
    <DJKITicketProvider>
      <DJKIPage />
    </DJKITicketProvider>
  );

case "Pupuk Indonesia":
  return <PlaceholderPage title="Pupuk Indonesia" />;

      default:
        return <DashboardPage />;
    }
  };

  return (
  <div className="flex min-h-screen bg-slate-950">
    <Sidebar selected={selected} setSelected={setSelected} />
    <div className="flex-1 min-w-0">{renderPage()}</div>
  </div>
);
}