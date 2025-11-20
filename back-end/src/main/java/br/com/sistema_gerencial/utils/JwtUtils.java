package br.com.sistema_gerencial.utils;

import java.io.Serializable;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtils implements Serializable {

    private static final long serialVersionUID = -2550185165626007488L;

    @Value("${jwt.token.validity}")
    public long JWT_TOKEN_VALIDITY;

    @Value("${secret.jwt.secret}")
    private String secret;

    // ===================== GETTERS DE CLAIMS =====================
    public String getUsernameFromToken(String token) throws Exception {
        return getClaimFromToken(sanitizeToken(token), claims -> claims.get("username", String.class));
    }

    public String getLoginFromToken(String token) throws Exception {
        return getClaimFromToken(sanitizeToken(token), claims -> claims.get("login", String.class));
    }

    public String getRolesFromToken(String token) throws Exception {
        return getClaimFromToken(sanitizeToken(token), claims -> claims.get("perfil", String.class));
    }

    public Date getExpirationDateFromToken(String token) throws Exception {
        return getClaimFromToken(sanitizeToken(token), Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) throws Exception {
        try {
            final Claims claims = getAllClaimsFromToken(token);
            return claimsResolver.apply(claims);
        } catch (Exception e) {
            throw new Exception("Erro ao extrair claims do token!", e);
        }
    }

    private Claims getAllClaimsFromToken(String token) throws Exception {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(sanitizeToken(token))
                    .getBody();
        } catch (Exception e) {
            throw new Exception("Token inválido!", e);
        }
    }

    // ===================== GERADOR E VALIDADOR =====================
    public Boolean isTokenExpired(String token) throws Exception {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public String generateToken(String userName, String login, String perfil) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("perfil", perfil);
        claims.put("username", userName);
        claims.put("login", login);
        return doGenerateToken(claims, login);
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Boolean validateToken(String token) {
        try {
        	String tokenSanitizado = sanitizeToken(token);
            JwtParser parser = Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build();

            parser.parseClaimsJws(sanitizeToken(tokenSanitizado));
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    public Authentication getAuthentication(String token) throws Exception {
        String username = getUsernameFromToken(token);
        String role = getRolesFromToken(token);
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
        return new UsernamePasswordAuthenticationToken(username, null, List.of(authority));
    }

    // ===================== UTILITÁRIOS =====================
    public Key getSecretKey() {
        byte[] keyBytes = secret.getBytes();
        byte[] truncatedKeyBytes = new byte[64]; // 512 bits
        System.arraycopy(keyBytes, 0, truncatedKeyBytes, 0, Math.min(keyBytes.length, truncatedKeyBytes.length));
        return Keys.hmacShaKeyFor(truncatedKeyBytes);
    }

    // Remove o prefixo "Bearer " do token, se existir
    public String sanitizeToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    // Resolve o token direto do header Authorization
    public String resolveToken(HttpServletRequest request) {
        return sanitizeToken(request.getHeader("Authorization"));
    }
}
