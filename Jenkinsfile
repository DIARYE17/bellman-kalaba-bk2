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
                @echo off

                for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
                    taskkill /f /pid %%a >nul 2>&1
                )

                start "React Server" /b npx serve -s dist -l 5000
            '''
        }
    }
}

}
