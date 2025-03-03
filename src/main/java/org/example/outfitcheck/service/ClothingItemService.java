package org.example.outfitcheck.service;

import org.example.outfitcheck.dto.ClothingItemRequest;
import org.example.outfitcheck.entity.ClothingCategory;
import org.example.outfitcheck.entity.ClothingItem;
import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.ClothingCategoryRepository;
import org.example.outfitcheck.repository.ClothingItemRepository;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.stereotype.Service;

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

    public ClothingItem addClothingItem(ClothingItemRequest request) {
        Optional<ClothingCategory> categoryOpt = categoryRepository.findById(request.getCategoryId());
        Optional<User> userOpt = userRepository.findById(request.getUserId());

        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Categoria nu există.");
        }
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilizatorul nu există.");
        }

        ClothingItem clothingItem = new ClothingItem();
        clothingItem.setImageUrl(request.getImageUrl());
        clothingItem.setColor(request.getColor());
        clothingItem.setMaterial(request.getMaterial());
        clothingItem.setCategory(categoryOpt.get());
        clothingItem.setOwner(userOpt.get());

        return clothingItemRepository.save(clothingItem);
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
