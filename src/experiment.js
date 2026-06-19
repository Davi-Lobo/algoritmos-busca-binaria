function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function gerarTamanhos() {
  const { MIN_SIZE, MAX_SIZE, NUM_SIZES } = CONFIG;
  const tamanhos = [];
  const passo = (MAX_SIZE - MIN_SIZE) / (NUM_SIZES - 1);
  for (let i = 0; i < NUM_SIZES; i++) {
    tamanhos.push(Math.round(MIN_SIZE + i * passo));
  }
  return tamanhos;
}

function gerarCatalogoOrdenado(n) {
  const catalogo = new Array(n);
  let id = Math.floor(Math.random() * 10) + 1;

  for (let i = 0; i < n; i++) {
    catalogo[i] = id;
    id += Math.floor(Math.random() * 10) + 1;
  }

  return catalogo;
}

function escolherAlvo(catalogo) {
  if (Math.random() < 0.85) {
    const idx = Math.floor(Math.random() * catalogo.length);
    return catalogo[idx];
  }
  return catalogo[catalogo.length - 1] + Math.floor(Math.random() * 100) + 1;
}

const MIN_MEDIDA_MS = 5;

// Acumulador global usado para evitar que o otimizador (JIT) elimine as
// chamadas cujo resultado "não é usado" (dead code elimination).
let _somaAntiOtimizacao = 0;

/**
 * Mede o tempo MÉDIO POR CHAMADA de `fn(...args)`, em MICROSSEGUNDOS.
 *
 * Repete a chamada num laço, aumentando o número de iterações até o tempo
 * total da amostra superar MIN_MEDIDA_MS; então divide pelo nº de iterações.
 * Para funções lentas (cópia em vetores grandes) basta uma ou poucas
 * iterações; para a busca por índices, são necessárias muitas — em ambos os
 * casos obtemos um valor confiável, acima do "ruído" do relógio.
 *
 * @param {Function} fn
 * @param {Array} args  argumentos passados a cada chamada (mesmo alvo)
 * @returns {number} tempo médio por chamada em µs
 */
function medirPorChamada(fn, args) {
  let iteracoes = 1;
  while (true) {
    const inicio = performance.now();
    for (let i = 0; i < iteracoes; i++) {
      _somaAntiOtimizacao += fn.apply(null, args);
    }
    const decorridoMs = performance.now() - inicio;

    if (decorridoMs >= MIN_MEDIDA_MS) {
      // ms por chamada → µs por chamada (× 1000)
      return (decorridoMs / iteracoes) * 1000;
    }

    // Amostra rápida demais: estima quantas iterações faltam para atingir o
    // alvo (com folga de 1,5×) e tenta de novo. Se nem registrou tempo, ×4.
    iteracoes = decorridoMs > 0
      ? Math.ceil(iteracoes * (MIN_MEDIDA_MS / decorridoMs) * 1.5)
      : iteracoes * 4;
  }
}

/**
 * Executa o experimento completo.
 *
 * Para cada tamanho de entrada:
 *  - gera um catálogo ordenado;
 *  - repete REPETITIONS vezes: escolhe um alvo aleatório e cronometra os
 *    dois algoritmos com o MESMO alvo;
 *  - verifica a corretude (mesma resposta) — diverge ⇒ console.error;
 *  - mede o tempo médio por chamada (µs) de cada algoritmo e calcula a média
 *    sobre as repetições.
 *
 * @param {(feito:number, total:number) => Promise|void} onProgresso
 *        callback de progresso chamado após cada tamanho concluído.
 * @returns {Promise<Array<{tamanho, mediaCopia, mediaIndices}>>}
 */
async function executarExperimento(onProgresso) {
  const { REPETITIONS } = CONFIG;
  const tamanhos = gerarTamanhos();
  const total = tamanhos.length;
  const dados = [];

  for (let t = 0; t < total; t++) {
    const tamanho = tamanhos[t];
    const catalogo = gerarCatalogoOrdenado(tamanho);

    let somaCopiaUs = 0;
    let somaIndicesUs = 0;

    for (let r = 0; r < REPETITIONS; r++) {
      const alvo = escolherAlvo(catalogo);

      // Verificação de corretude: ambos DEVEM retornar o mesmo índice.
      const r1 = buscaBinariaComCopia(catalogo, alvo);
      const r2 = buscaBinariaPorIndices(catalogo, alvo);
      if (r1 !== r2) {
        console.error(
          '[CORRETUDE] Divergência detectada!',
          `tamanho=${tamanho}`,
          `alvo=${alvo}`,
          `comCopia=${r1}`,
          `porIndices=${r2}`
        );
      }

      // Medição calibrada (µs por chamada), com o MESMO alvo para os dois.
      somaCopiaUs += medirPorChamada(buscaBinariaComCopia, [catalogo, alvo]);
      somaIndicesUs += medirPorChamada(buscaBinariaPorIndices, [catalogo, alvo]);
    }

    dados.push({
      tamanho,
      mediaCopia: somaCopiaUs / REPETITIONS,
      mediaIndices: somaIndicesUs / REPETITIONS
    });

    // reporta progresso e cede o controle ao navegador (UI responsiva)
    if (onProgresso) {
      await onProgresso(t + 1, total);
    }
    await sleep(0);
  }

  return dados;
}
