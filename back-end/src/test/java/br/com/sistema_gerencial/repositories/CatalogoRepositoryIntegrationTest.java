package br.com.sistema_gerencial.repositories;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.beans.BeanUtils;
import br.com.sistema_gerencial.support.DatabaseTestSupport;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.models.response.*;
import br.com.sistema_gerencial.services.impl.*;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;

class CatalogoRepositoryIntegrationTest extends DatabaseTestSupport {
    @Test void usuarioAutenticadoExigeLoginExatoMesmoComLoginsSemelhantes() {
        var repository = new LoginRepository(namedJdbc);
        var request = new CadastroLoginRequest();
        request.setNome("Administrador Demo"); request.setLogin("demo.admin");
        request.setSenha("demo"); request.setPerfil("ADMIN");
        int demoId = repository.cadastrarLogin(request);
        assertThat(repository.buscarPorLogin("admin").getId()).isEqualTo(1);
        assertThat(repository.buscarPorLogin("admin").getNome()).isEqualTo("Master User");
        assertThat(repository.buscarPorLogin("demo.admin").getId()).isEqualTo(demoId);
        assertThatThrownBy(() -> repository.buscarPorLogin("adm")).isInstanceOf(DefaultErrorException.class);
        assertThatThrownBy(() -> repository.buscarPorLogin("%admin%")).isInstanceOf(DefaultErrorException.class);
    }
    @Test void produtosPersistemDefaultsEFiltramEstoqueEAtivos() {
        var repository=new ProdutoRepository(namedJdbc);
        var request=new CadastrarProdutoRequest(); request.setNome(" Cabo ");
        int id=repository.cadastrar(request); var product=repository.buscarPorId(id);
        assertThat(product.getNome()).isEqualTo("Cabo");
        assertThat(product.getUnidade_medida()).isEqualTo("UN"); assertThat(product.isAtivo()).isTrue();
        assertThat(product.getValor_custo()).isEqualByComparingTo("0");
        var update=new AtualizarProdutoRequest(); update.setId(id); update.setNome("Cabo USB");
        update.setCodigo(" USB "); update.setDescricao(" Cabo "); update.setUnidade_medida(" PC ");
        update.setEstoque_atual(new BigDecimal("1.5")); update.setEstoque_minimo(new BigDecimal("3"));
        update.setValor_custo(new BigDecimal("5.50")); update.setValor_venda(new BigDecimal("10"));
        repository.atualizar(update);
        assertThat(repository.listarEmFalta()).extracting(ProdutoResponse::getId).containsExactly(id);
        assertThat(repository.listarAtivos()).hasSize(1);
        assertThat(repository.listarPorPagina(1,1).get("total")).isEqualTo(1);
        assertThat((java.util.List<?>)repository.listarPorPagina(1,2).get("lista")).isEmpty();
        update.setAtivo(false); repository.atualizar(update);
        assertThat(repository.listarEmFalta()).isEmpty(); assertThat(repository.listarAtivos()).isEmpty();
        repository.excluir(id); assertThatThrownBy(()->repository.buscarPorId(id)).isInstanceOf(DefaultErrorException.class);
    }
    @ParameterizedTest @NullAndEmptySource @ValueSource(strings={" "})
    void produtoSemNomeNaoPersiste(String name) {
        var request=new CadastrarProdutoRequest(); request.setNome(name);
        assertThatThrownBy(()->new ProdutoRepository(namedJdbc).cadastrar(request)).hasMessageContaining("obrigatorio");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM produtos",Integer.class)).isZero();
    }
    @Test void servicosCrudENormalizacao() {
        var service=new ServicoServiceImpl(new ServicoRepository(namedJdbc));
        var request=new CadastrarServicoRequest(); request.setNome(" Instalacao "); service.cadastrar(request);
        var result=service.listarAtivos().getFirst(); assertThat(result.getNome()).isEqualTo("Instalacao");
        assertThat(result.getValor_padrao()).isEqualByComparingTo("0");
        var update=new AtualizarServicoRequest(); update.setId(result.getId()); update.setNome("Manutencao");
        update.setCodigo(" M "); update.setDescricao(" Revisao "); update.setValor_padrao(new BigDecimal("20.5")); update.setAtivo(false);
        service.atualizar(update);
        assertThat(service.buscarPorId(result.getId()).getValor_padrao()).isEqualByComparingTo("20.50");
        assertThat(service.listarAtivos()).isEmpty(); assertThat(service.listarPorPagina(10,1).get("total")).isEqualTo(1);
        service.excluir(result.getId()); assertThatThrownBy(()->service.buscarPorId(result.getId())).isInstanceOf(DefaultErrorException.class);
        request.setNome(" "); assertThatThrownBy(()->service.cadastrar(request)).hasMessageContaining("obrigatorio");
    }
    @ParameterizedTest @ValueSource(strings={"f","j"})
    void cadastroClienteNormalizaDocumentoMantemHistoricoContrato(String type) {
        var repository=new EmpresaRepository(namedJdbc); var service=new EmpresaServiceImpl(repository);
        var request=new CadastrarEmpresaRequest(); request.setTipo_pessoa(type); request.setNome_cliente(" Ana ");
        request.setNome_fantasia("Empresa"); request.setRazao_social("Empresa LTDA");
        request.setCpf_cnpj("529.982.247-25"); request.setIe("ISENTO"); request.setPossui_contrato(true);
        request.setData_inicio(LocalDateTime.of(2026,1,1,0,0)); request.setData_fim(LocalDateTime.of(2026,12,31,0,0));
        service.cadastrar(request); var result=((java.util.List<EmpresaResponse>)service.listarPorPagina(10,1).get("lista")).getFirst();
        assertThat(result.getCpf_cnpj()).isEqualTo("529.982.247-25"); assertThat(result.getTeve_contrato()).isTrue();
        assertThat(new ClienteRepository(namedJdbc).buscarPorDocumentoNormalizado("52998224725").getId()).isEqualTo(result.getId());
        assertThat(service.listarPorPaginaENome(10,1,type.equals("f")?"Ana":"Empresa").get("total")).isEqualTo(1);
        service.salvarInfraestrutura("Rede gigabit",result.getId());
        assertThat(service.buscarPorId(result.getId()).getInfraestrutura()).isEqualTo("Rede gigabit");
        var renewal=new RenovarContratoRequest(); renewal.setData_inicio(LocalDateTime.of(2027,1,1,0,0));
        renewal.setData_fim(LocalDateTime.of(2027,12,31,0,0)); renewal.setObservacoes("Renovado"); service.renovarContrato(result.getId(),renewal);
        assertThat(service.listarRenovacoes(result.getId())).hasSize(1);
        assertThat(service.listarRenovacoes(result.getId()).getFirst().getData_fim_anterior()).isEqualTo(request.getData_fim());
        assertThat(service.buscarPorId(result.getId()).getData_fim()).isEqualTo(renewal.getData_fim());
        var update=new AtualizarEmpresaRequest(); BeanUtils.copyProperties(request,update); update.setId(result.getId());
        update.setNome_cliente("Bia"); update.setPossui_contrato(false); update.setTeve_contrato(true); service.atualizar(update);
        assertThat(service.buscarPorId(result.getId()).getNome_cliente()).isEqualTo("Bia");
        service.excluir(result.getId()); assertThat(service.listarRenovacoes(result.getId())).isEmpty();
        assertThatThrownBy(()->service.buscarPorId(result.getId())).isInstanceOf(DefaultErrorException.class);
    }
    @Test void clienteLegadoUsaCnpjERazaoSocialComoFallback() {
        var repository=new EmpresaRepository(namedJdbc); var request=new CadastrarEmpresaRequest();
        request.setRazao_social("Razao"); request.setNome_fantasia("Fantasia"); request.setCnpj("12.345.678/0001-90"); request.setInscricao("123");
        int id=repository.cadastrar(request); var result=repository.buscarPorId(id);
        assertThat(result.getNome_cliente()).isEqualTo("Fantasia"); assertThat(result.getCnpj()).isEqualTo(request.getCnpj());
        assertThat(result.getIe()).isEqualTo("123");
        var update=new AtualizarEmpresaRequest(); BeanUtils.copyProperties(request,update); update.setId(id); update.setNome_fantasia(" ");
        repository.atualizar(update); assertThat(repository.buscarPorId(id).getNome_cliente()).isEqualTo("Razao");
    }
    @Test void equipamentosCrudFiltraPorEmpresa() {
        seedOrigins(); var service=new EquipamentoServiceImpl(new EquipamentoRepository(namedJdbc));
        var request=new CadastrarEquipamentoRequest(); request.setId_empresa(1); request.setNome_maquina("Notebook");
        request.setSetor("TI"); request.setTipo_equipamento("NOTEBOOK"); service.cadastrar(request);
        assertThat(service.listarPorPagina(10,1,1).get("total")).isEqualTo(2);
        assertThat(service.listarPorPagina(10,1,999).get("total")).isEqualTo(0);
        int id=jdbc.queryForObject("SELECT id FROM equipamentos WHERE nome_maquina='Notebook'",Integer.class);
        var update=new AtualizarEquipamentoRequest(); BeanUtils.copyProperties(request,update); update.setId(id); update.setMarca("Dell");
        service.atualizar(update); assertThat(service.buscarPorId(id).getMarca()).isEqualTo("Dell");
        service.excluir(id); assertThatThrownBy(()->service.buscarPorId(id)).isInstanceOf(DefaultErrorException.class);
    }
    @Test void agendamentosCrudMantemDataEConclusao() {
        var service=new AgendamentoServiceImpl(new AgendamentoRepository(namedJdbc));
        var request=new CadastrarAgendamentoRequest(); request.setTitulo("Visita"); request.setTipo_tarefa("SUPORTE");
        request.setData_agendamento(LocalDateTime.of(2026,10,20,10,0)); request.setDetalhes("Instalar rede"); service.cadastrar(request);
        assertThat(service.listarPorPagina(10,1).get("total")).isEqualTo(1);
        int id=jdbc.queryForObject("SELECT id FROM agendamentos",Integer.class);
        var update=new AtualizarAgendamentoRequest(); BeanUtils.copyProperties(request,update); update.setId(id); update.setConcluido(true);
        service.atualizar(update); assertThat(service.buscarPorId(id).isConcluido()).isTrue();
        assertThat(service.buscarPorId(id).getData_agendamento()).isEqualTo(request.getData_agendamento());
        service.excluir(id); assertThatThrownBy(()->service.buscarPorId(id)).isInstanceOf(DefaultErrorException.class);
    }
    @Test void usuariosCrudPesquisaEAutenticacao() {
        var repository=new LoginRepository(namedJdbc); var request=new CadastroLoginRequest();
        request.setNome("Tecnico"); request.setLogin("tecnico"); request.setSenha("senha"); request.setPerfil("USER");
        repository.cadastrarLogin(request); var executor=repository.buscarPorLogin("tecnico");
        assertThat(repository.buscarPorLoginESenha("tecnico","senha").getNome()).isEqualTo("Tecnico");
        assertThat(repository.buscarPorLoginESenha("tecnico","errada")).isNull();
        assertThat(repository.buscarPorNome("Tec")).hasSize(1); assertThat(repository.listarTodos()).hasSize(1);
        assertThat(repository.listarPorPagina(10,1).get("total")).isEqualTo(1);
        var update=new AtualizarLoginRequest(); update.setId(executor.getId()); update.setNome("Novo Tecnico");
        update.setLogin("tecnico"); update.setPerfil("ADMIN"); update.setSenha("nova"); repository.atualizar(update);
        assertThat(repository.buscarPorId(executor.getId()).getPerfil()).isEqualTo("ADMIN");
        assertThat(repository.buscarPorLoginESenha("tecnico","nova")).isNotNull();
        repository.excluir(executor.getId()); assertThatThrownBy(()->repository.buscarPorId(executor.getId())).isInstanceOf(DefaultErrorException.class);
        assertThatThrownBy(()->repository.buscarPorLogin("inexistente")).isInstanceOf(DefaultErrorException.class);
    }
}
