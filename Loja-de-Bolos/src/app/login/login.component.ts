import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private platformId = inject(PLATFORM_ID);

  email = signal<string>('');
  senha = signal<string>('');
  carregando = signal<boolean>(false);
  mensagemErro = signal<string>('');
  mensagemSucesso = signal<string>('');

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  entrar(event?: Event) {
    event?.preventDefault();
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const emailVal = this.email().trim();
    const senhaVal = this.senha();

    if (!emailVal || !senhaVal) {
      this.mensagemErro.set('Informe o seu e-mail e a sua senha.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.carregando.set(true);

    this.clienteService.login({ email: emailVal, senha: senhaVal }).subscribe({
      next: (cliente) => {
        this.carregando.set(false);

        const logadoValido =
          cliente &&
          typeof cliente === 'object' &&
          (Number(cliente.codigo) > 0 || Boolean(cliente.email));

        if (!logadoValido) {
          this.mensagemErro.set('E-mail ou senha inválidos.');
          return;
        }

        this.clienteService.login({ email: emailVal, senha: senhaVal }).subscribe({
      next: (cliente) => {
        this.carregando.set(false);

        const logadoValido =
          cliente &&
          typeof cliente === 'object' &&
          (Number(cliente.codigo) > 0 || Boolean(cliente.email));

        if (!logadoValido) {
          this.mensagemErro.set('E-mail ou senha inválidos.');
          return;
        }

        // Atualiza o signal do ClienteService E salva no localStorage na hora
        this.clienteService.salvarSessao(cliente);
        this.mensagemSucesso.set(`Bem-vindo(a), ${cliente.nome || cliente.email}!`);

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 800);
      },
      error: (err) => {
        // ... mantém seu tratamento de erro
      }
    });
        this.mensagemSucesso.set(`Bem-vindo(a), ${cliente.nome || cliente.email}!`);

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 800);
      },
      error: (err) => {
        console.error('Erro ao realizar login:', err);
        this.carregando.set(false);
        const msgBackend =
          typeof err?.error === 'string' && err.error.trim().length > 0
            ? err.error
            : err?.error?.message;
        this.mensagemErro.set(
          msgBackend || 'Não foi possível entrar. Verifique suas credenciais ou se o backend está rodando em http://localhost:8081.'
        );
      }
    });
  }
}