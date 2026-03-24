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

    mvn clean verify sonar:sonar \
     -Dsonar.projectKey=back_end \
     -Dsonar.projectName='Back end' \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.token=sqp_e379a75940cd06b55048e58b53a064146cd947a8 \
     -Dsonar.coverage.exclusions=**/SistemaGerencialFullstackApplication.java


    cd - > /dev/null

  else
    cd "$projeto" || exit
    echo -e "${YELLOW}→ Projeto não-Java. Usando npm run sonar...${NC}"

    npm run sonar

    cd - > /dev/null
  fi
done
