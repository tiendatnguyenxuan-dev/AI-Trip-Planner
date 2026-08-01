import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ActivityResponse } from '../../../types/trip';

interface InteractiveMapProps {
  activities: ActivityResponse[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: ActivityResponse) => void;
  destinationName?: string;
}

const DESTINATION_COORDS: Record<string, [number, number]> = {
  'đà lạt': [11.9404, 108.4583],
  'bà rịa - vũng tàu': [10.3460, 107.0843],
  'vũng tàu': [10.3460, 107.0843],
  'đà nẵng': [16.0544, 108.2022],
  'hồ chí minh': [10.7769, 106.7009],
  'sài gòn': [10.7769, 106.7009],
  'hà nội': [21.0285, 105.8542],
  'phú quốc': [10.2899, 103.9840],
  'nha trang': [12.2388, 109.1967],
  'hội an': [15.8801, 108.3380],
  'sa pa': [22.3364, 103.8438],
  'côn đảo': [8.6833, 106.6000],
  'mũi né': [10.9333, 108.2833],
  'phan thiết': [10.9333, 108.1000],
  'quy nhơn': [13.7550, 109.1768],
  'ninh bình': [20.2506, 105.9745],
  'huế': [16.4637, 107.5909],
  'cần thơ': [10.0452, 105.7469],
  'hạ long': [20.9500, 107.0833]
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activities,
  selectedActivityId,
  onSelectActivity,
  destinationName = 'đà lạt'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const destKey = destinationName.toLowerCase().trim();
  const defaultCenter: [number, number] = DESTINATION_COORDS[destKey] || [11.9404, 108.4583];

  // Dynamic flyTo for any destination (cache + online Nominatim fallback)
  useEffect(() => {
    if (!destinationName || !mapRef.current) return;

    const destKey = destinationName.toLowerCase().trim();
    if (DESTINATION_COORDS[destKey]) {
      const coords = DESTINATION_COORDS[destKey];
      mapRef.current.flyTo(coords, 13, { animate: true, duration: 1.5 });
    } else {
      // Dynamic OpenStreetMap Geocoding for any custom place worldwide
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0 && mapRef.current) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            mapRef.current.flyTo([lat, lng], 13, { animate: true, duration: 1.5 });
          }
        })
        .catch((err) => console.warn('Geocoding error in map:', err));
    }
  }, [destinationName]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!activities || activities.length === 0) {
      const centerIcon = L.divIcon({
        className: 'custom-map-center-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-10 h-10 rounded-full bg-sky-500/30 animate-ping absolute"></div>
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-xl z-10">
              <span class="material-symbols-outlined text-lg">location_on</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const centerMarker = L.marker(defaultCenter, { icon: centerIcon }).addTo(map);
      centerMarker.bindPopup(`<div class="font-bold text-xs p-1">Điểm đến: ${destinationName}</div>`);
      markersRef.current['center'] = centerMarker;
      return;
    }

    // Only draw polyline if activities are real itinerary stops (not default sample)
    const isCustomItinerary = activities.some((a) => !a.id.startsWith('default_'));
    const points: [number, number][] = [];

    activities.forEach((act, index) => {
      const baseLat = defaultCenter[0];
      const baseLng = defaultCenter[1];
      const latOffset = (index - activities.length / 2) * 0.008 + (Math.sin(index * 1.5) * 0.003);
      const lngOffset = (index - activities.length / 2) * 0.008 + (Math.cos(index * 1.5) * 0.003);
      
      const lat = baseLat + latOffset;
      const lng = baseLng + lngOffset;
      points.push([lat, lng]);

      const isSelected = act.id === selectedActivityId;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-indigo-500 ring-4 ring-indigo-300' : 'bg-slate-800 border-2 border-emerald-400'} text-white text-xs font-bold flex items-center justify-center shadow-lg">
              ${index + 1}
            </div>
            <div class="absolute -bottom-1 w-2 h-2 bg-emerald-400 rotate-45"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<div class="font-bold text-xs p-1">${act.name}</div>`);
      marker.on('click', () => onSelectActivity(act));
      markersRef.current[act.id] = marker;
    });

    if (isCustomItinerary && points.length > 1) {
      polylineRef.current = L.polyline(points, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);
    }
  }, [activities, selectedActivityId, destinationName]);

  useEffect(() => {
    if (selectedActivityId && markersRef.current[selectedActivityId] && mapRef.current) {
      const marker = markersRef.current[selectedActivityId];
      mapRef.current.panTo(marker.getLatLng(), { animate: true });
    }
  }, [selectedActivityId]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-slate-700/60">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Bản đồ Tương tác • <span className="capitalize font-bold text-emerald-300">{destinationName}</span>
      </div>
    </div>
  );
};
