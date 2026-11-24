import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private baseUrl = 'http://localhost:8081/api/produto';
  private todosUrl = 'http://localhost:8081/api/produtos';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.todosUrl);
  }

  carregarVitrine(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vitrine`);
  }

  buscarPorCodigo(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${codigo}`);
  }

  buscarPorDescricao(termo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/busca/${termo}`);
  }

  cadastrar(produto: any): Observable<string> {
    return this.http.post(this.baseUrl, produto, { responseType: 'text' });
  }

  alterar(produto: any): Observable<string> {
    return this.http.put(this.baseUrl, produto, { responseType: 'text' });
  }

  excluir(codigo: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${codigo}`, { responseType: 'text' });
  }
}