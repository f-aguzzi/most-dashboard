import "./App.css";
import { Typography } from "./components/ui/typography";
import { Button } from "./components/ui/button";
import { Slider } from "./components/ui/slider";
import LeafletMap from "./components/map";

function App() {
  return (
    <div className="h-screen w-screen bg-background text-foreground p-8 color-scheme: dark">
      <Typography version="h1">MOST Dashboard</Typography>
      <div className="grid grid-cols-2 gap-8 mt-8 h-full">
        <div className="flex flex-col space-y-16">
          <Slider className="m-8 w-auto" />
          <Button className="m-8 w-auto">Carica</Button>
        </div>
        <div className="flex flex-col space-y-4">
          <LeafletMap />
        </div>
      </div>
    </div>
  );
}

export default App;
