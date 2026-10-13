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
    }
}