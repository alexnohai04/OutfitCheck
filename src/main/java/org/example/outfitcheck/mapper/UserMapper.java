package org.example.outfitcheck.mapper;

import org.example.outfitcheck.dto.UserDTO;
import org.example.outfitcheck.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDto(User user) {
        int followersCount = user.getFollowers() != null ? user.getFollowers().size() : 0;
        int followingCount = user.getFollowing() != null ? user.getFollowing().size() : 0;

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfilePicUrl(),
                followersCount,
                followingCount
        );
    }
}
