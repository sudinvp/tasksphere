package com.tasksphere.controller;

import com.tasksphere.dto.dashboard.NotificationResponse;
import com.tasksphere.security.UserPrincipal;
import com.tasksphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getMyNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.getForUser(principal.getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return Map.of("unread", notificationService.unreadCount(principal.getId()));
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.markRead(id, principal.getId());
    }
}
