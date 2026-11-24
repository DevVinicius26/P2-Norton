import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-esqueci',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './esqueci.component.html',
  styleUrl: './esqueci.component.css'
})
export class EsqueciComponent {
  private clienteService = inject(ClienteService);

  enviando = signal<boolean>(false);
  mensagemSucesso = signal<string>('');
  mensagemErro = signal<string>('');

  enviarReset(event: Event, email: string) {
    event.preventDefault();
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    const emailLimpo = email.trim();
    if (!emailLimpo) {
      this.mensagemErro.set('Informe o seu e-mail.');
      return;
    }

    this.enviando.set(true);
    this.clienteService.resetarSenha(emailLimpo).subscribe({
      next: (resp) => {
        this.enviando.set(false);
        this.mensagemSucesso.set(resp || 'Sua senha foi reiniciada, verifique o seu email!');
      },
      error: (err) => {
        console.error('Erro ao resetar senha:', err);
        this.enviando.set(false);
        this.mensagemErro.set('Não foi possível reiniciar a senha. Verifique o backend em http://localhost:8081.');
      }
    });
  }
}