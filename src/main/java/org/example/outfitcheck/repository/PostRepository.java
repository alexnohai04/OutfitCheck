package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);

    List<Post> findByUserIdInOrderByPostedAtDesc(List<Long> followingIds);
}
