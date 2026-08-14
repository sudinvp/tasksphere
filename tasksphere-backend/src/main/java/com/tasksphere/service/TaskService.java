package com.tasksphere.service;

import com.tasksphere.dto.task.CommentRequest;
import com.tasksphere.dto.task.CommentResponse;
import com.tasksphere.dto.task.TaskRequest;
import com.tasksphere.dto.task.TaskResponse;
import com.tasksphere.exception.ResourceNotFoundException;
import com.tasksphere.model.*;
import com.tasksphere.repository.CommentRepository;
import com.tasksphere.repository.ProjectRepository;
import com.tasksphere.repository.TaskRepository;
import com.tasksphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final AiClientService aiClientService;

    public TaskResponse createTask(TaskRequest request, Long creatorId) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.projectId()));

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + creatorId));

        User assignee = request.assigneeId() != null
                ? userRepository.findById(request.assigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.assigneeId()))
                : null;

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)
                .project(project)
                .assignee(assignee)
                .createdBy(creator)
                .dueDate(request.dueDate())
                .build();

        // Enrich with AI classification/priority prediction (fails soft).
        AiClientService.AiAnalysis analysis = aiClientService.analyze(task);
        task.setAiSuggestedCategory(analysis.suggestedCategory());
        task.setAiPriorityScore(analysis.priorityScore());

        task = taskRepository.save(task);

        if (assignee != null) {
            notificationService.notify(assignee, NotificationType.TASK_ASSIGNED,
                    "You were assigned to task \"" + task.getTitle() + "\" in project " + project.getName());
        }

        return TaskResponse.from(task);
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream().map(TaskResponse::from).toList();
    }

    public TaskResponse getTask(Long id) {
        return TaskResponse.from(findOrThrow(id));
    }

    public List<TaskResponse> getTasksForProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream().map(TaskResponse::from).toList();
    }

    public List<TaskResponse> getTasksForAssignee(Long assigneeId) {
        return taskRepository.findByAssigneeId(assigneeId).stream().map(TaskResponse::from).toList();
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findOrThrow(id);

        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.priority() != null) task.setPriority(request.priority());
        task.setDueDate(request.dueDate());

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.assigneeId()));
            boolean reassigned = task.getAssignee() == null || !task.getAssignee().getId().equals(assignee.getId());
            task.setAssignee(assignee);
            if (reassigned) {
                notificationService.notify(assignee, NotificationType.TASK_ASSIGNED,
                        "You were assigned to task \"" + task.getTitle() + "\"");
            }
        }

        return TaskResponse.from(taskRepository.save(task));
    }

    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task task = findOrThrow(id);
        task.setStatus(status);
        task = taskRepository.save(task);

        if (task.getAssignee() != null) {
            notificationService.notify(task.getAssignee(), NotificationType.STATUS_UPDATE,
                    "Task \"" + task.getTitle() + "\" status changed to " + status);
        }

        return TaskResponse.from(task);
    }

    public void deleteTask(Long id) {
        taskRepository.delete(findOrThrow(id));
    }

    public CommentResponse addComment(Long taskId, CommentRequest request, Long authorId) {
        Task task = findOrThrow(taskId);
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        Comment comment = Comment.builder()
                .task(task)
                .author(author)
                .content(request.content())
                .build();

        comment = commentRepository.save(comment);
        return CommentResponse.from(comment);
    }

    public List<CommentResponse> getComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream().map(CommentResponse::from).toList();
    }

    public List<Task> findOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDate.now());
    }

    private Task findOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }
}
