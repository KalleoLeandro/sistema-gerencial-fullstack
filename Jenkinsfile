pipeline {
    agent {
        label 'docker-local'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verificar Ambiente') {
            steps {
                sh '''
                    java -version
                    mvn -version
                    node --version
                    npm --version
                '''
            }
        }

        stage('Verificar Projetos') {
            steps {
                sh '''
                    pwd
                    ls -la

                    test -f back-end/pom.xml
                    test -f bff/package.json
                    test -f front-end/package.json
                '''
            }
        }

        stage('Build e Testes Backend') {
            steps {
                dir('back-end') {
                    withEnv([
                        'JAVA_HOME=/opt/jdks/jdk-27',
                        'PATH+JDK27=/opt/jdks/jdk-27/bin'
                    ]) {
                        sh '''
                            echo "Verificando Java:"
                            java -version

                            echo "Verificando Maven:"
                            mvn -version

                            echo "Compilando e executando testes:"
                            mvn clean verify
                        '''
                    }
                }
            }
        }

        stage('Validar Coverage Backend') {
            steps {
                dir('back-end') {
                    sh '''
                        test -f target/site/jacoco/jacoco.xml
                        echo "Relatório JaCoCo encontrado!"
                    '''
                }
            }
        }

        stage('SonarQube Backend') {
            steps {
                dir('back-end') {
                    script {
                        def scannerHome = tool 'sonar-scanner'

                        withSonarQubeEnv(
                            installationName: 'sonarqube-local',
                            credentialsId: 'sonar-token-backend'
                        ) {
                            withCredentials([
                                string(
                                    credentialsId: 'sonar-token-backend',
                                    variable: 'SONAR_TOKEN'
                                )
                            ]) {
                                withEnv(["SCANNER_HOME=${scannerHome}"]) {
                                    sh '''
                                        "$SCANNER_HOME/bin/sonar-scanner" \
                                        -Dsonar.token="$SONAR_TOKEN" \
                                        -Dsonar.host.url="$SONAR_HOST_URL"
                                    '''
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate Backend') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate(
                        abortPipeline: true,
                        credentialsId: 'sonar-token-backend'
                    )
                }
            }
        }
        
        stage('Build e Testes BFF') {
            steps {
                dir('bff') {
                    sh '''
                        echo "Instalando dependencias..."
                        npm ci

                        echo "Executando testes com coverage..."
                        npm run test:cov -- --runInBand --ci

                        echo "Validando relatorio LCOV..."
                        test -f coverage/lcov.info

                        echo "Compilando TypeScript..."
                        npm run build
                    '''
                }
            }
        }

        stage('SonarQube BFF') {
            steps {
                dir('bff') {
                    script {
                        def scannerHome = tool 'sonar-scanner'

                        withSonarQubeEnv(
                            installationName: 'sonarqube-local',
                            credentialsId: 'sonar-token-bff'
                        ) {
                            withCredentials([
                                string(
                                    credentialsId: 'sonar-token-bff',
                                    variable: 'SONAR_TOKEN'
                                )
                            ]) {
                                withEnv(["SCANNER_HOME=${scannerHome}"]) {
                                    sh '''
                                        echo "Executando analise SonarQube BFF..."

                                        "$SCANNER_HOME/bin/sonar-scanner" \
                                            -Dsonar.token="$SONAR_TOKEN" \
                                            -Dsonar.host.url="$SONAR_HOST_URL"
                                    '''
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Quality Gate BFF') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate(
                        abortPipeline: true
                    )
                }
            }
        }

        stage('Build e Testes Angular') {
            steps {
                dir('front-end') {
                    withEnv(['CHROME_BIN=/usr/bin/chromium']) {
                        sh '''
                            echo "Verificando Chromium..."
                            chromium --version

                            echo "Instalando dependencias..."
                            npm ci

                            echo "Executando testes Angular com cobertura..."
                            npm run test:ci

                            echo "Localizando relatorio LCOV..."
                            find coverage -name lcov.info -type f

                            echo "Compilando Angular para producao..."
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('SonarQube Angular') {
            steps {
                dir('front-end') {
                    script {
                        def scannerHome = tool 'sonar-scanner'

                        withSonarQubeEnv(
                            installationName: 'sonarqube-local',
                            credentialsId: 'sonar-token-frontend'
                        ) {
                            withCredentials([
                                string(
                                    credentialsId: 'sonar-token-frontend',
                                    variable: 'SONAR_TOKEN'
                                )
                            ]) {
                                withEnv(["SCANNER_HOME=${scannerHome}"]) {
                                    sh '''
                                        echo "Executando SonarQube Angular..."

                                        "$SCANNER_HOME/bin/sonar-scanner" \
                                            -Dsonar.token="$SONAR_TOKEN" \
                                            -Dsonar.host.url="$SONAR_HOST_URL"
                                    '''
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Quality Gate Angular') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate(
                        abortPipeline: true
                    )
                }
            }
        }
    }
}