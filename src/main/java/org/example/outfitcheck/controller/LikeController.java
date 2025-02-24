package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.Like;
import org.example.outfitcheck.repository.LikeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
public class LikeController {
    private final LikeRepository likeRepository;

    public LikeController(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    // 🔹 1. Adăugare like la o postare
    @PostMapping("/add")
    public ResponseEntity<Like> addLike(@RequestBody Like like) {
        Like savedLike = likeRepository.save(like);
        return ResponseEntity.ok(savedLike);
    }

    // 🔹 2. Obținerea tuturor like-urilor pentru o postare
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Like>> getLikesByPost(@PathVariable Long postId) {
        List<Like> likes = likeRepository.findByPostId(postId);
        return ResponseEntity.ok(likes);
    }

    // 🔹 3. Obținerea tuturor like-urilor date de un utilizator
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Like>> getLikesByUser(@PathVariable Long userId) {
        List<Like> likes = likeRepository.findByUserId(userId);
        return ResponseEntity.ok(likes);
    }

    // 🔹 4. Ștergerea unui like
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLike(@PathVariable Long id) {
        if (likeRepository.existsById(id)) {
            likeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
