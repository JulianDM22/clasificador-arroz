-- Nombre: V1__crear_esquema.sql
-- Descripción: Creación de las tablas productos y usuarios (migración Flyway; se ejecuta sola
--              al arrancar el back-end).
-- Fecha de creación: 2026-10-17
-- Última actualización: 2026-10-17
-- Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
-- Versión: 1.0.0

CREATE TABLE productos (
    id                  BIGSERIAL    PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    categoria           VARCHAR(20)  NOT NULL
        CHECK (categoria IN ('ARBORIO', 'BASMATI', 'IPSALA', 'JASMINE', 'KARACADAG')),
    descripcion         VARCHAR(500),
    estado              VARCHAR(20)  NOT NULL
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    fecha_creacion      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT ck_productos_nombre_longitud CHECK (char_length(nombre) BETWEEN 3 AND 100)
);

-- El nombre es único sin distinguir mayúsculas (CA-02.5).
CREATE UNIQUE INDEX ux_productos_nombre ON productos (LOWER(nombre));
CREATE INDEX ix_productos_categoria ON productos (categoria);
CREATE INDEX ix_productos_estado ON productos (estado);

CREATE TABLE usuarios (
    id            BIGSERIAL    PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('USUARIO', 'ADMIN')),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE
);
