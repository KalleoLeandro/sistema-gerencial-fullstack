package br.com.sistema_gerencial.services.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import br.com.sistema_gerencial.models.dto.AgendaEventoDTO;
import br.com.sistema_gerencial.models.dto.ContratoCalendarioDTO;
import br.com.sistema_gerencial.models.dto.LucroDTO;
import br.com.sistema_gerencial.models.dto.TipoAtendimentoDTO;
import br.com.sistema_gerencial.repositories.DashboardRepository;
import br.com.sistema_gerencial.repositories.LoginRepository;
import br.com.sistema_gerencial.services.DashboardService;
import lombok.RequiredArgsConstructor;

/**
 * Implementa as regras de negócio e a coordenação da persistência de indicadores do dashboard.
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService{

	private final DashboardRepository repository;
	private final LoginRepository loginRepository;
	
	/**
	 * Executa o metodo retornarLucrosMes.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarLucrosMes() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("lucro", repository.retornarLucrosDoMes());
		return map;
	}

	/**
	 * Executa o metodo retornarLucrosAno.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarLucrosAno() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("lucro", repository.retornarLucrosDoAno());
		return map;
	}

	/**
	 * Executa o metodo retornarContratosEncerrando.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarContratosEncerrando() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("total", repository.retornarContratosAcabando());
		return map;
	}

	/**
	 * Executa o metodo retornarTotalChamadosCancelados.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarTotalChamadosCancelados() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("total", repository.retornarTotalCancelados());
		return map;
	}

	/**
	 * Executa o metodo retornarTotalChamadosMes.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarTotalChamadosMes() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("total", repository.retornarTotalChamadosMesPorExecutor(resolveExecutorNome()));
		return map;
	}

	/**
	 * Executa o metodo retornarTotalChamadosAtrasados.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarTotalChamadosAtrasados() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("total", repository.retornarTotalChamadosAtrasadosPorExecutor(resolveExecutorNome()));
		return map;
	}

	/**
	 * Executa o metodo retornarTotalChamadosAtendidosPorMim.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarTotalChamadosAtendidosPorMim() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("total", repository.retornarTotalChamadosFinalizadosPorExecutor(resolveExecutorNome()));
		return map;
	}

	/**
	 * Executa o metodo retornarProdutosEmFalta.
	 * @return resultado da operacao.
	 */
	@Override
	public Map<String, Object> retornarProdutosEmFalta() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("total", repository.retornarTotalProdutosEmFalta());
		return map;
	}

	/**
	 * Executa o metodo retornarTotalLucrosPorMes.
	 * @return resultado da operacao.
	 */
	@Override
	public List<LucroDTO> retornarTotalLucrosPorMes() {
		if (isAdmin()) {
			return repository.retornarTotalPorMes();
		}

		return repository.retornarTotalChamadosPorMesPorExecutor(resolveExecutorNome());
	}

	/**
	 * Executa o metodo retornarTotalVendasPorMes.
	 * @return resultado da operacao.
	 */
	@Override
	public List<LucroDTO> retornarTotalVendasPorMes() {
		return repository.retornarTotalVendasPorMes();
	}

	/**
	 * Executa o metodo retornarQuantidadeAtendimentosPorTipo.
	 * @return resultado da operacao.
	 */
	@Override
	public List<TipoAtendimentoDTO> retornarQuantidadeAtendimentosPorTipo() {
		if (isAdmin()) {
			return repository.retornarQuantidadeAtendimentoPorTipo();
		}

		return repository.retornarQuantidadeAtendimentoPorTipoPorExecutor(resolveExecutorNome());
	}

	/**
	 * Executa o metodo retornarContratosCalendario.
	 * @return resultado da operacao.
	 */
	@Override
	public List<ContratoCalendarioDTO> retornarContratosCalendario() {
		return repository.retornarContratosCalendario();
	}

	/**
	 * Executa o metodo retornarAgendaEventos.
	 * @return resultado da operacao.
	 */
	@Override
	public List<AgendaEventoDTO> retornarAgendaEventos() {
		return repository.retornarAgendaEventos();
	}

	/**
	 * Executa o metodo isAdmin.
	 * @return resultado da operacao.
	 */
	private boolean isAdmin() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication != null
				&& authentication.getAuthorities().stream()
						.anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
	}

	/**
	 * Executa o metodo resolveExecutorNome.
	 * @return resultado da operacao.
	 */
	private String resolveExecutorNome() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof String principal) || principal.isBlank()) {
			return "";
		}

		try {
			return loginRepository.buscarPorLogin(principal).getNome();
		} catch (Exception exception) {
			return principal;
		}
	}
}

