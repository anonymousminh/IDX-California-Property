package com.idxexchange.idxbackend.specification;

import com.idxexchange.idxbackend.model.Property;
import org.springframework.data.jpa.domain.Specification;

public class PropertySpecification {

    public static Specification<Property> hasCity(String city) {
        return (root, query, criteriaBuilder) -> {
            if (city == null || city.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("city")),
                    city.toLowerCase()
            );
        };
    }

    public static Specification<Property> hasState(String state) {
        return (root, query, criteriaBuilder) -> {
            if (state == null || state.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("state")),
                    state.toLowerCase()
            );
        };
    }

    public static Specification<Property> hasZip(String zip) {
        return (root, query, criteriaBuilder) -> {
            if (zip == null || zip.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("zip"), zip);
        };
    }

    public static Specification<Property> priceGreaterThanOrEqual(Double minPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    public static Specification<Property> priceLessThanOrEqual(Double maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (maxPrice == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    public static Specification<Property> hasBeds(Integer beds) {
        return (root, query, criteriaBuilder) -> {
            if (beds == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("beds"), beds);
        };
    }

    public static Specification<Property> bedsGreaterThanOrEqual(Integer minBeds) {
        return (root, query, criteriaBuilder) -> {
            if (minBeds == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("beds"), minBeds);
        };
    }

    public static Specification<Property> hasBaths(Integer baths) {
        return (root, query, criteriaBuilder) -> {
            if (baths == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("baths"), baths);
        };
    }

    public static Specification<Property> bathsGreaterThanOrEqual(Integer minBaths) {
        return (root, query, criteriaBuilder) -> {
            if (minBaths == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("baths"), minBaths);
        };
    }

    // Square footage specifications
    public static Specification<Property> squareFeetGreaterThanOrEqual(Integer minSquareFeet) {
        return (root, query, criteriaBuilder) -> {
            if (minSquareFeet == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("squareFeet"), minSquareFeet);
        };
    }

    public static Specification<Property> squareFeetLessThanOrEqual(Integer maxSquareFeet) {
        return (root, query, criteriaBuilder) -> {
            if (maxSquareFeet == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("squareFeet"), maxSquareFeet);
        };
    }

    // Feature specifications
    public static Specification<Property> hasPool(Boolean hasPool) {
        return (root, query, criteriaBuilder) -> {
            if (hasPool == null || !hasPool) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("poolPrivate"), true);
        };
    }

    public static Specification<Property> hasFireplace(Boolean hasFireplace) {
        return (root, query, criteriaBuilder) -> {
            if (hasFireplace == null || !hasFireplace) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("fireplace"), true);
        };
    }

    public static Specification<Property> hasView(Boolean hasView) {
        return (root, query, criteriaBuilder) -> {
            if (hasView == null || !hasView) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("view"), true);
        };
    }

    public static Specification<Property> hasGarage(Boolean hasGarage) {
        return (root, query, criteriaBuilder) -> {
            if (hasGarage == null || !hasGarage) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("garage"), true);
        };
    }

    // Year built specifications
    public static Specification<Property> yearBuiltGreaterThanOrEqual(Integer minYear) {
        return (root, query, criteriaBuilder) -> {
            if (minYear == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("year_built"), minYear);
        };
    }

    public static Specification<Property> yearBuiltLessThanOrEqual(Integer maxYear) {
        return (root, query, criteriaBuilder) -> {
            if (maxYear == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("year_built"), maxYear);
        };
    }

    // Property type specification
    public static Specification<Property> hasPropertyType(String propertyType) {
        return (root, query, criteriaBuilder) -> {
            if (propertyType == null || propertyType.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            // Search in both household_type and property_class fields
            return criteriaBuilder.or(
                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("household_type")),
                    "%" + propertyType.toLowerCase() + "%"
                ),
                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("property_class")),
                    "%" + propertyType.toLowerCase() + "%"
                )
            );
        };
    }
}

