# Módulo financeiro

Acesso: menu **Financeiro**, disponível para ADMIN e DEV. Há telas de contas a pagar, contas a receber e relatórios.

## Banco e implantação

Para bancos existentes, executar `db/2026-10-13-financeiro.sql` no banco da aplicação antes de atualizar o backend. A migração é idempotente e cria somente `financeiro_contas` e `financeiro_baixas`. O schema de instalações novas, `db/init.sql`, já inclui essas tabelas.

Não há carga automática de contas ou fornecedores.

## Modelo e regras

- Lançamentos manuais têm tipo PAGAR/RECEBER, descrição, contraparte, vencimento e valor. Categoria e referência são opcionais.
- Os campos opcionais `entidadeTipo` e `entidadeId` permitem vincular uma conta a uma entidade futura sem depender de fornecedores ou centros de custo nesta versão. Eles devem ser informados juntos.
- Contas a receber de vendas são lidas das parcelas existentes, sem cópia ou sincronização de títulos. A origem mais o ID identifica a conta: MANUAL/1 e VENDA/1 são contas distintas.
- Baixas usam transação e bloqueio da conta. Valor maior que o saldo, valor não positivo, data futura e baixa de conta cancelada são rejeitados. São permitidas baixas parciais e totais.
- Baixas de vendas registram o pagamento, atualizam a parcela e geram o evento PAGAMENTO_REGISTRADO na outbox existente. O caixa comercial lê o mesmo pagamento.
- Lançamentos manuais alimentam o fluxo financeiro; o fechamento do caixa comercial mantém seu escopo atual de recebimentos comerciais.
- Cancelamento mantém o lançamento no histórico e retira seu saldo das previsões. Contas com baixas não podem ser canceladas. Uma edição não pode mudar o tipo nem reduzir o valor abaixo do já baixado.
- VENCIDA é calculado a partir do vencimento e do saldo atual; uma conta parcialmente paga também pode estar vencida.
- Os relatórios exibem saldos atuais por vencimento e movimentos realizados por data da baixa. O saldo previsto é a receber menos a pagar; o realizado é recebido menos pago. Não são saldos bancários com posição inicial.
- Relatórios têm filtros por período, tipo e categoria e exportação CSV.

## APIs

Todas as rotas passam pelo BFF e exigem autenticação e perfil ADMIN ou DEV no backend.

| Método | Rota | Operação |
| --- | --- | --- |
| GET | /financeiro/contas | Lista paginada e filtros |
| GET | /financeiro/contas/{origem}/{id} | Detalhes e histórico de baixas |
| POST | /financeiro/contas | Cria conta manual |
| PUT | /financeiro/contas/{id} | Edita conta manual |
| POST | /financeiro/contas/{id}/cancelar | Cancela conta manual sem baixas |
| POST | /financeiro/contas/{origem}/{id}/baixas | Registra pagamento ou recebimento |
| GET | /financeiro/relatorios | Resumo e fluxos diário realizado e previsto |

A lista aceita `tipo`, `status`, `pesquisa`, `inicio`, `fim`, `categoria`, `page` e `limit` (máximo 100). Relatórios aceitam `tipo`, `inicio`, `fim` e `categoria`. Datas seguem YYYY-MM-DD e valores usam JSON decimal com até duas casas.
