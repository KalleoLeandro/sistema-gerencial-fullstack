package br.com.sistema_gerencial.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.com.sistema_gerencial.exceptions.CustomAccessDeniedHandler;
import br.com.sistema_gerencial.exceptions.CustomAuthenticationEntryPoint;

/**
 * Configura o acesso HTTP entre origens e as regras de segurança da aplicação.
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@EnableWebSecurity
public class CorsConfig {

	@Value("${app.cors.allowed-origins:http://localhost:*,http://127.0.0.1:*,http://10.*.*.*:*,http://192.168.*.*:*,http://172.16.*.*:*,http://172.17.*.*:*,http://172.18.*.*:*,http://172.19.*.*:*,http://172.20.*.*:*,http://172.21.*.*:*,http://172.22.*.*:*,http://172.23.*.*:*,http://172.24.*.*:*,http://172.25.*.*:*,http://172.26.*.*:*,http://172.27.*.*:*,http://172.28.*.*:*,http://172.29.*.*:*,http://172.30.*.*:*,http://172.31.*.*:*,https://localhost:*,https://127.0.0.1:*,https://10.*.*.*:*,https://192.168.*.*:*,https://172.16.*.*:*,https://172.17.*.*:*,https://172.18.*.*:*,https://172.19.*.*:*,https://172.20.*.*:*,https://172.21.*.*:*,https://172.22.*.*:*,https://172.23.*.*:*,https://172.24.*.*:*,https://172.25.*.*:*,https://172.26.*.*:*,https://172.27.*.*:*,https://172.28.*.*:*,https://172.29.*.*:*,https://172.30.*.*:*,https://172.31.*.*:*}")
	private String allowedOrigins;
		

    /**
     * Executa o metodo securityFilterChain.
     * @param http valor do parametro http.
     * @param jwtFilter valor do parametro jwtFilter.
     * @param accessDeniedHandler valor do parametro accessDeniedHandler.
     * @param authenticationEntryPoint valor do parametro authenticationEntryPoint.
     * @return resultado da operacao.
     * @throws Exception em caso de falha na execucao.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter,
    		CustomAccessDeniedHandler accessDeniedHandler, CustomAuthenticationEntryPoint authenticationEntryPoint) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth                
                .requestMatchers("/login/validar-login", 
                		"/login/validar-token",
                		"/login/refresh",
                		"/login/logout",
                		"/actuator/**",
                		"/h2-console/**",
						"/swagger-ui.html",
						"/swagger-ui/**",
						"/v3/api-docs/**",
						"/error"
                		).permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
            		.authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler)
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Executa o metodo corsConfigurationSource.
     * @return resultado da operacao.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(Arrays.stream(allowedOrigins.split(","))
        		.map(String::trim)
        		.filter(origin -> !origin.isBlank())
        		.toList());

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

