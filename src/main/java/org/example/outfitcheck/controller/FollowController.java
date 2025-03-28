package org.example.outfitcheck.controller;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @GetMapping("/{otherUserId}/is-following")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable Long otherUserId,
            @RequestParam Long currentUserId
    ) {
        boolean following = followService.isFollowing(currentUserId, otherUserId);
        return ResponseEntity.ok(Map.of("following", following));
    }

    @PostMapping("/{otherUserId}/follow")
    public ResponseEntity<Void> followUser(
            @PathVariable Long otherUserId,
            @RequestParam Long currentUserId
    ) {
        followService.follow(currentUserId, otherUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{otherUserId}/unfollow")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long otherUserId,
            @RequestParam Long currentUserId
    ) {
        followService.unfollow(currentUserId, otherUserId);
        return ResponseEntity.ok().build();
    }
}
