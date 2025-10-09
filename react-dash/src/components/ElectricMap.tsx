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
  deltaco2: number;
}

interface Airport {
  location: LatLngTuple;
  label: string;
}

interface LeafletMapProps {
  polylines?: [PolyLine] | null;
  airports?: [Airport] | null;
  display?: string | null;
  center?: LatLngExpression | [55.505, 13.0];
  zoom?: number | 4;
}

export default function ElectricMap(props: LeafletMapProps) {
  const computeWeight = (positions: PolyLine) => {
    if (props.display === "Consumo")
      return Math.round(Math.max(1, Math.min(positions.fuel * 0.007, 20)));
    else if (props.display === "Emissioni")
      return Math.round(Math.max(1, Math.min(positions.co2 * 0.002, 20)));
    else return Math.round(Math.max(1, Math.min(positions.count * 0.008, 20)));
  };

  const computeColor = (positions: PolyLine) => {
    if (positions.distance <= 400 && positions.seats <= 20) {
      return "#ff6b35";
    } else if (positions.distance <= 400 && positions.seats <= 45) {
      return "#7cb342";
    } else {
      return "#1f88e0";
    }
  };

  return (
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
              <Popup key={index + positions.label + "label" + props.display}>
                <b>Rotta:</b> {positions.label}
                <br />
                <b>Numero di voli sostituiti: </b> {positions.count}
                <br />
                <b>Lunghezza della tratta: </b> {positions.distance} km
                <br />
                <b>Numero medio di posti offerti: </b> {positions.seats}
                <br />
                <b>Distanza totale volata: </b>{" "}
                {(Math.round(positions.flown * 100) / 100).toLocaleString(
                  "it-IT",
                )}{" "}
                km
                <br />
                <b>Emissioni totali (aereo convenzionale): </b>{" "}
                {Math.round(positions.co2).toLocaleString("it-IT")} ton
                <br />
                <b>Emissioni risparmiate: </b>{" "}
                {Math.round(positions.deltaco2).toLocaleString("it-IT")} ton
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
  );
}

export { type PolyLine, type Airport };
