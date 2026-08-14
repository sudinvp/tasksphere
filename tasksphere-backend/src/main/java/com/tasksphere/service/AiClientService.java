package com.tasksphere.service;

import com.tasksphere.model.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Thin client that calls the Python/FastAPI AI microservice for task
 * classification and priority prediction. Built to fail soft: if the AI
 * service is unavailable, task creation/update still succeeds without
 * AI-enriched fields, they just stay null until a retry.
 */
@Service
@Slf4j
public class AiClientService {

    private final RestClient restClient;

    public AiClientService(@Value("${ai-service.base-url}") String aiServiceBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(aiServiceBaseUrl).build();
    }

    public record AiAnalysis(String suggestedCategory, Double priorityScore) {}

    public AiAnalysis analyze(Task task) {
        try {
            Map<String, Object> body = Map.of(
                    "title", task.getTitle(),
                    "description", task.getDescription() == null ? "" : task.getDescription(),
                    "due_date", task.getDueDate() != null ? task.getDueDate().toString() : null
            );

            Map<?, ?> response = restClient.post()
                    .uri("/api/ai/analyze-task")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) return new AiAnalysis(null, null);

            String category = (String) response.get("suggested_category");
            Double score = response.get("priority_score") != null
                    ? ((Number) response.get("priority_score")).doubleValue()
                    : null;

            return new AiAnalysis(category, score);
        } catch (Exception ex) {
            log.warn("AI service unavailable, skipping task analysis for task '{}': {}", task.getTitle(), ex.getMessage());
            return new AiAnalysis(null, null);
        }
    }
}
