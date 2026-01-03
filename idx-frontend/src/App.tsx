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
        <div className="min-h-screen" style={{backgroundColor: '#f5f7fa'}}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '2rem 0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                marginBottom: '2rem'
            }}>
                <div style={{maxWidth: '1600px', margin: '0 auto', padding: '0 1rem'}}>
                    <h1 style={{fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em'}}>
                        🏠 IDX Real Estate
                    </h1>
                    <p style={{fontSize: '1.125rem', opacity: 0.95, fontWeight: 500}}>Find your dream home</p>
                </div>
            </header>

            {/* Main Content */}
            <main style={{maxWidth: '1600px', margin: '0 auto', padding: '0 1rem 2rem'}}>
                {/* Filters */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                    <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827'}}>🔍 Search Filters</h2>

                    {/* Location Filters */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="City (e.g., Provo)"
                                value={filters.city || ''}
                                onChange={e => handleFilterChange('city', e.target.value)}
                                style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.95rem',
                                    width: '100%',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            <input
                                type="text"
                                placeholder="State (e.g., Utah)"
                                value={filters.state || ''}
                                onChange={e => handleFilterChange('state', e.target.value)}
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Zip Code"
                                value={filters.zip || ''}
                                onChange={e => handleFilterChange('zip', e.target.value)}
                                className="border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Price Filters */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min Price (e.g., 300000)"
                                value={filters.minPrice || ''}
                                onChange={e => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="number"
                                placeholder="Max Price (e.g., 500000)"
                                value={filters.maxPrice || ''}
                                onChange={e => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                className="border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Bedroom Filters */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Bedrooms</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Exact Beds (e.g., 3)"
                                value={filters.beds || ''}
                                onChange={e => handleFilterChange('beds', e.target.value ? Number(e.target.value) : undefined)}
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="number"
                                placeholder="Min Beds (e.g., 3+)"
                                value={filters.minBeds || ''}
                                onChange={e => handleFilterChange('minBeds', e.target.value ? Number(e.target.value) : undefined)}
                                className="border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Bathroom Filters */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Bathrooms</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Exact Baths (e.g., 2)"
                                value={filters.baths || ''}
                                onChange={e => handleFilterChange('baths', e.target.value ? Number(e.target.value) : undefined)}
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="number"
                                placeholder="Min Baths (e.g., 2+)"
                                value={filters.minBaths || ''}
                                onChange={e => handleFilterChange('minBaths', e.target.value ? Number(e.target.value) : undefined)}
                                className="border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h3>
                        <select
                            value={filters.sort || ''}
                            onChange={e => handleFilterChange('sort', e.target.value)}
                            className="border rounded px-3 py-2 w-full md:w-auto"
                        >
                            <option value="">Default</option>
                            <option value="price,asc">Price: Low to High</option>
                            <option value="price,desc">Price: High to Low</option>
                            <option value="city,asc">City: A to Z</option>
                            <option value="city,desc">City: Z to A</option>
                            <option value="bedrooms,desc">Most Bedrooms</option>
                            <option value="bathrooms,desc">Most Bathrooms</option>
                            <option value="squareFeet,desc">Largest Sq Ft</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setFilters({ page: 0, size: 20, city: '', state: '', zip: '', sort: '' })}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                        Clear All Filters
                    </button>
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
                        <strong style={{color: '#111827'}}>{pageInfo.totalElements.toLocaleString()}</strong> properties found
                        {import.meta.env.DEV && (
                            <span style={{marginLeft: '0.5rem', fontSize: '0.75rem', color: '#9ca3af'}}>
                                (Loaded: {properties.length}, Loading: {loading ? 'Yes' : 'No'}, Error: {error ? 'Yes' : 'No'})
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
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pageInfo.currentPage - 1)}
                                    disabled={pageInfo.currentPage === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                  Page {pageInfo.currentPage + 1} of {pageInfo.totalPages}
                </span>
                                <button
                                    onClick={() => handlePageChange(pageInfo.currentPage + 1)}
                                    disabled={pageInfo.currentPage >= pageInfo.totalPages - 1}
                                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
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
        </div>
    );
}

export default App;