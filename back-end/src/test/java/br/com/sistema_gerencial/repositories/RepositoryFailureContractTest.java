package br.com.sistema_gerencial.repositories;

import br.com.sistema_gerencial.support.TestTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Stream;
import org.junit.jupiter.api.*;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.models.dto.OrigemComercialDTO;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;

/** All public persistence operations must translate infrastructure failures into domain errors.
 * Happy paths and mapping are exercised separately against a real database.
 */
class RepositoryFailureContractTest {
    record FailureCase(String name, Runnable operation) {}
    @TestFactory Stream<DynamicTest> databaseUnavailableReturns500() {
        var jdbc=mock(NamedParameterJdbcTemplate.class,call->{ throw new DataAccessResourceFailureException("database unavailable"); });
        var product=new CadastrarProdutoRequest(); product.setNome("Cabo");
        var productUpdate=new AtualizarProdutoRequest(); productUpdate.setNome("Cabo"); productUpdate.setId(1);
        var servicoRequest=new CadastrarServicoRequest(); servicoRequest.setNome("Instalacao");
        var servicoUpdate=new AtualizarServicoRequest(); servicoUpdate.setNome("Instalacao"); servicoUpdate.setId(1);
        var zero=BigDecimal.ZERO;
        var origem=OrigemComercialDTO.builder().origemId(1).origemTipo("ATENDIMENTO").clienteNome("Ana").build();
        var budget=OrcamentoResponse.builder().id(1).origem_tipo("ATENDIMENTO").cliente_nome("Ana").build();
        var item=OrcamentoItemResponse.builder().descricao("Cabo").build();
        var produto=new ProdutoRepository(jdbc);
        var servico=new ServicoRepository(jdbc);
        var empresa=new EmpresaRepository(jdbc);
        var equipamento=new EquipamentoRepository(jdbc);
        var atendimento=new AtendimentoRepository(jdbc);
        var manutencao=new ManutencaoRepository(jdbc);
        var avulso=new AvulsoRepository(jdbc);
        var cliente=new ClienteRepository(jdbc);
        var login=new LoginRepository(jdbc);
        var dashboard=new DashboardRepository(jdbc);
        var fluxoComercial=new FluxoComercialRepository(jdbc,new ObjectMapper());
        var agendamento=new AgendamentoRepository(jdbc);
        return Stream.of(
            new FailureCase("Agendamento.cadastrar",()->agendamento.cadastrar(new CadastrarAgendamentoRequest())),
            new FailureCase("Agendamento.listarPorPagina",()->agendamento.listarPorPagina(10,1)),
            new FailureCase("Agendamento.buscarPorId",()->agendamento.buscarPorId(1)),
            new FailureCase("Agendamento.atualizar",()->agendamento.atualizar(new AtualizarAgendamentoRequest())),
            new FailureCase("Agendamento.excluir",()->agendamento.excluir(1)),
            new FailureCase("Produto.cadastrar",()->produto.cadastrar(product)),
            new FailureCase("Produto.listarPorPagina",()->produto.listarPorPagina(10,1)),
            new FailureCase("Produto.listarAtivos",()->produto.listarAtivos()),
            new FailureCase("Produto.listarEmFalta",()->produto.listarEmFalta()),
            new FailureCase("Produto.buscarPorId",()->produto.buscarPorId(1)),
            new FailureCase("Produto.atualizar",()->produto.atualizar(productUpdate)),
            new FailureCase("Produto.excluir",()->produto.excluir(1)),
            new FailureCase("Servico.cadastrar",()->servico.cadastrar(servicoRequest)),
            new FailureCase("Servico.listarPorPagina",()->servico.listarPorPagina(10,1)),
            new FailureCase("Servico.listarAtivos",()->servico.listarAtivos()),
            new FailureCase("Servico.buscarPorId",()->servico.buscarPorId(1)),
            new FailureCase("Servico.atualizar",()->servico.atualizar(servicoUpdate)),
            new FailureCase("Servico.excluir",()->servico.excluir(1)),
            new FailureCase("Empresa.cadastrar",()->empresa.cadastrar(new CadastrarEmpresaRequest())),
            new FailureCase("Empresa.listarPorPagina",()->empresa.listarPorPagina(10,1)),
            new FailureCase("Empresa.listarPorPaginaENome",()->empresa.listarPorPaginaENome(10,1,"Ana")),
            new FailureCase("Empresa.buscarPorId",()->empresa.buscarPorId(1)),
            new FailureCase("Empresa.atualizar",()->empresa.atualizar(new AtualizarEmpresaRequest())),
            new FailureCase("Empresa.salvarInfraEstrutura",()->empresa.salvarInfraEstrutura("rede",1)),
            new FailureCase("Empresa.renovarContrato",()->empresa.renovarContrato(1,new RenovarContratoRequest())),
            new FailureCase("Empresa.listarRenovacoes",()->empresa.listarRenovacoes(1)),
            new FailureCase("Empresa.excluir",()->empresa.excluir(1)),
            new FailureCase("Equipamento.cadastrar",()->equipamento.cadastrar(new CadastrarEquipamentoRequest())),
            new FailureCase("Equipamento.listarPorPagina",()->equipamento.listarPorPagina(10,1,1)),
            new FailureCase("Equipamento.buscarPorId",()->equipamento.buscarPorId(1)),
            new FailureCase("Equipamento.atualizar",()->equipamento.atualizar(new AtualizarEquipamentoRequest())),
            new FailureCase("Equipamento.excluir",()->equipamento.excluir(1)),
            new FailureCase("Atendimento.cadastrarAtendimento",()->atendimento.cadastrarAtendimento(new CadastrarAtendimentoRequest())),
            new FailureCase("Atendimento.listarPorPagina",()->atendimento.listarPorPagina(10,1,1)),
            new FailureCase("Atendimento.buscarPorId",()->atendimento.buscarPorId(1)),
            new FailureCase("Atendimento.atualizar",()->atendimento.atualizar(new AtualizarAtendimentoRequest())),
            new FailureCase("Atendimento.alterarStatus",()->atendimento.alterarStatus(1,4,"motivo","historico")),
            new FailureCase("Atendimento.excluir",()->atendimento.excluir(1)),
            new FailureCase("Manutencao.cadastrar",()->manutencao.cadastrar(new CadastrarManutencaoRequest())),
            new FailureCase("Manutencao.listarPorPagina",()->manutencao.listarPorPagina(10,1,1)),
            new FailureCase("Manutencao.listarPorEmpresa",()->manutencao.listarPorEmpresa(10,1,1)),
            new FailureCase("Manutencao.buscarPorId",()->manutencao.buscarPorId(1)),
            new FailureCase("Manutencao.atualizar",()->manutencao.atualizar(new AtualizarManutencaoRequest())),
            new FailureCase("Manutencao.alterarStatus",()->manutencao.alterarStatus(1,4,"motivo","historico")),
            new FailureCase("Manutencao.excluir",()->manutencao.excluir(1)),
            new FailureCase("Avulso.cadastrar",()->avulso.cadastrar(new CadastrarAvulsoRequest())),
            new FailureCase("Avulso.listarPorPagina",()->avulso.listarPorPagina(10,1)),
            new FailureCase("Avulso.listarPorAtributoEPagina",()->avulso.listarPorAtributoEPagina(10,1,"Ana","nome")),
            new FailureCase("Avulso.buscarPorId",()->avulso.buscarPorId(1)),
            new FailureCase("Avulso.atualizar",()->avulso.atualizar(new AtualizarAvulsoRequest())),
            new FailureCase("Avulso.alterarStatus",()->avulso.alterarStatus(1,4,"motivo","historico")),
            new FailureCase("Avulso.excluir",()->avulso.excluir(1)),
            new FailureCase("Cliente.buscarPorDocumentoNormalizado",()->cliente.buscarPorDocumentoNormalizado("123")),
            new FailureCase("Cliente.buscarPorNome",()->cliente.buscarPorNome("Ana")),
            new FailureCase("Login.buscarPorLoginESenha",()->login.buscarPorLoginESenha("ana","senha")),
            new FailureCase("Login.buscarPorId",()->login.buscarPorId(1)),
            new FailureCase("Login.buscarPorNome",()->login.buscarPorNome("Ana")),
            new FailureCase("Login.buscarPorLogin",()->login.buscarPorLogin("ana")),
            new FailureCase("Login.cadastrarLogin",()->login.cadastrarLogin(new CadastroLoginRequest())),
            new FailureCase("Login.listarPorPagina",()->login.listarPorPagina(10,1)),
            new FailureCase("Login.listarTodos",()->login.listarTodos()),
            new FailureCase("Login.atualizar",()->login.atualizar(new AtualizarLoginRequest())),
            new FailureCase("Login.excluir",()->login.excluir(1)),
            new FailureCase("Dashboard.retornarLucrosDoMes",()->dashboard.retornarLucrosDoMes()),
            new FailureCase("Dashboard.retornarLucrosDoAno",()->dashboard.retornarLucrosDoAno()),
            new FailureCase("Dashboard.retornarContratosAcabando",()->dashboard.retornarContratosAcabando()),
            new FailureCase("Dashboard.retornarTotalCancelados",()->dashboard.retornarTotalCancelados()),
            new FailureCase("Dashboard.retornarTotalChamadosMesPorExecutor",()->dashboard.retornarTotalChamadosMesPorExecutor("Ana")),
            new FailureCase("Dashboard.retornarTotalChamadosAtrasadosPorExecutor",()->dashboard.retornarTotalChamadosAtrasadosPorExecutor("Ana")),
            new FailureCase("Dashboard.retornarTotalChamadosFinalizadosPorExecutor",()->dashboard.retornarTotalChamadosFinalizadosPorExecutor("Ana")),
            new FailureCase("Dashboard.retornarTotalProdutosEmFalta",()->dashboard.retornarTotalProdutosEmFalta()),
            new FailureCase("Dashboard.retornarTotalPorMes",()->dashboard.retornarTotalPorMes()),
            new FailureCase("Dashboard.retornarTotalVendasPorMes",()->dashboard.retornarTotalVendasPorMes()),
            new FailureCase("Dashboard.retornarQuantidadeAtendimentoPorTipo",()->dashboard.retornarQuantidadeAtendimentoPorTipo()),
            new FailureCase("Dashboard.retornarTotalChamadosPorMesPorExecutor",()->dashboard.retornarTotalChamadosPorMesPorExecutor("Ana")),
            new FailureCase("Dashboard.retornarQuantidadeAtendimentoPorTipoPorExecutor",()->dashboard.retornarQuantidadeAtendimentoPorTipoPorExecutor("Ana")),
            new FailureCase("Dashboard.retornarContratosCalendario",()->dashboard.retornarContratosCalendario()),
            new FailureCase("Dashboard.retornarAgendaEventos",()->dashboard.retornarAgendaEventos()),
            new FailureCase("FluxoComercial.buscarOrigem",()->fluxoComercial.buscarOrigem("ATENDIMENTO",1)),
            new FailureCase("FluxoComercial.buscarIdOrcamentoPorOrigem",()->fluxoComercial.buscarIdOrcamentoPorOrigem("ATENDIMENTO",1)),
            new FailureCase("FluxoComercial.inserirOrcamento",()->fluxoComercial.inserirOrcamento("ORC",origem,"nota")),
            new FailureCase("FluxoComercial.atualizarCodigoOrcamento",()->fluxoComercial.atualizarCodigoOrcamento(1,"ORC")),
            new FailureCase("FluxoComercial.buscarOrcamentoPorId",()->fluxoComercial.buscarOrcamentoPorId(1)),
            new FailureCase("FluxoComercial.listarOrcamentosPorPagina",()->fluxoComercial.listarOrcamentosPorPagina(10,1,"Ana")),
            new FailureCase("FluxoComercial.listarItensOrcamento",()->fluxoComercial.listarItensOrcamento(1)),
            new FailureCase("FluxoComercial.removerItensOrcamento",()->fluxoComercial.removerItensOrcamento(1)),
            new FailureCase("FluxoComercial.inserirItemOrcamento",()->fluxoComercial.inserirItemOrcamento(1,item)),
            new FailureCase("FluxoComercial.atualizarResumoOrcamento",()->fluxoComercial.atualizarResumoOrcamento(1,TestTime.TODAY,zero,zero,"Ana","123",zero,zero,zero,zero,"ABERTO","nota")),
            new FailureCase("FluxoComercial.atualizarValorOrcamentoNaOrigem",()->fluxoComercial.atualizarValorOrcamentoNaOrigem("ATENDIMENTO",1,zero)),
            new FailureCase("FluxoComercial.inserirVenda",()->fluxoComercial.inserirVenda("VEN",budget,"PIX",1,"nota")),
            new FailureCase("FluxoComercial.inserirItemVenda",()->fluxoComercial.inserirItemVenda(1,item)),
            new FailureCase("FluxoComercial.inserirParcela",()->fluxoComercial.inserirParcela(1,1,TestTime.TODAY,zero)),
            new FailureCase("FluxoComercial.buscarParcelaPorNumero",()->fluxoComercial.buscarParcelaPorNumero(1,1)),
            new FailureCase("FluxoComercial.inserirPagamento",()->fluxoComercial.inserirPagamento(1,"PAG",TestTime.NOW,"PIX",zero,"nota")),
            new FailureCase("FluxoComercial.atualizarParcelaAposPagamento",()->fluxoComercial.atualizarParcelaAposPagamento(1,zero,zero,"PAGA",TestTime.NOW)),
            new FailureCase("FluxoComercial.aprovarOrcamento",()->fluxoComercial.aprovarOrcamento(1,TestTime.NOW)),
            new FailureCase("FluxoComercial.rejeitarOrcamento",()->fluxoComercial.rejeitarOrcamento(1,"nota")),
            new FailureCase("FluxoComercial.reabrirOrcamento",()->fluxoComercial.reabrirOrcamento(1,"ABERTO","nota")),
            new FailureCase("FluxoComercial.cancelarManutencao",()->fluxoComercial.cancelarManutencao(1,"motivo","nota")),
            new FailureCase("FluxoComercial.cancelarAvulso",()->fluxoComercial.cancelarAvulso(1,"motivo","nota")),
            new FailureCase("FluxoComercial.buscarVendaPorOrcamento",()->fluxoComercial.buscarVendaPorOrcamento(1)),
            new FailureCase("FluxoComercial.buscarVendaPorId",()->fluxoComercial.buscarVendaPorId(1)),
            new FailureCase("FluxoComercial.listarVendasPorPagina",()->fluxoComercial.listarVendasPorPagina(10,1,"Ana")),
            new FailureCase("FluxoComercial.removerItensVenda",()->fluxoComercial.removerItensVenda(1)),
            new FailureCase("FluxoComercial.removerPagamentosVenda",()->fluxoComercial.removerPagamentosVenda(1)),
            new FailureCase("FluxoComercial.removerParcelasVenda",()->fluxoComercial.removerParcelasVenda(1)),
            new FailureCase("FluxoComercial.atualizarResumoVenda",()->fluxoComercial.atualizarResumoVenda(1,"Ana","123",zero,zero,zero,zero,"nota")),
            new FailureCase("FluxoComercial.atualizarVenda",()->fluxoComercial.atualizarVenda(1,"Ana","123","PIX",1,zero,zero,zero,zero,"nota")),
            new FailureCase("FluxoComercial.listarResumoCaixaDia",()->fluxoComercial.listarResumoCaixaDia(TestTime.TODAY)),
            new FailureCase("FluxoComercial.listarFechamentosCaixa",()->fluxoComercial.listarFechamentosCaixa()),
            new FailureCase("FluxoComercial.salvarFechamentoCaixa",()->fluxoComercial.salvarFechamentoCaixa(TestTime.TODAY,zero,zero,zero,"nota")),
            new FailureCase("FluxoComercial.substituirItensFechamentoCaixa",()->fluxoComercial.substituirItensFechamentoCaixa(1,List.of())),
            new FailureCase("FluxoComercial.listarItensFechamentoCaixa",()->fluxoComercial.listarItensFechamentoCaixa(1)),
            new FailureCase("FluxoComercial.listarItensVenda",()->fluxoComercial.listarItensVenda(1)),
            new FailureCase("FluxoComercial.listarParcelasVenda",()->fluxoComercial.listarParcelasVenda(1)),
            new FailureCase("FluxoComercial.listarPagamentosParcela",()->fluxoComercial.listarPagamentosParcela(1)),
            new FailureCase("FluxoComercial.registrarEventoOutbox",()->fluxoComercial.registrarEventoOutbox("VENDA",1,"VENDA_GERADA",Map.of())),
            new FailureCase("FluxoComercial.listarEventosPendentes",()->fluxoComercial.listarEventosPendentes(10))
        ).map(test->DynamicTest.dynamicTest(test.name(),()->{
            assertThatThrownBy(test.operation()::run).isInstanceOfSatisfying(DefaultErrorException.class,
                    error->assertThat(error.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR));
        }));
    }
}
