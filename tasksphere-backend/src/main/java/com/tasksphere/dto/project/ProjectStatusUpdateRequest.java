package com.tasksphere.dto.project;

import com.tasksphere.model.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusUpdateRequest(@NotNull ProjectStatus status) {}
