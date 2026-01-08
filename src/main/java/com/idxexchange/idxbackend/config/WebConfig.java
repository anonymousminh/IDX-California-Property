package com.idxexchange.idxbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for the application.
 * Page serialization is handled by PageSerializer annotated with @JsonComponent.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Read allowed origins from environment variable ALLOWED_ORIGINS (comma-separated).
        // Fallback to common local dev origins.
        String allowed = System.getenv("ALLOWED_ORIGINS");
        String[] origins;
        if (allowed != null && !allowed.isBlank()) {
            origins = java.util.Arrays.stream(allowed.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toArray(String[]::new);
        } else {
            origins = new String[]{"http://localhost:5173", "http://localhost:3000"};
        }

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

