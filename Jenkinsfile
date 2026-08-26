@'
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
    }
}
'@ | Out-File -FilePath .\Jenkinsfile -Encoding utf8