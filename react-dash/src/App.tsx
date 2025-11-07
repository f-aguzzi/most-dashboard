import { useState } from "react";
import "./App.css";
import "./i18n";
import Navbar from "./components/Navbar";
import ElectricDashboard from "./pages/ElectricDashboard";
import { Typography } from "./components/ui/typography";
import EmissionsDashboard from "./pages/EmissionsDashboard";
import BiometricDashboard from "./pages/BiometricDashboard";
import SocialDashboard from "./pages/SocialDashboard";
import DemandDashboard from "./pages/DemandDashboard";
import DroneDashboard from "./pages/DroneDashboard";

function App() {
  const [nightMode, setNightMode] = useState(false);
  const [page, setPage] = useState("electric-dashboard");

  const PageMaker = () => {
    if (page === "electric-dashboard") return <ElectricDashboard />;
    else if (page === "emissions-dashboard") return <EmissionsDashboard />;
    else if (page === "biometric") return <BiometricDashboard />;
    else if (page === "social") return <SocialDashboard />;
    else if (page === "demand-dashboard")
      return <DemandDashboard darkMode={nightMode} />;
    else if (page === "cargo") return <DroneDashboard />;
    else
      return (
        <>
          <Typography version="h1" className="p-8 m-8">
            Pagina inesistente.
          </Typography>
          <Typography version="h1" className="p-8 m-8">
            Siamo spiacenti per il disguido.
          </Typography>
        </>
      );
  };

  return (
    <div
      className={`
        h-full min-h-screen w-full min-w-screen bg-background text-foreground p-8 transition-all duration-500 ease-in-out
        ${nightMode ? "dark" : ""}
      `}
      style={{ colorScheme: nightMode ? "dark" : "light" }}
    >
      <div className="transition-all duration-500 ease-in-out">
        <Navbar
          nightMode={nightMode}
          setNightMode={setNightMode}
          setPage={setPage}
        />
        {PageMaker()}
      </div>
    </div>
  );
}

export default App;
