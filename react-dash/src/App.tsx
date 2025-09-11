import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import ElectricDashboard from "./pages/ElectricDashboard";

function App() {
  const [nightMode, setNightMode] = useState(true);

  return (
    <div
      className={
        nightMode
          ? "h-screen w-screen bg-background text-foreground p-8 color-scheme: dark"
          : "h-screen w-screen bg-background text-foreground p-8"
      }
    >
      <Navbar nightMode={nightMode} setNightMode={setNightMode} />
      <ElectricDashboard />
    </div>
  );
}

export default App;
