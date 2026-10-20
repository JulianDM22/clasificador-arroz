<!--
Nombre: casos_de_prueba.md
Descripción: Lista completa de casos de prueba y matriz de trazabilidad. ARCHIVO GENERADO por
             scripts/listar_casos_prueba.py a partir del código de pruebas: no editar a mano.
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
-->

# Casos de prueba

Total: **188** casos (las pruebas parametrizadas cuentan como un caso aunque se ejecuten varias veces).

## Resumen por tipo

| Tipo | Herramienta | Casos |
|---|---|---|
| Unitaria | JUnit 5 + Mockito | 43 |
| Integración (capa web) | Spring Test (MockMvc) + Mockito | 16 |
| Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | 12 |
| Integración (API + inferencia) | Spring Boot Test + Testcontainers | 10 |
| Seguridad | Spring Security Test + Testcontainers | 13 |
| Unitaria e integración (inferencia) | pytest + TestClient | 24 |
| Unitaria (componentes) | Vitest + Testing Library | 36 |
| Sistema (navegador) | Playwright + axe-core | 24 |
| Sistema (navegador) | Selenium WebDriver | 5 |
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
| CA-01.3 | Dado cualquier endpoint de productos o clasificación, cuando se llama sin token, con un token alterado o ve… | 8 | Integración, Seguridad, Sistema |
| CA-01.4 | Dado un usuario con rol USUARIO, cuando intenta eliminar un producto, entonces recibe `403`. | 5 | Integración, Seguridad, Sistema, Unitaria |
| CA-01.5 | Dado el formulario de inicio de sesión, cuando se dejan campos vacíos, entonces se muestran mensajes de val… | 4 | Seguridad, Sistema, Unitaria |
| CA-02.1 | Dado un usuario autenticado, cuando envía un producto válido a `POST /api/v1/productos`, entonces recibe `2… | 6 | Integración, Integración y sistema, Sistema, Unitaria |
| CA-02.2 | Dado un producto, cuando el `nombre` está vacío, tiene menos de 3 o más de 100 caracteres, entonces recibe … | 6 | Integración, Sistema, Unitaria |
| CA-02.3 | Dado un producto, cuando la `descripcion` supera 500 caracteres, entonces recibe `400`. 500 caracteres es v… | 2 | Integración, Unitaria |
| CA-02.4 | Dado un producto, cuando `categoria` o `estado` faltan o no son valores permitidos, entonces recibe `400`. | 3 | Integración, Unitaria |
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
| CA-06.1 | Dado un usuario autenticado, cuando envía una imagen JPEG o PNG a `POST /api/v1/clasificaciones`, entonces … | 8 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.2 | Dado un archivo que no es JPEG ni PNG (se verifica el contenido real, no solo la extensión) o un archivo va… | 13 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.3 | Dado un archivo de más de 5 MB, cuando se envía, entonces recibe `413`. | 4 | Integración, Unitaria, Unitaria e integración |
| CA-06.4 | Dado que el servicio de inferencia no responde, cuando se pide una clasificación, entonces recibe `503` con… | 6 | Integración, Unitaria, Unitaria e integración |
| CA-06.5 | Dado el formulario de producto en la interfaz, cuando se clasifica una foto, entonces la categoría sugerida… | 3 | Sistema, Unitaria |
| CA-06.6 | Dado el catálogo de los 5 modelos (CNN propia, EfficientNetB0, ResNet50V2, ViT-B/16, DeiT-S) y el ensamble,… | 14 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-06.7 | Dado el modo "Comparar los 5 modelos", cuando se clasifica una foto, entonces se muestra la predicción, la … | 12 | Integración, Sistema, Unitaria, Unitaria e integración |
| CA-07.1 | Dado la cabecera `Accept-Language: en`, cuando la API responde un error, entonces el mensaje está en inglés… | 2 | Integración, Seguridad |
| CA-07.2 | Dado la interfaz, cuando se cambia el idioma, entonces todos los textos visibles cambian sin recargar la pá… | 3 | Sistema, Unitaria |
| CA-08.1 | Dado una pantalla de 375 px de ancho (celular), cuando se abre cualquier vista, entonces no hay desplazamie… | 1 | Sistema |
| CA-08.2 | Dado la interfaz, cuando se analiza con axe-core, entonces no hay violaciones de accesibilidad de impacto s… | 2 | Sistema |
| CA-08.3 | Dado la interfaz, cuando se cambia entre tema claro y oscuro, entonces todos los colores provienen de los t… | 2 | Sistema, Unitaria |
| CA-08.4 | Dado el formulario, cuando se navega solo con teclado, entonces se puede llenar y enviar, y cada campo tien… | 2 | Sistema |
| CA-09.1 | Dado 50 usuarios simultáneos consultando y registrando productos durante 2 minutos, entonces el percentil 9… | 1 | Carga |
| CA-09.2 | Dado el sistema desplegado, cuando se consulta `/actuator/health`, entonces responde `UP` e incluye el esta… | 1 | Integración y sistema |
| CA-09.3 | Dado el servicio de clasificación, cuando recibe una imagen, entonces responde en menos de 1 s (sin contar … | 1 | Unitaria e integración |

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
| 15 | CA-06.1 reenvía la imagen en la parte 'archivo' conservando el nombre original | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 16 | CA-06.1 si el archivo no trae nombre se envía como 'imagen' | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 17 | CA-06.2 valor límite: un archivo del tamaño exacto de la firma JPEG o PNG es aceptado | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 18 | CA-06.1 acepta PNG aunque el nombre no tenga extensión | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 19 | CA-06.2 rechaza un archivo vacío | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 20 | CA-06.2 rechaza un archivo nulo | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 21 | CA-06.2 rechaza un texto disfrazado de .jpg (se revisa el contenido real) | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 22 | CA-06.2 rechaza archivos más cortos que la firma | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 23 | CA-06.3 límite de tamaño: 5 MB exactos se aceptan, 5 MB + 1 byte no | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 24 | CA-06.4 un error del servicio de inferencia se convierte en 503 | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 25 | CA-06.4 una respuesta sin categoría se trata como servicio no disponible | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ClasificacionServiceTest.java` |
| 26 | recorta nombre y descripción | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 27 | una descripción vacía se guarda como nula | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 28 | la respuesta copia todos los campos | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoMapperTest.java` |
| 29 | CA-02.1 guarda el producto con el nombre recortado y lo devuelve | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 30 | CA-02.5 rechaza un nombre que ya existe sin guardar nada | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 31 | CA-03.3 devuelve el producto existente | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 32 | CA-03.3 lanza 404 si no existe | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 33 | CA-04.1 copia los datos nuevos y guarda | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 34 | CA-04.2 lanza 404 si no existe y no consulta duplicados | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 35 | CA-04.3 rechaza un nombre usado por otro producto | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 36 | CA-05.1 elimina el producto existente | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 37 | CA-05.2 lanza 404 si no existe | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 38 | CA-03.2 convierte el texto a patrón LIKE en minúsculas y escapa comodines | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 39 | CA-03.2 un texto vacío no filtra | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 40 | CA-03.4 límites del tamaño de página | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/ProductoServiceTest.java` |
| 41 | CA-01.1 carga el usuario con su hash y su rol | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/UsuarioDetailsServiceTest.java` |
| 42 | un usuario desactivado queda deshabilitado | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/UsuarioDetailsServiceTest.java` |
| 43 | CA-01.2 un usuario inexistente lanza UsernameNotFoundException | Unitaria | JUnit 5 + Mockito | `backend/src/test/java/com/arroz/clasificador/unit/UsuarioDetailsServiceTest.java` |
| 44 | CA-02.1 POST válido responde 201 con Location | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 45 | CA-02.2 valores límite de la longitud del nombre | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 46 | CA-02.3 valores límite de la longitud de la descripción | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 47 | CA-02.2 nombre vacío: 400 con el error en el campo nombre, en español | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 48 | CA-02.4 sin categoría ni estado: 400 con ambos errores | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 49 | CA-02.4 categoría no permitida: 400 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 50 | CA-02.5 nombre duplicado: 409 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 51 | CA-07.1 con Accept-Language: en los mensajes salen en inglés | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 52 | CA-03.1 GET lista con paginación | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 53 | CA-03.3 id inexistente: 404 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 54 | CA-03.3 id no numérico: 400 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 55 | CA-04.1 PUT válido responde 200 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 56 | CA-01.4 USUARIO no puede eliminar: 403 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 57 | CA-05.1 ADMIN elimina: 204 | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 58 | CA-01.3 sin token: 401 en JSON | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 59 | JSON mal formado: 400 sin detalles internos | Integración (capa web) | Spring Test (MockMvc) + Mockito | `backend/src/test/java/com/arroz/clasificador/web/ProductoControllerTest.java` |
| 60 | Flyway cargó los 5 productos de ejemplo y el listado ordena por id (CA-03.1) | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 61 | Ciclo completo: crear → consultar → actualizar → eliminar (ADMIN) → 404 (CA-02.1, 03.3, 04.1, 05.1) | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 62 | CA-02.1 la cabecera Location apunta al producto creado | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 63 | CA-02.5 nombre duplicado sin distinguir mayúsculas: 409 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 64 | CA-04.3 actualizar con el nombre de otro producto: 409 y no cambia | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 65 | CA-04.2 / CA-05.2 actualizar o eliminar un id inexistente: 404 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 66 | CA-03.2 filtros por categoría, estado y texto | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 67 | CA-03.2 los comodines % y _ del texto se buscan literalmente | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 68 | CA-03.4 el tamaño de página se limita a 100 | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 69 | CA-02.6 inyección SQL y <script> se guardan como texto literal | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 70 | CA-09.2 /actuator/health responde UP e incluye la base de datos | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 71 | La documentación OpenAPI es pública y describe los endpoints | Integración y sistema (API + PostgreSQL) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ProductoIntegrationTest.java` |
| 72 | CA-06.1 una foto JPEG devuelve la variedad sugerida (el back-end envía la clave X-API-Key) | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 73 | CA-06.6 clasificar con el modelo elegido | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 74 | CA-06.6 un modelo inexistente: 400 con mensaje claro | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 75 | CA-06.7 comparar los modelos devuelve cada predicción, el ensamble y el consenso | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 76 | CA-06.7 el catálogo de modelos expone las métricas de test | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 77 | CA-01.3 el catálogo de modelos exige sesión | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 78 | CA-06.2 un archivo que no es imagen: 400 | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 79 | CA-06.2 sin archivo: 400 | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 80 | CA-06.3 una imagen de más de 5 MB: 413 | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 81 | CA-06.4 responde 503 con mensaje claro y el CRUD sigue funcionando | Integración (API + inferencia) | Spring Boot Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/ClasificacionIntegrationTest.java` |
| 82 | CA-01.1 login correcto devuelve token Bearer con rol | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 83 | CA-01.2 contraseña incorrecta y usuario inexistente dan el mismo 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 84 | CA-01.5 login con campos vacíos: 400 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 85 | CA-01.3 sin token: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 86 | CA-01.3 token con la firma alterada: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 87 | CA-01.3 token vencido: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 88 | CA-01.3 token firmado con otra clave: 401 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 89 | CA-01.4 el operario (USUARIO) no puede eliminar: 403 | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 90 | CA-07.1 errores de seguridad en inglés con Accept-Language: en | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 91 | CORS: el origen del front-end está permitido | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 92 | CORS: un origen desconocido es rechazado | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 93 | Cabeceras de seguridad presentes (nosniff, anti-iframe, sin caché) | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 94 | Una ruta inexistente no expone detalles internos | Seguridad | Spring Security Test + Testcontainers | `backend/src/test/java/com/arroz/clasificador/integration/SeguridadIntegrationTest.java` |
| 95 | test_ca_06_1_sin_modelo_usa_el_modelo_por_defecto | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 96 | test_ca_06_6_clasifica_con_el_modelo_elegido | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 97 | test_ca_06_6_ensamble_es_el_voto_suave_ponderado | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 98 | test_ca_06_6_modelo_desconocido_da_404_con_las_opciones | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 99 | test_nombre_de_modelo_con_caracteres_no_permitidos_da_422 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 100 | test_ca_06_7_comparar_devuelve_todos_los_modelos_y_el_ensamble | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 101 | test_ca_06_7_catalogo_con_metricas | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 102 | test_ca_06_1_png_y_escala_de_grises_se_aceptan | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 103 | test_ca_06_2_contenido_invalido_da_400 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 104 | test_ca_06_2_formato_no_permitido_da_400 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 105 | test_ca_06_3_mas_de_5_mb_da_400 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 106 | test_sin_archivo_da_422 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 107 | test_ca_06_4_sin_modelos_cargados_da_503 | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 108 | test_salud_con_modelos | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 109 | test_clave_de_api | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 110 | test_metricas_cuentan_predicciones_por_modelo | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 111 | test_preprocesar_redimensiona_y_conserva_rango | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 112 | test_catalogo_normaliza_probabilidades_y_pesos | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 113 | test_modelo_por_defecto_inexistente_usa_el_primero | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 114 | test_errores_de_dominio | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_api.py` |
| 115 | test_todos_los_modelos_del_catalogo_cargan | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 116 | test_cada_modelo_devuelve_probabilidades_validas | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 117 | test_ca_09_3_cada_modelo_clasifica_en_menos_de_un_segundo | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 118 | test_cada_modelo_acierta_las_fotos_reales_de_test | Unitaria e integración (inferencia) | pytest + TestClient | `inferencia/tests/test_modelo_real.py` |
| 119 | CA-06.6 por defecto usa el modelo recomendado (ResNet50V2) | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 120 | CA-06.6 el selector ofrece los 5 modelos con su exactitud y el ensamble | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 121 | CA-06.6 elegir otro modelo vuelve a clasificar la misma foto con ese modelo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 122 | CA-06.6 se puede clasificar con el ensamble | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 123 | CA-06.7 comparar muestra la predicción de los 5 modelos, el ensamble y si hay consenso | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 124 | CA-06.7 cambiar de modo vuelve a procesar la foto ya elegida | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 125 | CA-06.7 las métricas de test de los 5 modelos están disponibles | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 126 | avisa cuando los modelos cargados son de prueba | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 127 | si el catálogo no responde, igual se puede clasificar con el modelo por defecto del servidor | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/componentes/ClasificadorFoto.test.jsx` |
| 128 | CA-02.2 un nombre de 2 caracteres muestra el error y no envía | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 129 | CA-06.5 la foto clasificada precarga la categoría y se envía con el producto | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 130 | CA-06.2 una foto que no es JPEG/PNG se rechaza sin llamar a la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 131 | CA-06.4 si el servicio de clasificación no está disponible se muestra su mensaje | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 132 | CA-02.5 el error 409 de la API se muestra al usuario | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 133 | CA-04.1 en modo edición carga el producto y envía la actualización | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaFormularioProducto.test.jsx` |
| 134 | CA-01.5 con campos vacíos muestra errores y no llama a la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 135 | CA-01.2 muestra el mensaje de la API si las credenciales fallan | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 136 | CA-01.1 con credenciales correctas guarda la sesión y entra | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 137 | CA-07.2 cambiar el idioma traduce la pantalla y se recuerda | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 138 | CA-08.3 el tema elegido se recuerda | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaLogin.test.jsx` |
| 139 | CA-03.1 muestra los productos que devuelve la API | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 140 | CA-02.6 el texto con etiquetas HTML se muestra literal, sin ejecutarse | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 141 | CA-01.4 el USUARIO no ve el botón de eliminar | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 142 | CA-05.3 el ADMIN debe confirmar antes de eliminar | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 143 | CA-05.3 cancelar no elimina | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 144 | CA-03.2 el filtro de texto consulta la API después de escribir | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 145 | sin resultados muestra un mensaje | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 146 | un error de red se muestra al usuario | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/paginas/PaginaProductos.test.jsx` |
| 147 | CA-02.2 nombre de %i caracteres → válido=%s | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 148 | CA-02.2 un nombre solo con espacios no es válido | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 149 | CA-02.3 descripción de %i caracteres → válido=%s | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 150 | CA-02.4 categoría y estado deben ser valores permitidos | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 151 | CA-07.2 los mensajes salen en el idioma activo | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 152 | CA-01.5 usuario y contraseña son obligatorios | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 153 | CA-06.2 acepta JPEG y PNG y rechaza otros tipos | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 154 | CA-06.3 límite de 5 MB: exacto se acepta, un byte más no | Unitaria (componentes) | Vitest + Testing Library | `frontend/src/validacion/esquemas.test.js` |
| 155 | CA-01.1 el administrador inicia sesión y ve su rol | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 156 | CA-01.2 una contraseña incorrecta muestra un error genérico | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 157 | CA-01.3 sin sesión, una página protegida redirige al inicio de sesión | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 158 | CA-01.5 con campos vacíos no se envía el formulario | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 159 | cerrar sesión borra la sesión y vuelve al inicio | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/autenticacion.spec.js` |
| 160 | CA-06.1 / CA-06.5 la foto sugiere la categoría y se guarda con el producto | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 161 | CA-06.5 el usuario puede cambiar la categoría sugerida | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 162 | CA-06.6 clasificar con el modelo que elige el usuario | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 163 | CA-06.7 comparar los 5 modelos y ver sus métricas | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 164 | CA-06.2 un archivo que no es imagen se rechaza en la interfaz | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/clasificacion.spec.js` |
| 165 | CA-02.1 / CA-03.2 registrar un producto y encontrarlo con el filtro | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 166 | CA-02.2 un nombre de 2 caracteres no se puede guardar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 167 | CA-02.5 un nombre repetido muestra el conflicto de la API | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 168 | CA-02.6 un nombre con HTML se muestra como texto y no se ejecuta | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 169 | CA-04.1 editar un producto cambia sus datos | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 170 | CA-01.4 el operario no ve la opción de eliminar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 171 | CA-05.1 / CA-05.3 el administrador elimina tras confirmar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/productos.spec.js` |
| 172 | CA-07.2 cambiar a inglés traduce la interfaz y se recuerda al recargar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 173 | CA-08.3 el tema oscuro cambia el fondo y se recuerda al recargar | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 174 | CA-08.2 inicio de sesión sin violaciones graves de accesibilidad @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 175 | CA-08.2 listado y formulario sin violaciones graves de accesibilidad @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 176 | CA-08.1 sin desplazamiento horizontal y con acciones disponibles @celular | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 177 | CA-08.4 el inicio de sesión se completa solo con teclado | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 178 | CA-08.4 el enlace  | Sistema (navegador) | Playwright + axe-core | `frontend/e2e/usabilidad.spec.js` |
| 179 | CA-01.2 credenciales incorrectas muestran el error | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 180 | CA-01.1 / CA-02.1 / CA-03.2 el operario inicia sesión, registra un producto y lo encuentra | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 181 | CA-01.4 el operario no tiene botones de eliminar | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 182 | CA-05.3 el administrador ve eliminar y el diálogo pide confirmación | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 183 | CA-01.3 después de cerrar sesión la página protegida redirige al inicio | Sistema (navegador) | Selenium WebDriver | `frontend/pruebas-selenium/flujo-principal.test.js` |
| 184 | CA-09.1 50 usuarios durante 2 min: p95 < 500 ms y errores < 1 % | Carga | k6 | `pruebas/carga/carga.js` |
| 185 | Escalones de 50 a 300 usuarios hasta encontrar el punto de quiebre | Estrés | k6 | `pruebas/carga/estres.js` |
| 186 | Salto de 10 a 250 usuarios en 10 s: errores < 5 % y recuperación | Pico | k6 | `pruebas/carga/pico.js` |
| 187 | Mutantes en servicios y mapeador: mínimo 70 % detectados (resultado: 100 %) | Mutación | PIT | `backend/pom.xml` |
| 188 | Escaneo pasivo del front-end desplegado en cada integración | Seguridad (dinámica) | OWASP ZAP baseline | `.github/workflows/ci-cd.yml` |
