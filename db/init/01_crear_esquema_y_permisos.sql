-- Nombre: 01_crear_esquema_y_permisos.sql
-- Descripción: Inicialización de la base de datos (la ejecuta PostgreSQL la primera vez que
--              arranca el contenedor). Restringe los permisos públicos y deja la base lista para
--              que Flyway cree las tablas (backend/src/main/resources/db/migration).
-- Fecha de creación: 2026-10-18
-- Última actualización: 2026-10-18
-- Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
-- Versión: 1.0.0

-- Nadie fuera del dueño puede crear objetos en el esquema público.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO arroz;

-- Zona horaria de la base de datos: las fechas se guardan con zona y se muestran en UTC.
ALTER DATABASE arroz SET timezone TO 'UTC';
