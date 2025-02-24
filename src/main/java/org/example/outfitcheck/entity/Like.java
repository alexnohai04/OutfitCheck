package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "likes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "like_seq")
    @SequenceGenerator(name = "like_seq", sequenceName = "like_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // Cine a dat like

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;  // La ce postare s-a dat like
}
