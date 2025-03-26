package org.example.outfitcheck.mapper;

import org.example.outfitcheck.dto.PostRequestDTO;
import org.example.outfitcheck.dto.PostResponseDTO;
import org.example.outfitcheck.entity.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public PostResponseDTO toDto(Post post, Long currentUserId) {
        PostResponseDTO dto = new PostResponseDTO();
        dto.setId(post.getId());
        dto.setUserId(post.getUser().getId());
        dto.setUsername(post.getUser().getUsername());
        dto.setOutfitId(post.getOutfit().getId());
        dto.setCaption(post.getCaption());
        dto.setPostedAt(post.getPostedAt());
        dto.setHashtags(post.getHashtags());
        dto.setLikeCount(post.getLikedBy().size());
        dto.setLikedByCurrentUser(
                post.getLikedBy().stream()
                        .anyMatch(user -> user.getId().equals(currentUserId))
        );
        dto.setImageUrl(post.getImageUrl());
        return dto;
    }
}
