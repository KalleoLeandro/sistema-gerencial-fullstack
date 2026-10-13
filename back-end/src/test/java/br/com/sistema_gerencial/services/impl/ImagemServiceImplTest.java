package br.com.sistema_gerencial.services.impl;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import br.com.sistema_gerencial.models.mongo.ImagemDocumento;
import br.com.sistema_gerencial.repositories.*;
import br.com.sistema_gerencial.exceptions.DefaultErrorException;

class ImagemServiceImplTest {
    MongoTemplate mongo; ProdutoRepository products; AtendimentoRepository atendimentos;
    ManutencaoRepository manutencao; AvulsoRepository avulsos; ImagemServiceImpl service;
    @BeforeEach void setup() {
        mongo=mock(MongoTemplate.class); products=mock(ProdutoRepository.class); atendimentos=mock(AtendimentoRepository.class);
        manutencao=mock(ManutencaoRepository.class); avulsos=mock(AvulsoRepository.class);
        service=new ImagemServiceImpl(mongo,products,atendimentos,manutencao,avulsos);
    }
    MockMultipartFile image(int width,int height,String format) throws Exception {
        var output=new ByteArrayOutputStream(); ImageIO.write(new BufferedImage(width,height,BufferedImage.TYPE_INT_RGB),format,output);
        return new MockMultipartFile("arquivo","image."+format,"image/"+(format.equals("jpg")?"jpeg":format),output.toByteArray());
    }
    void saveEcho() { when(mongo.save(any(ImagemDocumento.class))).thenAnswer(call->{ ImagemDocumento doc=call.getArgument(0); doc.setId("image-1"); return doc; }); }
    @ParameterizedTest @CsvSource({"600,400,png,300,200","200,600,jpg,100,300","100,50,png,100,50"})
    void produtoExibicaoPreservaProporcaoETamanho(int w,int h,String format,int expectedW,int expectedH) throws Exception {
        saveEcho(); var response=service.salvar(" produto ",1," produto_exibicao ",null,image(w,h,format));
        var captor=org.mockito.ArgumentCaptor.forClass(ImagemDocumento.class); verify(mongo).save(captor.capture());
        var content=ImageIO.read(new ByteArrayInputStream(captor.getValue().getConteudo().getData()));
        assertThat(content.getWidth()).isEqualTo(expectedW); assertThat(content.getHeight()).isEqualTo(expectedH);
        assertThat(response.getPrincipal()).isTrue(); assertThat(response.getId()).isEqualTo("image-1");
        assertThat(response.getEntityType()).isEqualTo("PRODUTO");
        assertThat(response.getTamanhoBytes()).isEqualTo((long)captor.getValue().getConteudo().getData().length);
        verify(mongo).remove(any(Query.class),eq(ImagemDocumento.class));
    }
    @ParameterizedTest @ValueSource(strings={"ATENDIMENTO","MANUTENCAO","AVULSO"})
    void outrasEntidadesPreservamArquivo(String type) throws Exception {
        saveEcho(); var input=image(400,400,"png"); var result=service.salvar(type,1,"EVIDENCIA",false,input);
        assertThat(result.getPrincipal()).isFalse(); assertThat(result.getTamanhoBytes()).isEqualTo(input.getSize());
        verify(mongo,never()).remove(any(Query.class),eq(ImagemDocumento.class));
        switch(type) { case "ATENDIMENTO" -> verify(atendimentos).buscarPorId(1); case "MANUTENCAO" -> verify(manutencao).buscarPorId(1); default -> verify(avulsos).buscarPorId(1); }
    }
    @Test void produtoControleRedimensionaSemExcluirExibicao() throws Exception {
        saveEcho(); service.salvar("PRODUTO",1,"PRODUTO_CONTROLE",true,image(600,300,"png"));
        verify(mongo,never()).remove(any(Query.class),eq(ImagemDocumento.class));
    }
    @ParameterizedTest @ValueSource(strings={"tipoNulo","tipoVazio","tipoInvalido","id","categoria","arquivoNulo","vazio","grande","mimeNulo","mimeTexto","bytesInvalidos","io"})
    void rejeitaUploadInvalido(String invalid) throws Exception {
        String type=invalid.equals("tipoNulo")?null:invalid.equals("tipoVazio")?" ":invalid.equals("tipoInvalido")?"OUTRO":"PRODUTO";
        int id=invalid.equals("id")?0:1; String category=invalid.equals("categoria")?null:"PRODUTO_EXIBICAO";
        MultipartFile file=invalid.equals("arquivoNulo")?null:mock(MultipartFile.class);
        if(file!=null) {
            lenient().when(file.isEmpty()).thenReturn(invalid.equals("vazio"));
            lenient().when(file.getSize()).thenReturn(invalid.equals("grande")?10L*1024*1024+1:1L);
            lenient().when(file.getContentType()).thenReturn(invalid.equals("mimeNulo")?null:invalid.equals("mimeTexto")?"text/plain":"image/png");
            if(invalid.equals("io")) when(file.getBytes()).thenThrow(new IOException("broken"));
            else lenient().when(file.getBytes()).thenReturn(new byte[]{1,2,3});
        }
        MultipartFile input=file;
        assertThatThrownBy(()->service.salvar(type,id,category,false,input)).isInstanceOf(DefaultErrorException.class);
        verify(mongo,never()).save(any(ImagemDocumento.class));
    }
    @Test void listaFiltraCategoriaEMapeiaMetadados() {
        var doc=ImagemDocumento.builder().id("id").entityType("PRODUTO").entityId(1).categoria("EVIDENCIA")
                .nomeArquivo("foto.png").contentType("image/png").tamanhoBytes(15L).principal(false).criadoEm(LocalDateTime.now()).build();
        when(mongo.find(any(Query.class),eq(ImagemDocumento.class))).thenReturn(List.of(doc));
        assertThat(service.listar("PRODUTO",1," evidencia ")).extracting("id").containsExactly("id");
        var captor=org.mockito.ArgumentCaptor.forClass(Query.class); verify(mongo).find(captor.capture(),eq(ImagemDocumento.class));
        assertThat(captor.getValue().getQueryObject()).containsEntry("categoria","EVIDENCIA").containsEntry("entityId",1);
        assertThat(service.listar("PRODUTO",1,null)).hasSize(1);
    }
    @Test void conteudoNaoEncontradoEExclusao() {
        assertThatThrownBy(()->service.buscarConteudo("missing")).hasMessageContaining("nao encontrada");
        var doc=ImagemDocumento.builder().id("id").build(); when(mongo.findById("id",ImagemDocumento.class)).thenReturn(doc);
        assertThat(service.buscarConteudo("id")).isSameAs(doc); service.excluir("id"); verify(mongo).remove(doc);
    }
    @Test void buscaImagensDescartaIdsInvalidosEDuplicadosEscolheMaisAntiga() {
        assertThat(service.buscarIdsImagemExibicaoProduto(null)).isEmpty();
        assertThat(service.buscarIdsImagemExibicaoProduto(Arrays.asList(null,0,-1))).isEmpty(); verifyNoInteractions(mongo);
        var newer=ImagemDocumento.builder().id("new").entityId(1).criadoEm(LocalDateTime.of(2026,2,1,0,0)).build();
        var older=ImagemDocumento.builder().id("old").entityId(1).criadoEm(LocalDateTime.of(2026,1,1,0,0)).build();
        var other=ImagemDocumento.builder().id("other").entityId(2).build();
        when(mongo.find(any(Query.class),eq(ImagemDocumento.class))).thenReturn(List.of(newer,other,older));
        assertThat(service.buscarIdsImagemExibicaoProduto(Arrays.asList(null,-1,1,1,2))).containsEntry(1,"old").containsEntry(2,"other");
        var captor=org.mockito.ArgumentCaptor.forClass(Query.class); verify(mongo).find(captor.capture(),eq(ImagemDocumento.class));
        assertThat(captor.getValue().getQueryObject().get("entityId").toString()).contains("1", "2").doesNotContain("-1");
    }
}
