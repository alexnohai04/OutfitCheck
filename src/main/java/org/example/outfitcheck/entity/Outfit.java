package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "outfits")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Outfit {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "outfit_seq")
    @SequenceGenerator(name = "outfit_seq", sequenceName = "outfit_sequence", allocationSize = 1)
    private Long id;

    private String name;  // Numele outfit-ului, ex: "Casual Friday"

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User creator;  // Cine a creat outfit-ul

    @ManyToMany
    @JoinTable(
            name = "outfit_clothing",
            joinColumns = @JoinColumn(name = "outfit_id"),
            inverseJoinColumns = @JoinColumn(name = "clothing_item_id")
    )
    private List<ClothingItem> clothingItems;  // Lista hainelor din acest outfit
}
