package com.skill.repository;

import com.skill.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByStatus(String status);

    List<Request> findByRequesterEmailOrHelperEmail(String requesterEmail, String helperEmail);
}
