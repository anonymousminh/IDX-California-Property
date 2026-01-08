import { useState, useEffect } from 'react';
import { propertyService } from './services/api';
import type {Property, PropertyFilters} from './types/property';
import './App.css';

function App() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [pageInfo, setPageInfo] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    });

    // Filter state
    const [filters, setFilters] = useState<PropertyFilters>({
        city: '',
        state: '',
        zip: '',
        minPrice: undefined,
        maxPrice: undefined,
        beds: undefined,
        minBeds: undefined,
        baths: undefined,
        minBaths: undefined,
        page: 0,
        size: 20,
        sort: '',
    });

    // Fetch properties
    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await propertyService.getProperties(filters);
            setProperties(data.content);
            setPageInfo({
                currentPage: data.number,
                totalPages: data.totalPages,
                totalElements: data.totalElements,
            });
            // Debug: Log first property to see what fields are available
            console.log('Properties fetched:', data.content.length);
            if (data.content.length > 0) {
                console.log('Sample property data:', data.content[0]);
                console.log('Photos field:', data.content[0].photos);
                console.log('All property keys:', Object.keys(data.content[0]));
            } else {
                console.warn('No properties returned from API');
            }
        } catch (err) {
            setError('Failed to load properties. Make sure your Spring Boot API is running on http://localhost:8080');
            console.error('Error fetching properties:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filters)]);

    // Handle filter changes
    const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value,
            page: 0, // Reset to first page when filters change
        }));
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Format price
    const formatPrice = (price: number | null | undefined) => {
        if (!price || price === 0) return 'Price not available';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Get first photo URL from photos field
    // L_Photos can be stored as JSON array string, comma-separated, newline-separated, or single URL
    const getPhotoUrl = (photos: string | undefined): string | null => {
        if (!photos || photos.trim() === '') return null;

        // Clean the photos string
        const cleaned = photos.trim();

        // Try parsing as JSON array first (most common format from database)
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            try {
                const photoArray = JSON.parse(cleaned);
                if (Array.isArray(photoArray) && photoArray.length > 0) {
                    const firstUrl = photoArray[0];
                    if (typeof firstUrl === 'string' && firstUrl.trim().length > 0) {
                        return firstUrl.trim();
                    }
                }
            } catch (e) {
                // If JSON parsing fails, continue with other methods
                console.warn('Failed to parse photos as JSON:', e);
            }
        }

        // Try comma-separated
        if (cleaned.includes(',')) {
            const firstUrl = cleaned.split(',')[0].trim();
            if (firstUrl && firstUrl.length > 0 && !firstUrl.startsWith('[')) {
                return firstUrl;
            }
        }

        // Try newline-separated
        if (cleaned.includes('\n')) {
            const firstUrl = cleaned.split('\n')[0].trim();
            if (firstUrl && firstUrl.length > 0) {
                return firstUrl;
            }
        }

        // Try semicolon-separated
        if (cleaned.includes(';')) {
            const firstUrl = cleaned.split(';')[0].trim();
            if (firstUrl && firstUrl.length > 0) {
                return firstUrl;
            }
        }

        // If it looks like a single URL, return it
        if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('/')) {
            return cleaned;
        }

        // If it's a non-empty string, try to use it (might be a relative path or encoded)
        if (cleaned.length > 0 && !cleaned.startsWith('[')) {
            return cleaned;
        }

        return null;
    };

    // Helper function to get property field value (handles both camelCase and snake_case)
    const getPropertyValue = (property: Property, camelKey: string, snakeKey: string): any => {
        return (property as any)[camelKey] ?? (property as any)[snakeKey] ?? null;
    };

    // Property Card Component
    const PropertyCard = ({ property }: { property: Property }) => {
        try {
            // Debug: Log property data to see what we're getting
            if (import.meta.env.DEV) {
                console.log('PropertyCard rendering for property ID:', property.id);
            }
            
            const photoUrl = getPhotoUrl(property.photos ?? undefined);
            
            // Debug: Log photo URL
            if (import.meta.env.DEV && property.photos) {
                console.log('Photos field:', property.photos.substring(0, 100), 'Extracted URL:', photoUrl);
            }

            // Get values with fallback for both naming conventions
            const landSize = getPropertyValue(property, 'landSize', 'land_size');
            const yearBuilt = getPropertyValue(property, 'yearBuilt', 'year_built');
            const propertyType = getPropertyValue(property, 'householdType', 'household_type') || 
                                 getPropertyValue(property, 'type', 'type') ||
                                 getPropertyValue(property, 'propertyClass', 'property_class');
            
            const beds = property.beds ?? 0;
            const baths = property.baths ?? 0;
            const squareFeet = property.squareFeet;
            const status = property.status || property.standardStatus;
            const daysOnMarket = property.daysOnMarket;

            return (
            <div
                className="property-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 min-h-[340px] h-full"
                style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    minHeight: '340px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={() => setSelectedProperty(property)}
            >
                {/* Property Image */}
                <div className="relative h-56 overflow-hidden bg-gray-200">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={`${property.address || property.city || 'Property'} property`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.fallback-placeholder')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'fallback-placeholder w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold';
                                    fallback.textContent = (property.city || property.address || '?').charAt(0).toUpperCase();
                                    parent.appendChild(fallback);
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold">
                            {(property.city || property.address || '?').charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Price Badge */}
                    {property.price && (
                        <div className="price-badge absolute top-4 left-4" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '0.625rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {formatPrice(property.price)}
                        </div>
                    )}

                    {/* Property Type Badge */}
                    {propertyType && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {String(propertyType).replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                    )}

                    {/* Status Badge */}
                    {status && (
                        <div className="status-badge absolute bottom-4 right-4" style={{
                            background: 'rgba(34, 197, 94, 0.95)',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                        }}>
                            {String(status)}
                        </div>
                    )}

                    {/* Days on Market */}
                    {daysOnMarket !== null && daysOnMarket !== undefined && (
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {daysOnMarket} {daysOnMarket === 1 ? 'day' : 'days'} on market
                        </div>
                    )}
                </div>

                {/* Property Info */}
                <div className="p-5">
                    {/* Address */}
                    {property.address && (
                        <div className="text-lg font-semibold text-gray-800 mb-1 truncate">
                            {property.address}
                        </div>
                    )}

                    {/* Location */}
                    <div className="text-gray-600 mb-3">
                        {[property.city, property.state, property.zip].filter(Boolean).join(', ') || 'Location not available'}
                    </div>

                    {/* Property Details */}
                    <div className="flex gap-4 text-sm text-gray-700 mb-3 flex-wrap">
                        <span className="flex items-center gap-1">
                            <span className="text-lg">🛏️</span>
                            <span className="font-semibold">{beds}</span>
                            <span className="text-gray-500">beds</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-lg">🛁</span>
                            <span className="font-semibold">{baths}</span>
                            {property.bathroomsHalf && property.bathroomsHalf > 0 && (
                                <span className="text-gray-500">.{property.bathroomsHalf}</span>
                            )}
                            <span className="text-gray-500">baths</span>
                        </span>
                        {squareFeet ? (
                            <span className="flex items-center gap-1">
                                <span className="text-lg">📏</span>
                                <span className="font-semibold">{Number(squareFeet).toLocaleString()}</span>
                                <span className="text-gray-500">sqft</span>
                            </span>
                        ) : landSize && (
                            <span className="flex items-center gap-1">
                                <span className="text-lg">📏</span>
                                <span className="font-semibold">{Number(landSize).toLocaleString()}</span>
                                <span className="text-gray-500">sqft</span>
                            </span>
                        )}
                        {property.storiesTotal && (
                            <span className="flex items-center gap-1">
                                <span className="text-lg">🏢</span>
                                <span className="font-semibold">{property.storiesTotal}</span>
                                <span className="text-gray-500">stories</span>
                            </span>
                        )}
                    </div>

                    {/* Key Features */}
                    {(property.poolPrivate || property.fireplace || property.view || property.garage) && (
                        <div className="flex gap-2 text-xs text-gray-600 mb-3 flex-wrap">
                            {property.poolPrivate && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">🏊 Pool</span>
                            )}
                            {property.fireplace && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">🔥 Fireplace</span>
                            )}
                            {property.view && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🏔️ View</span>
                            )}
                            {property.garage && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">🚗 Garage</span>
                            )}
                        </div>
                    )}

                    {/* MLS Number */}
                    {property.mlsNumber && (
                        <div className="text-xs text-gray-500 mb-2">
                            MLS: {property.mlsNumber}
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        {yearBuilt && (
                            <span className="text-sm text-gray-600">
                                Built {yearBuilt}
                            </span>
                        )}
                        {property.subdivisionName && (
                            <span className="text-sm text-gray-600 truncate ml-2" title={property.subdivisionName}>
                                📍 {property.subdivisionName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            );
        } catch (error) {
            console.error('Error rendering PropertyCard:', error, property);
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-700 font-semibold">Error rendering property</div>
                    <div className="text-red-600 text-sm">ID: {property.id}</div>
                    <div className="text-red-600 text-xs mt-2">{String(error)}</div>
                </div>
            );
        }
    };

    // Property Detail Modal
    const PropertyDetailModal = ({ property, onClose }: { property: Property; onClose: () => void }) => {
        const photoUrl = getPhotoUrl(property.photos ?? undefined);
        
        // Get values with fallback for both naming conventions
        const yearBuilt = getPropertyValue(property, 'yearBuilt', 'year_built');
        const propertyType = getPropertyValue(property, 'householdType', 'household_type') || 
                             getPropertyValue(property, 'type', 'type') ||
                             getPropertyValue(property, 'propertyClass', 'property_class');
        const squareFeet = property.squareFeet;
        const lotSize = property.lotSizeSquareFeet;
        const status = property.status || property.standardStatus;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={`${property.address || property.city || 'Property'} property`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-6xl font-bold">
                                {(property.city || property.address || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-blue-600">
                                    {property.price ? formatPrice(property.price) : 'Price not available'}
                                </h2>
                                {property.mlsNumber && (
                                    <div className="text-sm text-gray-500 mt-1">MLS: {property.mlsNumber}</div>
                                )}
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                        </div>

                        {/* Status and Days on Market */}
                        {(status || property.daysOnMarket) && (
                            <div className="flex gap-3 mb-4">
                                {status && (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        {String(status)}
                                    </span>
                                )}
                                {property.daysOnMarket !== null && property.daysOnMarket !== undefined && (
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        {property.daysOnMarket} {property.daysOnMarket === 1 ? 'day' : 'days'} on market
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-gray-600 text-sm">Location</div>
                                <div className="font-semibold">
                                    {[property.city, property.state, property.zip].filter(Boolean).join(', ') || 'Not available'}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600 text-sm">Property ID</div>
                                <div className="font-semibold">#{property.id}</div>
                            </div>
                            {property.address && (
                                <div className="col-span-2">
                                    <div className="text-gray-600 text-sm">Address</div>
                                    <div className="font-semibold">{property.address}</div>
                                </div>
                            )}
                            {property.addressStreet && (
                                <div className="col-span-2">
                                    <div className="text-gray-600 text-sm">Street</div>
                                    <div className="font-semibold">{property.addressStreet}</div>
                                </div>
                            )}
                            {property.subdivisionName && (
                                <div>
                                    <div className="text-gray-600 text-sm">Subdivision</div>
                                    <div className="font-semibold">{property.subdivisionName}</div>
                                </div>
                            )}
                            {property.county && (
                                <div>
                                    <div className="text-gray-600 text-sm">County</div>
                                    <div className="font-semibold">{property.county}</div>
                                </div>
                            )}
                            {propertyType && (
                                <div>
                                    <div className="text-gray-600 text-sm">Type</div>
                                    <div className="font-semibold">{String(propertyType)}</div>
                                </div>
                            )}
                            {property.structureType && (
                                <div>
                                    <div className="text-gray-600 text-sm">Structure</div>
                                    <div className="font-semibold">{property.structureType}</div>
                                </div>
                            )}
                            {yearBuilt && (
                                <div>
                                    <div className="text-gray-600 text-sm">Year Built</div>
                                    <div className="font-semibold">{yearBuilt}</div>
                                </div>
                            )}
                            {property.propertyCondition && (
                                <div>
                                    <div className="text-gray-600 text-sm">Condition</div>
                                    <div className="font-semibold">{property.propertyCondition}</div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-2xl">🛏️</div>
                                <div className="font-bold">{property.beds ?? 'N/A'}</div>
                                <div className="text-xs text-gray-600">Bedrooms</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-2xl">🛁</div>
                                <div className="font-bold">
                                    {property.baths ?? 'N/A'}
                                    {property.bathroomsHalf && property.bathroomsHalf > 0 && `.${property.bathroomsHalf}`}
                                </div>
                                <div className="text-xs text-gray-600">Bathrooms</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-2xl">📏</div>
                                <div className="font-bold">
                                    {squareFeet ? Number(squareFeet).toLocaleString() : 
                                     (() => {
                                        const size = getPropertyValue(property, 'landSize', 'land_size');
                                        return size ? Number(size).toLocaleString() : 'N/A';
                                    })()}
                                </div>
                                <div className="text-xs text-gray-600">Sq Ft</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-2xl">🏢</div>
                                <div className="font-bold">{property.storiesTotal ?? 'N/A'}</div>
                                <div className="text-xs text-gray-600">Stories</div>
                            </div>
                        </div>

                        {/* Lot Size */}
                        {lotSize && (
                            <div className="mb-4 p-3 bg-gray-50 rounded">
                                <div className="text-gray-600 text-sm mb-1">Lot Size</div>
                                <div className="font-semibold">{Number(lotSize).toLocaleString()} sq ft</div>
                            </div>
                        )}

                        {/* Features Section */}
                        {(property.poolPrivate || property.fireplace || property.view || property.garage || 
                          property.cooling || property.heating || property.viewDescription) && (
                            <div className="mb-6">
                                <div className="text-gray-600 text-sm font-semibold mb-3">Features</div>
                                <div className="flex flex-wrap gap-2">
                                    {property.poolPrivate && (
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">🏊 Private Pool</span>
                                    )}
                                    {property.fireplace && (
                                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">🔥 Fireplace</span>
                                    )}
                                    {property.view && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">🏔️ View</span>
                                    )}
                                    {property.garage && (
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">🚗 Garage</span>
                                    )}
                                    {property.cooling && (
                                        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm">❄️ Cooling</span>
                                    )}
                                    {property.heating && (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">🔥 Heating</span>
                                    )}
                                </div>
                                {property.viewDescription && (
                                    <div className="mt-2 text-sm text-gray-700">
                                        <span className="font-semibold">View: </span>{property.viewDescription}
                                    </div>
                                )}
                                {property.coolingType && (
                                    <div className="mt-2 text-sm text-gray-700">
                                        <span className="font-semibold">Cooling: </span>{property.coolingType}
                                    </div>
                                )}
                                {property.heatingType && (
                                    <div className="mt-2 text-sm text-gray-700">
                                        <span className="font-semibold">Heating: </span>{property.heatingType}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interior Features */}
                        {property.interiorFeatures && (
                            <div className="mb-6">
                                <div className="text-gray-600 text-sm font-semibold mb-2">Interior Features</div>
                                <div className="text-gray-700 whitespace-pre-line">{property.interiorFeatures}</div>
                            </div>
                        )}

                        {/* Association/HOA */}
                        {property.associationFee && (
                            <div className="mb-6 p-3 bg-yellow-50 rounded">
                                <div className="text-gray-600 text-sm mb-1">Association Fee</div>
                                <div className="font-semibold">
                                    {formatPrice(property.associationFee)}
                                    {property.associationFeeFrequency && ` ${property.associationFeeFrequency}`}
                                </div>
                            </div>
                        )}

                        {/* Agent Information */}
                        {(property.agentFullName || property.agentFirstName || property.officeName) && (
                            <div className="mb-6 p-4 bg-blue-50 rounded">
                                <div className="text-gray-600 text-sm font-semibold mb-2">Listing Agent</div>
                                {(property.agentFullName || (property.agentFirstName && property.agentLastName)) && (
                                    <div className="font-semibold text-gray-800">
                                        {property.agentFullName || `${property.agentFirstName} ${property.agentLastName}`}
                                    </div>
                                )}
                                {property.officeName && (
                                    <div className="text-sm text-gray-600 mt-1">{property.officeName}</div>
                                )}
                                {property.agentPhone && (
                                    <div className="text-sm text-gray-600 mt-1">📞 {property.agentPhone}</div>
                                )}
                                {property.agentEmail && (
                                    <div className="text-sm text-gray-600 mt-1">✉️ {property.agentEmail}</div>
                                )}
                            </div>
                        )}

                        {property.remarks && (
                            <div className="mb-6">
                                <div className="text-gray-600 text-sm mb-2">Description</div>
                                <div className="text-gray-700 whitespace-pre-line">{property.remarks}</div>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen" style={{position: 'relative'}}>
            {/* Header */}
            <header style={{
                position: 'relative',
                padding: '4rem 0 5rem',
                marginBottom: '3rem',
                overflow: 'hidden'
            }}>
                {/* Glass morphism overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}></div>
                
                {/* Animated wave decoration */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '100px',
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                    clipPath: 'polygon(0 30%, 100% 20%, 100% 100%, 0% 100%)'
                }}></div>
                
                {/* Floating decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    animation: 'float 6s ease-in-out infinite'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    right: '15%',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    animation: 'float 8s ease-in-out infinite reverse'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '20%',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    animation: 'float 7s ease-in-out infinite'
                }}></div>
                
                <div style={{maxWidth: '1600px', margin: '0 auto', padding: '0 1rem', textAlign: 'center', position: 'relative', zIndex: 1}}>
                    {/* Logo/Icon with creative styling */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <span style={{fontSize: '3.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'}}>🏡</span>
                        </div>
                        {/* Decorative rings */}
                        <div style={{
                            position: 'absolute',
                            width: '120px',
                            height: '120px',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}></div>
                    </div>
                    
                    {/* Creative Title */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        letterSpacing: '-0.03em',
                        lineHeight: '1.1',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
                        margin: '0 auto 1rem'
                    }}>
                        Find Your Dream Home
                    </h1>
                    
                    {/* Subtitle with accent */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
                        }}></div>
                        <p style={{
                            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                            fontWeight: 300,
                            color: 'rgba(255, 255, 255, 0.95)',
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            in California
                        </p>
                        <div style={{
                            width: '60px',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
                        }}></div>
                    </div>
                    
                    {/* Tagline */}
                    <p style={{
                        fontSize: '1.125rem',
                        fontWeight: 400,
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '700px',
                        margin: '0 auto',
                        textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        lineHeight: '1.6'
                    }}>
                        Discover beautiful properties across the Golden State
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main style={{maxWidth: '1600px', margin: '0 auto', padding: '0 1rem 2rem'}}>
                {/* Filters Container */}
                <div className="filter-container mb-8">
                    {/* Main Search Input */}
                    <div className="mb-5" style={{position: 'relative'}}>
                        <div style={{
                            position: 'absolute',
                            left: '1.25rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.25rem',
                            zIndex: 1
                        }}>🔍</div>
                        <input
                            type="text"
                            placeholder="Search by city or any property detail (address, zip, price, beds, etc.)"
                            className="search-input-main"
                            style={{
                                width: '100%',
                                padding: '1.125rem 1.25rem 1.125rem 3.5rem',
                                fontSize: '1.05rem',
                                borderRadius: '14px',
                                border: '2px solid #e5e7eb',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                background: 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.15), 0 0 0 4px rgba(59, 130, 246, 0.1)';
                                e.target.style.background = '#ffffff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                                e.target.style.background = 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)';
                            }}
                        />
                    </div>

                    {/* Filter Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                        <div className="filter-card">
                            <input
                                type="text"
                                placeholder="City"
                                value={filters.city || ''}
                                onChange={e => handleFilterChange('city', e.target.value)}
                                className="filter-input-card"
                            />
                        </div>
                        
                        <div className="filter-card">
                            <input
                                type="text"
                                placeholder="ZIP Code"
                                value={filters.zip || ''}
                                onChange={e => handleFilterChange('zip', e.target.value)}
                                className="filter-input-card"
                            />
                        </div>
                        
                        <div className="filter-card">
                            <input
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice || ''}
                                onChange={e => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                className="filter-input-card"
                            />
                        </div>
                        
                        <div className="filter-card">
                            <input
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice || ''}
                                onChange={e => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                className="filter-input-card"
                            />
                        </div>
                        
                        <div className="filter-card">
                            <input
                                type="number"
                                placeholder="Bedrooms"
                                value={filters.beds || ''}
                                onChange={e => handleFilterChange('beds', e.target.value ? Number(e.target.value) : undefined)}
                                className="filter-input-card"
                                min="0"
                            />
                        </div>
                        
                        <div className="filter-card">
                            <input
                                type="number"
                                placeholder="Bathrooms"
                                value={filters.baths || ''}
                                onChange={e => handleFilterChange('baths', e.target.value ? Number(e.target.value) : undefined)}
                                className="filter-input-card"
                                min="0"
                                step="0.5"
                            />
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => fetchProperties()}
                            className="filter-button px-6 py-2.5"
                        >
                            Search Properties
                        </button>
                        <button
                            onClick={() => setFilters({ page: 0, size: 20, city: '', state: '', zip: '', sort: '' })}
                            className="filter-button-secondary px-6 py-2.5"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Loading/Error States */}
                {loading && (
                    <div className="loading-container">
                        <div className="loading-icon">🏠</div>
                        <div className="loading-text">Loading properties...</div>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <div className="error-title">Error</div>
                        <div className="error-message">{error}</div>
                    </div>
                )}

                {/* Results Summary */}
                {!loading && !error && (
                    <div className="results-summary">
                        <strong style={{color: 'white'}}>{pageInfo.totalElements.toLocaleString()}</strong> properties found
                        {import.meta.env.DEV && (
                            <span style={{marginLeft: '0.5rem', fontSize: '0.75rem', color: '#9ca3af'}}>
                                (Loaded: {properties.length})
                            </span>
                        )}
                    </div>
                )}

                {/* Property Grid */}
                {!loading && !error && properties.length > 0 && (
                    <>
                        <div className="property-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                            {properties.map((property, index) => {
                                return (
                                    <PropertyCard key={property.id || `property-${index}`} property={property} />
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pageInfo.totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '2rem',
                                marginTop: '3rem',
                                padding: '1rem 0'
                            }}>
                                <button
                                    onClick={() => handlePageChange(pageInfo.currentPage - 1)}
                                    disabled={pageInfo.currentPage === 0}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        background: pageInfo.currentPage === 0 ? '#e5e7eb' : '#3b82f6',
                                        color: pageInfo.currentPage === 0 ? '#9ca3af' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.9375rem',
                                        cursor: pageInfo.currentPage === 0 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: pageInfo.currentPage === 0 ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (pageInfo.currentPage > 0) {
                                            e.currentTarget.style.background = '#2563eb';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (pageInfo.currentPage > 0) {
                                            e.currentTarget.style.background = '#3b82f6';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                >
                                    Previous
                                </button>
                                
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.625rem 1.5rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <span style={{
                                        color: '#374151',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500
                                    }}>
                                        Page
                                    </span>
                                    <span style={{
                                        color: '#1f2937',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        minWidth: '40px',
                                        textAlign: 'center'
                                    }}>
                                        {pageInfo.currentPage + 1}
                                    </span>
                                    <span style={{
                                        color: '#6b7280',
                                        fontSize: '0.9375rem'
                                    }}>
                                        of
                                    </span>
                                    <span style={{
                                        color: '#1f2937',
                                        fontSize: '1rem',
                                        fontWeight: 700
                                    }}>
                                        {pageInfo.totalPages.toLocaleString()}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(pageInfo.currentPage + 1)}
                                    disabled={pageInfo.currentPage >= pageInfo.totalPages - 1}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        background: pageInfo.currentPage >= pageInfo.totalPages - 1 ? '#e5e7eb' : '#3b82f6',
                                        color: pageInfo.currentPage >= pageInfo.totalPages - 1 ? '#9ca3af' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.9375rem',
                                        cursor: pageInfo.currentPage >= pageInfo.totalPages - 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: pageInfo.currentPage >= pageInfo.totalPages - 1 ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (pageInfo.currentPage < pageInfo.totalPages - 1) {
                                            e.currentTarget.style.background = '#2563eb';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (pageInfo.currentPage < pageInfo.totalPages - 1) {
                                            e.currentTarget.style.background = '#3b82f6';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* No Results */}
                {!loading && !error && properties.length === 0 && (
                    <div className="no-results-container">
                        <div className="no-results-icon">🔍</div>
                        <div className="no-results-text">No properties found</div>
                        <div className="no-results-subtext">Try adjusting your filters</div>
                    </div>
                )}
            </main>

            {/* Property Detail Modal */}
            {selectedProperty && (
                <PropertyDetailModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                />
            )}

            {/* Footer */}
            <footer style={{
                position: 'relative',
                padding: '4rem 0 3rem',
                marginTop: '5rem',
                overflow: 'hidden'
            }}>
                {/* Glass morphism overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)'
                }}></div>
                
                {/* Animated wave decoration at top */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100px',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 70%)'
                }}></div>
                
                {/* Floating decorative elements */}
                <div style={{
                    position: 'absolute',
                    bottom: '30%',
                    left: '15%',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    animation: 'float 7s ease-in-out infinite'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '12%',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    animation: 'float 8s ease-in-out infinite reverse'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '25%',
                    right: '25%',
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    animation: 'float 6s ease-in-out infinite'
                }}></div>
                
                <div style={{maxWidth: '1600px', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 1}}>
                    {/* Footer Content Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '3rem',
                        marginBottom: '3rem',
                        textAlign: 'center'
                    }}>
                        {/* Brand Section */}
                        <div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)'
                                }}>
                                    <span style={{fontSize: '2rem'}}>🏡</span>
                                </div>
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: 'rgba(255, 255, 255, 0.95)',
                                marginBottom: '0.5rem',
                                textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                                California Real Estate
                            </h3>
                            <p style={{
                                fontSize: '0.95rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                textShadow: '0 1px 4px rgba(0,0,0,0.15)'
                            }}>
                                Your dream home awaits
                            </p>
                        </div>
                        
                        {/* Quick Links */}
                        <div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.95)',
                                marginBottom: '1rem',
                                textShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}>
                                Quick Links
                            </h4>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                {['Browse Properties', 'About Us', 'Contact', 'FAQs'].map((link) => (
                                    <li key={link}>
                                        <a href="#" style={{
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textDecoration: 'none',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s ease',
                                            display: 'inline-block',
                                            textShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                                            e.currentTarget.style.transform = 'translateX(5px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Contact Info */}
                        <div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.95)',
                                marginBottom: '1rem',
                                textShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}>
                                Contact
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                fontSize: '0.95rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                textShadow: '0 1px 3px rgba(0,0,0,0.15)'
                            }}>
                                <div>📍 1555 W Shoreline Dr Ste 100, Boise, Idaho 83702</div>
                                <div>📞 (650) 209-0551</div>
                                <div>✉️ info@idxexchange.com</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Divider */}
                    <div style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        marginBottom: '2rem'
                    }}></div>
                    
                    {/* Copyright */}
                    <div style={{
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.875rem',
                        textShadow: '0 1px 3px rgba(0,0,0,0.15)'
                    }}>
                        <p style={{margin: 0}}>
                            © {new Date().getFullYear()} IDX Exchange. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;