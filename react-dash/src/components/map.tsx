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
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface PolyLine {
  route: [];
  label: string;
  count: number;
}

interface Airport {
  location: LatLngTuple;
  label: string;
}

interface LeafletMapProps {
  polylines?: [PolyLine] | null;
  airports?: [Airport] | null;
}

export default function LeafletMap(props: LeafletMapProps) {
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
              key={index}
              positions={positions.route}
              weight={Math.round(
                Math.max(1, Math.min(positions.count * 1.0, 20)),
              )}
            >
              <Popup>
                <b>Rotta:</b> {positions.label}
                <br />
                <b>Numero di voli sostituiti: </b> {positions.count}
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
