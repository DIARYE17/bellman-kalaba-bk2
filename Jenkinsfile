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
                // 1. Libère le port 5000 s'il est utilisé
                bat 'cmd /c "for /f \"tokens=5\" %a in (\'netstat -aon ^| findstr :5000 ^| findstr LISTENING\') do taskkill /f /pid %a" 2>NUL || cmd /c exit 0'
                
                // 2. Lance npx serve directement dans le dossier dist du workspace Jenkins via start /b
                bat 'cmd /c "set JENKINS_NODE_COOKIE=dontKillMe && start /b npx serve -s C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Pipeline-Bellman-Kalaba\\dist -l 5000"'
            }
        }
    }
}