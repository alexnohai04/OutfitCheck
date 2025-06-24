package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.OutfitCategory;
import org.example.outfitcheck.service.OutfitCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outfit-categories")
public class OutfitCategoryController {

    @Autowired
    private OutfitCategoryService service;

    @GetMapping
    public List<OutfitCategory> getAll() {
        return service.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OutfitCategory> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<OutfitCategory> getByName(@PathVariable String name) {
        return service.getByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody OutfitCategory category) {
        try {
            OutfitCategory created = service.createCategory(category);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
