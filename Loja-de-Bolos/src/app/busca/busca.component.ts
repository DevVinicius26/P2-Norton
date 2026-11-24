import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProdutoService } from '../produto.service';
import { CartService } from '../cart.service';

interface InfoBolo {
  preco: number;
  imagem: string;
  descricao: string;
}

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './busca.component.html',
  styleUrl: './busca.component.css'
})
export class BuscaComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  termoBusca = signal<string>('');
  resultados = signal<any[]>([]);
  carregando = signal<boolean>(false);

  private readonly imagemPadrao = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400';

  private readonly catalogoBolos: Record<string, InfoBolo> = {
    'bolo de chocolate trufado': {
      preco: 45.00,
      imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
      descricao: 'Massa de cacau 50%, ovos, farinha de trigo, leite, manteiga e ganache trufada de chocolate meio amargo.'
    },
    'bolo de cenoura com chocolate': {
      preco: 38.00,
      imagem: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      descricao: 'Cenoura fresca ralada, óleo vegetal, ovos, açúcar, farinha de trigo e cobertura cremosa de chocolate ao leite.'
    },
    'bolo red velvet especial': {
      preco: 60.00,
      imagem: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400',
      descricao: 'Massa aveludada com toque de cacau e baunilha, farinha de trigo, manteiga, leitelho e cobertura cremosa.'
    },
    'bolo de prestigio cremoso': {
      preco: 42.00,
      imagem: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
      descricao: 'Massa fofinha de chocolate com recheio cremoso de coco ralado e leite condensado.'
    },
    'bolo de limao siciliano': {
      preco: 40.00,
      imagem: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=400',
      descricao: 'Massa leve com raspas e suco natural de limão-siciliano, farinha de trigo, ovos, manteiga e cobertura cítrica.'
    },
    'bolo de fuba com goiabada': {
      preco: 30.00,
      imagem: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400',
      descricao: 'Fubá mimoso, farinha de trigo, ovos, leite, óleo, fermento e pedaços de goiabada cremosa.'
    },
    'bolo doce de leite com nozes': {
      preco: 58.00,
      imagem: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
      descricao: 'Massa caseira macia com recheio farto de doce de leite cozido e nozes picadas.'
    },
    'bolo de maracuja trufado': {
      preco: 46.00,
      imagem: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400',
      descricao: 'Massa aerada com polpa natural de maracujá e cobertura trufada agridoce.'
    },
    'bolo de castanha do para': {
      preco: 50.00,
      imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
      descricao: 'Massa amanteigada com castanha-do-pará triturada e cobertura delicada.'
    },
    'bolo de brigadeiro gourmet': {
      preco: 48.00,
      imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
      descricao: 'Massa de chocolate com brigadeiro cremoso feito com chocolate nobre, manteiga e granulado.'
    },
    'bolo floresta negra': {
      preco: 55.00,
      imagem: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
      descricao: 'Massa de chocolate, chantilly, cerejas em calda e raspas de chocolate.'
    },
    'bolo de coco gelado': {
      preco: 39.00,
      imagem: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400',
      descricao: 'Massa úmida umedecida com leite de coco e leite condensado, finalizada com coco ralado.'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const termo = params['q'] || '';
      this.termoBusca.set(termo);
      this.buscarNaApi(termo);
    });
  }

  private normalizar(texto: string): string {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private distanciaEdicao(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const custo = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + custo
        );
      }
    }
    return dp[m][n];
  }

  private palavraCombina(palavraBusca: string, textoAlvo: string): boolean {
    if (!palavraBusca) return true;
    if (textoAlvo.includes(palavraBusca)) return true;

    const palavrasAlvo = textoAlvo.split(' ');
    const tolerancia = palavraBusca.length >= 6 ? 2 : palavraBusca.length >= 4 ? 1 : 0;

    if (tolerancia === 0) return false;

    return palavrasAlvo.some(alvo => {
      if (!alvo) return false;
      const trecho = alvo.length > palavraBusca.length + 2
        ? alvo.slice(0, palavraBusca.length + 1)
        : alvo;
      return this.distanciaEdicao(palavraBusca, trecho) <= tolerancia;
    });
  }

  private correspondeAoTermo(bolo: any, termo: string): boolean {
    const termoNorm = this.normalizar(termo);
    if (!termoNorm) return true;

    const alvoNorm = this.normalizar(`${bolo.nomeExibido} ${bolo.descricaoExibida}`);
    if (alvoNorm.includes(termoNorm)) return true;

    const tokens = termoNorm.split(' ');
    return tokens.every(token => this.palavraCombina(token, alvoNorm));
  }

  private montarItem(bolo: any) {
    const nome = bolo?.nome || bolo?.descricao || 'Bolo sem nome';
    const chave = this.normalizar(nome);
    const info = this.catalogoBolos[chave];

    const descritivoApi = bolo?.descritivo ? String(bolo.descritivo).trim() : '';
    const descricao =
      descritivoApi && descritivoApi !== 'Bolo caseiro com cobertura trufada'
        ? descritivoApi
        : info?.descricao || descritivoApi || 'Massa caseira preparada no dia com ingredientes selecionados.';

    return {
      ...bolo,
      nomeExibido: nome,
      descricaoExibida: descricao,
      precoExibido: Number(bolo?.valor ?? bolo?.preco ?? info?.preco ?? 0),
      imagemExibida: info?.imagem || bolo?.imagem || this.imagemPadrao
    };
  }

  private buscarNaApi(termo: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.carregando.set(true);

    this.produtoService.listarTodos().subscribe({
      next: (dados) => {
        const lista = Array.isArray(dados) ? dados : [];
        const formatados = lista.map(item => this.montarItem(item));
        const filtrados = formatados.filter(bolo => this.correspondeAoTermo(bolo, termo));
        this.resultados.set(filtrados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar bolos:', err);
        this.resultados.set([]);
        this.carregando.set(false);
      }
    });
  }

  adicionar(bolo: any) {
    this.cartService.adicionarItem({
      nome: bolo.nomeExibido,
      preco: bolo.precoExibido,
      qtd: 1,
      imagem: bolo.imagemExibida
    });
    alert(`"${bolo.nomeExibido}" foi adicionado à cesta com sucesso! 🛒`);
  }
}