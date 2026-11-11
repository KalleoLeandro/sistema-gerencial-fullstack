package br.com.sistema_gerencial.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * Configura a documentação OpenAPI dos endpoints do back-end.
 */
@Configuration
public class SwaggerConfig {

	private static final String BEARER_AUTH = "bearerAuth";

	/**
	 * Executa o metodo customOpenAPI.
	 * @return resultado da operacao.
	 */
	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Sistema Controle Equipamentos API")
						.description("Documentacao da API do backend do sistema de controle de equipamentos.")
						.version("v1")
						.contact(new Contact().name("FL Informatica")))
				.addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
				.components(new Components().addSecuritySchemes(BEARER_AUTH,
						new SecurityScheme()
								.name(BEARER_AUTH)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}
}

