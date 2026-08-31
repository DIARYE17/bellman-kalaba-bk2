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

        powershell '''
            Write-Host "========================================"
            Write-Host "   ANALYSE DU PROJET BELLMAN-KALABA"
            Write-Host "========================================"

            Write-Host ""
            Write-Host "--- Versions ---"
            node --version
            npm --version

            Write-Host ""
            Write-Host "--- Analyse des dependances ---"
            npm list --depth=0

            Write-Host ""
            Write-Host "--- Audit de securite ---"
            npm audit --json | Out-File -FilePath npm-audit.json -Encoding utf8

            Write-Host ""
            Write-Host "--- Analyse du dossier dist ---"

            $files = Get-ChildItem -Path "dist" -Recurse -File
            $fileCount = $files.Count

            if ($fileCount -gt 0) {
                $totalSize = ($files | Measure-Object -Property Length -Sum).Sum
                $totalSizeKB = [math]::Round($totalSize / 1KB, 2)
            }
            else {
                $totalSizeKB = 0
            }

            Write-Host "Nombre de fichiers : $fileCount"
            Write-Host "Taille totale      : $totalSizeKB KB"

            Write-Host ""
            Write-Host "--- Fichiers JavaScript ---"
            Get-ChildItem -Path "dist" -Recurse -Filter "*.js" -File |
                Select-Object Name, Length

            Write-Host ""
            Write-Host "--- Fichiers CSS ---"
            Get-ChildItem -Path "dist" -Recurse -Filter "*.css" -File |
                Select-Object Name, Length

            Write-Host ""
            Write-Host "========================================"
            Write-Host "        FIN DE L'ANALYSE"
            Write-Host "========================================"

            exit 0
        '''
    }
}

    stage("Generation du rapport") {
        steps {
            echo "=== Generation du rapport HTML ==="

            powershell '''
                $date = Get-Date -Format "dd/MM/yyyy HH:mm:ss"

                $package = Get-Content "package.json" -Raw | ConvertFrom-Json

                $dependencies = 0
                $devDependencies = 0

                if ($package.dependencies) {
                    $dependencies = $package.dependencies.PSObject.Properties.Count
                }

                if ($package.devDependencies) {
                    $devDependencies = $package.devDependencies.PSObject.Properties.Count
                }

                $files = Get-ChildItem -Path "dist" -Recurse -File
                $fileCount = $files.Count

                if ($fileCount -gt 0) {
                    $totalSize = ($files | Measure-Object -Property Length -Sum).Sum
                    $totalSizeKB = [math]::Round($totalSize / 1KB, 2)
                }
                else {
                    $totalSizeKB = 0
                }

                $javascriptFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*.js" -File
                $cssFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*.css" -File

                if ($javascriptFiles.Count -gt 0) {
                    $jsSize = [math]::Round(
                        (($javascriptFiles | Measure-Object -Property Length -Sum).Sum / 1KB),
                        2
                    )
                }
                else {
                    $jsSize = 0
                }

                if ($cssFiles.Count -gt 0) {
                    $cssSize = [math]::Round(
                        (($cssFiles | Measure-Object -Property Length -Sum).Sum / 1KB),
                        2
                    )
                }
                else {
                    $cssSize = 0
                }

                $html = @"

<!DOCTYPE html>

<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Jenkins - Bellman-Kalaba</title>

<style>
body {
    font-family: Arial, sans-serif;
    background: #f4f6f8;
    margin: 0;
    padding: 40px;
}

.container {
    max-width: 900px;
    margin: auto;
    background: white;
    padding: 35px;
    border-radius: 12px;
    box-shadow: 0 3px 15px rgba(0,0,0,0.1);
}

h1 {
    margin-bottom: 5px;
}

.subtitle {
    color: #666;
    margin-bottom: 30px;
}

h2 {
    margin-top: 30px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td {
    padding: 12px;
    border-bottom: 1px solid #eee;
}

.label {
    font-weight: bold;
}

.success {
    color: green;
    font-weight: bold;
}

.card {
    background: #f1f7ff;
    padding: 18px;
    border-radius: 8px;
    margin-top: 20px;
}

.footer {
    margin-top: 35px;
    color: #777;
    font-size: 13px;
}
</style>

</head>

<body>

<div class="container">

<h1>Rapport d'analyse du projet</h1>

<div class="subtitle">
Bellman-Kalaba
</div>

<div class="card">
<strong>Date de l'analyse :</strong> $date
</div>

<h2>État du build</h2>

<table>
<tr>
<td class="label">Projet</td>
<td>Bellman-Kalaba</td>
</tr>

<tr>
<td class="label">Technologie</td>
<td>React + Vite</td>
</tr>

<tr>
<td class="label">Statut</td>
<td class="success">BUILD RÉUSSI</td>
</tr>
</table>

<h2>Analyse du projet</h2>

<table>
<tr>
<td class="label">Dépendances</td>
<td>$dependencies</td>
</tr>

<tr>
<td class="label">DevDependencies</td>
<td>$devDependencies</td>
</tr>

<tr>
<td class="label">Fichiers de production</td>
<td>$fileCount</td>
</tr>

<tr>
<td class="label">Taille totale de dist</td>
<td>$totalSizeKB KB</td>
</tr>
</table>

<h2>Analyse des fichiers</h2>

<table>
<tr>
<td class="label">JavaScript</td>
<td>$jsSize KB</td>
</tr>

<tr>
<td class="label">CSS</td>
<td>$cssSize KB</td>
</tr>
</table>

<h2>Conclusion</h2>

<div class="card">
<p class="success">
✓ Le build du projet a été réalisé avec succès.
</p>

<p>
Le dossier <strong>dist</strong> a été généré correctement.
Le projet peut être déployé.
</p>
</div>

<div class="footer">
Rapport généré automatiquement par Jenkins.
</div>

</div>

</body>
</html>
"@

                Set-Content `
                    -Path "rapport-analyse.html" `
                    -Value $html `
                    -Encoding UTF8

                Write-Host "Rapport genere : rapport-analyse.html"
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
