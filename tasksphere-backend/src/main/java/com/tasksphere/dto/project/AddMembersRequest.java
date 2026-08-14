package com.tasksphere.dto.project;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AddMembersRequest(@NotEmpty(message = "At least one member id is required") List<Long> memberIds) {}
