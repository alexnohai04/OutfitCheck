package org.example.outfitcheck.service;

import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.dto.PostRequestDTO;
import org.example.outfitcheck.dto.PostResponseDTO;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.entity.Post;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.mapper.PostMapper;
import org.example.outfitcheck.repository.OutfitRepository;
import org.example.outfitcheck.repository.PostRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final OutfitRepository outfitRepository;
    private final PostMapper postMapper;
    private final FollowService followService;

    public PostResponseDTO createPost(PostRequestDTO dto, MultipartFile imageFile) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Outfit outfit = outfitRepository.findById(dto.getOutfitId())
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        Post post = new Post();
        post.setUser(user);
        post.setOutfit(outfit);
        post.setCaption(dto.getCaption());
        post.setHashtags(dto.getHashtags());
        post.setPostedAt(LocalDateTime.now());

        postRepository.save(post); // pentru generarea ID-ului

        String imageUrl = savePostImage(post.getId(), imageFile);
        post.setImageUrl(imageUrl);

        postRepository.save(post); // actualizare cu poza

        return postMapper.toDto(post, user.getId());
    }

    public List<PostResponseDTO> getAllPosts(Long currentUserId) {
        return postRepository.findAll().stream()
                .map(post -> postMapper.toDto(post, currentUserId))
                .collect(Collectors.toList());
    }
    public List<PostResponseDTO> getFollowingPosts(Long currentUserId) {
        // 1. Ia lista de userId-uri pe care currentUserId îi urmăreşte
        List<Long> followingIds = followService.getFollowingIds(currentUserId);

        // 2. Preia toate postările acelor useri, ordonate (de ex) descrescător după dată
        List<Post> posts = postRepository
                .findByUserIdInOrderByPostedAtDesc(followingIds);

        // 3. Converteşte la DTO-uri (în funcţie de vizibilitate, like-uri, etc)
        return posts.stream()
                .map(post -> postMapper.toDto(post, currentUserId))
                .collect(Collectors.toList());
    }

    public List<PostResponseDTO> getPostsByUserId(Long userId, Long currentUserId) {
        List<Post> posts = postRepository.findByUserId(userId);
        return posts.stream()
                .map(post -> postMapper.toDto(post, currentUserId))
                .collect(Collectors.toList());
    }


    public void toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getLikedBy().contains(user)) {
            post.getLikedBy().remove(user);
        } else {
            post.getLikedBy().add(user);
        }

        postRepository.save(post);
    }

    private String savePostImage(Long postId, MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            String fileName = "post_" + postId + ".webp";
            Path uploadPath = Paths.get("uploads/posts");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            return "/uploads/posts/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save post image", e);
        }
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts.");
        }

        postRepository.delete(post);
    }
}
