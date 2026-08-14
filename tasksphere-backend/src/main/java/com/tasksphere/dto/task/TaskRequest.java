package com.tasksphere.dto.task;

import com.tasksphere.model.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Title is required") String title,
        String description,
        TaskPriority priority,
        @NotNull(message = "Project id is required") Long projectId,
        Long assigneeId,
        LocalDate dueDate
) {}
