import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { LocationPopupContent } from './LocationPopupContent';

interface HeatmapPoint {
  lat: number;
  lng: number;
  count: number;
  bairro: string;
  municipio: string;
  estado: string;
}

interface EvaluationHeatmapProps {
  points: HeatmapPoint[];
}

function FitBounds({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();
  useMemo(() => {
    if (points.length > 0) {
      const bounds = points.map(p => [p.lat, p.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [points, map]);
  return null;
}

function HeatLayer({ points, maxCount }: { points: HeatmapPoint[]; maxCount: number }) {
  const map = useMap();
  useEffect(() => {
    const heat = L.heatLayer(
      points.map(p => [p.lat, p.lng, p.count / maxCount] as [number, number, number]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1,
        minOpacity: 0.4,
        gradient: {
          0.0: '#3b82f6',
          0.25: '#22c55e',
          0.5: '#eab308',
          0.75: '#f97316',
          1.0: '#ef4444',
        },
      }
    );
    heat.addTo(map);
    return () => { map.removeLayer(heat); };
  }, [map, points, maxCount]);
  return null;
}

function InteractionCircle({ point }: { point: HeatmapPoint }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <CircleMarker
      center={[point.lat, point.lng]}
      radius={18}
      pathOptions={{ fillOpacity: 0, opacity: 0, weight: 0 }}
      eventHandlers={{
        popupopen: () => setIsPopupOpen(true),
        popupclose: () => setIsPopupOpen(false),
      }}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        <span className="text-xs font-medium">{point.bairro || point.municipio} — {point.count}</span>
      </Tooltip>
      <Popup>
        <LocationPopupContent
          bairro={point.bairro}
          municipio={point.municipio}
          estado={point.estado}
          count={point.count}
          isOpen={isPopupOpen}
        />
      </Popup>
    </CircleMarker>
  );
}

export function EvaluationHeatmap({ points }: EvaluationHeatmapProps) {
  const maxCount = useMemo(() => Math.max(...points.map(p => p.count), 1), [points]);

  return (
    <MapContainer
      center={[-15.78, -47.93]}
      zoom={4}
      className="h-full w-full rounded-xl"
      style={{ minHeight: 400 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      <HeatLayer points={points} maxCount={maxCount} />
      {points.map((point, i) => (
        <InteractionCircle key={`${point.lat}-${point.lng}-${i}`} point={point} />
      ))}
    </MapContainer>
  );
}
