package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import br.com.sistema_gerencial.models.response.ProdutoResponse;
import br.com.sistema_gerencial.models.requests.*;
import br.com.sistema_gerencial.repositories.ProdutoRepository;
import br.com.sistema_gerencial.services.ImagemService;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;
import org.springframework.http.HttpStatus;

class ProdutoServiceImplTest {
    ProdutoRepository repository=mock(ProdutoRepository.class); ImagemService images=mock(ImagemService.class);
    ProdutoServiceImpl service=new ProdutoServiceImpl(repository,images);
    @ParameterizedTest @ValueSource(strings={"pagina","ativos","falta","id"})
    void incluiImagemExibicaoSemUmaConsultaPorProduto(String operation) {
        var product=ProdutoResponse.builder().id(1).nome("Cabo").build(); var other=ProdutoResponse.builder().id(2).nome("Fonte").build();
        when(images.buscarIdsImagemExibicaoProduto(any())).thenReturn(Map.of(1,"image"));
        switch(operation) {
            case "pagina" -> { when(repository.listarPorPagina(10,1)).thenReturn(Map.of("lista",List.of(product,other),"total",2)); assertThat(service.listarPorPagina(10,1).get("total")).isEqualTo(2); }
            case "ativos" -> { when(repository.listarAtivos()).thenReturn(List.of(product,other)); assertThat(service.listarAtivos()).hasSize(2); }
            case "falta" -> { when(repository.listarEmFalta()).thenReturn(List.of(product,other)); assertThat(service.listarEmFalta()).hasSize(2); }
            default -> { when(repository.buscarPorId(1)).thenReturn(product); assertThat(service.buscarPorId(1)).isSameAs(product); }
        }
        assertThat(product.getImagem_exibicao_id()).isEqualTo("image"); assertThat(other.getImagem_exibicao_id()).isNull();
        verify(images,times(1)).buscarIdsImagemExibicaoProduto(operation.equals("id")?List.of(1):List.of(1,2));
    }
    @Test void cadastroRetornaIdEAtualizacaoExigeProdutoExistente() {
        var create=new CadastrarProdutoRequest(); when(repository.cadastrar(create)).thenReturn(42); assertThat(service.cadastrar(create)).isEqualTo(42);
        when(repository.buscarPorId(1)).thenThrow(new DefaultErrorException("missing",HttpStatus.NOT_FOUND));
        var update=new AtualizarProdutoRequest(); update.setId(1);
        assertThatThrownBy(()->service.atualizar(update)).hasMessage("missing"); assertThatThrownBy(()->service.excluir(1)).hasMessage("missing");
        verify(repository,never()).atualizar(any()); verify(repository,never()).excluir(anyInt());
        when(repository.buscarPorId(2)).thenReturn(ProdutoResponse.builder().id(2).build()); update.setId(2);
        service.atualizar(update); service.excluir(2);
        var order=inOrder(repository); order.verify(repository).buscarPorId(2); order.verify(repository).atualizar(update);
        order.verify(repository).buscarPorId(2); order.verify(repository).excluir(2);
    }
}
