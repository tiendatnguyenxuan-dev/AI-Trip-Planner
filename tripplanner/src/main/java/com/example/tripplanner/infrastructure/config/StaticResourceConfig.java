package com.example.tripplanner.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get("uploads/community");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/api/v1/community/uploads/**")
                .addResourceLocations("file:/" + uploadPath + "/");
    }
}
