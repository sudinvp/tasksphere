package com.tasksphere.dto.task;

import com.tasksphere.model.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String content,
        Long authorId,
        String authorName,
        LocalDateTime createdAt
) {
    public static CommentResponse from(Comment c) {
        return new CommentResponse(c.getId(), c.getContent(), c.getAuthor().getId(), c.getAuthor().getFullName(), c.getCreatedAt());
    }
}
