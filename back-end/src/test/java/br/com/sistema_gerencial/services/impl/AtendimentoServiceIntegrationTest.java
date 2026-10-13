package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import java.time.LocalDateTime;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import br.com.sistema_gerencial.support.DatabaseTestSupport;
import br.com.sistema_gerencial.repositories.*;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import com.fasterxml.jackson.databind.ObjectMapper;

class AtendimentoServiceIntegrationTest extends DatabaseTestSupport {
    AtendimentoServiceImpl service;
    AtendimentoRepository repository;
    CadastrarAtendimentoRequest request;
    int id;
    @BeforeEach void setup() {
        seedOrigins();
        repository=new AtendimentoRepository(namedJdbc);
        service=new AtendimentoServiceImpl(repository,new FluxoComercialServiceImpl(new FluxoComercialRepository(namedJdbc,new ObjectMapper())));
        request=new CadastrarAtendimentoRequest();
        request.setId_empresa(1); request.setSolicitante("Ana");
        request.setDescricao("Reparar equipamento"); request.setExecutores("[{\"id\":1,\"nome\":\"Tecnico\"}]");
        request.setData_inicio(LocalDateTime.of(2026,10,20,10,0));
        request.setData_fim(LocalDateTime.of(2026,10,20,11,0));
        request.setObservacoes(" Observacao inicial ");
        service.cadastrar(request);
        id=jdbc.queryForObject("SELECT MAX(id) FROM atendimentos",Integer.class);
    }
    @Test void aberturaCriaOrcamentoEHistorico() {
        assertThat(service.buscarPorId(id).getObservacoes()).contains("Registro aberto","AGUARDANDO ATENDIMENTO","Observacao inicial");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM orcamentos",Integer.class)).isEqualTo(1);
        assertThat(service.listarPorPagina(10,1,1).get("total")).isEqualTo(2);
        
    }
    @Test void atualizacaoPreservaHistoricoERegistraNovaObservacao() {
        var update=new AtualizarAtendimentoRequest(); BeanUtils.copyProperties(request,update); update.setId(id); update.setObservacoes("Segunda nota");
        service.atualizar(update);
        assertThat(service.buscarPorId(id).getObservacoes()).contains("Observacao inicial","Segunda nota");
    }
    @ParameterizedTest @ValueSource(strings={"inicio","fim","inicioNulo","fimNulo"})
    void alteracaoHorarioExigeJustificativa(String field) {
        var update=new AtualizarAtendimentoRequest(); BeanUtils.copyProperties(request,update); update.setId(id);
        switch(field) {
            case "inicio" -> update.setData_inicio(request.getData_inicio().plusHours(1));
            case "fim" -> update.setData_fim(request.getData_fim().plusHours(1));
            case "inicioNulo" -> update.setData_inicio(null);
            case "fimNulo" -> update.setData_fim(null);
        }
        update.setJustificativa_alteracao_data(" ");
        assertThatThrownBy(()->service.atualizar(update)).isInstanceOfSatisfying(DefaultErrorException.class,
                e->assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST)).hasMessageContaining("justificativa");
        assertThat(service.buscarPorId(id).getData_inicio()).isEqualTo(request.getData_inicio());
    }
    @Test void alteracaoJustificadaRegistraMotivoEHorario() {
        var update=new AtualizarAtendimentoRequest(); BeanUtils.copyProperties(request,update); update.setId(id);
        update.setData_inicio(request.getData_inicio().plusHours(1)); update.setJustificativa_alteracao_data(" Cliente solicitou ");
        update.setObservacoes(null); service.atualizar(update);
        assertThat(service.buscarPorId(id).getObservacoes()).contains("Observacao inicial","Justificativa de alteracao de horario: Cliente solicitou");
        assertThat(service.buscarPorId(id).getData_inicio()).isEqualTo(update.getData_inicio());
    }
    @ParameterizedTest @CsvSource({"1,AGUARDANDO ATENDIMENTO","2,EM ATENDIMENTO","3,FINALIZADO","4,CANCELADO"})
    void statusPreservaHistorico(int status,String description) {
        service.alterarStatus(id,status,"Motivo");
        assertThat(service.buscarPorId(id).getStatus_atendimento()).isEqualTo(status);
        assertThat(service.buscarPorId(id).getObservacoes()).contains("Observacao inicial",description);
    }
    @Test void statusInvalidoNaoAlteraRegistro() {
        assertThatThrownBy(()->service.alterarStatus(id,5,null)).hasMessageContaining("Status invalido");
        assertThat(service.buscarPorId(id).getStatus_atendimento()).isEqualTo(1);
    }
    @Test void exclusaoRemoveRegistro() {
        // Budget FK prevents deleting an origin; remove its dependent budget first.
        jdbc.update("DELETE FROM orcamentos");
        service.excluir(id);
        assertThatThrownBy(()->service.buscarPorId(id)).isInstanceOf(DefaultErrorException.class);
    }
}

