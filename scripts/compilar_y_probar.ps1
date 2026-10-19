<#
Nombre: compilar_y_probar.ps1
Descripción: Compila y prueba todo el proyecto en el PC, en el mismo orden que la integración
             continua: back-end (incluye mutación), servicio de inferencia, front-end y, con
             -Sistema, las pruebas de sistema y de carga sobre docker compose.
             Uso: .\scripts\compilar_y_probar.ps1 [-Sistema] [-Python <ruta a python.exe>]
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
#>
param([switch]$Sistema, [string]$Python = 'python')
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot

function Paso([string]$Titulo, [scriptblock]$Accion) {
    Write-Host "`n=== $Titulo ===" -ForegroundColor Cyan
    & $Accion
    if ($LASTEXITCODE -ne 0) { throw "Falló: $Titulo" }
}

Push-Location $raiz
try {
    Paso 'Back-end: compilar y probar' { Push-Location backend; mvn -B verify; Pop-Location }
    Paso 'Back-end: pruebas de mutación' { Push-Location backend; mvn -B test-compile org.pitest:pitest-maven:mutationCoverage; Pop-Location }
    Paso 'Inferencia: pruebas' { Push-Location inferencia; & $Python -m pytest -q; Pop-Location }
    Paso 'Front-end: pruebas unitarias' { Push-Location frontend; npx vitest run; Pop-Location }
    Paso 'Front-end: compilar' { Push-Location frontend; npm run build; Pop-Location }
    if ($Sistema) {
        Paso 'Levantar el sistema' { docker compose up -d --build --wait --wait-timeout 300 }
        Paso 'Playwright' { Push-Location frontend; npx playwright test; Pop-Location }
        Paso 'Selenium' { Push-Location frontend; node --test pruebas-selenium/; Pop-Location }
        Paso 'Carga (k6)' { docker run --rm --network ia_arroz_default -e BASE_URL=http://backend:8080 -v "${raiz}\pruebas\carga:/scripts" grafana/k6:0.57.0 run /scripts/carga.js }
    }
    Write-Host "`nTodo pasó." -ForegroundColor Green
}
finally { Pop-Location }
