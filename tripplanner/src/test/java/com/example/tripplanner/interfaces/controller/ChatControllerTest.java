package com.example.tripplanner.interfaces.controller;

import com.example.tripplanner.application.dto.chat.ChatRequest;
import com.example.tripplanner.application.dto.chat.ChatResponse;
import com.example.tripplanner.application.service.AiOrchestratorService;
import com.example.tripplanner.domain.model.Conversation;
import com.example.tripplanner.domain.port.ConversationRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiOrchestratorService orchestratorService;

    @MockBean
    private ConversationRepository conversationRepository;

    @Test
    @WithMockUser
    void testCreateMessage() throws Exception {
        ChatResponse resp = ChatResponse.builder()
                .conversationId(UUID.randomUUID())
                .build();

        Mockito.when(orchestratorService.processChat(any(), any(ChatRequest.class), any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"Du lịch Nha Trang 3 ngày\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void testGetConversation() throws Exception {
        UUID convId = UUID.randomUUID();
        Conversation conversation = Conversation.builder().id(convId).build();
        Mockito.when(conversationRepository.findById(eq(convId))).thenReturn(Optional.of(conversation));

        mockMvc.perform(get("/api/v1/chat/" + convId))
                .andExpect(status().isOk());
    }
}
