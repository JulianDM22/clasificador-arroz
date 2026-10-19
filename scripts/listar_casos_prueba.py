"""
Nombre: listar_casos_prueba.py
Descripción: Recorre el código de pruebas de todo el proyecto (JUnit, Vitest, Playwright,
             Selenium, pytest y k6) y genera docs/casos_de_prueba.md con la lista completa de
             casos y la matriz de trazabilidad criterio de aceptación → pruebas.
             Uso: python scripts/listar_casos_prueba.py
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
"""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CA = re.compile(r"CA-\d{2}\.\d")

# Un @DisplayName de JUnit cuenta como caso solo si nombra un método de prueba (no una clase).
JAVA = r'@DisplayName\("(.+?)"\)\s*(?:@\w+(?:\([^)]*\))?\s*)*void\s'

# (carpeta o patrón, tipo de prueba, herramienta, expresión que captura el nombre del caso)
FUENTES = [
    ("backend/src/test/java/**/unit/*.java", "Unitaria", "JUnit 5 + Mockito", JAVA),
    ("backend/src/test/java/**/web/*.java", "Integración (capa web)", "Spring Test (MockMvc) + Mockito", JAVA),
    ("backend/src/test/java/**/integration/Producto*.java", "Integración y sistema (API + PostgreSQL)", "Spring Boot Test + Testcontainers", JAVA),
    ("backend/src/test/java/**/integration/Clasificacion*.java", "Integración (API + inferencia)", "Spring Boot Test + Testcontainers", JAVA),
    ("backend/src/test/java/**/integration/Seguridad*.java", "Seguridad", "Spring Security Test + Testcontainers", JAVA),
    ("inferencia/tests/test_*.py", "Unitaria e integración (inferencia)", "pytest + TestClient", r"def (test_\w+)"),
    ("frontend/src/**/*.test.js*", "Unitaria (componentes)", "Vitest + Testing Library", r"""\bit(?:\.each\([\s\S]*?\))?\(\s*['"`](.+?)['"`]"""),
    ("frontend/e2e/*.spec.js", "Sistema (navegador)", "Playwright + axe-core", r"""\btest\(\s*['"`](.+?)['"`]"""),
    ("frontend/pruebas-selenium/*.test.js", "Sistema (navegador)", "Selenium WebDriver", r"""\bit\(\s*['"`](.+?)['"`]"""),
]

RENDIMIENTO = [
    ("pruebas/carga/carga.js", "Carga", "k6", "CA-09.1 50 usuarios durante 2 min: p95 < 500 ms y errores < 1 %"),
    ("pruebas/carga/estres.js", "Estrés", "k6", "Escalones de 50 a 300 usuarios hasta encontrar el punto de quiebre"),
    ("pruebas/carga/pico.js", "Pico", "k6", "Salto de 10 a 250 usuarios en 10 s: errores < 5 % y recuperación"),
    ("backend/pom.xml", "Mutación", "PIT", "Mutantes en servicios y mapeador: mínimo 70 % detectados (resultado: 100 %)"),
    (".github/workflows/ci-cd.yml", "Seguridad (dinámica)", "OWASP ZAP baseline", "Escaneo pasivo del front-end desplegado en cada integración"),
]


def casos() -> list[dict]:
    filas = []
    for patron, tipo, herramienta, regex in FUENTES:
        for archivo in sorted(RAIZ.glob(patron)):
            texto = archivo.read_text(encoding="utf-8")
            for nombre in re.findall(regex, texto):
                if "{" in nombre and "}" in nombre and "CA-" not in nombre:
                    continue  # plantillas de nombres de pruebas parametrizadas
                filas.append({
                    "archivo": archivo.relative_to(RAIZ).as_posix(),
                    "tipo": tipo,
                    "herramienta": herramienta,
                    "nombre": nombre.replace("|", "\\|"),
                    # En pytest el código va en el nombre de la función: test_ca_06_2_... → CA-06.2
                    "criterios": sorted(set(CA.findall(nombre))
                                        | {f"CA-{a}.{b}" for a, b in re.findall(r"ca_(\d{2})_(\d)", nombre)}),
                })
    for archivo, tipo, herramienta, nombre in RENDIMIENTO:
        filas.append({"archivo": archivo, "tipo": tipo, "herramienta": herramienta, "nombre": nombre,
                      "criterios": sorted(set(CA.findall(nombre)))})
    return filas


def criterios_definidos() -> list[tuple[str, str]]:
    texto = (RAIZ / "docs/criterios_aceptacion.md").read_text(encoding="utf-8")
    return re.findall(r"\| (CA-\d{2}\.\d) \| (.+?) \|", texto)


def main() -> None:
    filas = casos()
    por_criterio = defaultdict(list)
    for i, f in enumerate(filas, 1):
        f["n"] = i
        for c in f["criterios"]:
            por_criterio[c].append(f)

    lineas = [
        "<!--",
        "Nombre: casos_de_prueba.md",
        "Descripción: Lista completa de casos de prueba y matriz de trazabilidad. ARCHIVO GENERADO por",
        "             scripts/listar_casos_prueba.py a partir del código de pruebas: no editar a mano.",
        "Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)",
        "Versión: 1.0.0",
        "-->",
        "",
        "# Casos de prueba",
        "",
        f"Total: **{len(filas)}** casos (las pruebas parametrizadas cuentan como un caso aunque se ejecuten varias veces).",
        "",
        "## Resumen por tipo",
        "",
        "| Tipo | Herramienta | Casos |",
        "|---|---|---|",
    ]
    conteo = defaultdict(int)
    for f in filas:
        conteo[(f["tipo"], f["herramienta"])] += 1
    lineas += [f"| {t} | {h} | {n} |" for (t, h), n in conteo.items()]

    lineas += ["", "## Matriz de trazabilidad: criterio de aceptación → pruebas", "",
               "| Criterio | Descripción | Pruebas | Tipos |", "|---|---|---|---|"]
    sin_prueba = []
    for codigo, descripcion in criterios_definidos():
        pruebas = por_criterio.get(codigo, [])
        if not pruebas:
            sin_prueba.append(codigo)
        corta = re.sub(r"\*\*", "", descripcion)
        corta = corta if len(corta) < 110 else corta[:107] + "…"
        tipos = ", ".join(sorted({p["tipo"].split(" (")[0] for p in pruebas})) or "**sin prueba**"
        lineas.append(f"| {codigo} | {corta} | {len(pruebas)} | {tipos} |")
    lineas += ["", f"Criterios sin prueba automática: {', '.join(sin_prueba) if sin_prueba else 'ninguno'}.", ""]

    lineas += ["## Lista completa", "", "| # | Caso | Tipo | Herramienta | Archivo |", "|---|---|---|---|---|"]
    lineas += [f"| {f['n']} | {f['nombre']} | {f['tipo']} | {f['herramienta']} | `{f['archivo']}` |" for f in filas]

    destino = RAIZ / "docs/casos_de_prueba.md"
    destino.write_text("\n".join(lineas) + "\n", encoding="utf-8")
    print(f"{len(filas)} casos escritos en {destino.relative_to(RAIZ)}; criterios sin prueba: {sin_prueba or 'ninguno'}")


if __name__ == "__main__":
    main()
