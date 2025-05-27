package org.example.outfitcheck.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

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

    @Column(nullable = true)
    private String baseColor;

    @Column(nullable = true)
    private String brand;  // Ex: "Cotton"

    private String imageUrl;  // URL către imaginea scanată

    private String link; // URL catre website-ul de unde a fost cumparat

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private ClothingCategory category;

    @ElementCollection
    @CollectionTable(name = "clothing_item_care_symbols", joinColumns = @JoinColumn(name = "clothing_item_id"))
    @Column(name = "symbol")
    private List<String> careSymbols;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonBackReference  // 🚀 Permite serializarea `owner`, dar evită recursivitatea
    private User owner;

    @Column(nullable = true)
    private String articleType;

    @Column(nullable = true)
    private String season;

    @Column(nullable = true)
    private String usage;

    @Column(nullable = true)
    private boolean inLaundry = false;
}
