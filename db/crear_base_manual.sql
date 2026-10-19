-- Nombre: crear_base_manual.sql
-- Descripción: Creación de la base de datos y del usuario cuando se usa un PostgreSQL instalado
--              (sin Docker). Ejecutar como superusuario:
--                psql -U postgres -f db/crear_base_manual.sql
--              Después, al arrancar el back-end, Flyway crea las tablas y carga los datos
--              iniciales (V1__crear_esquema.sql y V2__datos_iniciales.sql).
-- Fecha de creación: 2026-10-18
-- Última actualización: 2026-10-18
-- Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
-- Versión: 1.0.0

-- Cambiar la contraseña antes de usarla fuera del computador local.
CREATE ROLE arroz WITH LOGIN PASSWORD 'arroz_local';
CREATE DATABASE arroz OWNER arroz ENCODING 'UTF8';

\connect arroz
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO arroz;
ALTER DATABASE arroz SET timezone TO 'UTC';
