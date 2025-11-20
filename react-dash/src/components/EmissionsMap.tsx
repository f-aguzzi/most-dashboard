import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { type LatLngExpression, type LatLngTuple } from "leaflet";

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
  IT_19: number | null;
  IT_LF: number | null;
  EU_19: number | null;
  EU_LF: number | null;
  EU_35: number | null;
  EU_FR: number | null;
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
  scenario: string;
}

export default function EmissionsMap(props: LeafletMapProps) {
  const { t } = useTranslation();

  const computeWeight = (positions: PolyLine) => {
    // Risparmio emissioni
    if (props.display === "IT_19" && positions.IT_19 != null)
      return Math.round(Math.max(2, Math.min(positions.IT_19 * 0.0002, 25)));
    if (props.display === "IT_LF" && positions.IT_LF != null)
      return Math.round(Math.max(2, Math.min(positions.IT_LF * 0.0002, 25)));
    if (props.display === "EU_19" && positions.EU_19 != null)
      return Math.round(Math.max(2, Math.min(positions.EU_19 * 0.0002, 25)));
    if (props.display === "EU_LF" && positions.EU_LF != null)
      return Math.round(Math.max(2, Math.min(positions.EU_LF * 0.0002, 25)));
    if (props.display === "EU_35" && positions.EU_35 != null)
      return Math.round(Math.max(2, Math.min(positions.EU_35 * 0.00001, 25)));
    if (props.display === "EU_FR" && positions.EU_FR != null)
      return Math.round(Math.max(2, Math.min(positions.EU_FR * 0.00001, 25)));
    // Frequenza
    return Math.round(Math.max(2, Math.min(positions.count * 0.006, 25)));
  };

  const computeColor = (positions: PolyLine) => {
    if (positions.distance <= 400) return "#ff6b35";
    else if (positions.distance <= 800) return "#7cb342";
    else return "#1f88e0";
  };

  const translateLegend = (key: string | null | undefined) => {
    if (key === "Frequenza") return t("emissions.frequency");
    else return t("emissions.savings");
  };

  const fmtco2 = (value: number | null) => {
    if (value == null) return 0;
    return Math.round(value / 1000);
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
                  <b>{t("electric.map.seats")}: </b> {positions.seats}
                  <br />
                  <b>{t("electric.map.distance")}: </b>{" "}
                  {(Math.round(positions.flown * 100) / 100).toLocaleString(
                    "it-IT",
                  )}{" "}
                  km
                  <br />
                  {props.scenario === "s1" ? (
                    <>
                      <b>{t("emissions.savings")} (IT, ES-19): </b>
                      {fmtco2(positions.IT_19)} ton
                      <br />
                      <b>{t("emissions.savings")} (IT, LF=0,62): </b>
                      {fmtco2(positions.IT_LF)} ton
                      <br />
                      <b>{t("emissions.savings")} (EU, ES-19): </b>
                      {fmtco2(positions.EU_19)} ton
                      <br />
                      <b>{t("emissions.savings")} (EU, LF=0,62): </b>
                      {fmtco2(positions.EU_LF)} ton
                      <br />
                    </>
                  ) : (
                    <>
                      <b>{t("emissions.savings")} (EU 2030): </b>
                      {fmtco2(positions.EU_35)} ton
                      <br />
                      <b>{t("emissions.savings")} (EU Fully Renewable): </b>
                      {fmtco2(positions.EU_FR)} ton
                      <br />
                    </>
                  )}
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
