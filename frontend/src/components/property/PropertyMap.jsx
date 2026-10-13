import { useEffect, useRef } from 'react';
import './PropertyMap.css';

/**
 * PropertyMap — Leaflet-based map (no API key required).
 * Uses OpenStreetMap tiles.
 *
 * Props:
 *   latitude  — number
 *   longitude — number
 *   title     — string (popup label)
 */
const PropertyMap = ({ latitude, longitude, title = 'Property location' }) => {
  const mapRef     = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude) return;
    if (instanceRef.current) return; // already initialised

    // Dynamically import Leaflet to avoid SSR issues and keep chunk size manageable
    import('leaflet').then((L) => {
      // Fix default marker icon paths (Vite/webpack breaks them)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center:          [latitude, longitude],
        zoom:            15,
        zoomControl:     true,
        scrollWheelZoom: false,  // prevent accidental zoom while scrolling page
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<strong>${title}</strong>`, { maxWidth: 220 })
        .openPopup();

      instanceRef.current = map;
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  if (!latitude || !longitude) {
    return (
      <div className="property-map property-map--empty" aria-label="Map not available">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18S26 19.5 26 12c0-5.52-4.48-10-10-10z"
            stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <p>Location not available</p>
      </div>
    );
  }

  return (
    <div className="property-map" aria-label="Property location map">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className="property-map__canvas" />
    </div>
  );
};

export default PropertyMap;
