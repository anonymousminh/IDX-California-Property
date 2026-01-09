package com.idxexchange.idxbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO to hold parsed property search criteria from natural language query
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertySearchQuery {
    // Location filters
    private String city;
    private String state;
    private String zip;
    
    // Price filters
    private Double minPrice;
    private Double maxPrice;
    
    // Bedroom/Bathroom filters
    private Integer beds;
    private Integer minBeds;
    private Integer baths;
    private Integer minBaths;
    
    // Square footage
    private Integer minSquareFeet;
    private Integer maxSquareFeet;
    
    // Features
    private Boolean poolPrivate;
    private Boolean fireplace;
    private Boolean view;
    private Boolean garage;
    
    // Property type
    private String propertyType;
    
    // Year built
    private Integer minYearBuilt;
    private Integer maxYearBuilt;
    
    // Original query for reference
    private String originalQuery;
    
    // Confidence score (0-100)
    private Integer confidenceScore;
}
