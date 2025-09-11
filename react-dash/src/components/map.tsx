import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

// Fix for default markers
import icon from "@/assets/circle-dot.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface LeafletMapProps {
  polylines?: [] | null;
  airports?: [] | null;
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
            <Polyline key={index} positions={positions.route}>
              <Popup>{positions.label}</Popup>
            </Polyline>
          ))}
        {props.airports &&
          props.airports.map((positions, index) => (
            <Marker key={index} position={positions.location}>
              <Popup>{positions.label}</Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
