package com.skill.repository;

import com.skill.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderOrRecipientOrderByTimestampAsc(String sender, String recipient);

    List<ChatMessage> findBySenderOrRecipientOrderByTimestampDesc(String sender, String recipient);
}
