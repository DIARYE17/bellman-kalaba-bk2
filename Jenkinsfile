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
        // 1. Libère le port 5000 sans bloquer
        bat 'powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force"'
        // 2. Démarre serve de manière totalement indépendante de Jenkins
        bat 'powershell -Command "Start-Process serve -ArgumentList \'-s dist -l 5000\' -WindowStyle Hidden"'
    }
}
    }
}