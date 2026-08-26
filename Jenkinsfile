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
                echo "=== Déploiement du serveur local ==="
                // Libère le port 5000 s'il est déjà occupé
                bat 'cmd /c "for /f \"tokens=5\" %a in (\'netstat -aon ^| findstr :5000 ^| findstr LISTENING\') do taskkill /f /pid %a" 2>NUL || cmd /c exit 0'
                
                // Lance serve en pointant vers le dossier dist du workspace Jenkins
                bat 'powershell -Command "Start-Process cmd -ArgumentList \'/c npx serve -s %WORKSPACE%\\dist -l 5000\' -WindowStyle Hidden"'
            }
        }
    }
}