pipeline {
    agent any
    stages {
        stage("Install Dependencies") {
            steps {
                echo "=== Installation des dépendances ==="
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
                echo "=== Sauvegarde du dossier dist ==="
                archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: false
            }
        }
        stage("Deploy") {
            steps {
                echo "=== Déploiement en arrière-plan ==="
                // Arrête les processus node existants sans faire échouer le script s'il n'y en a pas
                bat 'powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force"'
                // Lance le serveur web via cmd /c start pour détacher le processus
                bat 'cmd /c start /B npx serve -s dist -l 5000'
            }
        }
    }
}