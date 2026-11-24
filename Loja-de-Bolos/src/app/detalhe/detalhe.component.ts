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
  selector: 'app-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhe.component.html',
  styleUrl: './detalhe.component.css'
})
export class DetalheComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  nomeBolo = signal<string>('Bolo Selecionado');
  descricaoBolo = signal<string>('Massa caseira preparada no dia com ingredientes selecionados.');
  precoBolo = signal<number>(45.00);
  imagemBolo = signal<string>('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600');

  private readonly catalogoBolos: Record<string, InfoBolo> = {
    'bolo de chocolate trufado': {
      preco: 45.00,
      imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
      descricao: 'Massa de cacau 50%, ovos, farinha de trigo, leite, manteiga e ganache trufada de chocolate meio amargo.'
    },
    'bolo de cenoura com chocolate': {
      preco: 38.00,
      imagem: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
      descricao: 'Cenoura fresca ralada, óleo vegetal, ovos, açúcar, farinha de trigo e cobertura cremosa de chocolate ao leite.'
    },
    'bolo red velvet especial': {
      preco: 60.00,
      imagem: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600',
      descricao: 'Massa aveludada com toque de cacau e baunilha, farinha de trigo, manteiga, leitelho e cobertura cremosa.'
    },
    'bolo de prestigio cremoso': {
      preco: 42.00,
      imagem: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600',
      descricao: 'Massa fofinha de chocolate com recheio cremoso de coco ralado e leite condensado.'
    },
    'bolo de limao siciliano': {
      preco: 40.00,
      imagem: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600',
      descricao: 'Massa leve com raspas e suco natural de limão-siciliano, farinha de trigo, ovos, manteiga e cobertura cítrica.'
    },
    'bolo de fuba com goiabada': {
      preco: 30.00,
      imagem: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600',
      descricao: 'Fubá mimoso, farinha de trigo, ovos, leite, óleo, fermento e pedaços de goiabada cremosa.'
    },
    'bolo doce de leite com nozes': {
      preco: 58.00,
      imagem: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600',
      descricao: 'Massa caseira macia com recheio farto de doce de leite cozido e nozes picadas.'
    },
    'bolo de maracuja trufado': {
      preco: 46.00,
      imagem: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600',
      descricao: 'Massa aerada com polpa natural de maracujá e cobertura trufada agridoce.'
    },
    'bolo de castanha do para': {
      preco: 50.00,
      imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600',
      descricao: 'Massa amanteigada com castanha-do-pará triturada e cobertura delicada.'
    },
    'bolo de brigadeiro gourmet': {
      preco: 48.00,
      imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600',
      descricao: 'Massa de chocolate com brigadeiro cremoso feito com chocolate nobre, manteiga e granulado.'
    },
    'bolo floresta negra': {
      preco: 55.00,
      imagem: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600',
      descricao: 'Massa de chocolate, chantilly, cerejas em calda e raspas de chocolate.'
    },
    'bolo de coco gelado': {
      preco: 39.00,
      imagem: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600',
      descricao: 'Massa úmida umedecida com leite de coco e leite condensado, finalizada com coco ralado.'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const param = params.get('nome') || params.get('codigo') || '';
      const codigoNum = Number(param);

      if (isPlatformBrowser(this.platformId) && param && !Number.isNaN(codigoNum) && codigoNum > 0) {
        this.produtoService.buscarPorCodigo(codigoNum).subscribe({
          next: (produto) => {
            if (produto) {
              this.aplicarDadosProduto(produto);
            } else {
              this.aplicarFallbackPorTexto(param);
            }
          },
          error: () => {
            this.aplicarFallbackPorTexto(param);
          }
        });
      } else {
        this.aplicarFallbackPorTexto(param);
      }
    });
  }

  private normalizarChave(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private aplicarDadosProduto(produto: any) {
    const nome = produto?.nome || produto?.descricao || 'Bolo Selecionado';
    const chave = this.normalizarChave(nome);
    const info = this.catalogoBolos[chave];

    this.nomeBolo.set(nome);
    this.precoBolo.set(Number(produto?.valor ?? produto?.preco ?? info?.preco ?? 45.00));
    this.imagemBolo.set(info?.imagem || produto?.imagem || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600');

    if (produto?.descritivo && String(produto.descritivo).trim().length > 0 && String(produto.descritivo).trim() !== 'Bolo caseiro com cobertura trufada') {
      this.descricaoBolo.set(produto.descritivo);
    } else if (info?.descricao) {
      this.descricaoBolo.set(info.descricao);
    } else if (produto?.descritivo) {
      this.descricaoBolo.set(produto.descritivo);
    }
  }

  private aplicarFallbackPorTexto(texto: string) {
    const chave = this.normalizarChave(texto);
    const info = this.catalogoBolos[chave];

    if (texto) {
      this.nomeBolo.set(texto);
    }
    if (info) {
      this.precoBolo.set(info.preco);
      this.imagemBolo.set(info.imagem);
      this.descricaoBolo.set(info.descricao);
    }
  }

  adicionarAoCarrinho() {
    const nome = this.nomeBolo();
    const preco = this.precoBolo();
    const imagem = this.imagemBolo();

    this.cartService.adicionarItem({ nome, preco, qtd: 1, imagem });
    alert(`"${nome}" foi adicionado à cesta com sucesso! 🛒`);
  }
}