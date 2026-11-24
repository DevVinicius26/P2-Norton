import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  clienteForm: any = {
    codigo: 0,
    nome: '',
    email: '',
    senha: '',
    documento: '',
    telefone: '',
    endereco: ''
  };

  salvando = signal<boolean>(false);
  excluindo = signal<boolean>(false);
  mensagemSucesso = signal<string>('');
  mensagemErro = signal<string>('');

  ngOnInit() {
    const logado = this.clienteService.clienteLogado();
    if (!logado || !logado.codigo) {
      this.router.navigate(['/login']);
      return;
    }

    this.clienteForm = { ...logado };
    this.clienteService.buscarPorCodigo(Number(logado.codigo)).subscribe({
      next: (dados) => {
        if (dados && dados.codigo) {
          this.clienteForm = { ...dados };
        }
      },
      error: (err) => console.error('Erro ao carregar dados do cliente:', err)
    });
  }

  salvarAlteracoes(event: Event) {
    event.preventDefault();
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    if (!this.clienteForm.codigo) {
      this.mensagemErro.set('Cliente não identificado.');
      return;
    }

    this.salvando.set(true);
    this.clienteService.alterar(this.clienteForm).subscribe({
      next: (resp) => {
        this.salvando.set(false);
        this.clienteService.salvarSessao({ ...this.clienteForm });
        this.mensagemSucesso.set(resp || 'Dados atualizados com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao alterar cliente:', err);
        this.salvando.set(false);
        this.mensagemErro.set('Erro ao atualizar dados. Verifique se o backend está a correr em http://localhost:8081.');
      }
    });
  }

  excluirConta() {
    const codigo = Number(this.clienteForm?.codigo || 0);
    if (!codigo) return;

    this.excluindo.set(true);
    this.clienteService.excluir(codigo).subscribe({
      next: () => {
        this.excluindo.set(false);
        this.clienteService.sair();
        this.router.navigate(['/cadastro']);
      },
      error: (err) => {
        console.error('Erro ao excluir cliente:', err);
        this.excluindo.set(false);
        this.mensagemErro.set('Erro ao excluir conta.');
      }
    });
  }
}