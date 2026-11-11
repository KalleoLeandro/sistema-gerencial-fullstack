# Fluxo de desenvolvimento

Orientação permanente do usuário: toda nova implementação ou correção deve ter suas alterações commitadas e enviadas à branch `historico/funcionalidades` do remoto `origin`.

- Este worktree é o local de desenvolvimento da branch `historico/funcionalidades`. Confira a branch e o estado do Git antes de editar.
- Preserve a `main`, a pasta original, alterações locais preexistentes e serviços em execução. Não faça merge para a `main`, force push ou alteração da branch padrão sem solicitação explícita.
- Inclua em cada commit somente as alterações da funcionalidade ou correção solicitada. Não versione arquivos `.env`, segredos, dependências instaladas, resultados de builds ou alterações alheias à tarefa.
- Execute as verificações adequadas às partes afetadas antes de concluir.
- Organize os commits por funcionalidade ou correção e publique com `git push origin historico/funcionalidades` ao concluir cada implementação solicitada. Essa publicação está autorizada pelo usuário; não peça nova confirmação de rotina.
- Se testes, conflitos, autenticação ou permissões impedirem a conclusão, informe o impedimento e não declare a publicação como concluída.
- O desenvolvimento novo deve continuar a partir do histórico atual, sem reconstruir ou reescrever os commits anteriores.
