package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.ClothingCategory;
import org.example.outfitcheck.repository.ClothingCategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class ClothingCategoryController {
    private final ClothingCategoryRepository categoryRepository;

    public ClothingCategoryController(ClothingCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // 🔹 1. Adăugare categorie nouă
    @PostMapping("/add")
    public ResponseEntity<ClothingCategory> addCategory(@RequestBody ClothingCategory category) {
        ClothingCategory savedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    // 🔹 2. Obținerea tuturor categoriilor
    @GetMapping("/all")
    public ResponseEntity<List<ClothingCategory>> getAllCategories() {
        List<ClothingCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    // 🔹 3. Obținerea unei categorii după nume
    @GetMapping("/name/{name}")
    public ResponseEntity<ClothingCategory> getCategoryByName(@PathVariable String name) {
        ClothingCategory category = categoryRepository.findByName(name);
        return category != null ? ResponseEntity.ok(category) : ResponseEntity.notFound().build();
    }

    // 🔹 4. Ștergerea unei categorii
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
