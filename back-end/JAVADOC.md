# Documentação Java (Javadoc)

Os comentários `/** ... */` das classes, interfaces e records descrevem a responsabilidade de cada tipo. Os contratos dos serviços também documentam os parâmetros e retornos. As anotações Spring e Lombok continuam responsáveis pelo comportamento da aplicação; os comentários Javadoc são utilizados para gerar a documentação HTML.

## Gerar e abrir a documentação

É necessário ter o JDK 27 (incluindo a ferramenta `javadoc`) e o Maven disponíveis. Confira com `java -version` e `mvn -version`.

Na raiz do repositório:

```powershell
cd back-end
mvn javadoc:javadoc
Start-Process .\target\reports\apidocs\index.html
```

Também é possível executar a geração da raiz, sem mudar de diretório:

```powershell
mvn -f back-end/pom.xml javadoc:javadoc
```

O resultado fica em `back-end/target/reports/apidocs/index.html`. Essa tarefa não inicia a aplicação e não precisa de banco de dados. O conteúdo de `target` é gerado e não deve ser versionado. Execute novamente o comando depois de alterar os comentários. A primeira execução pode baixar o plugin e suas dependências.

Se estiver utilizando o cache Maven local do projeto, execute dentro de `back-end`:

```powershell
mvn "-Dmaven.repo.local=.m2/repository" javadoc:javadoc
```

Para empacotar a documentação em um JAR:

```powershell
mvn javadoc:jar
```

O arquivo gerado fica em `target/sistema_gerencial_fullstack-0.0.1-SNAPSHOT-javadoc.jar`.

## Manter os comentários

Escreva o comentário imediatamente antes da declaração ou de suas anotações. Descreva o comportamento e use `@param`, `@return` e `@throws` quando aplicáveis:

```java
/**
 * Consulta os detalhes de um produto pelo identificador.
 *
 * @param id identificador do produto
 * @return dados do produto encontrado
 */
ProdutoResponse buscarPorId(int id);
```

O `pom.xml` fixa o Maven Javadoc Plugin em `3.11.3` e utiliza UTF-8. Erros de geração fazem o comando falhar; avisos sobre documentação ausente em outros membros ou construtores devem ser corrigidos conforme esses contratos forem documentados.

O Javadoc gerado diretamente dos fontes não inclui os métodos criados pelo Lombok, como getters e setters. Para documentar também esses métodos, é necessário gerar fontes intermediários com `delombok` e utilizá-los na geração do Javadoc. Isso não é necessário para consultar os comentários das classes e dos métodos declarados neste projeto.

Referências: [Maven Javadoc Plugin](https://maven.apache.org/plugins/maven-javadoc-plugin/usage.html) e [Lombok delombok](https://projectlombok.org/features/delombok).
