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
                // Libération du port 5000
                bat 'cmd /c "for /f \"tokens=5\" %a in (\'netstat -aon ^| findstr :5000 ^| findstr LISTENING\') do taskkill /f /pid %a" 2>NUL || cmd /c exit 0'
                
                // Lancement de serve directement en ciblant le dossier dist du workspace
                bat 'powershell -Command "Start-Process cmd -ArgumentList \'/c npx serve -s C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Pipeline-Bellman-Kalaba\\dist -l 5000\' -WindowStyle Hidden"'
            }
        }
    }
}