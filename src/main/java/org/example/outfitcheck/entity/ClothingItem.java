package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clothing_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class ClothingItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "clothing_seq")
    @SequenceGenerator(name = "clothing_seq", sequenceName = "clothing_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String name;  // Ex: "Blue T-Shirt"

    private String color;  // Ex: "Blue"
    private String material;  // Ex: "Cotton"

    private String imageUrl;  // URL către imaginea scanată

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ClothingCategory category; // Legătură cu tabela de categorii

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;  // Haina aparține unui utilizator
}
