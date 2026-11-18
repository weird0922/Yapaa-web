# YAPAA Web

Interfaz Angular de YAPAA, plataforma de excedentes alimentarios. API: [Yapaa-api](https://github.com/weird0922/Yapaa-api).

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
- Administrador: revisión de afiliaciones y registro de liquidaciones verificadas de comisiones.

La afiliación crea una cuenta negocio independiente. La razón social se autocompleta mediante la API; el nombre comercial se registra por separado.

## Planes y comisiones

| Plan | Comisión | Funciones |
|---|---|---|
| Promocional | 10% durante el primer mes | Productos, pedidos y consulta de comisiones |
| Normal | 15% | Productos, pedidos y consulta de comisiones |
| Pro | 20% | Lo anterior, indicadores de ventas/unidades/importes y exportación CSV |

En `/mi-negocio` puede consultarse o cambiarse el plan. El cambio requiere confirmación y se aplica a las próximas ventas confirmadas. El negocio confirma únicamente ventas ya realizadas; entonces la API genera la comisión sobre productos, excluyendo delivery. Los pedidos no concretados se cancelan y devuelven stock.

La plataforma no ejecuta pagos ni envía mensajes de WhatsApp automáticamente. El administrador registra una comisión como liquidada tras verificar el abono del negocio fuera del sistema.

## Diseño y comprobaciones

Interfaz con propuesta visual cálida, fotografías locales, formularios adaptables y cuenta regresiva. Los prototipos locales están en `public/prototipos`; las imágenes del catálogo en `public/imagenes/productos`.

La compilación final pasó y el panel comercial se comprobó en 320, 390, 768 y 1440 px sin desbordamiento. Los permisos de plan y propiedad se hacen cumplir en la API, además de los controles de Angular.

Los casos de uso y reglas comerciales están documentados junto a la API en `docs/modelado`.
