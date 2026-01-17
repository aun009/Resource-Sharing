package com.skill.repository;

import com.skill.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByStatus(String status);

    List<Resource> findByUserId(Long userId);

    List<Resource> findByCategory(String category);
}
