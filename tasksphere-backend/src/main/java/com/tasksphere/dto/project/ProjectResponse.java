package com.tasksphere.dto.project;

import com.tasksphere.model.Project;
import com.tasksphere.model.ProjectStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        ProjectStatus status,
        LocalDate startDate,
        LocalDate endDate,
        Long managerId,
        String managerName,
        List<String> memberNames,
        int totalTasks,
        int completedTasks,
        LocalDateTime createdAt
) {
    public static ProjectResponse from(Project p, int totalTasks, int completedTasks) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getStatus(),
                p.getStartDate(),
                p.getEndDate(),
                p.getManager() != null ? p.getManager().getId() : null,
                p.getManager() != null ? p.getManager().getFullName() : null,
                p.getMembers().stream().map(com.tasksphere.model.User::getFullName).collect(Collectors.toList()),
                totalTasks,
                completedTasks,
                p.getCreatedAt()
        );
    }
}
