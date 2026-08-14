package com.tasksphere.service;

import com.tasksphere.dto.dashboard.DashboardSummary;
import com.tasksphere.model.TaskPriority;
import com.tasksphere.model.TaskStatus;
import com.tasksphere.repository.ProjectRepository;
import com.tasksphere.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DashboardSummary getSummary() {
        long totalProjects = projectRepository.count();
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.DONE);
        long overdueTasks = taskRepository.countOverdueTasks(LocalDate.now());
        long pendingTasks = totalTasks - completedTasks;

        double progress = totalTasks == 0 ? 0.0 : (completedTasks * 100.0) / totalTasks;

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            byStatus.put(status.name(), taskRepository.countByStatus(status));
        }

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (TaskPriority priority : TaskPriority.values()) {
            byPriority.put(priority.name(), taskRepository.findAll().stream()
                    .filter(t -> t.getPriority() == priority).count());
        }

        return new DashboardSummary(
                totalProjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                Math.round(progress * 100.0) / 100.0,
                byStatus,
                byPriority
        );
    }
}
