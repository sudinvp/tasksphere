package com.tasksphere.dto.user;

import com.tasksphere.model.Role;
import com.tasksphere.model.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean enabled,
        LocalDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.isEnabled(), u.getCreatedAt());
    }
}
