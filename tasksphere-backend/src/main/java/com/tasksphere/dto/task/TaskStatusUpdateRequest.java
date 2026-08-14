package com.tasksphere.dto.task;

import com.tasksphere.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(@NotNull TaskStatus status) {}
