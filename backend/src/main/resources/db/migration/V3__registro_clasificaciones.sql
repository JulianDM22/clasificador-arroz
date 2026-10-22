-- Nombre: V3__registro_clasificaciones.sql
-- Descripción: Tabla con el registro de cada clasificación hecha desde la aplicación (sin la
--              foto ni datos de quien la hizo), para las estadísticas del panel del administrador.
-- Fecha de creación: 2026-10-21
-- Última actualización: 2026-10-21
-- Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
-- Versión: 1.0.0

CREATE TABLE clasificaciones (
    id        BIGSERIAL        PRIMARY KEY,
    fecha     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tipo      VARCHAR(20)      NOT NULL CHECK (tipo IN ('UN_MODELO', 'COMPARACION')),
    modelo    VARCHAR(40)      NOT NULL,
    categoria VARCHAR(20)      NOT NULL
        CHECK (categoria IN ('ARBORIO', 'BASMATI', 'IPSALA', 'JASMINE', 'KARACADAG')),
    confianza DOUBLE PRECISION NOT NULL CHECK (confianza BETWEEN 0 AND 1)
);

CREATE INDEX ix_clasificaciones_fecha ON clasificaciones (fecha);
