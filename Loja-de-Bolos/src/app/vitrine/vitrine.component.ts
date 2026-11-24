import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../produto.service';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vitrine.component.html',
  styleUrl: './vitrine.component.css'
})
export class VitrineComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  bolos = signal<any[]>([]);
  carregando = signal<boolean>(true);
  erroMsg = signal<string>('');

  readonly imagemPadrao = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400';

  private readonly fotosPorSabor: Record<string, string> = {
    'bolo de chocolate trufado': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    'bolo de cenoura com chocolate': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    'bolo red velvet especial': 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400',
    'bolo de prestigio cremoso': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
    'bolo de limao siciliano': 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=400',
    'bolo de limão siciliano': 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=400',
    'bolo de fuba com goiabada': 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400',
    'bolo doce de leite com nozes': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
    'bolo de maracuja trufado': 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400',
    'bolo de castanha do para': 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    'bolo de brigadeiro gourmet': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
    'bolo floresta negra': 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
    'bolo de coco gelado': 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400'
  };

  private readonly descricoesPorSabor: Record<string, string> = {
    'bolo de chocolate trufado': 'Massa de cacau 50%, ovos, farinha de trigo, leite, manteiga e ganache trufada de chocolate meio amargo.',
    'bolo de cenoura com chocolate': 'Cenoura fresca ralada, óleo vegetal, ovos, açúcar, farinha de trigo e cobertura cremosa de chocolate ao leite.',
    'bolo red velvet especial': 'Massa aveludada com toque de cacau e baunilha, farinha de trigo, manteiga, leitelho e cobertura cremosa.',
    'bolo de prestigio cremoso': 'Massa fofinha de chocolate com recheio cremoso de coco ralado e leite condensado.',
    'bolo de limao siciliano': 'Massa leve com raspas e suco natural de limão-siciliano, farinha de trigo, ovos, manteiga e cobertura cítrica.',
    'bolo de limão siciliano': 'Massa leve com raspas e suco natural de limão-siciliano, farinha de trigo, ovos, manteiga e cobertura cítrica.',
    'bolo de fuba com goiabada': 'Fubá mimoso, farinha de trigo, ovos, leite, óleo, fermento e pedaços de goiabada cremosa.',
    'bolo doce de leite com nozes': 'Massa caseira macia com recheio farto de doce de leite cozido e nozes picadas.',
    'bolo de maracuja trufado': 'Massa aerada com polpa natural de maracujá e cobertura trufada agridoce.',
    'bolo de castanha do para': 'Massa amanteigada com castanha-do-pará triturada e cobertura delicada.',
    'bolo de brigadeiro gourmet': 'Massa de chocolate com brigadeiro cremoso feito com chocolate nobre, manteiga e granulado.',
    'bolo floresta negra': 'Massa de chocolate, chantilly, cerejas em calda e raspas de chocolate.',
    'bolo de coco gelado': 'Massa úmida umedecida com leite de coco e leite condensado, finalizada com coco ralado.'
  };

  constructor(
    private produtoService: ProdutoService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregar();
    } else {
      this.carregando.set(false);
    }
  }

  carregar() {
    this.carregando.set(true);
    this.erroMsg.set('');

    this.produtoService.carregarVitrine().subscribe({
      next: (dados) => {
        const lista = (dados ?? []).map((item) => ({
          ...item,
          nomeExibido: this.obterNome(item),
          descricaoExibida: this.obterDescricao(item),
          precoExibido: this.obterPreco(item),
          imagemExibida: this.obterImagem(item)
        }));
        this.bolos.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar vitrine:', err);
        this.erroMsg.set('Não foi possível carregar os bolos da API. Verifique se o backend está rodando em http://localhost:8081.');
        this.carregando.set(false);
      }
    });
  }

  private chaveNormalizada(bolo: any): string {
    return String(bolo?.nome || bolo?.descricao || '')
      .trim()
      .toLowerCase();
  }

  obterNome(bolo: any): string {
    return bolo?.nome || bolo?.descricao || 'Bolo sem nome';
  }

  obterDescricao(bolo: any): string {
    const chave = this.chaveNormalizada(bolo);
    if (bolo?.descritivo && String(bolo.descritivo).trim().length > 0 && bolo.descritivo !== 'Bolo caseiro com cobertura trufada') {
      return bolo.descritivo;
    }
    return this.descricoesPorSabor[chave] || bolo?.descritivo || 'Massa caseira preparada no dia com ingredientes selecionados.';
  }

  obterPreco(bolo: any): number {
    return Number(bolo?.valor ?? bolo?.preco ?? 0);
  }

  obterImagem(bolo: any): string {
    const chave = this.chaveNormalizada(bolo);
    return this.fotosPorSabor[chave] || bolo?.imagem || this.imagemPadrao;
  }

  adicionar(bolo: any) {
    const nome = this.obterNome(bolo);
    const preco = this.obterPreco(bolo);
    const imagem = this.obterImagem(bolo);

    this.cartService.adicionarItem({ nome, preco, qtd: 1, imagem });
    alert(`"${nome}" foi adicionado à cesta com sucesso! 🛒`);
  }
}