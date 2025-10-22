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
  if (Array.isArray(resposta.itemCards)) {
    return resposta.itemCards;
  } else {
    return [];
  }
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
  const efeitoRaw = primeiroValorDefinido(itemBruto.effects, itemBruto.effect, itemBruto.efeito);
  let efeito = null;
  
  if (efeitoRaw) {
    if (typeof efeitoRaw === 'string') {
      efeito = efeitoRaw;
    } else if (typeof efeitoRaw === 'object') {
      // Mapear os campos do banco para o formato esperado pelo componente
      efeito = {
        descricao: primeiroValorDefinido(efeitoRaw.description, efeitoRaw.descricao, itemBruto.description),
        dano: primeiroValorDefinido(efeitoRaw.damage, efeitoRaw.dano),
        cura: primeiroValorDefinido(efeitoRaw.heal, efeitoRaw.cura, efeitoRaw.regen_per_turn),
        defesa: primeiroValorDefinido(efeitoRaw.defense, efeitoRaw.defesa),
        ataque: primeiroValorDefinido(efeitoRaw.attack, efeitoRaw.ataque),
        duracao: primeiroValorDefinido(efeitoRaw.duration, efeitoRaw.duracao),
        valor: primeiroValorDefinido(efeitoRaw.value, efeitoRaw.valor),
        tipo: primeiroValorDefinido(efeitoRaw.type, efeitoRaw.tipo),
        condicao: primeiroValorDefinido(efeitoRaw.trigger, efeitoRaw.condicao),
        area_effect: efeitoRaw.area_effect,
        target: efeitoRaw.target,
      };
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
    novo: itemBruto.novo || false, // ← IMPORTANTE: campo novo
    imagens: {
      retrato: estruturaImagens.retrato,
      completa: estruturaImagens.completa
    },
    bruto: itemBruto,
  };
}

export async function carregarDadosDeCartas(filtros = {}) {
  const cartasResposta = await cardsAPI.getAll(filtros);
  let cartasBrutas;
  if (Array.isArray(cartasResposta.cards)) {
    cartasBrutas = cartasResposta.cards;
  } else {
    cartasBrutas = [];
  }
  
  console.log('🔍 [carregarDadosDeCartas] Total de cartas recebidas:', cartasBrutas.length);
  console.log('🔍 [carregarDadosDeCartas] Primeira carta (raw):', cartasBrutas[0]);
  
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

      const cartaFinal = {
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
        novo: carta.novo || false, // ← IMPORTANTE: pega do objeto original da API
      };
      
      if (cartaFinal.novo) {
        console.log('🆕 Carta marcada como NOVO:', cartaFinal.nome || cartaFinal.name, '| novo =', cartaFinal.novo);
      }
      
      return cartaFinal;
    })
    .filter(Boolean);

  const itensBrutos = await buscarItensDoBanco({
    raridade: filtros.raridade,
    tipoItem: filtros.tipoItem,
    comercializavel: filtros.comercializavel,
    limite: filtros.limiteItens,
    deslocamento: filtros.deslocamentoItens,
  });
  
  console.log('🔍 [carregarDadosDeCartas] Total de itens recebidos:', itensBrutos.length);
  
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
