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
                echo "=== Sauvegarde des fichiers dist ==="
                archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: false
            }
        }
        stage("Deploy") {
            steps {
                echo "=== Déploiement via serveur Python ==="
                // 1. Libère le port 5000 s'il est déjà occupé
                bat 'cmd /c "for /f \"tokens=5\" %a in (\'netstat -aon ^| findstr :5000 ^| findstr LISTENING\') do taskkill /f /pid %a" 2>NUL || cmd /c exit 0'
                
                // 2. Se déplace dans dist et lance le serveur HTTP natif de Python
                bat 'set JENKINS_NODE_COOKIE=dontKillMe && cd dist && start /b python -m http.server 5000'
            }
        }
    }
}