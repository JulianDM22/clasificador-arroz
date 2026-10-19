<!--
Nombre: metricas.md
Descripción: Punto 7 (administración, control y monitoreo): métricas del sistema y su
             evaluación, desempeño y producción de los integrantes, y monitoreo de errores y
             tareas. Indica dónde se mide cada cosa y cómo se interpreta.
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
-->

# Administración, control y monitoreo

## 1. Métricas del sistema y su evaluación

Las métricas se recogen con **Prometheus** (cada 15 s) y se ven en el tablero de **Grafana**
*Clasificador de arroz · operación*. En local: `docker compose --profile monitoreo up -d`,
Prometheus en http://localhost:9090 y Grafana en http://localhost:3000.

| Métrica | Fuente | Objetivo (cómo se evalúa) | Alerta |
|---|---|---|---|
| Disponibilidad | `up` de Prometheus; `/actuator/health` y `/salud` | 100 % de servicios arriba; en producción ≥ 99 % mensual | `ServicioCaido`: un servicio sin responder durante 1 min |
| Latencia de la API (p95) | `http_server_requests_seconds` (Spring Boot Actuator) | < 500 ms (CA-09.1) | `LatenciaAltaApi`: 5 min seguidos sobre 500 ms |
| Tasa de errores 5xx | `http_server_requests_seconds_count{status=~"5.."}` | < 1 % de las respuestas | `TasaDeErroresAlta` |
| Rendimiento | peticiones por segundo | Referencia del rendimiento real, sin umbral | — |
| Latencia de clasificación (p95) | `prediccion_segundos` (servicio de inferencia) | < 1 s (CA-09.3) | `InferenciaLenta` |
| Variedades sugeridas | `predicciones_total{categoria}` | Distribución estable; un sesgo fuerte hacia una variedad indica un posible problema de datos | — |
| Imágenes rechazadas | `imagenes_rechazadas_total` | Bajo; si sube, revisar la guía de fotos para los usuarios | — |
| Memoria de la JVM | `jvm_memory_used_bytes` | < 90 % del heap (plan gratuito de 512 MB) | `MemoriaJvmAlta` |
| Conexiones a la BD | `hikaricp_connections_*` | Sin conexiones en espera sostenidas | — |

### Métricas de calidad del software (en cada integración)

| Métrica | Herramienta | Objetivo | Resultado actual |
|---|---|---|---|
| Pruebas que pasan | JUnit, pytest, Vitest, Playwright, Selenium | 100 % (si no, no se despliega) | 100 % |
| Cobertura de líneas del back-end | JaCoCo | ≥ 80 % | 97,4 % (ramas: 90,4 %) |
| Puntaje de mutación | PIT | ≥ 70 % | 100 % (58/58) |
| Accesibilidad | axe-core en Playwright | 0 violaciones serias o críticas | 0 |
| Rendimiento con 50 usuarios | k6 (`carga.js`) | p95 < 500 ms, errores < 1 % | p95 = 18 a 28 ms en dos corridas locales, 0 errores |
| Hallazgos de seguridad | OWASP ZAP (línea base) | 0 alertas de riesgo alto | Ver reporte `zap-frontend.html` de cada ejecución |

### Resultados de rendimiento (k6, PC local con docker compose, 18-oct-2026)

Límites aplicados: 512 MB de memoria para el back-end y para la inferencia. Resúmenes completos
en `pruebas/carga/resultados/`.

| Prueba | Usuarios | Peticiones | p95 | Máximo | Errores | Veredicto |
|---|---|---|---|---|---|---|
| Carga (`carga.js`, CA-09.1) | 50 durante 2 min | 5.243 | 28 ms | 222 ms | 0 % | Cumple (objetivo p95 < 500 ms y errores < 1 %) |
| Estrés (`estres.js`) | escalones 50 → 300 | 48.258 | 21 ms | 766 ms | 0 % | No se alcanzó el punto de quiebre con 300 usuarios |
| Pico (`pico.js`) | 10 → 250 en 10 s | 8.235 | 1,5 s | 6,8 s | 0 % | Sin errores y con recuperación, pero la latencia se dispara durante el salto |

**Lectura.** La cantidad de usuarios no es lo que más pesa: el sistema aguanta 300 usuarios si
llegan de forma gradual. Lo que lo degrada es que lleguen de golpe. La hipótesis, sin verificar,
es que el pool de 5 conexiones a la base de datos (`DB_POOL`) hace esperar a las peticiones
mientras todo se ajusta. Mejoras posibles: subir el pool o precalentar el servicio.
**Advertencia:** estas cifras son de un PC. En el plan gratuito de Render, con una fracción de
CPU, el límite será mucho menor, y la prueba de carga se debe repetir contra producción antes
de afirmar que cumple CA-09.1 allá.

### Calidad del modelo (de los notebooks)

| Métrica | Valor | Fuente |
|---|---|---|
| Exactitud en test (ResNet50V2) | 99,91 % | notebook 04 |
| Validación cruzada (k = 5) | 99,78 % ± 0,22 | notebook 03 |
| Diferencia frente al mejor ensamble | 2 imágenes de 11.206, no significativa (McNemar p = 0,5) | notebook 05 |

## 2. Desempeño y producción de los integrantes

El flujo **Métricas del equipo** (`.github/workflows/metricas-equipo.yml`) corre cada lunes, o
a mano desde la pestaña *Actions*, y publica por integrante:

| Indicador | Qué mide | Cómo leerlo |
|---|---|---|
| Commits y participación (%) | Constancia del trabajo | Una participación muy desigual sostenida varias semanas indica mala división del trabajo |
| Líneas agregadas / eliminadas | Volumen de cambios | Solo como contexto: más líneas no es mejor trabajo |
| Pull requests abiertos / fusionados | Trabajo terminado e integrado | Un PR abierto mucho tiempo indica bloqueo o falta de revisión |
| Issues cerrados | Tareas y errores resueltos | Se cuentan los issues asignados al integrante |
| Mediana de horas de resolución | Rapidez para corregir | Un valor alto en issues de CI significa que `main` estuvo roto más tiempo |

**Evaluación.** Las cifras de actividad no miden por sí solas la calidad del aporte. Se
complementan con la revisión de código en cada pull request (mínimo una aprobación del otro
integrante) y con la división de responsabilidades acordada:

| Área | Responsable principal | Apoyo |
|---|---|---|
| Notebooks de IA (temas 1 a 6) | Julian Delgado | Camilo |
| Back-end y base de datos | Por definir en el grupo | |
| Front-end | Por definir en el grupo | |
| Pruebas, CI/CD y despliegue | Por definir en el grupo | |

## 3. Monitoreo de errores y tareas

| Qué | Dónde | Cómo funciona |
|---|---|---|
| Fallas de integración | Issues con etiqueta `ci-fallido` | El pipeline crea el issue con una tarea por trabajo fallido, lo asigna a ambos integrantes y los menciona (GitHub envía correo). Si ya existe, agrega un comentario. Cuando el pipeline vuelve a pasar, el issue se cierra solo. |
| Errores en producción | Registros de Render y alertas de Prometheus | Cada error 500 queda en el registro del back-end con su traza; al cliente nunca se le muestran detalles internos. |
| Tareas del proyecto | Issues + tablero de GitHub Projects | Cada tarea es un issue con responsable, etiqueta (`feat`, `bug`, `docs`, `test`) y criterio de aceptación asociado. |
| Estado semanal | Resumen de *Métricas del equipo* | Lista los issues abiertos y a quién están asignados. |
