package org.example.outfitcheck.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String openAIApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> SYMBOLS = List.of(
            "Machine wash 30C",
            "Machine wash 40C",
            "Machine wash 50C",
            "Machine wash 60C",
            "Hand wash",
            "Do not wash",
            "Tumble dry allowed",
            "Do not tumble dry",
            "Iron at low temperature",
            "Iron at medium temperature",
            "Iron at high temperature",
            "Do not iron",
            "Bleach allowed",
            "Do not bleach"
    );

    public List<String> analyzeLabel(String imageBase64) {
        String endpoint = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAIApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 1. Construim lista cu simboluri predefinite
        StringBuilder symbolList = new StringBuilder();
        SYMBOLS.forEach(s -> symbolList.append("- ").append(s).append("\n"));

        // 2. Prompt clar și constrâns
        String instruction = "You are analyzing a clothing care label image." +
                "\nYour task is to identify only the exact care symbols that are clearly visible in the image." +
                "\nHere is the list of all valid care symbols:\n\n" +
                symbolList +
                "\nImportant rules:" +
                "\n- Do NOT guess or assume symbols." +
                "\n- Match only based on visual similarity between the label and the symbols listed." +
                "\n- Each care category (washing, drying, ironing, bleaching) includes mutually exclusive symbols." +
                "\n  → For each category, select at most ONE matching symbol." +
                "\n  → If multiple are similar, choose the one that visually matches best." +
                "\n- Return ONLY a valid JSON array like this: [\"Do not bleach\", \"Iron at low temperature\"]" +
                "\n- Do NOT include any explanation, markdown formatting, or text outside the JSON array.";

        // 3. Structura mesajului (text + imagine cu detail: "high")
        Map<String, Object> textPart = Map.of(
                "type", "text",
                "text", instruction
        );

        Map<String, Object> imagePart = Map.of(
                "type", "image_url",
                "image_url", Map.of(
                        "url", imageBase64,
                        "detail", "high"
                )
        );

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", List.of(textPart, imagePart)
        );

        // 4. Corpul requestului
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4.1"); // corect pentru vision
        body.put("temperature", 0);
        body.put("messages", List.of(message));
        body.put("max_tokens", 300);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, Map.class);

        try {
            String content = (String) ((Map)((Map)((List<?>) response.getBody().get("choices")).get(0)).get("message")).get("content");

            String cleaned = content.trim();
            if (cleaned.startsWith("`")) {
                cleaned = cleaned.replaceAll("`", "");
            }

            return objectMapper.readValue(cleaned, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
