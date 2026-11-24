import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../cart.service';
import { ClienteService } from '../cliente.service';
import { PedidoService, RegistroPedido } from '../pedido.service';

@Component({
  selector: 'app-cesta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cesta.component.html',
  styleUrl: './cesta.component.css'
})
export class CestaComponent {
  private clienteService = inject(ClienteService);
  public pedidoService = inject(PedidoService);
  private router = inject(Router);

  enviandoPedido = signal<boolean>(false);
  mensagemErro = signal<string>('');
  mensagemSucesso = signal<string>('');
  pedidoConsultado = signal<RegistroPedido | null>(null);
  erroConsulta = signal<string>('');

  constructor(public cartService: CartService) {}

  limpar(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
    this.cartService.limparCesta();
  }

  finalizarPedido(entrega: string = 'Entrega', obs: string = '') {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
    this.pedidoConsultado.set(null);

    const itens = this.cartService.getItens();
    if (!itens.length) {
      this.mensagemErro.set('Sua cesta está vazia.');
      return;
    }

    const cliente = this.clienteService.clienteLogado();
    const codigoCliente = Number(cliente?.codigo || 0);
    if (!codigoCliente) {
      this.router.navigate(['/login']);
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];

    const payload = {
      valorTotal: Number(this.cartService.getTotal().toFixed(2)),
      entrega,
      obs: obs.trim(),
      dataPedido: hoje,
      codigoCliente
    };

    this.enviandoPedido.set(true);

    this.pedidoService.criarPedido(payload).subscribe({
      next: (resposta) => {
        this.enviandoPedido.set(false);
        this.cartService.limparCesta();
        this.mensagemSucesso.set(resposta || 'Pedido realizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao gravar pedido:', err);
        this.enviandoPedido.set(false);
        this.mensagemErro.set('Não foi possível finalizar o pedido. Verifique se o backend está rodando em http://localhost:8081.');
      }
    });
  }

  buscarPedidoPorCodigo(codigoStr: string) {
    this.erroConsulta.set('');
    this.pedidoConsultado.set(null);

    const codigo = Number(codigoStr);
    if (!codigo || codigo <= 0) {
      this.erroConsulta.set('Informe um código de pedido válido (ex.: 1, 2).');
      return;
    }

    this.pedidoService.buscarPorCodigo(codigo).subscribe({
      next: (dados) => {
        if (!dados || Number(dados.codigoPedido) <= 0) {
          this.erroConsulta.set(`Pedido #${codigo} não encontrado.`);
          return;
        }
        this.pedidoConsultado.set(dados);
      },
      error: (err) => {
        console.error('Erro ao buscar pedido:', err);
        this.erroConsulta.set('Não foi possível consultar o pedido no backend.');
      }
    });
  }
}