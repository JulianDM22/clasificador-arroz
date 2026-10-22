<!--
Nombre: casos_de_prueba.md
Descripción: Lista completa de casos de prueba y matriz de trazabilidad. ARCHIVO GENERADO por
             scripts/listar_casos_prueba.py a partir del código de pruebas: no editar a mano.
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
-->

# Casos de prueba

Total: **237** casos (las pruebas parametrizadas cuentan como un caso aunque se ejecuten varias veces).

## Resumen por tipo

| Tipo | Herramienta | Casos |
|---|---|---|
| Unitaria | JUnit 5 + Mockito | 53 |
| Integración (capa web) | Spring Test (MockMvc) + Mockito | 16 |
| Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | 15 |
| Integración (API + inferencia) | Spring Boot Test + Testcontainers | 14 |
| Seguridad | Spring Security Test + Testcontainers | 14 |
| Unitaria e integración (inferencia) | pytest + TestClient | 24 |
| Unitaria (componentes) | Vitest + Testing Library | 56 |
| Sistema (navegador) | Playwright + axe-core | 34 |
| Sistema (navegador) | Selenium WebDriver | 6 |
| Carga | k6 | 1 |
| Estrés | k6 | 1 |
| Pico | k6 | 1 |
| Mutación | PIT | 1 |
| Seguridad (dinámica) | OWASP ZAP baseline | 1 |

## Matriz de trazabilidad: criterio de aceptación → pruebas

