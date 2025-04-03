package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clothing_categories")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class ClothingCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
