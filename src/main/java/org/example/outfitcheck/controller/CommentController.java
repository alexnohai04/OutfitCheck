package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.Comment;
import org.example.outfitcheck.repository.CommentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentRepository commentRepository;

    public CommentController(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // 🔹 1. Adăugare comentariu nou
    @PostMapping("/add")
    public ResponseEntity<Comment> addComment(@RequestBody Comment comment) {
        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(savedComment);
    }

    // 🔹 2. Obținerea tuturor comentariilor pentru o postare
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // 🔹 3. Ștergerea unui comentariu
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