| Criterio | Descripción | Pruebas | Tipos |
|---|---|---|---|
| CA-01.1 | Dado un usuario registrado, cuando envía usuario y contraseña correctos a `POST /api/v1/auth/login`, entonc… | 7 | Seguridad, Sistema, Unitaria |
| CA-01.2 | Dado un usuario, cuando envía una contraseña incorrecta o un usuario inexistente, entonces recibe `401` con… | 6 | Seguridad, Sistema, Unitaria |
| CA-01.3 | Dado cualquier endpoint de productos o de estadísticas, cuando se llama sin token, con un token alterado o … | 8 | Integración, Seguridad, Sistema, Unitaria |
| CA-01.4 | Dado un usuario con rol USUARIO, cuando intenta eliminar un producto, entonces recibe `403`. | 5 | Integración, Seguridad, Sistema, Unitaria |
| CA-01.5 | Dado el formulario de inicio de sesión, cuando se dejan campos vacíos, entonces se muestran mensajes de val… | 4 | Seguridad, Sistema, Unitaria |
| CA-02.1 | Dado un usuario autenticado, cuando envía un producto válido a `POST /api/v1/productos`, entonces recibe `2… | 6 | Integración, Integración y sistema, Sistema, Unitaria |
| CA-02.2 | Dado un producto, cuando el `nombre` está vacío, tiene menos de 3 o más de 100 caracteres, entonces recibe … | 6 | Integración, Sistema, Unitaria |
| CA-02.3 | Dado un producto, cuando la `descripcion` supera 500 caracteres, entonces recibe `400`. 500 caracteres es v… | 2 | Integración, Unitaria |
| CA-02.4 | Dado un producto, cuando `categoria` falta o no es un valor permitido, entonces recibe `400`. | 3 | Integración, Unitaria |
| CA-02.5 | Dado un producto con un `nombre` que ya existe (sin distinguir mayúsculas), cuando se intenta registrar, en… | 5 | Integración, Integración y sistema, Sistema, Unitaria |
| CA-02.6 | Dado un `nombre` o `descripcion` con texto como `<script>` o `' OR 1=1 --`, cuando se registra, entonces se… | 3 | Integración y sistema, Sistema, Unitaria |
| CA-03.1 | Dado un usuario autenticado, cuando llama a `GET /api/v1/productos`, entonces recibe `200` con una página d… | 3 | Integración, Integración y sistema, Unitaria |
| CA-03.2 | Dado el listado, cuando se filtra por `categoria`, `estado` o texto `q` (contenido en el nombre, sin distin… | 7 | Integración y sistema, Sistema, Unitaria |
| CA-03.3 | Dado un `id` existente, cuando se llama a `GET /api/v1/productos/{id}`, entonces recibe `200` con el produc… | 4 | Integración, Unitaria |
| CA-03.4 | Dado el listado, cuando se pide un tamaño de página mayor a 100 o negativo, entonces el tamaño se limita a … | 2 | Integración y sistema, Unitaria |
| CA-04.1 | Dado un producto existente, cuando se envían datos válidos a `PUT /api/v1/productos/{id}`, entonces recibe … | 4 | Integración, Sistema, Unitaria |
| CA-04.2 | Dado un `id` inexistente, cuando se intenta actualizar, entonces recibe `404`. | 2 | Integración y sistema, Unitaria |
| CA-04.3 | Dado datos inválidos o un nombre que ya usa otro producto, cuando se actualiza, entonces recibe `400` o `40… | 2 | Integración y sistema, Unitaria |
| CA-05.1 | Dado un ADMIN y un producto existente, cuando llama a `DELETE /api/v1/productos/{id}`, entonces recibe `204… | 3 | Integración, Sistema, Unitaria |
| CA-05.2 | Dado un `id` inexistente, cuando el ADMIN intenta eliminar, entonces recibe `404`. | 2 | Integración y sistema, Unitaria |
| CA-05.3 | Dado la interfaz, cuando el ADMIN pulsa eliminar, entonces se pide confirmación antes de borrar. | 4 | Sistema, Unitaria |
| CA-06.1 | Dado cualquier persona, cuando envía una imagen JPEG o PNG a `POST /api/v1/clasificaciones`, entonces recib… | 10 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.2 | Dado un archivo que no es JPEG ni PNG (se verifica el contenido real, no solo la extensión) o un archivo va… | 13 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.3 | Dado un archivo de más de 5 MB, cuando se envía, entonces recibe `413`. | 5 | Integración, Unitaria, Unitaria e integración |
| CA-06.4 | Dado que el servicio de inferencia no responde, cuando se pide una clasificación, entonces recibe `503` con… | 6 | Integración, Unitaria, Unitaria e integración |
| CA-06.5 | Dado un integrante del equipo con sesión iniciada, cuando clasifica una foto y pulsa "Registrar como lote",… | 3 | Sistema, Unitaria |
| CA-06.6 | Dado el catálogo de los 5 modelos (CNN propia, EfficientNetB0, ResNet50V2, ViT-B/16, DeiT-S) y el ensamble,… | 11 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.7 | Dado una foto ya clasificada, cuando se pulsa "Comparar los 5 modelos con esta foto" en las opciones avanza… | 10 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.8 | Dado un visitante sin cuenta, cuando entra a la página principal, entonces ve para qué sirve y los pasos de… | 6 | Integración, Sistema, Unitaria |
| CA-06.9 | Dado que la clasificación es pública, cuando una misma dirección IP supera el límite de clasificaciones por… | 3 | Integración, Unitaria |
| CA-07.1 | Dado la cabecera `Accept-Language: en`, cuando la API responde un error, entonces el mensaje está en inglés… | 2 | Integración, Seguridad |
| CA-07.2 | Dado la interfaz, cuando se cambia el idioma, entonces todos los textos visibles cambian sin recargar la pá… | 4 | Sistema, Unitaria |
| CA-08.1 | Dado una pantalla de 375 px de ancho (celular), cuando se abre cualquier vista, entonces no hay desplazamie… | 1 | Sistema |
| CA-08.2 | Dado la interfaz, cuando se analiza con axe-core, entonces no hay violaciones de accesibilidad de impacto s… | 3 | Sistema |
| CA-08.3 | Dado la interfaz, cuando se cambia entre tema claro y oscuro, entonces todos los colores provienen de los t… | 2 | Sistema, Unitaria |
| CA-08.4 | Dado el formulario, cuando se navega solo con teclado, entonces se puede llenar y enviar, y cada campo tien… | 3 | Sistema |
| CA-09.1 | Dado 50 usuarios simultáneos consultando y registrando productos durante 2 minutos, entonces el percentil 9… | 1 | Carga |
| CA-09.2 | Dado el sistema desplegado, cuando se consulta `/actuator/health`, entonces responde `UP` e incluye el esta… | 1 | Integración y sistema |
| CA-09.3 | Dado el servicio de clasificación, cuando recibe una imagen, entonces responde en menos de 1 s (sin contar … | 1 | Unitaria e integración |
| CA-10.1 | Dado un ADMIN, cuando abre el panel (`GET /api/v1/estadisticas`), entonces ve el total de lotes, activos e … | 16 | Integración, Seguridad, Sistema, Unitaria |
| CA-10.2 | Dado un lote, cuando el ADMIN lo activa o desactiva (`PATCH /api/v1/productos/{id}/estado`), entonces el es… | 12 | Integración y sistema, Sistema, Unitaria |
| CA-10.3 | Dado un lote nuevo, cuando se registra, entonces queda ACTIVO aunque la petición diga otro estado. | 3 | Integración y sistema, Unitaria |

Criterios sin prueba automática: ninguno.

## Lista completa

| # | Caso | Tipo | Herramienta | Archivo |
|---|---|---|---|---|
| 1 | CA-01.1 emite un JWT con el usuario, el rol y vigencia de 60 minutos | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/AuthServiceTest.java` |
| 2 | CA-01.1 el rol USUARIO queda en el token | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/AuthServiceTest.java` |
| 3 | CA-01.2 propaga el error de credenciales sin emitir token | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/AuthServiceTest.java` |
| 4 | CA-06.6 envía el modelo elegido como parámetro y devuelve su predicción | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 5 | CA-06.6 el ensamble se pide como un modelo más | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 6 | CA-06.6 ids de modelo con caracteres no permitidos se rechazan sin llamar al servicio | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 7 | CA-06.6 un modelo que el servicio no conoce (404) se informa como modelo desconocido | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 8 | CA-06.2 una imagen que pasa la firma pero no se puede leer (400) se informa como archivo ilegible | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 9 | CA-06.7 la comparación devuelve cada modelo, el ensamble y el consenso | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 10 | CA-06.7 una comparación sin modelos se trata como servicio no disponible | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 11 | CA-06.7 la comparación también valida la imagen antes de llamar al servicio | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 12 | CA-06.7 el catálogo trae las métricas de cada modelo | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 13 | CA-06.4 un catálogo vacío se trata como servicio no disponible | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionModelosTest.java` |
| 14 | CA-06.1 envía un JPEG y devuelve la variedad sugerida | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 15 | CA-10.1 cada clasificación exitosa se registra (sin la foto) para las estadísticas | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 16 | CA-10.1 si no se puede registrar, la clasificación igual se entrega | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 17 | CA-06.1 reenvía la imagen en la parte 'archivo' conservando el nombre original | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 18 | CA-06.1 si el archivo no trae nombre se envía como 'imagen' | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 19 | CA-06.2 valor límite: un archivo del tamaño exacto de la firma JPEG o PNG es aceptado | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 20 | CA-06.1 acepta PNG aunque el nombre no tenga extensión | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 21 | CA-06.2 rechaza un archivo vacío | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 22 | CA-06.2 rechaza un archivo nulo | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 23 | CA-06.2 rechaza un texto disfrazado de .jpg (se revisa el contenido real) | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 24 | CA-06.2 rechaza archivos más cortos que la firma | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 25 | CA-06.3 límite de tamaño: 5 MB exactos se aceptan, 5 MB + 1 byte no | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 26 | CA-06.4 un error del servicio de inferencia se convierte en 503 | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 27 | CA-06.4 una respuesta sin categoría se trata como servicio no disponible | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 28 | CA-10.1 lotes: total, activos, inactivos y por variedad (las que no tienen lotes en 0) | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/EstadisticasServiceTest.java` |
| 29 | CA-10.1 clasificaciones: total, por variedad y por modelo en orden de uso | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/EstadisticasServiceTest.java` |
| 30 | CA-10.1 los días se cuentan en hora de Colombia: 7 días = desde el 14-oct a las 00:00 (-05:00) | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/EstadisticasServiceTest.java` |
| 31 | CA-10.1 la serie tiene 14 días hasta hoy, con 0 en los días sin clasificaciones | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/EstadisticasServiceTest.java` |
| 32 | la serie también acepta el día como LocalDate | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/EstadisticasServiceTest.java` |
| 33 | recorta nombre y descripción, y el lote nuevo queda ACTIVO (CA-10.3) | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 34 | una descripción vacía se guarda como nula | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 35 | CA-10.2 actualizar copia los datos pero no cambia el estado | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 36 | la respuesta copia todos los campos | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 37 | CA-02.1 guarda el producto con el nombre recortado y lo devuelve | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 38 | CA-02.5 rechaza un nombre que ya existe sin guardar nada | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 39 | CA-03.3 devuelve el producto existente | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 40 | CA-03.3 lanza 404 si no existe | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 41 | CA-04.1 copia los datos nuevos y guarda, sin cambiar el estado | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 42 | CA-04.2 lanza 404 si no existe y no consulta duplicados | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 43 | CA-04.3 rechaza un nombre usado por otro producto | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 44 | CA-10.2 guarda el nuevo estado y lo devuelve | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 45 | CA-10.2 lanza 404 si el lote no existe | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 46 | CA-05.1 elimina el producto existente | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 47 | CA-05.2 lanza 404 si no existe | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 48 | CA-03.2 convierte el texto a patrón LIKE en minúsculas y escapa comodines | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 49 | CA-03.2 un texto vacío no filtra | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 50 | CA-03.4 límites del tamaño de página | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 51 | CA-01.1 carga el usuario con su hash y su rol | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/UsuarioDetailsServiceTest.java` |
| 52 | un usuario desactivado queda deshabilitado | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/UsuarioDetailsServiceTest.java` |
| 53 | CA-01.2 un usuario inexistente lanza UsernameNotFoundException | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/UsuarioDetailsServiceTest.java` |
| 54 | CA-02.1 POST válido responde 201 con Location | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 55 | CA-02.2 valores límite de la longitud del nombre | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 56 | CA-02.3 valores límite de la longitud de la descripción | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 57 | CA-02.2 nombre vacío: 400 con el error en el campo nombre, en español | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 58 | CA-02.4 sin categoría: 400 con el error en el campo categoria | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 59 | CA-02.4 categoría no permitida: 400 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 60 | CA-02.5 nombre duplicado: 409 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 61 | CA-07.1 con Accept-Language: en los mensajes salen en inglés | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 62 | CA-03.1 GET lista con paginación | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 63 | CA-03.3 id inexistente: 404 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 64 | CA-03.3 id no numérico: 400 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 65 | CA-04.1 PUT válido responde 200 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 66 | CA-01.4 USUARIO no puede eliminar: 403 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 67 | CA-05.1 ADMIN elimina: 204 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 68 | CA-01.3 sin token: 401 en JSON | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 69 | JSON mal formado: 400 sin detalles internos | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 70 | Flyway cargó los 5 productos de ejemplo y el listado ordena por id (CA-03.1) | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 71 | Ciclo completo: crear → consultar → actualizar → eliminar (ADMIN) → 404 (CA-02.1, 03.3, 04.1, 05.1) | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 72 | CA-02.1 la cabecera Location apunta al producto creado | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 73 | CA-02.5 nombre duplicado sin distinguir mayúsculas: 409 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 74 | CA-04.3 actualizar con el nombre de otro producto: 409 y no cambia | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 75 | CA-04.2 / CA-05.2 actualizar o eliminar un id inexistente: 404 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 76 | CA-03.2 filtros por categoría, estado y texto | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 77 | CA-10.2 solo ADMIN activa y desactiva un lote; el operario recibe 403 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 78 | CA-10.2 estado inválido o ausente: 400; lote inexistente: 404 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 79 | CA-10.3 un lote nuevo siempre queda ACTIVO, aunque el cuerpo pida otro estado | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 80 | CA-03.2 los comodines % y _ del texto se buscan literalmente | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 81 | CA-03.4 el tamaño de página se limita a 100 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 82 | CA-02.6 inyección SQL y <script> se guardan como texto literal | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 83 | CA-09.2 /actuator/health responde UP e incluye la base de datos | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 84 | La documentación OpenAPI es pública y describe los endpoints | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 85 | CA-06.1 / CA-06.8 cualquier visitante, sin iniciar sesión, clasifica una foto (el back-end envía X-API-Key) | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 86 | CA-06.6 clasificar con el modelo elegido | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 87 | CA-06.6 un modelo inexistente: 400 con mensaje claro | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 88 | CA-06.7 comparar los modelos devuelve cada predicción, el ensamble y el consenso | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 89 | CA-06.7 el catálogo de modelos expone las métricas de test | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 90 | CA-06.8 el catálogo de modelos es público | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 91 | CA-10.1 cada clasificación queda registrada y se ve en las estadísticas del admin | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 92 | CA-10.1 una clasificación fallida no se registra | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 93 | CA-06.2 un archivo que no es imagen: 400 | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 94 | CA-06.2 sin archivo: 400 | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 95 | CA-06.3 una imagen de más de 5 MB: 413 | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 96 | CA-06.9 al superar el límite por IP responde 429 con Retry-After; otra IP no se afecta | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 97 | CA-06.9 el límite no aplica al inventario del equipo | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 98 | CA-06.4 responde 503 con mensaje claro y el CRUD sigue funcionando | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 99 | CA-01.1 login correcto devuelve token Bearer con rol | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 100 | CA-01.2 contraseña incorrecta y usuario inexistente dan el mismo 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 101 | CA-01.5 login con campos vacíos: 400 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 102 | CA-01.3 sin token: 401 en el inventario y en las estadísticas | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 103 | CA-10.1 las estadísticas son solo para ADMIN: el operario recibe 403 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 104 | CA-01.3 token con la firma alterada: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 105 | CA-01.3 token vencido: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 106 | CA-01.3 token firmado con otra clave: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 107 | CA-01.4 el operario (USUARIO) no puede eliminar: 403 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 108 | CA-07.1 errores de seguridad en inglés con Accept-Language: en | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 109 | CORS: el origen del front-end está permitido | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 110 | CORS: un origen desconocido es rechazado | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 111 | Cabeceras de seguridad presentes (nosniff, anti-iframe, sin caché) | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 112 | Una ruta inexistente no expone detalles internos | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 113 | test_ca_06_1_sin_modelo_usa_el_modelo_por_defecto | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 114 | test_ca_06_6_clasifica_con_el_modelo_elegido | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 115 | test_ca_06_6_ensamble_es_el_voto_suave_ponderado | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 116 | test_ca_06_6_modelo_desconocido_da_404_con_las_opciones | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 117 | test_nombre_de_modelo_con_caracteres_no_permitidos_da_422 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 118 | test_ca_06_7_comparar_devuelve_todos_los_modelos_y_el_ensamble | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 119 | test_ca_06_7_catalogo_con_metricas | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 120 | test_ca_06_1_png_y_escala_de_grises_se_aceptan | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 121 | test_ca_06_2_contenido_invalido_da_400 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 122 | test_ca_06_2_formato_no_permitido_da_400 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 123 | test_ca_06_3_mas_de_5_mb_da_400 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 124 | test_sin_archivo_da_422 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 125 | test_ca_06_4_sin_modelos_cargados_da_503 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 126 | test_salud_con_modelos | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 127 | test_clave_de_api | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 128 | test_metricas_cuentan_predicciones_por_modelo | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 129 | test_preprocesar_redimensiona_y_conserva_rango | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 130 | test_catalogo_normaliza_probabilidades_y_pesos | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 131 | test_modelo_por_defecto_inexistente_usa_el_primero | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 132 | test_errores_de_dominio | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 133 | test_todos_los_modelos_del_catalogo_cargan | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 134 | test_cada_modelo_devuelve_probabilidades_validas | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 135 | test_ca_09_3_cada_modelo_clasifica_en_menos_de_un_segundo | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 136 | test_cada_modelo_acierta_las_fotos_reales_de_test | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 137 | CA-06.8 un visitante entra directo a clasificar; solo ve  | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 138 | CA-01.3 sin sesión, el inventario lleva al acceso del equipo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 139 | las rutas antiguas redirigen a las nuevas | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 140 | CA-10.1 el operario ve  | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 141 | CA-10.1 el administrador ve  | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 142 | cerrar sesión vuelve a la página pública | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 143 | una ruta inexistente muestra  | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/App.test.jsx` |
| 144 | CA-02.2 un nombre de 2 caracteres muestra el error y no envía | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 145 | CA-06.5 la variedad que sugirió la foto llega precargada y se envía con el lote (sin estado) | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 146 | CA-10.3 el formulario no pide estado: avisa que el lote queda activo y ofrece clasificar una foto | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 147 | CA-02.5 el error 409 de la API se muestra al usuario | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 148 | CA-04.1 en modo edición carga el producto y envía la actualización | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 149 | explica para qué es la página y los 3 pasos | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 150 | CA-06.1 / CA-06.8 un visitante sin sesión sube una foto y ve la variedad, la seguridad y la descripción | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 151 | con una foto de ejemplo clasifica sin que el visitante tenga que subir nada | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 152 | con poca seguridad recomienda probar con otra foto | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 153 | nivelConfianza: alto desde 90 %, medio desde 60 %, bajo por debajo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 154 | CA-06.2 una foto que no es JPEG/PNG se rechaza sin llamar a la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 155 | CA-06.3 una foto de más de 5 MB se rechaza sin llamar a la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 156 | CA-06.4 si el servicio no está disponible muestra su mensaje y deja intentar de nuevo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 157 | CA-06.9 al superar el límite de clasificaciones se muestra el mensaje de la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 158 | "Clasificar otra foto | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 159 | CA-06.6 en opciones avanzadas se elige otro modelo y la misma foto se vuelve a clasificar | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 160 | CA-06.7 comparar los 5 modelos muestra cada predicción, el ensamble y las métricas | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 161 | si la comparación falla se muestra el error | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 162 | sin catálogo igual se puede clasificar con el modelo por defecto | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 163 | avisa cuando los modelos cargados son de prueba | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 164 | CA-06.5 con sesión del equipo,  | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaInicio.test.jsx` |
| 165 | CA-01.5 con campos vacíos muestra errores y no llama a la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 166 | CA-01.2 muestra el mensaje de la API si las credenciales fallan | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 167 | CA-01.1 con credenciales correctas guarda la sesión y entra | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 168 | CA-07.2 cambiar el idioma traduce la pantalla y se recuerda | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 169 | CA-08.3 el tema elegido se recuerda | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 170 | CA-10.1 muestra las cifras del inventario y del uso, con formato colombiano | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaPanel.test.jsx` |
| 171 | CA-10.1 las gráficas tienen el detalle de cada barra y sus datos en tabla | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaPanel.test.jsx` |
| 172 | sin clasificaciones muestra un mensaje en lugar de la gráfica de modelos | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaPanel.test.jsx` |
| 173 | un error se muestra y  | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaPanel.test.jsx` |
| 174 | CA-03.1 muestra los productos que devuelve la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 175 | CA-02.6 el texto con etiquetas HTML se muestra literal, sin ejecutarse | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 176 | CA-01.4 / CA-10.2 el USUARIO no ve eliminar ni el interruptor de estado, y se le explica su rol | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 177 | CA-10.2 el ADMIN desactiva un lote con el interruptor y la fila se actualiza | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 178 | CA-10.2 el ADMIN activa un lote inactivo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 179 | CA-10.2 si la API rechaza el cambio de estado se muestra el error y la fila no cambia | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 180 | CA-05.3 el ADMIN debe confirmar antes de eliminar | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 181 | CA-05.3 cancelar no elimina | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 182 | CA-03.2 el filtro de texto consulta la API después de escribir | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 183 | sin resultados muestra un mensaje | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 184 | un error de red se muestra al usuario | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 185 | CA-02.2 nombre de %i caracteres → válido=%s | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 186 | CA-02.2 un nombre solo con espacios no es válido | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 187 | CA-02.3 descripción de %i caracteres → válido=%s | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 188 | CA-02.4 la variedad debe ser un valor permitido | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 189 | CA-07.2 los mensajes salen en el idioma activo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 190 | CA-01.5 usuario y contraseña son obligatorios | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 191 | CA-06.2 acepta JPEG y PNG y rechaza otros tipos | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 192 | CA-06.3 límite de 5 MB: exacto se acepta, un byte más no | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 193 | CA-01.1 el administrador inicia sesión y ve su rol | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 194 | CA-01.2 una contraseña incorrecta muestra un error genérico | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 195 | CA-01.3 sin sesión, una página del equipo redirige al acceso del equipo | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 196 | CA-01.5 con campos vacíos no se envía el formulario | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 197 | desde el acceso del equipo se puede volver a clasificar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 198 | cerrar sesión borra la sesión y vuelve a la página pública | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 199 | CA-06.8 / CA-06.1 un visitante sin cuenta clasifica una foto de ejemplo y ve la variedad | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 200 | CA-06.1 subir una foto propia muestra un resultado y se puede clasificar otra | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 201 | CA-06.2 un archivo que no es imagen se rechaza en la interfaz | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 202 | CA-06.6 clasificar con el modelo que elige el visitante | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 203 | CA-06.7 comparar los 5 modelos con la misma foto y ver sus métricas | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 204 | CA-06.5 un operario clasifica y registra el resultado como lote con la variedad sugerida | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 205 | CA-10.1 el administrador ve el panel con las cifras y las gráficas | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/panel.spec.js` |
| 206 | CA-10.1 una clasificación pública aparece en las estadísticas | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/panel.spec.js` |
| 207 | CA-10.1 el operario no tiene panel: el enlace no aparece y la ruta lo devuelve a los lotes | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/panel.spec.js` |
| 208 | CA-10.2 el administrador desactiva y vuelve a activar un lote | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/panel.spec.js` |
| 209 | CA-10.2 el operario no ve el interruptor de estado | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/panel.spec.js` |
| 210 | CA-02.1 / CA-03.2 registrar un lote (queda activo) y encontrarlo con el filtro | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 211 | CA-02.2 un nombre de 2 caracteres no se puede guardar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 212 | CA-02.5 un nombre repetido muestra el conflicto de la API | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 213 | CA-02.6 un nombre con HTML se muestra como texto y no se ejecuta | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 214 | CA-04.1 editar un lote cambia sus datos | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 215 | CA-01.4 el operario no ve la opción de eliminar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 216 | CA-05.1 / CA-05.3 el administrador elimina tras confirmar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 217 | CA-07.2 cambiar a inglés traduce la página pública y se recuerda al recargar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 218 | CA-07.2 el inventario también se traduce | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 219 | CA-08.3 el tema oscuro cambia el fondo y se recuerda al recargar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 220 | CA-08.2 página pública sin violaciones graves de accesibilidad, también con resultado @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 221 | CA-08.2 acceso del equipo sin violaciones graves de accesibilidad @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 222 | CA-08.2 inventario, formulario y panel sin violaciones graves de accesibilidad @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 223 | CA-08.1 sin desplazamiento horizontal en la página pública, el inventario y el formulario @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 224 | CA-08.4 el acceso del equipo se completa solo con teclado | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 225 | CA-08.4 una foto de ejemplo se clasifica solo con teclado | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 226 | CA-08.4 el enlace  | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 227 | CA-06.8 un visitante sin cuenta clasifica una foto de ejemplo | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 228 | CA-01.2 credenciales incorrectas muestran el error | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 229 | CA-01.1 / CA-02.1 / CA-03.2 el operario inicia sesión, registra un lote y lo encuentra | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 230 | CA-01.4 / CA-10.2 el operario no tiene botones de eliminar ni interruptores de estado | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 231 | CA-05.3 el administrador ve eliminar y el diálogo pide confirmación | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 232 | CA-01.3 después de cerrar sesión la página del equipo redirige al acceso del equipo | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 233 | CA-09.1 50 usuarios durante 2 min: p95 < 500 ms y errores < 1 % | Carga | k6 | `pruebas/carga/carga.js` |
| 234 | Escalones de 50 a 300 usuarios hasta encontrar el punto de quiebre | Estrés | k6 | `pruebas/carga/estres.js` |
| 235 | Salto de 10 a 250 usuarios en 10 s: errores < 5 % y recuperación | Pico | k6 | `pruebas/carga/pico.js` |
| 236 | Mutantes en servicios y mapeador: mínimo 70 % detectados (resultado: 100 %) | Mutación | PIT | `backend/pom.xml` |
| 237 | Escaneo pasivo del front-end desplegado en cada integración | Seguridad (dinámica) | OWASP ZAP baseline | `.github/workflows/ci-cd.yml` |
