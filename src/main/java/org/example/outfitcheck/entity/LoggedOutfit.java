package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "logged_outfits")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class LoggedOutfit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "logged_outfit_seq")
    @SequenceGenerator(name = "logged_outfit_seq", sequenceName = "logged_outfit_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outfit_id", nullable = false)
    private Outfit outfit;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long userId;
}
