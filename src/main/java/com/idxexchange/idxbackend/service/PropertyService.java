package com.idxexchange.idxbackend.service;

import com.idxexchange.idxbackend.dto.PropertySearchQuery;
import com.idxexchange.idxbackend.model.Property;
import com.idxexchange.idxbackend.repository.PropertyRepository;
import com.idxexchange.idxbackend.specification.PropertySpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository repository;
    
    @Autowired
    private NLPQueryParserService nlpQueryParserService;

    public Page<Property> searchProperties(
            String city,
            String state,
            String zip,
            Double minPrice,
            Double maxPrice,
            Integer beds,
            Integer minBeds,
            Integer baths,
            Integer minBaths,
            Pageable pageable) {

        Specification<Property> spec = buildSpecification(
                city, state, zip,
                minPrice, maxPrice,
                beds, minBeds,
                baths, minBaths
        );

        if (spec == null) {
            return repository.findAll(pageable);
        }
        return repository.findAll(spec, pageable);
    }

    private Specification<Property> buildSpecification(
            String city, String state, String zip,
            Double minPrice, Double maxPrice,
            Integer beds, Integer minBeds,
            Integer baths, Integer minBaths) {

        Specification<Property> spec = null;

        // Location filters
        if (city != null && !city.trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasCity(city));
        }
        if (state != null && !state.trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasState(state));
        }
        if (zip != null && !zip.trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasZip(zip));
        }

        // Price filters
        if (minPrice != null) {
            spec = combineSpec(spec, PropertySpecification.priceGreaterThanOrEqual(minPrice));
        }
        if (maxPrice != null) {
            spec = combineSpec(spec, PropertySpecification.priceLessThanOrEqual(maxPrice));
        }

        // Bedroom filters
        if (beds != null) {
            spec = combineSpec(spec, PropertySpecification.hasBeds(beds));
        } else if (minBeds != null) {
            spec = combineSpec(spec, PropertySpecification.bedsGreaterThanOrEqual(minBeds));
        }

        // Bathroom filters
        if (baths != null) {
            spec = combineSpec(spec, PropertySpecification.hasBaths(baths));
        } else if (minBaths != null) {
            spec = combineSpec(spec, PropertySpecification.bathsGreaterThanOrEqual(minBaths));
        }

        return spec;
    }

    private Specification<Property> combineSpec(Specification<Property> existing, Specification<Property> additional) {
        return existing == null ? additional : existing.and(additional);
    }

    public Page<Property> getAllProperties(Pageable pageable) {
        return repository.findAll(pageable);
    }
    
    /**
     * Search properties using natural language query
     */
    public Page<Property> searchPropertiesWithNLP(String naturalLanguageQuery, Pageable pageable) {
        // Parse the natural language query
        PropertySearchQuery searchQuery = nlpQueryParserService.parseQuery(naturalLanguageQuery);
        
        // Build specification from parsed query
        Specification<Property> spec = buildSpecificationFromNLPQuery(searchQuery);
        
        if (spec == null) {
            return repository.findAll(pageable);
        }
        return repository.findAll(spec, pageable);
    }
    
    /**
     * Build JPA Specification from parsed NLP query
     */
    private Specification<Property> buildSpecificationFromNLPQuery(PropertySearchQuery query) {
        Specification<Property> spec = null;
        
        // Location filters
        if (query.getCity() != null && !query.getCity().trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasCity(query.getCity()));
        }
        if (query.getState() != null && !query.getState().trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasState(query.getState()));
        }
        if (query.getZip() != null && !query.getZip().trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasZip(query.getZip()));
        }
        
        // Price filters
        if (query.getMinPrice() != null) {
            spec = combineSpec(spec, PropertySpecification.priceGreaterThanOrEqual(query.getMinPrice()));
        }
        if (query.getMaxPrice() != null) {
            spec = combineSpec(spec, PropertySpecification.priceLessThanOrEqual(query.getMaxPrice()));
        }
        
        // Bedroom filters
        if (query.getBeds() != null) {
            spec = combineSpec(spec, PropertySpecification.hasBeds(query.getBeds()));
        } else if (query.getMinBeds() != null) {
            spec = combineSpec(spec, PropertySpecification.bedsGreaterThanOrEqual(query.getMinBeds()));
        }
        
        // Bathroom filters
        if (query.getBaths() != null) {
            spec = combineSpec(spec, PropertySpecification.hasBaths(query.getBaths()));
        } else if (query.getMinBaths() != null) {
            spec = combineSpec(spec, PropertySpecification.bathsGreaterThanOrEqual(query.getMinBaths()));
        }
        
        // Square footage filters
        if (query.getMinSquareFeet() != null) {
            spec = combineSpec(spec, PropertySpecification.squareFeetGreaterThanOrEqual(query.getMinSquareFeet()));
        }
        if (query.getMaxSquareFeet() != null) {
            spec = combineSpec(spec, PropertySpecification.squareFeetLessThanOrEqual(query.getMaxSquareFeet()));
        }
        
        // Feature filters
        if (query.getPoolPrivate() != null && query.getPoolPrivate()) {
            spec = combineSpec(spec, PropertySpecification.hasPool(true));
        }
        if (query.getFireplace() != null && query.getFireplace()) {
            spec = combineSpec(spec, PropertySpecification.hasFireplace(true));
        }
        if (query.getView() != null && query.getView()) {
            spec = combineSpec(spec, PropertySpecification.hasView(true));
        }
        if (query.getGarage() != null && query.getGarage()) {
            spec = combineSpec(spec, PropertySpecification.hasGarage(true));
        }
        
        // Year built filters
        if (query.getMinYearBuilt() != null) {
            spec = combineSpec(spec, PropertySpecification.yearBuiltGreaterThanOrEqual(query.getMinYearBuilt()));
        }
        if (query.getMaxYearBuilt() != null) {
            spec = combineSpec(spec, PropertySpecification.yearBuiltLessThanOrEqual(query.getMaxYearBuilt()));
        }
        
        // Property type filter
        if (query.getPropertyType() != null && !query.getPropertyType().trim().isEmpty()) {
            spec = combineSpec(spec, PropertySpecification.hasPropertyType(query.getPropertyType()));
        }
        
        return spec;
    }
}

