package org.example.outfitcheck.service;

import org.example.outfitcheck.entity.ClothingCategory;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.ClothingCategoryRepository;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class ClothingItemService {
    private final ClothingItemRepository clothingItemRepository;
    private final ClothingCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ClothingItemService(ClothingItemRepository clothingItemRepository,
                               ClothingCategoryRepository categoryRepository,
                               UserRepository userRepository) {
        this.clothingItemRepository = clothingItemRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public ClothingItem addClothingItem(Long userId, Long categoryId, String color, String material, MultipartFile file) {
        Optional<ClothingCategory> categoryOpt = categoryRepository.findById(categoryId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Categoria nu există.");
        }
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilizatorul nu există.");
        }

        ClothingItem clothingItem = new ClothingItem();
        clothingItem.setColor(color);
        clothingItem.setMaterial(material);
        clothingItem.setCategory(categoryOpt.get());
        clothingItem.setOwner(userOpt.get());

        // Salvăm articolul fără imagine (pentru a obține ID-ul)
        clothingItem = clothingItemRepository.save(clothingItem);

        // Dacă există o imagine, o salvăm și actualizăm ClothingItem
        if (file != null && !file.isEmpty()) {
            String imageUrl = saveClothingItemImage(clothingItem.getId(), file);
            clothingItem.setImageUrl(imageUrl);
            clothingItem = clothingItemRepository.save(clothingItem);
        }

        return clothingItem;
    }

    private String saveClothingItemImage(Long id, MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            // Creează folderul dacă nu există
            String fileName = "clothing_" + id + ".webp";
            Path uploadPath = Paths.get("uploads/clothing");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            // Returnează calea relativă
            return "/uploads/clothing/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save clothing item image", e);
        }
    }

    public List<ClothingItem> getClothingItemsByUser(Long userId) {
        return clothingItemRepository.findByOwnerId(userId);
    }

    public Optional<ClothingItem> getClothingItemById(Long id) {
        return clothingItemRepository.findById(id);
    }

    public boolean deleteClothingItem(Long id) {
        if (clothingItemRepository.existsById(id)) {
            clothingItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
