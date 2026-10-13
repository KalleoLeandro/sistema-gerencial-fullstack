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
                    sh '''
                        mvn clean verify
                    '''
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
    }
}