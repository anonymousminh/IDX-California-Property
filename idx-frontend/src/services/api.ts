import axios from 'axios';
import type {Property, PropertyPage, PropertyFilters} from '../types/property';

// Base URL for your Spring Boot API — use Vite env var when available
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Property API service
export const propertyService = {
    /**
     * Get all properties with optional filters and pagination
     */
    getProperties: async (filters: PropertyFilters = {}): Promise<PropertyPage> => {
        const params = new URLSearchParams();

        // Add all non-empty filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await api.get<PropertyPage>('/properties', { params });
        return response.data;
    },

    /**
     * Get a single property by ID
     */
    getPropertyById: async (id: number): Promise<Property> => {
        const response = await api.get<Property>(`/properties/${id}`);
        return response.data;
    },
};

export default api;