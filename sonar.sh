#!/bin/bash

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Lista de projetos
projetos=(
  "back-end"
  "bff"
  "front-end"
)

for projeto in "${projetos[@]}"; do
  echo -e "\n🔍 Rodando análise SonarQube em: ${GREEN}${projeto}${NC}"

  if [ "$projeto" == "back-end" ]; then
    cd "$projeto" || exit
    echo -e "${YELLOW}→ Projeto Java detectado. Usando Maven...${NC}"

    mvn clean verify org.sonarsource.scanner.maven:sonar-maven-plugin:sonar \
      -Dsonar.projectKey=back-end \
      -Dsonar.projectName='back-end' \
      -Dsonar.host.url=http://localhost:9000 \
      -Dsonar.token=sqp_4073be1ab4adb296f9da5b7274b66dbab298558d\
      -Dsonar.coverage.exclusions=**/SistemaGerencialFullstackApplication.java


    cd - > /dev/null

  else
    cd "$projeto" || exit
    echo -e "${YELLOW}→ Projeto não-Java. Usando npm run sonar...${NC}"

    npm run sonar

    cd - > /dev/null
  fi
done
