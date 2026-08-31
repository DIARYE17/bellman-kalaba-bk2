pipeline {
    agent any

    stages {

        stage("Install Dependencies") {
            steps {
                echo "=== Installation des dependances ==="
                bat "npm install"
            }
        }

        stage("Build") {
            steps {
                echo "=== Build du projet React ==="
                bat "npm run build"
            }
        }

        stage("Archive Artifacts") {
            steps {
                echo "=== Sauvegarde des fichiers dist ==="
                archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: false
            }
        }
    }
}