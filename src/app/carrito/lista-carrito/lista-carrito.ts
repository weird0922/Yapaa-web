import { MisDirecciones } from '../../direcciones/mis-direcciones';
import { DireccionesApi,Direccion,Cotizacion } from '../../direcciones/direcciones-api';
import { PagoSimulado } from '../../pedidos/pago-simulado';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Carrito, ItemCarrito } from '../carrito';
import { PedidosApi } from '../../pedidos/pedidos-api';
import { mensajeDeError } from '../../core/api/errores';
import { soles } from '../../dominio/producto';
import { Pedido, PeticionPedido } from '../../dominio/pedido';

interface GrupoCarrito {
  idNegocio: number;
  nombreNegocio: string;
  items: ItemCarrito[];
  subtotal: number;
}

interface OpcionEntrega {
  modalidad: string;
  direccion: string;
  costoDelivery: number;
  cotizacion?: Cotizacion;
}

const ENTREGA_POR_DEFECTO: OpcionEntrega = { modalidad: 'RECOJO', direccion: '', costoDelivery: 0 };

@Component({
  selector: 'app-lista-carrito',
  imports: [RouterLink,PagoSimulado,MisDirecciones],
  templateUrl: './lista-carrito.html',
  styleUrl: './lista-carrito.css',
})
export class ListaCarrito {

  private direccionesApi=inject(DireccionesApi);
  direccion=signal<Direccion|null>(null);cotizando=signal<Record<number,boolean>>({});erroresEntrega=signal<Record<number,string>>({});private secuencias:Record<number,number>={};
  hayDelivery=computed(()=>this.grupos().some(g=>this.opcionDe(g.idNegocio).modalidad==='DELIVERY'));
  sinCotizar=computed(()=>this.grupos().some(g=>this.opcionDe(g.idNegocio).modalidad==='DELIVERY'&&(!this.opcionDe(g.idNegocio).cotizacion||this.cotizando()[g.idNegocio])));
  private carrito = inject(Carrito);
  private pedidosApi = inject(PedidosApi);


  opciones = signal<Record<number, OpcionEntrega>>({});
  pedidoCreado = signal<Pedido | null>(null);

  generando = signal(false);
  error = signal('');

  grupos = computed<GrupoCarrito[]>(() => {
    const mapa = new Map<number, GrupoCarrito>();
    for (const item of this.carrito.lista()) {
      const existente = mapa.get(item.producto.idNegocio);
      const importe = item.producto.precioDescuento * item.cantidad;
      if (existente) {
        existente.items = [...existente.items, item];
        existente.subtotal += importe;
      } else {
        mapa.set(item.producto.idNegocio, {
          idNegocio: item.producto.idNegocio,
          nombreNegocio: item.producto.nombreNegocio,
          items: [item],
          subtotal: importe,
        });
      }
    }
    return Array.from(mapa.values());
  });

  subtotal = computed(() => this.carrito.subtotal());

  costoDeliveryTotal = computed(() =>
    this.grupos().reduce((total, grupo) => total + this.opcionDe(grupo.idNegocio).costoDelivery, 0),
  );

  total = computed(() => this.subtotal() + this.costoDeliveryTotal());

  vacio = computed(() => this.carrito.lista().length === 0);

  precio(valor: number): string {
    return soles(valor);
  }

  opcionDe(idNegocio: number): OpcionEntrega {
    return this.opciones()[idNegocio] ?? ENTREGA_POR_DEFECTO;
  }

  private actualizarOpcion(idNegocio: number, cambios: Partial<OpcionEntrega>): void {
    const actual = this.opcionDe(idNegocio);
    this.opciones.set({ ...this.opciones(), [idNegocio]: { ...actual, ...cambios } });
  }

