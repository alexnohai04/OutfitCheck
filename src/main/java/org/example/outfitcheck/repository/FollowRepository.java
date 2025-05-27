package org.example.outfitcheck.repository;

import org.example.outfitcheck.entity.Follow;
import org.example.outfitcheck.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    void deleteByFollowerAndFollowing(User follower, User following);

    List<Follow> findAllByFollower(User follower);
}
