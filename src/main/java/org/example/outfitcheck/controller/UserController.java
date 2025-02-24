package org.example.outfitcheck.controller;

import org.example.outfitcheck.entity.User;
import org.example.outfitcheck.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
        System.out.println("🎯 UserController a fost creat!");
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        System.out.println("📩 Request primit în Controller: " + user);

        User savedUser = userService.registerUser(user);
        System.out.println("✅ User salvat în Controller: " + savedUser);

        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
