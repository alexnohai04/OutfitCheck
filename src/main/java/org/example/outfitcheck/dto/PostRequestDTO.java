package org.example.outfitcheck.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter @Setter
public class PostRequestDTO {
    private Long userId;
    private Long outfitId;
    private String caption;
    private List<String> hashtags;
    private MultipartFile image;
}
