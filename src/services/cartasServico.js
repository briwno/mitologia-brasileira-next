// src/services/cartasServico.js

import { cardsAPI, itemCardsAPI } from '@/utils/api';
import {
  mapearCartaDaApi,
  inferirCustoParaJogar,
  traduzirValor,
  TRANSLATION_MAPS,
} from '@/utils/cardUtils';
import { primeiroValorDefinido, valorQuandoVerdadeiro, valorComPadrao, valorFoiDefinido } from '@/utils/valores';
import { normalizarEstruturaDeImagens } from '@/utils/normalizadores';

async function buscarItensDoBanco(filtros = {}) {
  const parametrosDeFiltro = {};
  
  if (filtros.raridade) {
    parametrosDeFiltro.rarity = filtros.raridade;
  }
  
  if (filtros.tipoItem) {
    parametrosDeFiltro.itemType = filtros.tipoItem;
  }
  
  if (filtros.comercializavel !== undefined) {
    parametrosDeFiltro.isTradeable = filtros.comercializavel;
  }
  
  if (filtros.limite) {
    parametrosDeFiltro.limit = filtros.limite;
  }
  
  if (filtros.deslocamento) {
    parametrosDeFiltro.offset = filtros.deslocamento;
  }

  const resposta = await itemCardsAPI.getAll(parametrosDeFiltro);
  return Array.isArray(resposta.itemCards) ? resposta.itemCards : [];
}

function prepararItemParaJogo(itemBruto) {
  if (!itemBruto) {
    return null;
  }

  const custo = inferirCustoParaJogar(itemBruto);
  let valorFinal = 1;
  
  if (typeof custo === 'number') {
    valorFinal = custo;
  } else {
    const valorAlternativo = primeiroValorDefinido(itemBruto.value, itemBruto.valor);
    if (valorFoiDefinido(valorAlternativo)) {
      valorFinal = valorAlternativo;
    }
  }
  
  const estruturaImagens = normalizarEstruturaDeImagens(itemBruto);
  
  // Prepare efeito ensuring it's either a string or an object with valid description
  const efeitoRaw = primeiroValorDefinido(itemBruto.effect, itemBruto.efeito, itemBruto.effects);
  let efeito = null;
  
  if (efeitoRaw) {
    if (typeof efeitoRaw === 'string') {
      efeito = efeitoRaw;
    } else if (typeof efeitoRaw === 'object' && (efeitoRaw.descricao || efeitoRaw.description)) {
      efeito = efeitoRaw;
    }
  }

  return {
    id: itemBruto.id,
    nome: primeiroValorDefinido(itemBruto.name, itemBruto.nome, 'Item sem nome'),
    imagem: estruturaImagens.retrato,
    tipo: 'item',
    tipo_item: valorComPadrao(
      traduzirValor(
        primeiroValorDefinido(itemBruto.itemType, itemBruto.item_type, itemBruto.tipo),
        TRANSLATION_MAPS.ITEM_TYPE
      ),
      'Consumível'
    ),
    efeito: efeito,
    valor: valorFinal,
    raridade: valorComPadrao(
      traduzirValor(
        primeiroValorDefinido(itemBruto.rarity, itemBruto.raridade),
        TRANSLATION_MAPS.RARITY
      ),
      'Comum'
    ),
    custo: valorFinal,
    descricao: primeiroValorDefinido(itemBruto.description, itemBruto.descricao),
    isTradeable: primeiroValorDefinido(itemBruto.isTradeable, itemBruto.is_tradeable, true),
    unlockCondition: primeiroValorDefinido(itemBruto.unlockCondition, itemBruto.unlock_condition),
    imagens: {
      retrato: estruturaImagens.retrato,
      completa: estruturaImagens.completa
    },
    bruto: itemBruto,
  };
}

export async function carregarDadosDeCartas(filtros = {}) {
  const cartasResposta = await cardsAPI.getAll(filtros);
  const cartasBrutas = Array.isArray(cartasResposta.cards) ? cartasResposta.cards : [];
  const cartas = cartasBrutas
    .map((carta) => {
      const local = mapearCartaDaApi(carta);
      if (!local) {
        return null;
      }
      const imagens = valorQuandoVerdadeiro(local.imagens, {});
      const retrato = primeiroValorDefinido(
        imagens.retrato,
        imagens.portrait,
        carta.images?.portrait,
        carta.image
      );
      const completa = primeiroValorDefinido(
        imagens.completa,
        imagens.full,
        carta.images?.full,
        carta.images?.completa
      );

      return {
        ...local,
        imagem: primeiroValorDefinido(retrato, completa, '/images/placeholder.svg'),
        imagens: {
          retrato: retrato || '/images/placeholder.svg',
          completa: completa || retrato || '/images/placeholder.svg',
        },
        images: {
          portrait: retrato || '/images/placeholder.svg',
          full: completa || retrato || '/images/placeholder.svg',
        },
        ataque: primeiroValorDefinido(local.ataque, carta.attack, 3),
        defesa: primeiroValorDefinido(local.defesa, carta.defense, 3),
        vida: primeiroValorDefinido(local.vida, carta.life, local.defesa, 3),
        raridade: primeiroValorDefinido(local.raridade, carta.rarity, 'Comum'),
      };
    })
    .filter(Boolean);

  const itensBrutos = await buscarItensDoBanco({
    raridade: filtros.raridade,
    tipoItem: filtros.tipoItem,
    comercializavel: filtros.comercializavel,
    limite: filtros.limiteItens,
    deslocamento: filtros.deslocamentoItens,
  });
  const itens = itensBrutos.map((item) => prepararItemParaJogo(item)).filter(Boolean);

  return {
    cartas,
    itens,
  };
}

export async function obterCartaPorId(identificador) {
  if (!identificador) {
    throw new Error('Identificador da carta é obrigatório.');
  }
  const resposta = await cardsAPI.getById(identificador);
  return mapearCartaDaApi(resposta.card || resposta);
}

export async function obterItensDoJogo(filtros = {}) {
  const itensBrutos = await buscarItensDoBanco(filtros);
  return itensBrutos.map((item) => prepararItemParaJogo(item)).filter(Boolean);
}
