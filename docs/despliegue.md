<!--
Nombre: despliegue.md
Descripción: Guía de despliegue: local con Docker Compose y producción en Render (plan
             gratuito) disparada por GitHub Actions solo cuando todas las pruebas pasan.
Fecha de creación: 2026-10-18
Última actualización: 2026-10-18
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
-->

# Despliegue

## Flujo completo

```
push a GitHub ──► CI/CD: back-end · inferencia · front-end (en paralelo)
                        │ todo pasa
                        ▼
                  sistema completo en Docker: Playwright · Selenium · k6 · OWASP ZAP
                        │ todo pasa y la rama es main
                        ▼
                  Render: despliega inferencia, back-end y front-end
        (si algo falla en cualquier paso) ──► issue con tareas, asignado y notificado al equipo
```

## 1. Local (Docker Compose)

```bash
docker compose up -d --build --wait
```

| Servicio | URL |
|---|---|
| Front-end | http://localhost:8081 |
| API + Swagger UI | http://localhost:8080/swagger-ui.html |
| Servicio de inferencia | http://localhost:8000/salud |
| Monitoreo (opcional) | `docker compose --profile monitoreo up -d` → Grafana http://localhost:3000 |

Usuarios de prueba: `admin` / `Admin123*` (ADMIN) y `operario` / `Operario123*` (USUARIO).

**Base de datos.** El contenedor de PostgreSQL ejecuta `db/init/01_crear_esquema_y_permisos.sql`
la primera vez. Después, el back-end aplica con Flyway `V1__crear_esquema.sql` (tablas, índices y
restricciones) y `V2__datos_iniciales.sql` (productos de ejemplo). Para un PostgreSQL instalado
sin Docker se usa `db/crear_base_manual.sql`.

## 2. Producción (Render, plan gratuito)

### Una sola vez

1. Crear una cuenta en https://render.com, iniciando sesión con GitHub.
2. **New → Blueprint** y elegir el repositorio. Render lee `render.yaml` y propone la base de
   datos y los tres servicios.
3. Completar las variables marcadas como `sync: false`:

   | Servicio | Variable | Valor |
   |---|---|---|
   | arroz-backend | `APP_INFERENCIA_URL` | URL pública de arroz-inferencia |
   | arroz-backend | `APP_CORS_ORIGENES` | URL pública de arroz-frontend |
   | arroz-backend | `APP_ADMIN_PASSWORD`, `APP_USUARIO_PASSWORD` | Contraseñas nuevas (no las de prueba) |
   | arroz-frontend | `VITE_API_URL` | URL pública de arroz-backend |

   `APP_JWT_SECRET` y la clave compartida con la inferencia los genera Render.
4. En cada servicio: **Settings → Deploy Hook**, copiar la URL y guardarla en GitHub
   (**Settings → Secrets and variables → Actions**) como `RENDER_HOOK_BACKEND`,
   `RENDER_HOOK_INFERENCIA` y `RENDER_HOOK_FRONTEND`.
5. En GitHub, **Settings → Environments → New environment** llamado `produccion`. Ahí se
   puede exigir aprobación manual antes de desplegar.

### En cada cambio

No hay que hacer nada: al fusionar en `main`, el pipeline prueba todo y, si pasa, llama a los
tres deploy hooks. Si faltan los secretos, el paso de despliegue se omite con un aviso y el resto
del pipeline sigue igual.

### Limitaciones del plan gratuito

- Los servicios se **duermen** tras 15 minutos sin uso; la primera petición después tarda cerca
  de un minuto en despertarlos. Antes de la sustentación conviene abrir la aplicación unos minutos
  antes.
- La base de datos gratuita de Render **vence a los 30 días**. Alternativa sin vencimiento: Neon
  o Supabase, configurando `DB_URL`, `DB_USER` y `DB_PASSWORD` en el back-end.
- 512 MB de memoria por servicio: por eso el modelo va en TensorFlow Lite (unos 47 MB) y el
  back-end usa `-XX:MaxRAMPercentage=70`.
- La CPU es una fracción de la de un PC: los tiempos de la prueba de carga local no se
  trasladan a producción.
