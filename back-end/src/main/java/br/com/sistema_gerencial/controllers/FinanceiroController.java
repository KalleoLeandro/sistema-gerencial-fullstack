package br.com.sistema_gerencial.controllers;

import static br.com.sistema_gerencial.models.financeiro.FinanceiroModels.*;
import java.time.LocalDate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import br.com.sistema_gerencial.services.impl.FinanceiroService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/financeiro")
@PreAuthorize("hasAnyRole('ADMIN','DEV')")
@RequiredArgsConstructor
@Tag(name="Financeiro",description="Contas a pagar, receber e relatórios financeiros")
public class FinanceiroController {
    private final FinanceiroService service;

    @GetMapping("/contas")
    public Pagina listar(@RequestParam(required=false) String tipo,@RequestParam(required=false) String status,
        @RequestParam(required=false) String pesquisa,@RequestParam(required=false) LocalDate inicio,
        @RequestParam(required=false) LocalDate fim,@RequestParam(required=false) String categoria,
        @RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="10") int limit) {
        return service.listar(service.filtro(tipo,status,pesquisa,inicio,fim,categoria),page,limit);
    }
    @GetMapping("/contas/{origem}/{id}")
    public Detalhes detalhes(@PathVariable String origem,@PathVariable long id) { return service.detalhes(origem,id); }
    @PostMapping("/contas") @ResponseStatus(HttpStatus.CREATED)
    public Conta criar(@Valid @RequestBody ContaRequest request) { return service.criar(request); }
    @PutMapping("/contas/{id}")
    public Conta atualizar(@PathVariable long id,@Valid @RequestBody ContaRequest request) { return service.atualizar(id,request); }
    @PostMapping("/contas/{id}/cancelar") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable long id) { service.cancelar(id); }
    @PostMapping("/contas/{origem}/{id}/baixas")
    public Detalhes baixar(@PathVariable String origem,@PathVariable long id,@Valid @RequestBody BaixaRequest request) { return service.baixar(origem,id,request); }
    @GetMapping("/relatorios")
    public Relatorio relatorio(@RequestParam(required=false) String tipo,@RequestParam(required=false) LocalDate inicio,
        @RequestParam(required=false) LocalDate fim,@RequestParam(required=false) String categoria) {
        return service.relatorio(service.filtro(tipo,null,null,inicio,fim,categoria));
    }
}
