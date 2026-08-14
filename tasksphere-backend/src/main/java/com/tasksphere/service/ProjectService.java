package com.tasksphere.service;

import com.tasksphere.dto.project.AddMembersRequest;
import com.tasksphere.dto.project.ProjectRequest;
import com.tasksphere.dto.project.ProjectResponse;
import com.tasksphere.exception.ResourceNotFoundException;
import com.tasksphere.model.Project;
import com.tasksphere.model.ProjectStatus;
import com.tasksphere.model.User;
import com.tasksphere.repository.ProjectRepository;
import com.tasksphere.repository.TaskRepository;
import com.tasksphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectResponse createProject(ProjectRequest request, Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Set<User> members = resolveMembers(request.memberIds());

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .manager(manager)
                .members(members)
                .build();

        project = projectRepository.save(project);
        return toResponse(project);
    }

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ProjectResponse getProject(Long id) {
        return toResponse(findOrThrow(id));
    }

    public List<ProjectResponse> getProjectsForUser(Long userId) {
        List<Project> managed = projectRepository.findByManagerId(userId);
        List<Project> member = projectRepository.findByMemberId(userId);
        Set<Project> combined = new HashSet<>();
        combined.addAll(managed);
        combined.addAll(member);
        return combined.stream().map(this::toResponse).toList();
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findOrThrow(id);
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        if (request.memberIds() != null) {
            project.setMembers(resolveMembers(request.memberIds()));
        }
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse updateStatus(Long id, ProjectStatus status) {
        Project project = findOrThrow(id);
        project.setStatus(status);
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse addMembers(Long id, AddMembersRequest request) {
        Project project = findOrThrow(id);
        project.getMembers().addAll(resolveMembers(request.memberIds()));
        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        Project project = findOrThrow(id);
        projectRepository.delete(project);
    }

    private Set<User> resolveMembers(List<Long> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(userRepository.findAllById(memberIds));
    }

    private Project findOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    private ProjectResponse toResponse(Project project) {
        int total = (int) taskRepository.countByProjectId(project.getId());
        int completed = (int) taskRepository.findByProjectId(project.getId()).stream()
                .filter(t -> t.getStatus() == com.tasksphere.model.TaskStatus.DONE)
                .count();
        return ProjectResponse.from(project, total, completed);
    }
}
