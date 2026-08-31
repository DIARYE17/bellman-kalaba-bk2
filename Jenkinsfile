pipeline {
agent any

stages {

    stage("Install Dependencies") {
        steps {
            echo "Installation des dependances"
            bat "npm install"
        }
    }

    stage("Build") {
        steps {
            echo "Build du projet React"
            bat "npm run build"
        }
    }

    stage("Archive Artifacts") {
        steps {
            echo "Sauvegarde du dossier dist"
            archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: false
        }
    }

    stage("Serve Application") {
        steps {
            echo "Demarrage de l'application React"

            bat '''
                cd dist
                start "React Server" /b python -m http.server 5000
            '''
        }
    }
}


}
