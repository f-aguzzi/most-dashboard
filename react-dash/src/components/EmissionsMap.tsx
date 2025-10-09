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
}

export default function EmissionsMap(props: LeafletMapProps) {
  const computeWeight = (positions: PolyLine) => {
    return Math.round(Math.max(1, Math.min(positions.co2 * 0.002, 20)));
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
              key={index + positions.label}
              positions={positions.route}
              weight={computeWeight(positions)}
              opacity={0.5}
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
  );
}

export { type PolyLine, type Airport };
