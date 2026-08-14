package com.tasksphere.dto.user;

import com.tasksphere.model.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(@NotNull Role role) {}
