package com.limitbeyond.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOrigins(
                                                "http://localhost:8081",
                                                "http://localhost:3000",
                                                "http://localhost:5173")
                                .allowedMethods(
                                                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
                                .allowedHeaders("*")

                                .exposedHeaders(
                                                "Authorization",
                                                "Access-Control-Allow-Origin",
                                                "Access-Control-Allow-Credentials")
                                .allowCredentials(true)
                                .maxAge(3600);
        }
}