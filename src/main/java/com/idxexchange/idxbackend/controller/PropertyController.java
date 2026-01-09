package com.idxexchange.idxbackend.controller;

import com.idxexchange.idxbackend.dto.PropertySearchQuery;
import com.idxexchange.idxbackend.model.Property;
import com.idxexchange.idxbackend.repository.PropertyRepository;
import com.idxexchange.idxbackend.service.NLPQueryParserService;
import com.idxexchange.idxbackend.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyRepository repository;
    
    @Autowired
    private NLPQueryParserService nlpQueryParserService;

    @GetMapping("/properties")
    public Page<Property> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String zip,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer beds,
            @RequestParam(required = false) Integer minBeds,
            @RequestParam(required = false) Integer baths,
            @RequestParam(required = false) Integer minBaths,
            @PageableDefault(size = 20) Pageable pageable) {

        return propertyService.searchProperties(
                city, state, zip,
                minPrice, maxPrice,
                beds, minBeds,
                baths, minBaths,
                pageable
        );
    }

    @GetMapping("/properties/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * NLP-based property search endpoint
     * Accepts a natural language query and returns matching properties
     * 
     * Example queries:
     * - "3 bedroom house with pool in Los Angeles under 500k"
     * - "2+ bath condo in San Francisco with view"
     * - "Houses in San Diego between 400k and 600k with garage"
     */
    @PostMapping("/properties/nlp-search")
    public Page<Property> searchWithNLP(
            @RequestBody String naturalLanguageQuery,
            @PageableDefault(size = 20) Pageable pageable) {
        
        return propertyService.searchPropertiesWithNLP(naturalLanguageQuery, pageable);
    }
    
    /**
     * Parse a natural language query without executing search
     * Useful for debugging and showing what the system understood
     */
    @PostMapping("/properties/nlp-parse")
    public PropertySearchQuery parseNLPQuery(@RequestBody String naturalLanguageQuery) {
        return nlpQueryParserService.parseQuery(naturalLanguageQuery);
    }

}
