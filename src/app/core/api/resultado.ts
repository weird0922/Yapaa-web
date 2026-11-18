export interface Resultado<T> {
  exitoso: boolean;
  mensaje: string;
  datos: T;
}
