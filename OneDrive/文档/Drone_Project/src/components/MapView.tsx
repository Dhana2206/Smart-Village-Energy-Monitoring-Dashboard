import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertCircle, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  setView: (v: any, id?: string) => void;
}

export function MapView({ setView }: MapViewProps) {
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const q = query(collection(db, 'inspections'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPoints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Geospatial Intelligence</h2>
          <p className="text-slate-400 mt-1">Real-world coordinates of detected infrastructure faults.</p>
        </div>
        
        <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-brand-danger/10 px-3 py-1.5 rounded-lg border border-brand-danger/20 text-[10px] font-bold text-brand-danger uppercase">
                <AlertCircle size={14} /> Major Faults
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase">
                <CheckCircle2 size={14} /> Clear zones
            </div>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] rounded-3xl overflow-hidden glass-panel border-4 border-slate-900 shadow-2xl relative">
        {!loading && points.length > 0 ? (
          <MapContainer 
            center={[34.0522, -118.2437]} 
            zoom={10} 
            className="w-full h-full z-0"
            style={{ filter: 'grayscale(1) invert(1) contrast(1.2) brightness(0.8)' }} // Dark map hack
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((p) => (
              <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
                <Popup className="tech-popup">
                  <div className="p-3 min-w-[200px] bg-[#0f172a] text-white rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] font-bold uppercase text-brand-primary">Ref: {p.id.slice(0, 8)}</span>
                       {p.faultsDetected?.length > 0 ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-brand-danger animate-pulse" />
                       ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                       )}
                    </div>
                    <p className="text-sm font-bold mb-2 line-clamp-2">{p.summary}</p>
                    <button 
                      onClick={() => setView('detail', p.id)}
                      className="w-full bg-brand-primary text-slate-900 py-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-widest"
                    >
                      Inspect Data <ChevronRight size={12} />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
             <MapPin className="text-brand-primary animate-bounce" size={48} />
             <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Connecting GIS Link...</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-slate-500">No geo-tagged inspections available.</p>
          </div>
        )}
      </div>

      <style>{`
        .leaflet-container { background: #0b0e14 !important; }
        .tech-popup .leaflet-popup-content-wrapper { background: #0f172a; border: 1px solid #1e293b; color: white; border-radius: 12px; }
        .tech-popup .leaflet-popup-tip { background: #0f172a; }
        .tech-popup .leaflet-popup-content { margin: 0; }
      `}</style>
    </div>
  );
}
