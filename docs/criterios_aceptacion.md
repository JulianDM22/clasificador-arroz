<!--
Nombre: criterios_aceptacion.md
Descripción: Historias de usuario y criterios de aceptación (Dado/Cuando/Entonces) del sistema
             clasificador de arroz. Cada prueba del proyecto referencia el código de su criterio.
Fecha de creación: 2026-10-17
Última actualización: 2026-10-17
Autores: Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
Versión: 1.0.0
-->

# Historias de usuario y criterios de aceptación

**Contexto.** Una cooperativa arrocera registra lotes de arroz (productos) y quiere saber su
variedad a partir de una foto del grano. El sistema expone una API REST (Spring Boot) y una
interfaz web (React). La clasificación la hace el modelo ResNet50V2 entrenado en el proyecto
(99,91 % de exactitud en test).

**Roles.**
- **USUARIO** (operario): consulta, registra y actualiza productos; clasifica fotos.
- **ADMIN** (coordinador): todo lo anterior y además elimina productos.

**Entidad Producto.** `id`, `nombre`, `categoria` (variedad: ARBORIO, BASMATI, IPSALA,
JASMINE, KARACADAG), `descripcion`, `estado` (ACTIVO, INACTIVO). Formato de intercambio: JSON.

Cada criterio tiene un código `CA-xx.y`. Las pruebas automáticas llevan ese código en su nombre
(`@DisplayName` en JUnit, título en Playwright y Selenium), así se puede rastrear qué prueba
verifica cada criterio. La matriz de trazabilidad está en `docs/plan_pruebas.md`.

---

## HU-01 · Autenticación

*Como* usuario del sistema *quiero* iniciar sesión con mi usuario y contraseña *para* acceder
solo a las funciones de mi rol.

| Código | Criterio |
|---|---|
| CA-01.1 | **Dado** un usuario registrado, **cuando** envía usuario y contraseña correctos a `POST /api/v1/auth/login`, **entonces** recibe `200` y un token JWT con su rol y una vigencia de 60 minutos. |
| CA-01.2 | **Dado** un usuario, **cuando** envía una contraseña incorrecta o un usuario inexistente, **entonces** recibe `401` con un mensaje que no revela cuál de los dos datos falló. |
| CA-01.3 | **Dado** cualquier endpoint de productos o clasificación, **cuando** se llama sin token, con un token alterado o vencido, **entonces** responde `401`. |
| CA-01.4 | **Dado** un usuario con rol USUARIO, **cuando** intenta eliminar un producto, **entonces** recibe `403`. |
| CA-01.5 | **Dado** el formulario de inicio de sesión, **cuando** se dejan campos vacíos, **entonces** se muestran mensajes de validación y no se envía la petición. |

## HU-02 · Registrar producto

*Como* USUARIO *quiero* registrar un lote de arroz *para* llevar el inventario de la cooperativa.

| Código | Criterio |
|---|---|
| CA-02.1 | **Dado** un usuario autenticado, **cuando** envía un producto válido a `POST /api/v1/productos`, **entonces** recibe `201`, el producto creado con su `id` y la cabecera `Location`. |
| CA-02.2 | **Dado** un producto, **cuando** el `nombre` está vacío, tiene menos de 3 o más de 100 caracteres, **entonces** recibe `400` con el error asociado al campo `nombre`. Límites: 2 y 101 caracteres fallan; 3 y 100 son válidos. |
| CA-02.3 | **Dado** un producto, **cuando** la `descripcion` supera 500 caracteres, **entonces** recibe `400`. 500 caracteres es válido. |
| CA-02.4 | **Dado** un producto, **cuando** `categoria` o `estado` faltan o no son valores permitidos, **entonces** recibe `400`. |
| CA-02.5 | **Dado** un producto con un `nombre` que ya existe (sin distinguir mayúsculas), **cuando** se intenta registrar, **entonces** recibe `409`. |
| CA-02.6 | **Dado** un `nombre` o `descripcion` con texto como `<script>` o `' OR 1=1 --`, **cuando** se registra, **entonces** se guarda como texto literal, sin ejecutarse ni alterar la consulta, y la interfaz lo muestra escapado. |

## HU-03 · Consultar productos

*Como* USUARIO *quiero* listar, filtrar y ver el detalle de los productos *para* encontrar un lote rápidamente.

| Código | Criterio |
|---|---|
| CA-03.1 | **Dado** un usuario autenticado, **cuando** llama a `GET /api/v1/productos`, **entonces** recibe `200` con una página de productos (`content`, `totalElements`, `totalPages`), ordenada por `id`. |
| CA-03.2 | **Dado** el listado, **cuando** se filtra por `categoria`, `estado` o texto `q` (contenido en el nombre, sin distinguir mayúsculas), **entonces** solo aparecen los productos que cumplen el filtro. |
| CA-03.3 | **Dado** un `id` existente, **cuando** se llama a `GET /api/v1/productos/{id}`, **entonces** recibe `200` con el producto; **dado** un `id` inexistente, recibe `404`. |
| CA-03.4 | **Dado** el listado, **cuando** se pide un tamaño de página mayor a 100 o negativo, **entonces** el tamaño se limita a 100 o se usa el valor por defecto (20). |

## HU-04 · Actualizar producto

*Como* USUARIO *quiero* modificar un producto *para* corregir datos o cambiar su estado.

