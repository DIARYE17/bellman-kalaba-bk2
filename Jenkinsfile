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

        stage("Deploy") {
            steps {
                echo "=== Demarrage du serveur ==="

                bat '''
                    @echo off
                    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
                        taskkill /f /pid %%a >nul 2>&1
                    )

                    set JENKINS_NODE_COOKIE=dontKillMe
                    cd dist
                    start /b python -m http.server 5000
                '''
            }
        }
    }
}