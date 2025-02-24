package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "follows")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "follow_seq")
    @SequenceGenerator(name = "follow_seq", sequenceName = "follow_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "follower_id")
    private User follower;  // Cine urmărește

    @ManyToOne
    @JoinColumn(name = "following_id")
    private User following;  // Cine este urmărit
}
