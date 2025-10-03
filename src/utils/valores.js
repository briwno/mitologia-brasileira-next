// src/utils/valores.js

/**
 * Verifica se um valor foi definido (não nulo e não indefinido).
 * @param {*} valor Valor a ser verificado.
 * @returns {boolean} Verdadeiro quando o valor está definido.
 */
export function valorFoiDefinido(valor) {
  if (valor === null) {
    return false;
  }
  if (valor === undefined) {
    return false;
  }
  return true;
}

/**
 * Retorna o valor informado quando estiver definido; caso contrário, devolve o padrão.
 * @param {*} valor Valor principal.
 * @param {*} padrao Valor padrão.
 * @returns {*} Valor final com fallback explícito.
 */
export function valorComPadrao(valor, padrao) {
  if (valorFoiDefinido(valor)) {
    return valor;
  }
  return padrao;
}

/**
 * Percorre uma lista de valores e devolve o primeiro que estiver definido.
 * @param  {...any} valores Valores a serem avaliados em ordem.
 * @returns {*} Primeiro valor definido ou nulo caso nenhum esteja definido.
 */
export function primeiroValorDefinido(...valores) {
  if (!Array.isArray(valores)) {
    return null;
  }
  for (let indice = 0; indice < valores.length; indice += 1) {
    const atual = valores[indice];
    if (valorFoiDefinido(atual)) {
      return atual;
    }
  }
  return null;
}

/**
 * Avalia uma condição e devolve o valor desejado conforme resultado booleano.
 * Substitui usos simples de operador || para valores padrão.
 * @param {*} valor Valor principal.
 * @param {*} padrao Valor alternativo quando a condição falha.
 * @returns {*} Valor final após validação.
 */
export function valorQuandoVerdadeiro(valor, padrao) {
  if (valor) {
    return valor;
  }
  return padrao;
}
