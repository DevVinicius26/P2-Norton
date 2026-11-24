import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrl: './cadastro.css',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private platformId = inject(PLATFORM_ID);

  nome = signal<string>('');
  email = signal<string>('');
  senha = signal<string>('');
  confirmaSenha = signal<string>('');
  cpf = signal<string>('');
  telefone = signal<string>('');

  carregando = signal<boolean>(false);
  mensagemErro = signal<string>('');
  mensagemSucesso = signal<string>('');

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  cadastrar(event?: Event) {
    event?.preventDefault();
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const nomeVal = this.nome().trim();
    const emailVal = this.email().trim();
    const senhaVal = this.senha();
    const confirmaVal = this.confirmaSenha();
    const cpfVal = this.cpf().trim();
    const telefoneVal = this.telefone().trim();

    if (!nomeVal || !emailVal || !senhaVal || !confirmaVal || !cpfVal || !telefoneVal) {
      this.mensagemErro.set('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senhaVal !== confirmaVal) {
      this.mensagemErro.set('As senhas não conferem.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.carregando.set(true);

    const payload = {
      nome: nomeVal,
      email: emailVal,
      senha: senhaVal,
      documento: cpfVal,
      telefone: telefoneVal,
      logradouro: '',
      ativo: 1
    };

    this.clienteService.cadastrar(payload).subscribe({
      next: (resposta) => {
        this.carregando.set(false);
        this.mensagemSucesso.set(resposta || 'Cadastro realizado com sucesso!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err) => {
        console.error('Erro ao cadastrar cliente:', err);
        this.carregando.set(false);
        const msgBackend =
          typeof err?.error === 'string' && err.error.trim().length > 0
            ? err.error
            : err?.error?.message;
        this.mensagemErro.set(
          msgBackend || 'Não foi possível concluir o cadastro. Verifique os dados ou se o backend está rodando em http://localhost:8081.'
        );
      }
    });
  }
}