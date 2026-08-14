package com.tasksphere.controller;

import com.tasksphere.dto.user.UpdateRoleRequest;
import com.tasksphere.dto.user.UserResponse;
import com.tasksphere.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        return userService.updateRole(id, request.role());
    }

    @PutMapping("/{id}/enabled")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse setEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
        return userService.setEnabled(id, enabled);
    }
}
