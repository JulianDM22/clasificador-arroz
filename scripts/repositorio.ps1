<#
Nombre: repositorio.ps1
Descripción: Comandos de gestión del repositorio Git para el equipo (Windows PowerShell).
             Uso: .\scripts\repositorio.ps1 <comando> [argumentos]
               iniciar <url>          primer envío del proyecto al repositorio remoto
               rama <tipo> <nombre>   crea una rama de trabajo actualizada (tipo: feat, fix, test, docs, chore)
               guardar "<mensaje>"    agrega cambios y crea un commit con formato convencional
               publicar               sube la rama actual y muestra el enlace para abrir el pull request
               actualizar             trae los cambios de main a la rama actual
               version <x.y.z>        crea y publica una etiqueta de versión en main
               estado                 resumen de rama, cambios pendientes y últimos commits
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
#>
param(
    [Parameter(Mandatory = $true, Position = 0)][string]$Comando,
    [Parameter(Position = 1)][string]$Arg1,
    [Parameter(Position = 2)][string]$Arg2
)
$ErrorActionPreference = 'Stop'

# Ejecuta git con los argumentos tal cual (sin volver a partir el texto) y se detiene si falla.
function Git {
    Write-Host ("> git " + ($args -join ' ')) -ForegroundColor DarkGray
    & git @args
    if ($LASTEXITCODE -ne 0) { throw ("Falló: git " + ($args -join ' ')) }
}

switch ($Comando) {
    'iniciar' {
        if (-not $Arg1) { throw 'Uso: iniciar <url-del-repositorio>' }
        if (-not (Test-Path .git)) { Git init -b main }
        Git add -A
        Git commit -m 'chore: versión inicial del clasificador de arroz'
        Git remote add origin $Arg1
        Git push -u origin main
    }
    'rama' {
        if ($Arg1 -notin 'feat', 'fix', 'test', 'docs', 'chore') { throw 'Tipo de rama: feat, fix, test, docs o chore' }
        if (-not $Arg2) { throw 'Uso: rama <tipo> <nombre-corto>' }
        Git checkout main
        Git pull --ff-only origin main
        Git checkout -b "$Arg1/$Arg2"
    }
    'guardar' {
        if ($Arg1 -notmatch '^(feat|fix|test|docs|chore|refactor|ci)(\(.+\))?: .+') {
            throw 'El mensaje debe seguir el formato convencional, p. ej.: "feat(front): filtro por estado"'
        }
        Git add -A
        Git commit -m $Arg1
    }
    'publicar' {
        $rama = (git rev-parse --abbrev-ref HEAD).Trim()
        Git push -u origin $rama
        $remoto = (git remote get-url origin).Trim() -replace '\.git$', '' -replace '^git@github\.com:', 'https://github.com/'
        Write-Host "Abre el pull request en: $remoto/compare/main...$rama" -ForegroundColor Green
    }
    'actualizar' {
        Git fetch origin
        Git merge --no-edit origin/main
    }
    'version' {
        if ($Arg1 -notmatch '^\d+\.\d+\.\d+$') { throw 'Uso: version <x.y.z>' }
        Git checkout main
        Git pull --ff-only origin main
        Git tag -a "v$Arg1" -m "Versión $Arg1"
        Git push origin "v$Arg1"
    }
    'estado' {
        git status -sb
        git log --oneline -n 10 --graph --decorate
    }
    default { throw "Comando desconocido: $Comando" }
}
