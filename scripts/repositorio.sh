#!/usr/bin/env bash
# Nombre: repositorio.sh
# Descripción: Comandos de gestión del repositorio Git para el equipo (Linux, macOS o Git Bash).
#              Mismos comandos que repositorio.ps1:
#                iniciar <url> | rama <tipo> <nombre> | guardar "<mensaje>" | publicar |
#                actualizar | version <x.y.z> | estado
# Fecha de creación: 2026-10-18
# Última actualización: 2026-10-18
# Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
# Versión: 1.0.0
set -euo pipefail

comando="${1:-}"; arg1="${2:-}"; arg2="${3:-}"

case "$comando" in
  iniciar)
    [ -n "$arg1" ] || { echo "Uso: iniciar <url-del-repositorio>"; exit 1; }
    [ -d .git ] || git init -b main
    git add -A
    git commit -m "chore: versión inicial del clasificador de arroz"
    git remote add origin "$arg1"
    git push -u origin main ;;
  rama)
    [[ "$arg1" =~ ^(feat|fix|test|docs|chore)$ && -n "$arg2" ]] || { echo "Uso: rama <feat|fix|test|docs|chore> <nombre-corto>"; exit 1; }
    git checkout main && git pull --ff-only origin main
    git checkout -b "$arg1/$arg2" ;;
  guardar)
    [[ "$arg1" =~ ^(feat|fix|test|docs|chore|refactor|ci)(\(.+\))?:\ .+ ]] || { echo 'Formato convencional, p. ej.: "feat(front): filtro por estado"'; exit 1; }
    git add -A
    git commit -m "$arg1" ;;
  publicar)
    rama="$(git rev-parse --abbrev-ref HEAD)"
    git push -u origin "$rama"
    remoto="$(git remote get-url origin | sed -e 's/\.git$//' -e 's#^git@github.com:#https://github.com/#')"
    echo "Abre el pull request en: $remoto/compare/main...$rama" ;;
  actualizar)
    git fetch origin && git merge --no-edit origin/main ;;
  version)
    [[ "$arg1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Uso: version <x.y.z>"; exit 1; }
    git checkout main && git pull --ff-only origin main
    git tag -a "v$arg1" -m "Versión $arg1"
    git push origin "v$arg1" ;;
  estado)
    git status -sb
    git log --oneline -n 10 --graph --decorate ;;
  *)
    echo "Comandos: iniciar | rama | guardar | publicar | actualizar | version | estado"; exit 1 ;;
esac
