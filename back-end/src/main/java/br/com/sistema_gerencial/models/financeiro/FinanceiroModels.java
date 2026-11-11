package br.com.sistema_gerencial.models.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.*;

/**
 * Agrupa os contratos de contas, baixas, filtros e relatórios do módulo financeiro.
 */
public final class FinanceiroModels {
    private FinanceiroModels() {}

    /**
     * Representa uma conta manual ou parcela de venda, incluindo valores baixados, saldo e referência à entidade.
     */
    public record Conta(long id, String origem, String tipo, String descricao, String contraparte,
        String categoria, String referencia, LocalDate vencimento, BigDecimal valor,
        BigDecimal valorBaixado, BigDecimal saldo, String status, Integer vendaId,
        String entidadeTipo, Long entidadeId) {}

    /**
     * Define os dados validados para cadastrar ou atualizar uma conta manual.
     */
    public record ContaRequest(
        @NotBlank @Pattern(regexp="PAGAR|RECEBER") String tipo,
        @NotBlank @Size(max=255) String descricao,
        @NotBlank @Size(max=255) String contraparte,
        @Size(max=100) String categoria, @Size(max=100) String referencia,
        @NotNull LocalDate vencimento,
        @NotNull @DecimalMin("0.01") @Digits(integer=10, fraction=2) BigDecimal valor,
        @Size(max=50) String entidadeTipo, @Positive Long entidadeId) {}

    /**
     * Define a data, o valor e a forma de pagamento de uma baixa financeira.
     */
    public record BaixaRequest(
        @NotNull LocalDate data,
        @NotNull @DecimalMin("0.01") @Digits(integer=10, fraction=2) BigDecimal valor,
        @NotBlank @Size(max=30) String formaPagamento,
        @Size(max=1000) String observacoes) {}

    /**
     * Representa um pagamento ou recebimento registrado para uma conta.
     */
    public record Baixa(long id, LocalDate data, BigDecimal valor, String formaPagamento, String observacoes) {}
    /**
     * Reúne uma conta e o histórico de suas baixas.
     */
    public record Detalhes(Conta conta, List<Baixa> baixas) {}
    /**
     * Transporta as contas de uma página e os metadados de paginação.
     */
    public record Pagina(List<Conta> lista, long total, int page, int limit) {}
    /**
     * Consolida contas abertas, valores vencidos, pagamentos, recebimentos e saldos financeiros.
     */
    public record Resumo(BigDecimal aPagar, BigDecimal aReceber, BigDecimal pagarVencido,
        BigDecimal receberVencido, BigDecimal pago, BigDecimal recebido,
        BigDecimal saldoRealizado, BigDecimal saldoPrevisto) {}
    /**
     * Representa entradas, saídas e saldo financeiro agrupados por data.
     */
    public record Fluxo(LocalDate data, BigDecimal entradas, BigDecimal saidas, BigDecimal saldo) {}
    /**
     * Reúne o resumo financeiro e os fluxos realizado e previsto.
     */
    public record Relatorio(Resumo resumo, List<Fluxo> realizado, List<Fluxo> previsto) {}
    /**
     * Define os critérios de tipo, status, pesquisa, período de vencimento e categoria das contas.
     */
    public record Filtro(String tipo, String status, String pesquisa, LocalDate inicio, LocalDate fim, String categoria) {}
}
