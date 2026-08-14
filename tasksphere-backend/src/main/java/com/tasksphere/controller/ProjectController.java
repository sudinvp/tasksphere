package com.tasksphere.controller;

import com.tasksphere.dto.project.*;
import com.tasksphere.security.UserPrincipal;
import com.tasksphere.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request, principal.getId()));
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/mine")
    public List<ProjectResponse> getMyProjects(@AuthenticationPrincipal UserPrincipal principal) {
        return projectService.getProjectsForUser(principal.getId());
    }

    @GetMapping("/{id}")
    public ProjectResponse getProject(@PathVariable Long id) {
        return projectService.getProject(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectResponse updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectResponse updateStatus(@PathVariable Long id, @Valid @RequestBody ProjectStatusUpdateRequest request) {
        return projectService.updateStatus(id, request.status());
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectResponse addMembers(@PathVariable Long id, @Valid @RequestBody AddMembersRequest request) {
        return projectService.addMembers(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
