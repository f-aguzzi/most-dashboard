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
  replaced: number;
  weight: number;
  co2: number;
}

interface Location {
  location: LatLngTuple;
  label: string;
}

interface DroneMapProps {
  polylines?: [PolyLine] | null;
  locations?: [Location] | null;
  display?: string | null;
  center?: LatLngExpression | [55.505, 13.0];
  zoom?: number | 4;
}

export default function DroneMap(props: DroneMapProps) {
  const { t } = useTranslation();

  const computeWeight = (positions: PolyLine) => {
    if (props.display === "flights")
      return Math.round(Math.max(5, Math.min(positions.count * 0.1, 20)));
    else return Math.round(Math.max(5, Math.min(positions.co2 * 0.02, 20)));
  };

  const formatNumber = (value: number) => {
    return (Math.round(value * 100.0) / 100.0).toLocaleString("it-IT");
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
                opacity={0.8}
              >
                <Popup key={index + positions.label + "label" + props.display}>
                  <b>{t("drone.map.route")}:</b> {positions.label}
                  <br />
                  <b>{t("drone.map.count")}: </b> {positions.count}
                  <br />
                  <b>{t("drone.map.replaced")}: </b> {positions.replaced}
                  <br />
                  <b>{t("drone.map.weight")}: </b>{" "}
                  {formatNumber(positions.weight)} kg
                  <br />
                  <b>{t("drone.map.co2")}: </b> {formatNumber(positions.co2)} kg
                  <br />
                </Popup>
              </Polyline>
            ))}
          {props.locations &&
            props.locations.map((positions, index) => (
              <Marker
                key={
                  index +
                  positions.location[0] +
                  positions.location[1] +
                  positions.label
                }
                position={positions.location}
              >
                <Popup>
                  <b>{t("drone.map.label")}: </b>
                  {positions.label}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

export { type PolyLine, type Location };
