package org.example.outfitcheck.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

// PostResponseDTO.java
@Data
public class PostResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private Long outfitId;
    private String caption;
    private LocalDateTime postedAt;
    private List<String> hashtags;
    private int likeCount;
    private boolean likedByCurrentUser;
    private String imageUrl; // 🆕 imaginea postării
}
