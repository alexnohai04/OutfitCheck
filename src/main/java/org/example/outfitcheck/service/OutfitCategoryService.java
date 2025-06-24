package org.example.outfitcheck.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.outfitcheck.entity.Outfit;
import org.example.outfitcheck.entity.OutfitCategory;
import org.example.outfitcheck.repository.OutfitCategoryRepository;
import org.example.outfitcheck.repository.OutfitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class OutfitCategoryService {

    private final OutfitCategoryRepository repository;

    private final OutfitRepository outfitRepository;


    public List<OutfitCategory> getAllCategories() {
        return repository.findAll();
    }

    public Optional<OutfitCategory> getById(Long id) {
        return repository.findById(id);
    }

    public Optional<OutfitCategory> getByName(String name) {
        return repository.findByNameIgnoreCase(name);
    }

    public OutfitCategory createCategory(OutfitCategory category) {
        if (repository.existsByNameIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("Category already exists");
        }
        return repository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Optional<OutfitCategory> categoryOpt = repository.findById(id);
        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Category not found");
        }

        OutfitCategory category = categoryOpt.get();

        // Dezlipește categoria din toate outfiturile
        List<Outfit> outfits = outfitRepository.findAllByCategoriesContaining(category);
        for (Outfit o : outfits) {
            o.getCategories().remove(category);
        }

        outfitRepository.saveAll(outfits); // salvează modificările

        repository.delete(category);
    }

}
