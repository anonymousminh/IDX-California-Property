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
}