| Código | Criterio |
|---|---|
| CA-04.1 | **Dado** un producto existente, **cuando** se envían datos válidos a `PUT /api/v1/productos/{id}`, **entonces** recibe `200` con los datos actualizados y la fecha de actualización cambia. |
| CA-04.2 | **Dado** un `id` inexistente, **cuando** se intenta actualizar, **entonces** recibe `404`. |
| CA-04.3 | **Dado** datos inválidos o un nombre que ya usa otro producto, **cuando** se actualiza, **entonces** recibe `400` o `409` según corresponda, y el producto no cambia. |

## HU-05 · Eliminar producto

*Como* ADMIN *quiero* eliminar un producto *para* depurar registros erróneos.

| Código | Criterio |
|---|---|
| CA-05.1 | **Dado** un ADMIN y un producto existente, **cuando** llama a `DELETE /api/v1/productos/{id}`, **entonces** recibe `204` y el producto ya no se puede consultar (`404`). |
| CA-05.2 | **Dado** un `id` inexistente, **cuando** el ADMIN intenta eliminar, **entonces** recibe `404`. |
| CA-05.3 | **Dado** la interfaz, **cuando** el ADMIN pulsa eliminar, **entonces** se pide confirmación antes de borrar. |

## HU-06 · Clasificar variedad por foto

*Como* USUARIO *quiero* subir la foto de un grano *para* que el sistema me sugiera su variedad al registrar el producto, eligiendo el modelo o comparando los 5 modelos del proyecto.

| Código | Criterio |
|---|---|
| CA-06.1 | **Dado** un usuario autenticado, **cuando** envía una imagen JPEG o PNG a `POST /api/v1/clasificaciones`, **entonces** recibe `200` con la `categoria` sugerida, su `confianza` (0 a 1) y la probabilidad de cada variedad. |
| CA-06.2 | **Dado** un archivo que no es JPEG ni PNG (se verifica el contenido real, no solo la extensión) o un archivo vacío, **cuando** se envía, **entonces** recibe `400`. |
| CA-06.3 | **Dado** un archivo de más de 5 MB, **cuando** se envía, **entonces** recibe `413`. |
| CA-06.4 | **Dado** que el servicio de inferencia no responde, **cuando** se pide una clasificación, **entonces** recibe `503` con un mensaje claro y el resto del sistema sigue funcionando. |
| CA-06.5 | **Dado** el formulario de producto en la interfaz, **cuando** se clasifica una foto, **entonces** la categoría sugerida se precarga en el campo `categoria` y el usuario puede cambiarla antes de guardar. |
| CA-06.6 | **Dado** el catálogo de los 5 modelos (CNN propia, EfficientNetB0, ResNet50V2, ViT-B/16, DeiT-S) y el ensamble, **cuando** el usuario elige uno y clasifica, **entonces** la predicción la hace ese modelo y se informa cuál fue y cuánto tardó. Sin elección se usa ResNet50V2. Un modelo inexistente responde `400`. |
| CA-06.7 | **Dado** el modo "Comparar los 5 modelos", **cuando** se clasifica una foto, **entonces** se muestra la predicción, la confianza y el tiempo de cada modelo y del ensamble, si todos coinciden, y las métricas de test de cada modelo (exactitud, F1, tamaño y peso en el ensamble). |

## HU-07 · Idioma

*Como* usuario *quiero* usar el sistema en español o inglés.

| Código | Criterio |
|---|---|
| CA-07.1 | **Dado** la cabecera `Accept-Language: en`, **cuando** la API responde un error, **entonces** el mensaje está en inglés; sin cabecera o con `es`, en español. |
| CA-07.2 | **Dado** la interfaz, **cuando** se cambia el idioma, **entonces** todos los textos visibles cambian sin recargar la página y la elección se recuerda. |

## HU-08 · Interfaz usable y accesible

| Código | Criterio |
|---|---|
| CA-08.1 | **Dado** una pantalla de 375 px de ancho (celular), **cuando** se abre cualquier vista, **entonces** no hay desplazamiento horizontal y las acciones siguen disponibles. |
| CA-08.2 | **Dado** la interfaz, **cuando** se analiza con axe-core, **entonces** no hay violaciones de accesibilidad de impacto serio o crítico. |
| CA-08.3 | **Dado** la interfaz, **cuando** se cambia entre tema claro y oscuro, **entonces** todos los colores provienen de los tokens del tema y la elección se recuerda. |
| CA-08.4 | **Dado** el formulario, **cuando** se navega solo con teclado, **entonces** se puede llenar y enviar, y cada campo tiene su etiqueta. |

## HU-09 · Rendimiento y disponibilidad

| Código | Criterio |
|---|---|
| CA-09.1 | **Dado** 50 usuarios simultáneos consultando y registrando productos durante 2 minutos, **entonces** el percentil 95 del tiempo de respuesta es menor a 500 ms y la tasa de error menor al 1 %. |
| CA-09.2 | **Dado** el sistema desplegado, **cuando** se consulta `/actuator/health`, **entonces** responde `UP` e incluye el estado de la base de datos. |
| CA-09.3 | **Dado** el servicio de clasificación, **cuando** recibe una imagen, **entonces** responde en menos de 1 s (sin contar el arranque en frío del plan gratuito). |
