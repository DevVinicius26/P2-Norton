import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface PedidoPayload {
  valorTotal: number;
  entrega: string;
  obs: string;
  dataPedido: string;
  codigoCliente: number;
}

export interface RegistroPedido {
  codigoPedido?: number;
  valorTotal: number;
  entrega: string;
  obs: string;
  dataPedido: string;
  codigoCliente: number;
  mensagemBackend?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = 'http://localhost:8081/api/pedido';

  ultimoPedido = signal<RegistroPedido | null>(null);
  pedidos = signal<RegistroPedido[]>([]);

  constructor(private http: HttpClient) {}

  criarPedido(pedido: PedidoPayload): Observable<string> {
    return this.http.post(this.baseUrl, pedido, { responseType: 'text' }).pipe(
      tap((resposta) => {
        // Tenta extrair o número do pedido no final da resposta (ex.: "... 2")
        const match = resposta?.match(/(\d+)\s*$/);
        const codigoExtraido = match ? Number(match[1]) : undefined;

        const novoRegistro: RegistroPedido = {
          ...pedido,
          codigoPedido: codigoExtraido,
          mensagemBackend: resposta
        };

        this.ultimoPedido.set(novoRegistro);
        this.pedidos.update((lista) => [novoRegistro, ...lista]);
      })
    );
  }

  buscarPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${codigo}`);
  }
}