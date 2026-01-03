package com.idxexchange.idxbackend.repository;

import com.idxexchange.idxbackend.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    Page<Property> findByCity(String city, Pageable pageable);
    Page<Property> findByState(String state, Pageable pageable);
    Page<Property> findByCityAndState(String city, String state, Pageable pageable);
    Page<Property> findByCityAndStateAndZip(String city, String state, String country, Pageable pageable);

    // Filter by prices
//    @Query("SELECT p FROM Property p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    Page<Property> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);

//    @Query("SELECT p FROM Property p WHERE p.price >= :minPrice")
    Page<Property> findByPriceGreaterThanEqual(Double minPrice, Pageable pageable);

//    @Query("SELECT p FROM Property p WHERE p.price <= :maxPrice")
    Page<Property> findByPriceLessThanEqual(Double maxPrice, Pageable pageable);

    // Filter by location + price
//    Page<Property> findByCityAndSystemPriceBetween(String city, Double minPrice, Double maxPrice, Pageable pageable);
//    Page<Property> findByCityAndSystemPriceGreaterThanEqual(String city, Double minPrice, Pageable pageable);
//    Page<Property> findByCityAndSystemPriceLessThanEqual(String city, Double maxPrice, Pageable pageable);
}
