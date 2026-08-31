pipeline {
agent any


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

    stage("Analyse du projet") {
        steps {
            echo "=== Analyse automatique du projet ==="

            bat '''
                @echo off

                echo ========================================
                echo       ANALYSE DU PROJET BELLMAN-KALABA
                echo ========================================

                echo.
                echo --- Informations Node.js ---
                node --version
                npm --version

                echo.
                echo --- Dependances ---
                npm list --depth=0

                echo.
                echo --- Audit de securite ---
                npm audit --json > npm-audit.json

                echo.
                echo --- Taille du dossier dist ---
                powershell -Command "(Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB"

                echo.
                echo --- Fichiers generes ---
                dir dist /s /b

                echo.
                echo ========================================
                echo          FIN DE L'ANALYSE
                echo ========================================
            '''
        }
    }

    stage("Generation du rapport") {
        steps {
            echo "=== Generation du rapport HTML ==="

            bat '''
                @echo off

                powershell -Command ^
                "$date = Get-Date -Format 'dd/MM/yyyy HH:mm:ss'; ^
                "$files = (Get-ChildItem -Path dist -Recurse -File).Count; ^
                "$size = [math]::Round(((Get-ChildItem -Path dist -Recurse -File | Measure-Object Length -Sum).Sum / 1KB), 2); ^
                "$dependencies = (Get-Content package.json | ConvertFrom-Json).dependencies.PSObject.Properties.Count; ^
                "$devDependencies = (Get-Content package.json | ConvertFrom-Json).devDependencies.PSObject.Properties.Count; ^
                "$html = @'

<!DOCTYPE html>

<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Jenkins - Bellman-Kalaba</title>
<style>
body {
    font-family: Arial, sans-serif;
    margin: 40px;
    background: #f5f7fa;
    color: #333;
}
.container {
    max-width: 900px;
    margin: auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
h1 {
    color: #222;
}
h2 {
    margin-top: 30px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
}
table {
    width: 100%;
    border-collapse: collapse;
}
td {
    padding: 12px;
    border-bottom: 1px solid #eee;
}
.status {
    color: green;
    font-weight: bold;
}
.info {
    background: #eef5ff;
    padding: 15px;
    border-radius: 6px;
}
</style>
</head>

<body>
<div class="container">

<h1>Rapport d'analyse - Bellman-Kalaba</h1>

<div class="info">
<strong>Analyse realisee le :</strong> DATE_ANALYSE
</div>

<h2>Build</h2>

<table>
<tr>
<td>Projet</td>
<td>Bellman-Kalaba</td>
</tr>

<tr>
<td>Statut</td>
<td class="status">BUILD REUSSI</td>
</tr>
</table>

<h2>Projet</h2>

<table>
<tr>
<td>Dependances</td>
<td>NB_DEPENDENCIES</td>
</tr>

<tr>
<td>DevDependencies</td>
<td>NB_DEV_DEPENDENCIES</td>
</tr>

<tr>
<td>Fichiers de production</td>
<td>NB_FILES</td>
</tr>

<tr>
<td>Taille de dist</td>
<td>SIZE_KB KB</td>
</tr>
</table>

<h2>Production</h2>

<p>
Le projet React a ete compile avec Vite et le dossier
<strong>dist</strong> a ete genere correctement.
</p>

<h2>Conclusion</h2>

<p class="status">
✓ Analyse terminee avec succes.
</p>

<p>
Le projet est pret pour le deploiement.
</p>

</div>
</body>
</html>
'@; ^
                    $html = $html.Replace('DATE_ANALYSE', $date); ^
                    $html = $html.Replace('NB_DEPENDENCIES', $dependencies); ^
                    $html = $html.Replace('NB_DEV_DEPENDENCIES', $devDependencies); ^
                    $html = $html.Replace('NB_FILES', $files); ^
                    $html = $html.Replace('SIZE_KB', $size); ^
                    Set-Content -Path rapport-analyse.html -Value $html -Encoding UTF8"
                '''
            }
        }

    stage("Archive Artifacts") {
        steps {
            echo "=== Archivage des resultats ==="

            archiveArtifacts artifacts: 'dist/**,rapport-analyse.html,npm-audit.json',
                             allowEmptyArchive: false
        }
    }
}

}
