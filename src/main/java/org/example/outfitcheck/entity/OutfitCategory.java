package org.example.outfitcheck.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "outfit_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OutfitCategory {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true)
        private String name;

        @ManyToMany(mappedBy = "categories")
        @JsonIgnore
        private List<Outfit> outfits;
}

