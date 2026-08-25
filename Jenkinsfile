pipeline {
    agent any
    stages {
        stage("Checkout & Clean") {
            steps {
                echo "=== Nettoyage du workspace ==="
                cleanWs()
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
