package br.com.sistema_gerencial.services;

import java.util.List;
import java.util.Map;

import br.com.sistema_gerencial.models.dto.AgendaEventoDTO;
import br.com.sistema_gerencial.models.dto.ContratoCalendarioDTO;
import br.com.sistema_gerencial.models.dto.LucroDTO;
import br.com.sistema_gerencial.models.dto.TipoAtendimentoDTO;

public interface DashboardService {

	/**
	 * Executa o metodo retornarLucrosMes.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarLucrosMes();	
	/**
	 * Executa o metodo retornarLucrosAno.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarLucrosAno();
	/**
	 * Executa o metodo retornarContratosEncerrando.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarContratosEncerrando();
	/**
	 * Executa o metodo retornarTotalChamadosCancelados.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarTotalChamadosCancelados();
	/**
	 * Executa o metodo retornarTotalChamadosMes.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarTotalChamadosMes();
	/**
	 * Executa o metodo retornarTotalChamadosAtrasados.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarTotalChamadosAtrasados();
	/**
	 * Executa o metodo retornarTotalChamadosAtendidosPorMim.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarTotalChamadosAtendidosPorMim();

	/**
	 * Executa o metodo retornarProdutosEmFalta.
	 * @return resultado da operacao.
	 */
	public Map<String, Object> retornarProdutosEmFalta();
	
	/**
	 * Executa o metodo retornarTotalLucrosPorMes.
	 * @return resultado da operacao.
	 */
	public List<LucroDTO> retornarTotalLucrosPorMes();

	/**
	 * Executa o metodo retornarTotalVendasPorMes.
	 * @return resultado da operacao.
	 */
	public List<LucroDTO> retornarTotalVendasPorMes();
	
	/**
	 * Executa o metodo retornarQuantidadeAtendimentosPorTipo.
	 * @return resultado da operacao.
	 */
	public List<TipoAtendimentoDTO> retornarQuantidadeAtendimentosPorTipo();

	/**
	 * Executa o metodo retornarContratosCalendario.
	 * @return resultado da operacao.
	 */
	public List<ContratoCalendarioDTO> retornarContratosCalendario();

	/**
	 * Executa o metodo retornarAgendaEventos.
	 * @return resultado da operacao.
	 */
	public List<AgendaEventoDTO> retornarAgendaEventos();
	
	
	
}

