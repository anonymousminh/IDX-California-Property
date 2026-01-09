package com.idxexchange.idxbackend.service;

import com.idxexchange.idxbackend.dto.PropertySearchQuery;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for parsing natural language property search queries
 * Converts text like "3 bedroom house with pool in Los Angeles under 500k" into structured search criteria
 */
@Service
public class NLPQueryParserService {
    
    // City patterns - common California cities
    private static final Pattern CITY_PATTERN = Pattern.compile(
        "\\b(?:in|near|around|at)\\s+(Los Angeles|LA|San Francisco|SF|San Diego|Sacramento|" +
        "San Jose|Oakland|Fresno|Long Beach|Santa Ana|Anaheim|Bakersfield|Riverside|" +
        "Stockton|Irvine|Fremont|San Bernardino|Modesto|Fontana|Oxnard|Moreno Valley|" +
        "Huntington Beach|Glendale|Santa Clarita|Oceanside|Garden Grove|Elk Grove|" +
        "Corona|Ontario|Rancho Cucamonga|Santa Rosa|Pasadena|Hayward|Salinas|" +
        "Sunnyvale|Roseville|Escondido|Pomona|Torrance|Fullerton|Orange|Visalia|" +
        "Thousand Oaks|Simi Valley|Concord|Santa Clara|Victorville|Berkeley|" +
        "Vallejo|Fairfield|Murrieta|Richmond|Lancaster|Palmdale|Carlsbad|" +
        "Antioch|Temecula|Downey|Inglewood|Ventura|West Covina|Norwalk|" +
        "Burbank|Daly City|Rialto|San Mateo|Vista|Vacaville|Carson|" +
        "Hesperia|Redding|Santa Monica|Westminster|Santa Barbara|Chico|" +
        "Newport Beach|San Marcos|Hawthorne|Citrus Heights|Alhambra|" +
        "Tracy|Livermore|Buena Park|Menifee|Hemet|Lakewood|Merced|" +
        "Chino|Chino Hills|Indio|Redwood City|Lake Forest|Napa|Tustin|" +
        "Bellflower|Mountain View|Redondo Beach|Alameda|Upland|Folsom|" +
        "San Ramon|Pleasanton|Lynwood|Union City|Apple Valley|Manteca|" +
        "Redlands|Turlock|Milpitas|Whittier|Davis|Newport|Palo Alto|Malibu)\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    // Price patterns
    private static final Pattern PRICE_RANGE_PATTERN = Pattern.compile(
        "(?:between\\s+)?\\$?([0-9,]+)(?:k|K)?\\s*(?:to|-|and)\\s*\\$?([0-9,]+)(?:k|K)?",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MAX_PRICE_PATTERN = Pattern.compile(
        "(?:under|below|less than|max|maximum|up to)\\s+\\$?([0-9,]+)(?:k|K)?",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MIN_PRICE_PATTERN = Pattern.compile(
        "(?:over|above|more than|min|minimum|starting at|at least)\\s+\\$?([0-9,]+)(?:k|K)?",
        Pattern.CASE_INSENSITIVE
    );
    
    // Bedroom patterns
    private static final Pattern BEDROOM_PATTERN = Pattern.compile(
        "([0-9]+)\\s*(?:\\+)?\\s*(?:bed(?:room)?s?|br|bd)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MIN_BEDROOM_PATTERN = Pattern.compile(
        "(?:at least|minimum|min|\\+)\\s*([0-9]+)\\s*(?:bed(?:room)?s?|br|bd)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Bathroom patterns
    private static final Pattern BATHROOM_PATTERN = Pattern.compile(
        "([0-9]+(?:\\.[0-9]+)?)\\s*(?:\\+)?\\s*(?:bath(?:room)?s?|ba)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MIN_BATHROOM_PATTERN = Pattern.compile(
        "(?:at least|minimum|min|\\+)\\s*([0-9]+(?:\\.[0-9]+)?)\\s*(?:bath(?:room)?s?|ba)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Square footage patterns
    private static final Pattern SQFT_RANGE_PATTERN = Pattern.compile(
        "([0-9,]+)\\s*(?:to|-|and)\\s*([0-9,]+)\\s*(?:sq\\s*ft|sqft|square\\s*feet)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MIN_SQFT_PATTERN = Pattern.compile(
        "(?:over|above|more than|at least)\\s+([0-9,]+)\\s*(?:sq\\s*ft|sqft|square\\s*feet)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MAX_SQFT_PATTERN = Pattern.compile(
        "(?:under|below|less than|max|maximum|up to)\\s+([0-9,]+)\\s*(?:sq\\s*ft|sqft|square\\s*feet)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Feature patterns
    private static final Pattern POOL_PATTERN = Pattern.compile(
        "\\b(?:with|has|having|includes?)\\s+(?:a\\s+)?pool\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern FIREPLACE_PATTERN = Pattern.compile(
        "\\b(?:with|has|having|includes?)\\s+(?:a\\s+)?fireplace\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern VIEW_PATTERN = Pattern.compile(
        "\\b(?:with|has|having|includes?)\\s+(?:a\\s+)?(?:view|ocean view|mountain view|city view)\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern GARAGE_PATTERN = Pattern.compile(
        "\\b(?:with|has|having|includes?)\\s+(?:a\\s+)?garage\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    // Property type patterns
    private static final Pattern PROPERTY_TYPE_PATTERN = Pattern.compile(
        "\\b(house|condo|townhouse|apartment|single\\s+family|multi\\s+family|land|commercial)\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    // Year built patterns
    private static final Pattern YEAR_BUILT_RANGE_PATTERN = Pattern.compile(
        "built\\s+(?:between\\s+)?([0-9]{4})\\s*(?:to|-|and)\\s*([0-9]{4})",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MIN_YEAR_BUILT_PATTERN = Pattern.compile(
        "built\\s+(?:after|since|from)\\s+([0-9]{4})",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern MAX_YEAR_BUILT_PATTERN = Pattern.compile(
        "built\\s+(?:before|prior to|until)\\s+([0-9]{4})",
        Pattern.CASE_INSENSITIVE
    );
    
    /**
     * Main parsing method - converts natural language to PropertySearchQuery
     */
    public PropertySearchQuery parseQuery(String naturalLanguageQuery) {
        if (naturalLanguageQuery == null || naturalLanguageQuery.trim().isEmpty()) {
            return PropertySearchQuery.builder()
                    .originalQuery(naturalLanguageQuery)
                    .confidenceScore(0)
                    .build();
        }
        
        String query = naturalLanguageQuery.trim();
        PropertySearchQuery.PropertySearchQueryBuilder builder = PropertySearchQuery.builder()
                .originalQuery(query);
        
        int matchedCriteria = 0;
        
        // Parse city
        Matcher cityMatcher = CITY_PATTERN.matcher(query);
        if (cityMatcher.find()) {
            String city = cityMatcher.group(1);
            // Normalize common abbreviations
            if (city.equalsIgnoreCase("LA")) city = "Los Angeles";
            if (city.equalsIgnoreCase("SF")) city = "San Francisco";
            builder.city(city);
            matchedCriteria++;
        }
        
        // Parse price - check range first, then min/max
        Matcher priceRangeMatcher = PRICE_RANGE_PATTERN.matcher(query);
        if (priceRangeMatcher.find()) {
            Double minPrice = parsePrice(priceRangeMatcher.group(1));
            Double maxPrice = parsePrice(priceRangeMatcher.group(2));
            builder.minPrice(minPrice).maxPrice(maxPrice);
            matchedCriteria++;
        } else {
            Matcher maxPriceMatcher = MAX_PRICE_PATTERN.matcher(query);
            if (maxPriceMatcher.find()) {
                builder.maxPrice(parsePrice(maxPriceMatcher.group(1)));
                matchedCriteria++;
            }
            
            Matcher minPriceMatcher = MIN_PRICE_PATTERN.matcher(query);
            if (minPriceMatcher.find()) {
                builder.minPrice(parsePrice(minPriceMatcher.group(1)));
                matchedCriteria++;
            }
        }
        
        // Parse bedrooms
        Matcher minBedMatcher = MIN_BEDROOM_PATTERN.matcher(query);
        if (minBedMatcher.find()) {
            builder.minBeds(Integer.parseInt(minBedMatcher.group(1)));
            matchedCriteria++;
        } else {
            Matcher bedMatcher = BEDROOM_PATTERN.matcher(query);
            if (bedMatcher.find()) {
                String bedStr = bedMatcher.group(1);
                // Check if there's a + sign nearby indicating minimum
                int matchPos = bedMatcher.start();
                String context = query.substring(Math.max(0, matchPos - 10), 
                                               Math.min(query.length(), matchPos + bedMatcher.group(0).length() + 5));
                if (context.contains("+")) {
                    builder.minBeds(Integer.parseInt(bedStr));
                } else {
                    builder.beds(Integer.parseInt(bedStr));
                }
                matchedCriteria++;
            }
        }
        
        // Parse bathrooms
        Matcher minBathMatcher = MIN_BATHROOM_PATTERN.matcher(query);
        if (minBathMatcher.find()) {
            builder.minBaths(parseFloat(minBathMatcher.group(1)));
            matchedCriteria++;
        } else {
            Matcher bathMatcher = BATHROOM_PATTERN.matcher(query);
            if (bathMatcher.find()) {
                String bathStr = bathMatcher.group(1);
                int matchPos = bathMatcher.start();
                String context = query.substring(Math.max(0, matchPos - 10), 
                                               Math.min(query.length(), matchPos + bathMatcher.group(0).length() + 5));
                if (context.contains("+")) {
                    builder.minBaths(parseFloat(bathStr));
                } else {
                    builder.baths(parseFloat(bathStr));
                }
                matchedCriteria++;
            }
        }
        
        // Parse square footage
        Matcher sqftRangeMatcher = SQFT_RANGE_PATTERN.matcher(query);
        if (sqftRangeMatcher.find()) {
            builder.minSquareFeet(parseInt(sqftRangeMatcher.group(1)));
            builder.maxSquareFeet(parseInt(sqftRangeMatcher.group(2)));
            matchedCriteria++;
        } else {
            Matcher minSqftMatcher = MIN_SQFT_PATTERN.matcher(query);
            if (minSqftMatcher.find()) {
                builder.minSquareFeet(parseInt(minSqftMatcher.group(1)));
                matchedCriteria++;
            }
            
            Matcher maxSqftMatcher = MAX_SQFT_PATTERN.matcher(query);
            if (maxSqftMatcher.find()) {
                builder.maxSquareFeet(parseInt(maxSqftMatcher.group(1)));
                matchedCriteria++;
            }
        }
        
        // Parse features
        if (POOL_PATTERN.matcher(query).find()) {
            builder.poolPrivate(true);
            matchedCriteria++;
        }
        
        if (FIREPLACE_PATTERN.matcher(query).find()) {
            builder.fireplace(true);
            matchedCriteria++;
        }
        
        if (VIEW_PATTERN.matcher(query).find()) {
            builder.view(true);
            matchedCriteria++;
        }
        
        if (GARAGE_PATTERN.matcher(query).find()) {
            builder.garage(true);
            matchedCriteria++;
        }
        
        // Parse property type
        Matcher propertyTypeMatcher = PROPERTY_TYPE_PATTERN.matcher(query);
        if (propertyTypeMatcher.find()) {
            builder.propertyType(propertyTypeMatcher.group(1));
            matchedCriteria++;
        }
        
        // Parse year built
        Matcher yearRangeMatcher = YEAR_BUILT_RANGE_PATTERN.matcher(query);
        if (yearRangeMatcher.find()) {
            builder.minYearBuilt(Integer.parseInt(yearRangeMatcher.group(1)));
            builder.maxYearBuilt(Integer.parseInt(yearRangeMatcher.group(2)));
            matchedCriteria++;
        } else {
            Matcher minYearMatcher = MIN_YEAR_BUILT_PATTERN.matcher(query);
            if (minYearMatcher.find()) {
                builder.minYearBuilt(Integer.parseInt(minYearMatcher.group(1)));
                matchedCriteria++;
            }
            
            Matcher maxYearMatcher = MAX_YEAR_BUILT_PATTERN.matcher(query);
            if (maxYearMatcher.find()) {
                builder.maxYearBuilt(Integer.parseInt(maxYearMatcher.group(1)));
                matchedCriteria++;
            }
        }
        
        // Calculate confidence score (0-100)
        int confidenceScore = Math.min(100, matchedCriteria * 15);
        builder.confidenceScore(confidenceScore);
        
        return builder.build();
    }
    
    /**
     * Parse price string handling 'k' suffix and commas
     */
    private Double parsePrice(String priceStr) {
        if (priceStr == null) return null;
        
        priceStr = priceStr.replace(",", "").trim();
        
        try {
            // Check if it ends with 'k' or 'K' (thousands)
            if (priceStr.toLowerCase().endsWith("k")) {
                String numStr = priceStr.substring(0, priceStr.length() - 1);
                return Double.parseDouble(numStr) * 1000;
            }
            
            double value = Double.parseDouble(priceStr);
            
            // If the value is less than 10000, assume it's in thousands (e.g., "500" means "500k")
            if (value < 10000) {
                return value * 1000;
            }
            
            return value;
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Parse integer string removing commas
     */
    private Integer parseInt(String str) {
        if (str == null) return null;
        try {
            return Integer.parseInt(str.replace(",", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Parse float string for bathrooms
     */
    private Integer parseFloat(String str) {
        if (str == null) return null;
        try {
            // Convert to integer for bathroom count
            return (int) Math.ceil(Double.parseDouble(str));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
