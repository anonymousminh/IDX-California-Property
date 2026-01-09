import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '../types/property';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
    properties: Property[];
    onPropertyClick?: (property: Property) => void;
    selectedProperty?: Property | null;
    height?: string;
}

// Component to auto-fit bounds when properties change
function MapBounds({ properties }: { properties: Property[] }) {
    const map = useMap();
    
    useEffect(() => {
        if (properties.length > 0) {
            const validProperties = properties.filter(p => 
                p.latitude && p.longitude && 
                !isNaN(parseFloat(p.latitude)) && 
                !isNaN(parseFloat(p.longitude))
            );

            if (validProperties.length > 0) {
                const bounds = L.latLngBounds(
                    validProperties.map(p => [
                        parseFloat(p.latitude!),
                        parseFloat(p.longitude!)
                    ])
                );
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [properties, map]);

    return null;
}

// Component to handle selected property centering
function SelectedPropertyMarker({ property }: { property: Property }) {
    const map = useMap();
    
    useEffect(() => {
        if (property.latitude && property.longitude) {
            const lat = parseFloat(property.latitude);
            const lng = parseFloat(property.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                map.setView([lat, lng], 16, { animate: true });
            }
        }
    }, [property, map]);

    return null;
}

export function PropertyMap({ 
    properties, 
    onPropertyClick, 
    selectedProperty,
    height = '600px' 
}: PropertyMapProps) {
    const mapRef = useRef(null);

    // Filter properties with valid coordinates
    const validProperties = properties.filter(p => 
        p.latitude && p.longitude && 
        !isNaN(parseFloat(p.latitude)) && 
        !isNaN(parseFloat(p.longitude))
    );

    // Default center (US center)
    const defaultCenter: [number, number] = [39.8283, -98.5795];
    const defaultZoom = 4;

    const formatPrice = (price?: number | null) => {
        if (!price) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const createCustomIcon = (isSelected: boolean) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background-color: ${isSelected ? '#dc2626' : '#2563eb'};
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        transform: rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                    ">$</div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    };

    return (
        <div style={{ height, width: '100%', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapBounds properties={validProperties} />
                
                {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
                    <SelectedPropertyMarker property={selectedProperty} />
                )}

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {validProperties.map((property) => {
                        const lat = parseFloat(property.latitude!);
                        const lng = parseFloat(property.longitude!);
                        const isSelected = selectedProperty?.id === property.id;

                        return (
                            <Marker
                                key={property.id}
                                position={[lat, lng]}
                                icon={createCustomIcon(isSelected)}
                                eventHandlers={{
                                    click: () => {
                                        if (onPropertyClick) {
                                            onPropertyClick(property);
                                        }
                                    }
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '250px' }}>
                                        <h3 style={{ 
                                            fontSize: '16px', 
                                            fontWeight: 'bold', 
                                            marginBottom: '8px',
                                            color: '#1f2937'
                                        }}>
                                            {formatPrice(property.price)}
                                        </h3>
                                        
                                        {property.address && (
                                            <p style={{ 
                                                fontSize: '14px', 
                                                marginBottom: '4px',
                                                color: '#4b5563'
                                            }}>
                                                📍 {property.address}
                                            </p>
                                        )}
                                        
                                        <p style={{ 
                                            fontSize: '14px', 
                                            marginBottom: '8px',
                                            color: '#4b5563'
                                        }}>
                                            {property.city}, {property.state} {property.zip}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            color: '#374151'
                                        }}>
                                            {property.beds && (
                                                <span>🛏️ {property.beds} beds</span>
                                            )}
                                            {property.baths && (
                                                <span>🚿 {property.baths} baths</span>
                                            )}
                                        </div>

                                        {property.squareFeet && (
                                            <p style={{ 
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                marginBottom: '8px'
                                            }}>
                                                📏 {property.squareFeet.toLocaleString()} sq ft
                                            </p>
                                        )}

                                        {property.mlsNumber && (
                                            <p style={{ 
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                                marginTop: '8px'
                                            }}>
                                                MLS# {property.mlsNumber}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => onPropertyClick && onPropertyClick(property)}
                                            style={{
                                                marginTop: '8px',
                                                width: '100%',
                                                padding: '6px 12px',
                                                backgroundColor: '#2563eb',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
            
            {/* Stats overlay */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
                fontSize: '14px',
                fontWeight: '500'
            }}>
                📍 {validProperties.length} {validProperties.length === 1 ? 'property' : 'properties'} on map
            </div>
        </div>
    );
}

export default PropertyMap;
