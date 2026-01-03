package com.idxexchange.idxbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "rets_property")
public class Property {
    // Getters & setters
    @Id
    @Column(name = "Id")
    private Long id;

    @Column(name = "L_Address")
    private String address;

    @Column(name = "L_City")
    private String city;

    @Column(name = "L_State")
    private String state;

    @Column(name = "L_Zip")
    private String zip;

    @Column(name = "L_Class")
    private String property_class;

    @Column(name = "L_Type_")
    private String household_type;

    @Column(name = "L_Keyword2")
    private Integer beds;

    @Column(name = "LM_Dec_3")
    private Integer baths;

    @Column(name = "L_Keyword1")
    private Integer land_size;

    @Column(name = "L_Keyword5")
    private Integer garage_capacity;

    @Column(name = "L_SystemPrice")
    private Double price;

    @Column(name = "LMD_MP_Latitude")
    private String latitude;

    @Column(name = "LMD_MP_Longitude")
    private String longitude;

    @Column(name = "L_Remarks")
    private String remarks;

    @Column(name = "YearBuilt")
    private Integer year_built;

    @Column(name = "Appliances")
    private String appliances;

    @Column(name = "L_Photos")
    private String photos;

    // MLS and Listing Info
    @Column(name = "L_DisplayId")
    private String mlsNumber;

    @Column(name = "L_Status")
    private String status;

    @Column(name = "StandardStatus")
    private String standardStatus;

    @Column(name = "ListingContractDate")
    private java.sql.Date listingContractDate;

    @Column(name = "DaysOnMarket")
    private Integer daysOnMarket;

    // Location Details
    @Column(name = "L_AddressStreet")
    private String addressStreet;

    @Column(name = "SubdivisionName")
    private String subdivisionName;

    @Column(name = "CountyOrParish")
    private String county;

    // Property Details
    @Column(name = "LM_Int2_3")
    private Integer squareFeet;

    @Column(name = "LotSizeSquareFeet")
    private java.math.BigDecimal lotSizeSquareFeet;

    @Column(name = "BathroomsHalf")
    private Integer bathroomsHalf;

    @Column(name = "StoriesTotal")
    private Integer storiesTotal;

    @Column(name = "StructureType")
    private String structureType;

    @Column(name = "PropertyCondition")
    private String propertyCondition;

    // Features (YN fields as Boolean)
    @Column(name = "PoolPrivateYN")
    private Boolean poolPrivate;

    @Column(name = "FireplaceYN")
    private Boolean fireplace;

    @Column(name = "ViewYN")
    private Boolean view;

    @Column(name = "GarageYN")
    private Boolean garage;

    @Column(name = "CoolingYN")
    private Boolean cooling;

    @Column(name = "HeatingYN")
    private Boolean heating;

    // HVAC Details
    @Column(name = "Cooling")
    private String coolingType;

    @Column(name = "Heating")
    private String heatingType;

    // View Details
    @Column(name = "View")
    private String viewDescription;

    // Interior Features
    @Column(name = "InteriorFeatures")
    private String interiorFeatures;

    // Association/HOA
    @Column(name = "AssociationFee")
    private Integer associationFee;

    @Column(name = "AssociationFeeFrequency")
    private String associationFeeFrequency;

    // Agent Information
    @Column(name = "LA1_UserFirstName")
    private String agentFirstName;

    @Column(name = "LA1_UserLastName")
    private String agentLastName;

    @Column(name = "ListAgentFullName")
    private String agentFullName;

    @Column(name = "LO1_OrganizationName")
    private String officeName;

    @Column(name = "ListAgentEmail")
    private String agentEmail;

    @Column(name = "ListAgentDirectPhone")
    private String agentPhone;

}
