# Vérifie si le dossier doom-source existe déjà
if (-not (Test-Path "doom-source")) {
    Write-Host "Clonage du dépôt b0nam/docker-doom..."
    git clone https://github.com/b0nam/DOCKER-DOOM.git doom-source
    Write-Host "Clonage terminé."
} else {
    Write-Host "Le dossier doom-source existe déjà. Mise à jour..."
    Push-Location doom-source
    git pull
    Pop-Location
    Write-Host "Mise à jour terminée."
}

# Patch du Dockerfile pour Windows (CRLF fix)
$dockerfilePath = "doom-source/Docker/Dockerfile"
if (Test-Path $dockerfilePath) {
    $content = Get-Content $dockerfilePath -Raw
    if ($content -notmatch "Fix line endings") {
        Write-Host "Application du correctif Windows (CRLF) sur le Dockerfile..."
        $fix = @"

# Fix line endings (CRLF to LF) and permissions for Windows users
RUN chmod +x /src/*.sh && sed -i 's/\r$//' /src/*.sh

CMD ["/src/entrypoint.sh"]
"@
        Add-Content -Path $dockerfilePath -Value $fix
        Write-Host "Correctif appliqué."
    } else {
        Write-Host "Le correctif Windows est déjà présent."
    }
}

Write-Host "Initialisation terminée. Vous pouvez lancer 'docker compose up doom-dev'."
