#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}[Ollama Init]${NC} Iniciando Ollama..."

# Inicia o Ollama em background
/bin/ollama serve > /tmp/ollama.log 2>&1 &
OLLAMA_PID=$!

# Trap para garantir que o Ollama seja finalizado corretamente
trap "kill $OLLAMA_PID 2>/dev/null || true" EXIT

# Aguarda até que o Ollama esteja pronto (máximo 90 segundos)
echo -e "${YELLOW}[Ollama Init]${NC} Aguardando Ollama iniciar..."
for i in {1..90}; do
  if ollama list &>/dev/null; then
    echo -e "${GREEN}[Ollama Init]${NC} ✓ Ollama iniciado com sucesso"
    break
  fi
  echo -e "${YELLOW}[Ollama Init]${NC} Tentativa $i/90..."
  sleep 1
  
  if [ $i -eq 90 ]; then
    echo -e "${RED}[Ollama Init]${NC} ✗ Timeout ao aguardar Ollama"
    cat /tmp/ollama.log
    exit 1
  fi
done

# Pull do modelo (com retry)
echo -e "${YELLOW}[Ollama Init]${NC} Fazendo pull do modelo qwen2.5:1.5b..."
for attempt in {1..3}; do
  if ollama pull qwen2.5:1.5b; then
    echo -e "${GREEN}[Ollama Init]${NC} ✓ Modelo puxado com sucesso"
    break
  else
    if [ $attempt -lt 3 ]; then
      echo -e "${YELLOW}[Ollama Init]${NC} Falha na tentativa $attempt/3, retrying..."
      sleep 5
    else
      echo -e "${RED}[Ollama Init]${NC} ✗ Falha ao puxar modelo após 3 tentativas"
      cat /tmp/ollama.log
      exit 1
    fi
  fi
done

echo -e "${GREEN}[Ollama Init]${NC} Ollama pronto e modelo carregado!"
echo -e "${GREEN}[Ollama Init]${NC} Aguardando sinais..."

# Aguarda o Ollama continuar rodando
wait $OLLAMA_PID
