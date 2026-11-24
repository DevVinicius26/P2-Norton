import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private platformId = inject(PLATFORM_ID);
  private baseUrl = 'http://localhost:8081/api/cliente';

  clienteLogado = signal<any | null>(this.lerClienteDoStorage());

  constructor(private http: HttpClient) {}

  private lerClienteDoStorage(): any | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = localStorage.getItem('clienteLogado');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  salvarSessao(cliente: any) {
    this.clienteLogado.set(cliente);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('clienteLogado', JSON.stringify(cliente));
    }
  }

  sair() {
    this.clienteLogado.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('clienteLogado');
    }
  }

  cadastrar(cliente: any): Observable<string> {
    return this.http.post(this.baseUrl, cliente, { responseType: 'text' });
  }

  login(credenciais: { email: string; senha: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credenciais);
  }

  buscarPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${codigo}`);
  }

  alterar(cliente: any): Observable<string> {
    return this.http.put(this.baseUrl, cliente, { responseType: 'text' });
  }

  excluir(codigo: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${codigo}`, { responseType: 'text' });
  }

  resetarSenha(dados: any): Observable<string> {
    return this.http.patch(`${this.baseUrl}/resetarSenha`, dados, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }

  alterarSenha(dados: any): Observable<string> {
    return this.http.patch(`${this.baseUrl}/alterarSenha`, dados, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }
}