# YAPAA Web

Interfaz Angular de YAPAA, plataforma de excedentes alimentarios. API: [Yapaa-api](https://github.com/weird0922/Yapaa-api).

### Descarga ZIP en Windows

Extraer ambos repositorios en carpetas separadas. Ejecutar primero
**Iniciar-API.cmd** en Yapaa-api y después **Iniciar-Web.cmd** en Yapaa-web.
La web instala sus dependencias y queda en **http://localhost:4200/login**.
Se requiere Node.js 24 LTS, Java 21 y SQL Server con sqlcmd.


## Ejecutar

```text
npm ci
npm start
```

Abrir `http://localhost:4200`. La API debe estar disponible en `http://localhost:8080/api`, según `src/environments/environment.ts`.

```text
npm run build
```

La compilación de producción se genera en `dist/yapaa-web`. `node_modules`, cachés y archivos compilados están excluidos de Git.

## Accesos y funciones

- Visitante: catálogo, detalle, registro de cliente y afiliación de negocio.
- Cliente: carrito, registro de pedido y consulta de pedidos propios. Continúa la coordinación por WhatsApp.
- Negocio: panel exclusivo, datos del local, productos, plan, pedidos y comisiones. No compra ni navega por el catálogo público.
- Administrador: afiliaciones, ventas, comisiones automáticas y netos de los negocios con filtros por fecha y plan y detalle de productos vendidos.

La afiliación crea una cuenta negocio independiente. La razón social se autocompleta mediante la API; el nombre comercial se registra por separado.

## Planes y comisiones

| Plan | Comisión | Funciones |
|---|---|---|
| Promocional | 10% durante el primer mes | Productos, pedidos y consulta de comisiones |
| Normal | 15% | Productos, pedidos y consulta de comisiones |
| Pro | 20% | Lo anterior, indicadores de ventas/unidades/importes y exportación CSV |

En `/mi-negocio` puede consultarse o cambiarse el plan. El cambio requiere confirmación y se aplica a las próximos pagos. El pago aprobado genera la comisión sobre productos, excluyendo delivery. El negocio marca la entrega sin generar un segundo cobro. Cancelar el pago antes de la entrega devuelve stock y anula la comisión.

La pasarela interna simula el pago sin recopilar tarjetas. El servidor aplica la comisión automáticamente y devuelve los importes al dashboard. WhatsApp permite coordinar la entrega después del pago; no se envían mensajes automáticamente.

## Diseño y comprobaciones

Interfaz con propuesta visual cálida, fotografías locales, formularios adaptables y cuenta regresiva. Los prototipos locales están en `public/prototipos`; las imágenes del catálogo en `public/imagenes/productos`.

La compilación final pasó y el panel comercial se comprobó en 320, 390, 768 y 1440 px sin desbordamiento. Los permisos de plan y propiedad se hacen cumplir en la API, además de los controles de Angular.

Los casos de uso y reglas comerciales están documentados junto a la API en `docs/modelado`.

## Verificación y simulación

Cliente y negocio confirman su contraseña y verifican el correo mediante un código OTP antes de crear la cuenta. Los campos permiten mostrar y ocultar la contraseña.

La pasarela de prueba, disponible al registrar un pedido y en su detalle, simula aprobación, rechazo y anulación. No recopila tarjetas ni realiza cargos reales.

El dashboard administrativo se carga bajo demanda y comprueba la sesión con la API. Acceder mediante su dirección, recargarla o volver a ella fuera del flujo de inicio de sesión redirige al catálogo.

El catálogo conserva la identidad cálida con tarjetas de mayor tamaño y texto más legible. Los formularios validan coincidencia de claves, correo, nombres, celular peruano, límites de cantidades e importes, además de los controles del servidor.



El dashboard muestra ventas totales, comisión YAPAA, neto de negocios y pedidos pagados. Incluye ventas por negocio, búsqueda, filtro de plan, productos vendidos y evolución diaria. Se eliminó el registro manual de liquidaciones. La demostración local contiene 30 negocios: 18 Normal, 9 Pro y 3 Promocional.

## Direcciones y delivery — 23/11/2026

Cada cliente puede guardar hasta diez direcciones con nombre, referencia y una predeterminada. La primera se marca automáticamente como predeterminada. La ubicación aceptada queda bloqueada; para cambiarla se agrega otra dirección. Las direcciones se guardan en SQL Server por cuenta y no se comparten entre clientes. Eliminarlas no modifica los textos históricos de los pedidos.

El selector usa Leaflet, OpenStreetMap y Photon: búsqueda con pausa de 800 ms, sugerencias, marcador arrastrable, geocodificación inversa, ubicación del dispositivo y enlace a Google Maps. No utiliza la API pública de Nominatim. Las selecciones que permite guardar el servidor están vinculadas a la cuenta y vencen a los veinte minutos. El negocio fija su punto de recojo en su propio panel; sin este punto solo se permite recojo. Los puntos iniciales de los negocios identificados del escenario son ficticios.

La cobertura inicial es la zona urbana de Trujillo delimitada en `CoberturaTrujillo`, con un máximo de 6 km por calles entre negocio y destino. OSRM calcula la distancia por la red vial; no se cobra según distancia en línea recta. Tarifa inicial: S/ 4 hasta 2 km, más S/ 1 por km adicional, redondeando hacia arriba a S/ 0,50. Hasta 6 km cuesta S/ 8. El importe de reparto no integra la base de comisión de YAPAA.

La cotización del servidor vence a los diez minutos, pertenece a un cliente, negocio y dirección, y se consume una sola vez en la transacción del pedido. El servidor ignora los importes de delivery enviados por el navegador. Al cambiar de dirección se recalcula; con recojo el costo es cero. Si falla el servicio de rutas no se inventa una distancia ni se permite continuar con delivery gratuito.

Las tablas nuevas se crean sin recrear la base. Script: `yapaa-api/sql/20261123-direcciones-delivery.sql`. Servicios configurables: `yapaa.mapas.photon` y `yapaa.mapas.osrm`. Se usan las instancias públicas para el proyecto académico, con caché y límites; para mayor tráfico se requiere un proveedor o instancia con capacidad acordada. Referencias: https://github.com/komoot/photon, https://project-osrm.org/docs/v5.24.0/api/, https://operations.osmfoundation.org/policies/tiles/.

El dashboard solo se abre desde el login administrativo. Escribir o recargar una ruta administrativa borra la sesión local y redirige al catálogo. Las ventas de cada negocio tienen una página separada, con sus datos, totales del periodo, productos y paginación; el regreso conserva las fechas. La API mantiene la autorización ADMIN independientemente de la navegación.
