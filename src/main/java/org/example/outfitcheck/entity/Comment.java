package org.example.outfitcheck.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_seq")
    @SequenceGenerator(name = "comment_seq", sequenceName = "comment_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // Cine a comentat

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;  // La ce postare s-a comentat

    private String content;  // Conținutul comentariului
    private LocalDateTime commentedAt;  // Data comentariului
}
