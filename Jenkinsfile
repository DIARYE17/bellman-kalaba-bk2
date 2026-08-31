pipeline {
agent any

```
stages {

    stage("Install Dependencies") {
        steps {
            echo "=== Installation des dependances ==="
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

    stage("Serve Application") {
        steps {
            echo "=== Demarrage de l'application React ==="

            bat '''
                @echo off

                echo Verification du port 5000...

                for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
                    echo Arret du processus %%a...
                    taskkill /f /pid %%a >nul 2>&1
                )

                echo Demarrage du serveur...

                cd dist

                start /b python -m http.server 5000

                echo.
                echo ==========================================
                echo Application disponible sur :
                echo http://localhost:5000
                echo ==========================================
            '''
        }
    }
}
```

}
