import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import ElectricDashboard from "./pages/ElectricDashboard";

function App() {
  const [nightMode, setNightMode] = useState(true);

  return (
    <div
      className={`
        h-screen w-screen bg-background text-foreground p-8
        transition-all duration-500 ease-in-out
        ${nightMode ? "dark" : ""}
      `}
      style={{ colorScheme: nightMode ? "dark" : "light" }}
    >
      <div className="transition-all duration-500 ease-in-out">
        <Navbar nightMode={nightMode} setNightMode={setNightMode} />
        <ElectricDashboard />
      </div>
    </div>
  );
}

export default App;
