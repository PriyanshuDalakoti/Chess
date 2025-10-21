pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'sudo docker-compose build'
            }
        }

        stage('Restart App') {
            steps {
                sh '''
                    sudo docker-compose down || true
                    sudo docker-compose up -d
                '''
            }
        }
    }

    post {
        failure {
            echo 'Build failed.'
        }
    }
}
