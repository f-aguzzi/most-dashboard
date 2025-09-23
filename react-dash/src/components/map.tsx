import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";

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
}

export default function LeafletMap(props: LeafletMapProps) {
  const computeWeight = (positions: PolyLine) => {
    if (props.display === "Consumo")
      return Math.round(Math.max(1, Math.min(positions.fuel * 0.007, 20)));
    else if (props.display === "Emissioni")
      return Math.round(Math.max(1, Math.min(positions.co2 * 0.002, 20)));
    else return Math.round(Math.max(1, Math.min(positions.count * 0.02, 20)));
  };

  return (
    <div id="map">
      <MapContainer center={[55.505, 13.0]} zoom={4} scrollWheelZoom={true}>
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
                <b>Distanza totale volata: </b> {positions.flown} km
                <br />
                <b>Emissioni totali (convenzionale): </b> {positions.co2} ton
                <br />
                <b>Emissioni risparmiate: </b> {positions.deltaco2} ton
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
