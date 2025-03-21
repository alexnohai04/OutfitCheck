package org.example.outfitcheck.service;

import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User registerUser(User user) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(existingUser -> {
                    throw new RuntimeException("Email deja folosit!");
                });

        if (user.getUsername() != null) {  // Verifică doar dacă username-ul nu este null
            userRepository.findByUsername(user.getUsername())
                    .ifPresent(existingUser -> {
                        throw new RuntimeException("Username deja folosit!");
                    });
        }

        System.out.println("✅ User saved: " + user);
        return userRepository.save(user);
    }

    public String uploadProfilePicture(Long id, MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            // Creează folderul dacă nu există
            String fileName = "profile_" + id + ".webp";
            Path uploadPath = Paths.get("uploads/profile");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            // NU folosim un IP fix, doar calea relativă
            String imageUrl = "/uploads/profile" + fileName;

            // Actualizăm user-ul cu noua imagine
            updateProfilePicture(id, imageUrl);

            return imageUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    public Resource getProfilePicture(Long id) {
        try {
            Path filePath = Paths.get("uploads/profile").resolve("profile_" + id + ".webp").normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }

            return resource;
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving file", e);
        }
    }

    public void updateProfilePicture(Long id, String imageUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePicUrl(imageUrl);
        userRepository.save(user);
    }
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utilizatorul nu există!"));
    }
}
