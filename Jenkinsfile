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
                // Libération du port 5000 s'il est utilisé
                bat 'cmd /c "for /f \"tokens=5\" %a in (\'netstat -aon ^| findstr :5000 ^| findstr LISTENING\') do taskkill /f /pid %a" 2>NUL || cmd /c exit 0'
                
                // Lancement du serveur avec la variable d'environnement PowerShell $env:WORKSPACE
                bat 'powershell -Command "Start-Process cmd -ArgumentList \'/c npx serve -s $env:WORKSPACE\\dist -l 5000\' -WindowStyle Hidden"'
            }
        }
    }
}