# Testes de carga e desempenho — FutBot Brasil (JMeter)

Plano de teste de carga do canal de chat WebSocket (`/v1/chat`) do backend, usado
para validar os requisitos não funcionais de desempenho:

| Requisito | Critério verificado no plano |
| --------- | ---------------------------- |
| RNF01 — Eficiência | Primeiro retorno do chatbot em até **3 s** (Duration Assertion no sampler "Enviar pergunta e ler primeiro retorno"). |
| RNF02 — Desempenho | Tempo da transação "Conversa completa" sob carga. |
| RNF03 — Disponibilidade | Taxa de erro (`% Error`) deve permanecer baixa com múltiplos acessos. |

> O endpoint faz *streaming* de vários frames (`type: "token"` …) e finaliza com
> `type: "done"`. O sampler principal mede o **tempo até o primeiro retorno**
> (time‑to‑first‑token), que é a métrica de responsividade percebida pelo usuário.
> O sampler opcional "Ler proximo frame do stream" pode ser habilitado para
> drenar/observar frames seguintes.

## Pré-requisitos

1. **Java 11+** (JDK) e **Apache JMeter 5.6+**.
2. **Plugin WebSocket Samplers** (Peter Doornbosch). JMeter não testa WebSocket
   nativamente. Instale por uma das opções:
   - Via **Plugins Manager**: menu *Options → Plugins Manager → Available Plugins*,
     procure por **"WebSocket Samplers by Peter Doornbosch"**, marque e aplique; ou
   - Baixe o `JMeterWebSocketSamplers-x.y.z.jar` e copie para
     `$JMETER_HOME/lib/ext/`, depois reinicie o JMeter.
3. **Backend em execução** apontando para uma instância acessível:
   ```bash
   cd backend
   npm run dev        # sobe em http://localhost:8081  (ws://localhost:8081/v1/chat)
   ```
   > Atenção: o backend chama o Google Gemini de verdade. Para um teste de carga
   > sem consumir cota da API, suba uma instância com os serviços mockados ou
   > aponte `host`/`port` para um ambiente de homologação dedicado.

## Execução headless (CLI) — recomendado para relatórios

A partir desta pasta (`backend/load-tests`):

```bash
jmeter -n \
  -t futbot-chat-load-test.jmx \
  -l results/run.jtl \
  -e -o results/report \
  -Jhost=localhost -Jport=8081 \
  -Jthreads=10 -Jrampup=10 -Jloops=5
```

- `-n` modo não‑gráfico (carga real); `-l` salva os resultados brutos;
- `-e -o results/report` gera o dashboard HTML ao final;
- Parâmetros sobrescrevíveis: `host`, `port`, `path`, `threads`, `rampup`, `loops`.

Abra o GUI apenas para editar/depurar o plano (não use o GUI para a carga real):

```bash
jmeter -t futbot-chat-load-test.jmx
```

## Cenários sugeridos

| Cenário | Parâmetros | Objetivo |
| ------- | ---------- | -------- |
| Desempenho (RNF01) | `threads=10 rampup=10 loops=10` | Tempo de resposta em carga normal. |
| Carga | `threads=50 rampup=30 loops=10` | Comportamento sob volume elevado. |
| Estresse | incrementar `threads` (100 → 200 → 400) | Identificar o limite operacional (Tabela 03 — "Incremento gradual de carga"). |

## Estrutura

```
load-tests/
├── futbot-chat-load-test.jmx   # plano de teste JMeter
├── data/
│   └── perguntas.csv           # massa de dados (perguntas sobre futebol)
├── results/                    # saída dos relatórios (.jtl / dashboard) — gerada na execução
└── README.md
```
