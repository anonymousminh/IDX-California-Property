// Property interface matching your Spring Boot entity
// Note: Backend uses snake_case, but Jackson serializes to camelCase by default
export interface Property {
    id: number;
    price?: number | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    beds?: number | null;
    baths?: number | null;
    landSize?: number | null; // Backend: land_size
    garageCapacity?: number | null; // Backend: garage_capacity
    address?: string | null;
    propertyClass?: string | null; // Backend: property_class
    householdType?: string | null; // Backend: household_type
    yearBuilt?: number | null; // Backend: year_built
    photos?: string | null;
    remarks?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    appliances?: string | null;
    
    // New important fields
    mlsNumber?: string | null;
    status?: string | null;
    standardStatus?: string | null;
    listingContractDate?: string | null;
    daysOnMarket?: number | null;
    addressStreet?: string | null;
    subdivisionName?: string | null;
    county?: string | null;
    squareFeet?: number | null;
    lotSizeSquareFeet?: number | null;
    bathroomsHalf?: number | null;
    storiesTotal?: number | null;
    structureType?: string | null;
    propertyCondition?: string | null;
    poolPrivate?: boolean | null;
    fireplace?: boolean | null;
    view?: boolean | null;
    garage?: boolean | null;
    cooling?: boolean | null;
    heating?: boolean | null;
    coolingType?: string | null;
    heatingType?: string | null;
    viewDescription?: string | null;
    interiorFeatures?: string | null;
    associationFee?: number | null;
    associationFeeFrequency?: string | null;
    agentFirstName?: string | null;
    agentLastName?: string | null;
    agentFullName?: string | null;
    officeName?: string | null;
    agentEmail?: string | null;
    agentPhone?: string | null;
    
    // Legacy fields for backward compatibility
    land_size?: number | null;
    garage_capacity?: number | null;
    year_built?: number | null;
    property_class?: string | null;
    household_type?: string | null;
    type?: string | null; // Alias for householdType
}

// Paginated response from Spring Boot
export interface PropertyPage {
    content: Property[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Filter parameters for API requests
export interface PropertyFilters {
    city?: string;
    state?: string;
    zip?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    minBeds?: number;
    baths?: number;
    minBaths?: number;
    page?: number;
    size?: number;
    sort?: string;
}