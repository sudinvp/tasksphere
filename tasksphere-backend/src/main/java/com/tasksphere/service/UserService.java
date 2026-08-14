package com.tasksphere.service;

import com.tasksphere.dto.user.UserResponse;
import com.tasksphere.exception.ResourceNotFoundException;
import com.tasksphere.model.Role;
import com.tasksphere.model.User;
import com.tasksphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse getUser(Long id) {
        return UserResponse.from(findUserOrThrow(id));
    }

    public UserResponse updateRole(Long id, Role newRole) {
        User user = findUserOrThrow(id);
        user.setRole(newRole);
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse setEnabled(Long id, boolean enabled) {
        User user = findUserOrThrow(id);
        user.setEnabled(enabled);
        return UserResponse.from(userRepository.save(user));
    }

    public User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
