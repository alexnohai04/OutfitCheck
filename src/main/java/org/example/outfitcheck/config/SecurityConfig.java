package org.example.outfitcheck.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // ⚠️ Dezactivăm protecția CSRF pentru testare
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/register").permitAll() // ✅ Permitem acces liber la înregistrare
                        .anyRequest().authenticated() // 🔒 Restul endpoint-urilor necesită autentificare
                )
                .formLogin(form -> form.disable()) // 🚫 Dezactivăm form login-ul
                .httpBasic(httpBasic -> httpBasic.disable()); // 🚫 Dezactivăm Basic Auth

        return http.build();
    }
}

//@Configuration
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable()) // ⚠️ Dezactivăm CSRF
//                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // 🚨 Permitem TOT
//
//        return http.build();
//    }
//}
