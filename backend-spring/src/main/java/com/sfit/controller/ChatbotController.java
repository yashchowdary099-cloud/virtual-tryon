package com.sfit.controller;

import com.sfit.dto.chatbot.ChatRequest;
import com.sfit.dto.chatbot.ChatResponse;
import com.sfit.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> processChat(@RequestBody(required = false) ChatRequest request) {
        if (request == null) {
            request = new ChatRequest();
        }
        ChatResponse response = chatbotService.processChat(request);
        return ResponseEntity.ok(response);
    }
}
