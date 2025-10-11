import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { type LatLngExpression, type LatLngTuple } from "leaflet";

// Fix for default markers
import icon from "@/assets/circle-dot.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface PolyLine {
  route: [];
  label: string;
  count: number;
  distance: number;
  seats: number;
  flown: number;
  co2: number;
  fuel: number;
}

interface Airport {
  location: LatLngTuple;
  label: string;
}

interface LeafletMapProps {
  polylines?: [PolyLine] | null;
  airports?: [Airport] | null;
  center?: LatLngExpression | [55.505, 13.0];
  zoom?: number | 4;
  display?: string | null;
}

export default function EmissionsMap(props: LeafletMapProps) {
  const computeWeight = (positions: PolyLine) => {
    if (props.display === "Consumo")
      return Math.round(Math.max(2, Math.min(positions.fuel * 0.006, 25)));
    else if (props.display === "Emissioni")
      return Math.round(Math.max(2, Math.min(positions.co2 * 0.004, 25)));
    else return Math.round(Math.max(2, Math.min(positions.count * 0.006, 25)));
  };

  const computeColor = (positions: PolyLine) => {
    if (positions.distance <= 307 && positions.seats <= 21) return "#ff6b35";
    else if (positions.distance <= 787 && positions.seats <= 86)
      return "#7cb342";
    else return "#1f88e0";
  };

  return (
    <div className="relative">
      <div id="map">
        <MapContainer
          center={props.center}
          zoom={props.zoom}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {props.polylines &&
            props.polylines.map((positions, index) => (
              <Polyline
                key={index + positions.label + props.display}
                positions={positions.route}
                weight={computeWeight(positions)}
                opacity={0.5}
                color={computeColor(positions)}
              >
                <Popup key={index + positions.label + "label"}>
                  <b>Rotta:</b> {positions.label}
                  <br />
                  <b>Numero di voli sostituiti: </b> {positions.count}
                  <br />
                  <b>Lunghezza della tratta: </b> {positions.distance} km
                  <br />
                  <b>Numero medio di passeggeri: </b> {positions.seats}
                  <br />
                  <b>Distanza totale volata: </b>{" "}
                  {(Math.round(positions.flown * 100) / 100).toLocaleString(
                    "it-IT",
                  )}{" "}
                  km
                  <br />
                  <b>Emissioni totali (convenzionale): </b>{" "}
                  {(Math.round(positions.co2 * 100) / 100).toLocaleString(
                    "it-IT",
                  )}{" "}
                  ton
                  <br />
                </Popup>
              </Polyline>
            ))}
          {props.airports &&
            props.airports.map((positions, index) => (
              <Marker key={index} position={positions.location}>
                <Popup>
                  <b>Aeroporto: </b>
                  {positions.label}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-[1000] border border-gray-200">
        <h3 className="font-bold text-xs mb-3 text-gray-800">Legenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-1 rounded"
              style={{ backgroundColor: "#ff6b35" }}
            ></div>
            <span className="text-xs text-gray-700">Scenario 1</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-1 rounded"
              style={{ backgroundColor: "#7cb342" }}
            ></div>
            <span className="text-xs text-gray-700">Scenario 2</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-1 rounded"
              style={{ backgroundColor: "#1f88e0" }}
            ></div>
            <span className="text-xs text-gray-700">Scenario 3</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-700">
              Spessore linee: {props.display}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { type PolyLine, type Airport };
