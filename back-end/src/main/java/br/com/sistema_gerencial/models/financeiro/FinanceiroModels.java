package br.com.sistema_gerencial.models.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.*;

public final class FinanceiroModels {
    private FinanceiroModels() {}

    public record Conta(long id, String origem, String tipo, String descricao, String contraparte,
        String categoria, String referencia, LocalDate vencimento, BigDecimal valor,
        BigDecimal valorBaixado, BigDecimal saldo, String status, Integer vendaId,
        String entidadeTipo, Long entidadeId) {}

    public record ContaRequest(
        @NotBlank @Pattern(regexp="PAGAR|RECEBER") String tipo,
        @NotBlank @Size(max=255) String descricao,
        @NotBlank @Size(max=255) String contraparte,
        @Size(max=100) String categoria, @Size(max=100) String referencia,
        @NotNull LocalDate vencimento,
        @NotNull @DecimalMin("0.01") @Digits(integer=10, fraction=2) BigDecimal valor,
        @Size(max=50) String entidadeTipo, @Positive Long entidadeId) {}

    public record BaixaRequest(
        @NotNull LocalDate data,
        @NotNull @DecimalMin("0.01") @Digits(integer=10, fraction=2) BigDecimal valor,
        @NotBlank @Size(max=30) String formaPagamento,
        @Size(max=1000) String observacoes) {}

    public record Baixa(long id, LocalDate data, BigDecimal valor, String formaPagamento, String observacoes) {}
    public record Detalhes(Conta conta, List<Baixa> baixas) {}
    public record Pagina(List<Conta> lista, long total, int page, int limit) {}
    public record Resumo(BigDecimal aPagar, BigDecimal aReceber, BigDecimal pagarVencido,
        BigDecimal receberVencido, BigDecimal pago, BigDecimal recebido,
        BigDecimal saldoRealizado, BigDecimal saldoPrevisto) {}
    public record Fluxo(LocalDate data, BigDecimal entradas, BigDecimal saidas, BigDecimal saldo) {}
    public record Relatorio(Resumo resumo, List<Fluxo> realizado, List<Fluxo> previsto) {}
    public record Filtro(String tipo, String status, String pesquisa, LocalDate inicio, LocalDate fim, String categoria) {}
}
