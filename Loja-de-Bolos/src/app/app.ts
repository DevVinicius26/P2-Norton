import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { ClienteService } from './cliente.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  clienteService = inject(ClienteService);

  constructor(private router: Router) {}

  irParaBusca(event: Event) {
    event.preventDefault();
    const input = (document.getElementById('termoBusca') as HTMLInputElement).value;
    if (input.trim()) {
      this.router.navigate(['/busca'], { queryParams: { q: input } });
    }
  }

  logout() {
    this.clienteService.sair();
    this.router.navigate(['/login']);
  }
}