package com.tasksphere.dto.dashboard;

import java.util.Map;

public record DashboardSummary(
        long totalProjects,
        long totalTasks,
        long completedTasks,
        long pendingTasks,
        long overdueTasks,
        double overallProgressPercent,
        Map<String, Long> tasksByStatus,
        Map<String, Long> tasksByPriority
) {}
