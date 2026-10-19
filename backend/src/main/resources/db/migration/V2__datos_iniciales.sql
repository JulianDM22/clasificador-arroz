-- Nombre: V2__datos_iniciales.sql
-- Descripción: Productos de ejemplo para que la aplicación no arranque vacía. Los usuarios se
--              crean desde InicializadorUsuarios.java con contraseñas tomadas de variables de
--              entorno, para no dejar hashes en el repositorio.
-- Fecha de creación: 2026-10-17
-- Última actualización: 2026-10-17
-- Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
-- Versión: 1.0.0

INSERT INTO productos (nombre, categoria, descripcion, estado) VALUES
    ('Lote Arborio 2026-01', 'ARBORIO', 'Grano corto y redondo, ideal para risotto', 'ACTIVO'),
    ('Lote Basmati 2026-01', 'BASMATI', 'Grano largo y aromático', 'ACTIVO'),
    ('Lote Ipsala 2026-01', 'IPSALA', 'Grano ancho de origen turco', 'ACTIVO'),
    ('Lote Jasmine 2026-01', 'JASMINE', 'Grano largo con aroma floral', 'INACTIVO'),
    ('Lote Karacadag 2026-01', 'KARACADAG', 'Grano pequeño de la región de Karacadağ', 'ACTIVO');
