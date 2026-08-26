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
                echo "=== Déploiement réel sur le serveur local Node.js ==="
                // Arrête les anciennes instances de serve sur le port 5000 s'il y en a, sans planter si aucun processus n'existe
                bat 'taskkill /F /IM node.exe /FI "WINDOWTITLE eq serve*" 2>NUL || cmd /c exit 0'
                // Lance le serveur web statique en arrière-plan sur le port 5000
                bat 'start /B serve -s dist -l 5000'
            }
        }
    }
}