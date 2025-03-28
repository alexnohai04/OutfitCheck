package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    private String imageUrl; // Poza asociată postării


    @ManyToOne
    @JoinColumn(name = "outfit_id")
    private Outfit outfit;  // Outfit-ul asociat

    private String caption;  // Descrierea postării
    private LocalDateTime postedAt;  // Timpul postării

    @ElementCollection
    private List<String> hashtags;  // Hashtag-uri asociate postării

    @ManyToMany
    @JoinTable(
            name = "post_likes",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likedBy = new HashSet<>();



}
