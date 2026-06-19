# Comparação Experimental de Algoritmos de Busca Binária

Experimento de benchmark, executado inteiramente no navegador, que compara duas
implementações **recursivas** de busca binária sobre um catálogo de e-commerce
ordenado por ID, medindo o tempo médio de execução para catálogos de tamanhos
crescentes.

## Os dois algoritmos comparados

| # | Implementação | Estratégia | Custo |
|---|---------------|-----------|-------|
| 1 | **Com cópia de subvetor** | A cada chamada copia a metade relevante do vetor (`arr.slice`) | ~O(n) de trabalho total — a "lenta" |
| 2 | **Por índices** | Mantém o mesmo vetor e só ajusta os índices `ini`/`fim` | O(1) por nível — a "eficiente" |

Ambas recebem um vetor ordenado e um alvo, e retornam o índice do elemento no
vetor original (ou `-1` se ausente). O experimento verifica a **corretude**
(as duas devem retornar sempre o mesmo resultado) antes de cronometrar.

## Como executar

Não há etapa de build nem dependências para instalar. Basta abrir o
`index.html` no navegador:

```bash
# Opção 1 — abrir o arquivo diretamente
# (clique duas vezes em index.html ou arraste para o navegador)

# Opção 2 — servir localmente (recomendado, evita problemas de cache/CDN)
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Na página, clique em **"▶ Iniciar Experimento"**. Ao final são exibidos:

- **Gráficos individuais** — cada algoritmo isolado, com escala de Y própria.
- **Gráfico comparativo** — os dois sobrepostos (eixo X em escala logarítmica).
- **Tabela de dados brutos** — tempo médio (µs) de cada algoritmo por tamanho.

> Dica: abra o console do navegador (F12) para conferir a verificação de
> corretude.

## Configuração

Os parâmetros do experimento ficam em `src/config.js`:

| Parâmetro | Significado |
|-----------|-------------|
| `MIN_SIZE` | Menor tamanho de catálogo testado |
| `MAX_SIZE` | Maior tamanho de catálogo testado |
| `NUM_SIZES` | Quantidade de tamanhos distintos (igualmente espaçados) |
| `REPETITIONS` | Repetições por tamanho (usadas para tirar a média) |

> Atenção: os valores padrão (100k–10M) tornam o algoritmo "com cópia" lento —
> uma execução completa pode demorar. Reduza os valores para testes rápidos.

## Estrutura do projeto

```
index.html          Página principal e orquestração da UI
documentacao.html   Documentação detalhada da metodologia
assets/style.css    Estilos
src/config.js       Parâmetros do experimento (CONFIG)
src/algorithms.js   As duas buscas binárias comparadas
src/experiment.js   Geração de dados, medição de tempo e corretude
src/ui.js           Gráficos (Chart.js), tabela e barra de progresso
```

A única dependência externa é o **Chart.js**, carregado via CDN em tempo de
execução (requer conexão com a internet na primeira carga).

## Como a medição funciona

Uma única busca binária leva nanossegundos — abaixo da resolução de tempo que os
navegadores expõem (`performance.now()` é deliberadamente impreciso como
mitigação de Spectre). Por isso o experimento mede um **lote** de chamadas em
laço, aumentando as iterações até superar um tempo mínimo, e então divide pelo
total para obter o tempo **médio por chamada** em microssegundos (µs).
