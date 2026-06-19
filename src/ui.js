/**
 * ui.js
 * Camada de apresentação: gráfico (Chart.js), tabela de dados brutos e
 * barra de progresso. Depende de Chart.js (carregado via CDN no index.html).
 */

// Cores de cada algoritmo, reutilizadas em todos os gráficos.
const COR_COPIA = '#e74c3c';
const COR_INDICES = '#2980b9';

// Rótulos longos (legenda) de cada algoritmo.
const LABEL_COPIA = 'Algoritmo 1 — Recursiva com cópia de subvetor';
const LABEL_INDICES = 'Algoritmo 2 — Recursiva por índices (sem cópia)';

// Registro dos Chart ativos por id de canvas, para destruí-los antes de
// redesenhar (evita vazamento de memória ao reexecutar o experimento).
const graficos = {};

/**
 * Constrói um dataset de linha no padrão do projeto.
 * @param {string} label  rótulo exibido na legenda/tooltip
 * @param {string} cor    cor da linha e dos pontos
 * @param {Array} dados   linhas do experimento
 * @param {(d) => number} seletorY  extrai o valor Y de cada linha
 */
function montarDataset(label, cor, dados, seletorY) {
  return {
    label,
    data: dados.map((d) => ({ x: d.tamanho, y: seletorY(d) })),
    borderColor: cor,
    backgroundColor: cor,
    tension: 0.2,
    pointRadius: 4
  };
}

/**
 * Desenha/redesenha um gráfico de linhas no canvas indicado, seguindo o mesmo
 * padrão de eixos (X log, Y em µs), tooltip e estilo dos demais.
 * @param {string} canvasId  id do <canvas>
 * @param {string} titulo    título exibido acima do gráfico
 * @param {Array}  datasets  um ou mais datasets (de montarDataset)
 */
function desenharGrafico(canvasId, titulo, datasets) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (graficos[canvasId]) {
    graficos[canvasId].destroy();
  }

  graficos[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: { display: true, text: titulo },
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (item) =>
              `${item.dataset.label}: ${item.parsed.y.toFixed(2)} µs`
          }
        }
      },
      scales: {
        x: {
          type: 'logarithmic',
          title: { display: true, text: 'Tamanho da entrada (nº de produtos) — escala log' }
        },
        y: {
          title: { display: true, text: 'Tempo médio (µs)' },
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Desenha os três gráficos: cada algoritmo isolado (lado a lado) e o conjunto.
 * Os gráficos individuais usam escala de Y própria, evidenciando o crescimento
 * de cada algoritmo por si só; o conjunto permite a comparação direta.
 *
 * @param {Array<{tamanho, mediaCopia, mediaIndices}>} dados
 */
function renderGraficos(dados) {
  // Individuais (lado a lado)
  desenharGrafico('grafico-copia', 'Algoritmo 1 — cópia de subvetor', [
    montarDataset(LABEL_COPIA, COR_COPIA, dados, (d) => d.mediaCopia)
  ]);
  desenharGrafico('grafico-indices', 'Algoritmo 2 — por índices', [
    montarDataset(LABEL_INDICES, COR_INDICES, dados, (d) => d.mediaIndices)
  ]);

  // Conjunto
  desenharGrafico('grafico', 'Comparação — tempo médio por tamanho da entrada', [
    montarDataset(LABEL_COPIA, COR_COPIA, dados, (d) => d.mediaCopia),
    montarDataset(LABEL_INDICES, COR_INDICES, dados, (d) => d.mediaIndices)
  ]);
}

/**
 * Preenche a tabela de dados brutos.
 * Colunas: tamanho da entrada, tempo médio algoritmo 1, tempo médio algoritmo 2.
 *
 * @param {Array<{tamanho, mediaCopia, mediaIndices}>} dados
 */
function renderTabela(dados) {
  const tbody = document.querySelector('#tabela-dados tbody');
  tbody.innerHTML = '';

  for (const d of dados) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${d.tamanho.toLocaleString('pt-BR')}</td>` +
      `<td>${d.mediaCopia.toFixed(2)}</td>` +
      `<td>${d.mediaIndices.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  }

  document.getElementById('resultados').hidden = false;
}

/**
 * Atualiza a barra de progresso.
 * @param {number} feito  tamanhos já processados
 * @param {number} total  total de tamanhos
 */
function atualizarProgresso(feito, total) {
  const pct = Math.round((feito / total) * 100);
  const barra = document.getElementById('barra-progresso');
  const rotulo = document.getElementById('progresso-rotulo');
  barra.style.width = pct + '%';
  barra.setAttribute('aria-valuenow', String(pct));
  rotulo.textContent = `Processando… ${feito} de ${total} tamanhos (${pct}%)`;
}
