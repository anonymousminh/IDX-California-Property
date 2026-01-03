package com.idxexchange.idxbackend.service;

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
}

