
function buscaBinariaComCopia(arr, alvo, offset = 0) {
  if (arr.length === 0) {
    return -1;
  }

  const mid = Math.floor(arr.length / 2);

  if (arr[mid] === alvo) {
    return offset + mid;
  }

  if (alvo < arr[mid]) {
    const esquerda = arr.slice(0, mid);
    return buscaBinariaComCopia(esquerda, alvo, offset);
  } else {
    const direita = arr.slice(mid + 1);
    return buscaBinariaComCopia(direita, alvo, offset + mid + 1);
  }
}

function buscaBinariaPorIndices(arr, alvo, ini = 0, fim = arr.length - 1) {
  if (ini > fim) {
    return -1;
  }

  const mid = Math.floor((ini + fim) / 2);

  if (arr[mid] === alvo) {
    return mid;
  }

  if (alvo < arr[mid]) {
    return buscaBinariaPorIndices(arr, alvo, ini, mid - 1);
  } else {
    return buscaBinariaPorIndices(arr, alvo, mid + 1, fim);
  }
}