  private valorDe(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  cambiarModalidad(idNegocio:number,evento:Event):void {
    const modalidad=this.valorDe(evento);this.secuencias[idNegocio]=(this.secuencias[idNegocio]??0)+1;
    this.cotizando.update(v=>({...v,[idNegocio]:false}));this.erroresEntrega.update(v=>({...v,[idNegocio]:''}));
    this.actualizarOpcion(idNegocio,{modalidad,costoDelivery:0,cotizacion:undefined,direccion:''});
    if(modalidad==='DELIVERY'&&this.direccion())this.cotizar(idNegocio);
  }
  seleccionarDireccion(d:Direccion|null):void {
    this.direccion.set(d);this.error.set('');
    for(const g of this.grupos()){
      this.secuencias[g.idNegocio]=(this.secuencias[g.idNegocio]??0)+1;this.cotizando.update(v=>({...v,[g.idNegocio]:false}));
      this.actualizarOpcion(g.idNegocio,{cotizacion:undefined,costoDelivery:0,direccion:''});
      if(this.opcionDe(g.idNegocio).modalidad==='DELIVERY'&&d)this.cotizar(g.idNegocio);
    }
  }
  cotizar(id:number):void {
    const d=this.direccion();if(!d||this.opcionDe(id).modalidad!=='DELIVERY')return;
    const v=(this.secuencias[id]??0)+1;this.secuencias[id]=v;this.cotizando.update(a=>({...a,[id]:true}));this.erroresEntrega.update(a=>({...a,[id]:''}));this.actualizarOpcion(id,{cotizacion:undefined,costoDelivery:0});
    this.direccionesApi.cotizar(id,d.id).subscribe({next:r=>{if(this.secuencias[id]!==v)return;this.actualizarOpcion(id,{cotizacion:r.datos,costoDelivery:r.datos.importe,direccion:r.datos.direccion});this.cotizando.update(a=>({...a,[id]:false}));},error:e=>{if(this.secuencias[id]!==v)return;this.cotizando.update(a=>({...a,[id]:false}));this.erroresEntrega.update(a=>({...a,[id]:mensajeDeError(e)}));}});
  }
  cambiarCantidad(idProducto: number, cantidad: number): void {
    this.carrito.cambiarCantidad(idProducto, cantidad);
  }

  quitar(idProducto: number): void {
    this.carrito.quitar(idProducto);
  }

  actualizarPago(estado:string):void{if(estado==='CONFIRMADO'||estado==='ANULADO')this.pedidoCreado.update(p=>p?{...p,estadoPago:estado==='CONFIRMADO'?'CONFIRMADO':'REEMBOLSADO',estadoPedido:estado==='CONFIRMADO'?'CONFIRMADO':'CANCELADO'}:p);}
  generarPedido(): void {
    if (this.vacio()||this.generando()) {
      return;
    }
    if(this.sinCotizar()){this.error.set('Selecciona una dirección válida para calcular el delivery.');return;}
    const vencidas=this.grupos().filter(g=>this.opcionDe(g.idNegocio).modalidad==='DELIVERY'&&new Date(this.opcionDe(g.idNegocio).cotizacion!.vence+'-05:00').getTime()<=Date.now());
    if(vencidas.length){this.error.set('Estamos actualizando el delivery. Revisa el total y continúa.');for(const g of vencidas)this.cotizar(g.idNegocio);return;}

    const peticion: PeticionPedido = {
      grupos: this.grupos().map(grupo => {
        const opcion = this.opcionDe(grupo.idNegocio);
        return {
          idNegocio: grupo.idNegocio,
          modalidadEntrega: opcion.modalidad,
          cotizacionDelivery: opcion.modalidad === 'DELIVERY' ? opcion.cotizacion?.id : undefined,
          items: grupo.items.map(item => ({
            idProducto: item.producto.idProducto,
            cantidad: item.cantidad,
          })),
        };
      }),
    };

    this.generando.set(true);
    this.error.set('');
    this.pedidosApi.crear(peticion).subscribe({
      next: respuesta => {
        this.pedidoCreado.set(respuesta.datos);
        this.carrito.limpiar();
        this.opciones.set({});
        this.generando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeError(e));
        this.generando.set(false);
      },
    });
  }

}
