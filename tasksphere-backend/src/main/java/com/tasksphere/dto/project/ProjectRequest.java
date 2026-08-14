package com.tasksphere.dto.project;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record ProjectRequest(
        @NotBlank(message = "Project name is required") String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        List<Long> memberIds
) {}
