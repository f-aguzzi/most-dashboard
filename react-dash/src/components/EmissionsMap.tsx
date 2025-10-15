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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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

  const translateLegend = (key: string | null | undefined) => {
    if (key === "Frequenza") return t("electric.display.frequency");
    else if (key === "Consumo") return t("electric.display.usage");
    else return t("electric.display.emissions");
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
                  <b>{t("electric.map.route")}:</b> {positions.label}
                  <br />
                  <b>{t("electric.map.number")}: </b> {positions.count}
                  <br />
                  <b>{t("electric.map.length")}: </b> {positions.distance} km
                  <br />
                  <b>{t("electric.map.seats)")}: </b> {positions.seats}
                  <br />
                  <b>{t("electric.map.distance")}: </b>{" "}
                  {(Math.round(positions.flown * 100) / 100).toLocaleString(
                    "it-IT",
                  )}{" "}
                  km
                  <br />
                  <b>{t("electric.map.emissions")}: </b>{" "}
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
                  <b>{t("electric.map.airport")}: </b>
                  {positions.label}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-[1000] border border-gray-200">
        <h3 className="font-bold text-xs mb-3 text-gray-800">
          {t("electric.legend.title")}
        </h3>
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
              {t("electric.legend.thickness")}: {translateLegend(props.display)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { type PolyLine, type Airport };
