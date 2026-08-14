package com.tasksphere.scheduler;

import com.tasksphere.model.NotificationType;
import com.tasksphere.model.Task;
import com.tasksphere.service.NotificationService;
import com.tasksphere.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Runs once a day and reminds assignees about tasks that are overdue or
 * (in a fuller implementation) due within the next 24-48h.
 */
@Component
@RequiredArgsConstructor
public class DeadlineReminderScheduler {

    private final TaskService taskService;
    private final NotificationService notificationService;

    // Every day at 08:00 server time.
    @Scheduled(cron = "0 0 8 * * *")
    public void sendOverdueReminders() {
        for (Task task : taskService.findOverdueTasks()) {
            if (task.getAssignee() != null) {
                notificationService.notify(
                        task.getAssignee(),
                        NotificationType.DEADLINE_REMINDER,
                        "Task \"" + task.getTitle() + "\" is overdue (was due " + task.getDueDate() + ")"
                );
            }
        }
    }
}
