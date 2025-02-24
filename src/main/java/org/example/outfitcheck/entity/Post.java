package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "post_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // Cine a postat

    @OneToOne
    @JoinColumn(name = "outfit_id")
    private Outfit outfit;  // Outfit-ul asociat

    private String caption;  // Descrierea postării
    private LocalDateTime postedAt;  // Timpul postării

    @ElementCollection
    private List<String> hashtags;  // Hashtag-uri asociate postării
}
