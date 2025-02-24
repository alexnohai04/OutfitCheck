package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.Follow;
import org.example.outfitcheck.repository.FollowRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/follows")
public class FollowController {
    private final FollowRepository followRepository;

    public FollowController(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    // 🔹 1. Urmărire utilizator
    @PostMapping("/follow")
    public ResponseEntity<Follow> followUser(@RequestBody Follow follow) {
        Follow savedFollow = followRepository.save(follow);
        return ResponseEntity.ok(savedFollow);
    }

    // 🔹 2. Obținerea tuturor utilizatorilor pe care îi urmărește un user
    @GetMapping("/following/{userId}")
    public ResponseEntity<List<Follow>> getFollowing(@PathVariable Long userId) {
        List<Follow> following = followRepository.findByFollowerId(userId);
        return ResponseEntity.ok(following);
    }

    // 🔹 3. Obținerea tuturor follower-ilor unui user
    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<Follow>> getFollowers(@PathVariable Long userId) {
        List<Follow> followers = followRepository.findByFollowingId(userId);
        return ResponseEntity.ok(followers);
    }

    // 🔹 4. Anularea urmăririi unui utilizator
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long id) {
        if (followRepository.existsById(id)) {
            followRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
