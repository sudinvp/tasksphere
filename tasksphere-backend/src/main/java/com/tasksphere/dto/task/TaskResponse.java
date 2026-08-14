package com.tasksphere.dto.task;

import com.tasksphere.model.Task;
import com.tasksphere.model.TaskPriority;
import com.tasksphere.model.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        Long projectId,
        String projectName,
        Long assigneeId,
        String assigneeName,
        String aiSuggestedCategory,
        Double aiPriorityScore,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getPriority(),
                t.getStatus(),
                t.getDueDate(),
                t.getProject() != null ? t.getProject().getId() : null,
                t.getProject() != null ? t.getProject().getName() : null,
                t.getAssignee() != null ? t.getAssignee().getId() : null,
                t.getAssignee() != null ? t.getAssignee().getFullName() : null,
                t.getAiSuggestedCategory(),
                t.getAiPriorityScore(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
