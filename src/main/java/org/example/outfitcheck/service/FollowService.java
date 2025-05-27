package org.example.outfitcheck.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.entity.Follow;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.FollowRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public boolean isFollowing(Long currentUserId, Long otherUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        return followRepository.existsByFollowerAndFollowing(currentUser, otherUser);
    }

    public List<Long> getFollowingIds(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        return followRepository.findAllByFollower(currentUser).stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void follow(Long currentUserId, Long otherUserId) {
        if (currentUserId.equals(otherUserId)) return;

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        if (!followRepository.existsByFollowerAndFollowing(currentUser, otherUser)) {
            Follow follow = new Follow(null, currentUser, otherUser, LocalDateTime.now());
            followRepository.save(follow);
        }
    }

    @Transactional
    public void unfollow(Long currentUserId, Long otherUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        followRepository.deleteByFollowerAndFollowing(currentUser, otherUser);
    }
}
