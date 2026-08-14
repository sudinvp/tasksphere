package com.tasksphere.repository;

import com.tasksphere.model.Task;
import com.tasksphere.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssigneeId(Long assigneeId);

    long countByStatus(TaskStatus status);

    long countByProjectId(Long projectId);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.dueDate < :today AND t.status <> 'DONE'")
    long countOverdueTasks(@Param("today") LocalDate today);
}
