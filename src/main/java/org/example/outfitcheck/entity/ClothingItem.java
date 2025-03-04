package org.example.outfitcheck.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

//    @Column(nullable = false)
//    private String name;  // Ex: "Blue T-Shirt"

    private String color;  // Ex: "Blue"
    private String material;  // Ex: "Cotton"

    private String imageUrl;  // URL către imaginea scanată

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private ClothingCategory category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonBackReference  // 🚀 Permite serializarea `owner`, dar evită recursivitatea
    private User owner;
}
