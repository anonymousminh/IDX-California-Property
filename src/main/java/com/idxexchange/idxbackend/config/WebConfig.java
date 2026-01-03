package com.idxexchange.idxbackend.config;

import org.springframework.context.annotation.Configuration;

/**
 * Web configuration for the application.
 * Page serialization is handled by PageSerializer annotated with @JsonComponent.
 */
@Configuration
public class WebConfig {
    // Page serialization is automatically configured via @JsonComponent on PageSerializer
}

