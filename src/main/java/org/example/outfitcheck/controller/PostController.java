package org.example.outfitcheck.controller;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.dto.PostRequestDTO;
import org.example.outfitcheck.dto.PostResponseDTO;
import org.example.outfitcheck.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PostResponseDTO> createPost(
            @RequestParam("userId") Long userId,
            @RequestParam("outfitId") Long outfitId,
            @RequestParam("caption") String caption,
            @RequestParam(value = "hashtags", required = false) String hashtags,
            @RequestPart("image") MultipartFile imageFile
    ) {
        PostRequestDTO dto = new PostRequestDTO();
        dto.setUserId(userId);
        dto.setOutfitId(outfitId);
        dto.setCaption(caption);
        dto.setHashtags(parseHashtags(hashtags));

        PostResponseDTO responseDTO = postService.createPost(dto, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @GetMapping
    public ResponseEntity<List<PostResponseDTO>> getAllPosts(@RequestParam Long currentUserId) {
        return ResponseEntity.ok(postService.getAllPosts(currentUserId));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long postId, @RequestParam Long userId) {
        postService.toggleLike(postId, userId);
        return ResponseEntity.ok().build();
    }

    private List<String> parseHashtags(String raw) {
        if (raw == null || raw.trim().isEmpty()) return List.of();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toList());
    }
}
