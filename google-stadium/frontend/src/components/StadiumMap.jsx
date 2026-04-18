import React, { useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import blueprintImage from '../assets/stadium-blueprint.jpg';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapZoomController() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 500); 
    }, [map]);
    return null;
}

export default function StadiumMap({ densityData }) {
  const bounds = [[0, 0], [1000, 1000]];

  return (
    <div className="w-full h-[500px] border border-gray-700 rounded-lg overflow-hidden relative shadow-inner bg-gray-900 z-0">
      <MapContainer 
        crs={L.CRS.Simple} 
        bounds={bounds} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={true}
        maxZoom={3}
      >
        <ImageOverlay url={blueprintImage} bounds={bounds} />

        <Marker position={[700, 300]}>
            <Popup>
                <strong>Zone A</strong><br/>
                {densityData?.zone === 'A' ? `Density: ${densityData.count} (${densityData.status})` : 'Normal'}
            </Popup>
        </Marker>
        
        <Marker position={[300, 700]}>
             <Popup>
                <strong>Zone B</strong><br/>
                {densityData?.zone === 'B' ? `Density: ${densityData.count} (${densityData.status})` : 'Normal'}
            </Popup>
        </Marker>

        <MapZoomController />
      </MapContainer>
    </div>
  );
}
