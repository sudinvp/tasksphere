package com.tasksphere.service;

import com.tasksphere.dto.dashboard.NotificationResponse;
import com.tasksphere.exception.ResourceNotFoundException;
import com.tasksphere.model.Notification;
import com.tasksphere.model.NotificationType;
import com.tasksphere.model.User;
import com.tasksphere.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void notify(User user, NotificationType type, String message) {
        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .build();
        notificationRepository.save(n);
        // Hook point: publish to a message queue / WebSocket / push service here
        // so the frontend gets real-time updates instead of polling.
    }

    public List<NotificationResponse> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationResponse::from).toList();
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markRead(Long id, Long requestingUserId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (!n.getUser().getId().equals(requestingUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not your notification");
        }
        n.setRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }
}
