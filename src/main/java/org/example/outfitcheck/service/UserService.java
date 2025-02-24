package org.example.outfitcheck.service;

import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User registerUser(User user) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(existingUser -> {
                    throw new RuntimeException("Email deja folosit!");
                });
        System.out.println("✅ User saved: " + user);
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utilizatorul nu există!"));
    }
}
