#!/bin/bash

# 📦 Docker Compose - Gerenciador Centralizado
# Simplifica uso dos múltiplos docker-compose

set -e

DOCKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$DOCKER_DIR")"
COMPOSE_FILE_DEV="$DOCKER_DIR/docker-compose.yml"
COMPOSE_FILE_PROD="$DOCKER_DIR/docker-compose.prod.yml"
ENV_FILE="$DOCKER_DIR/.env"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Verificar .env
if [ ! -f "$ENV_FILE" ]; then
    print_info "Criando .env a partir de .env.example..."
    cp "$DOCKER_DIR/.env.example" "$ENV_FILE"
    print_success ".env criado com sucesso"
fi

# Comando padrão é development
COMMAND="${1:-up}"
ENVIRONMENT="${2:-dev}"

case $ENVIRONMENT in
    dev|development)
        print_info "Usando configuração de DESENVOLVIMENTO"
        COMPOSE_FILE="$COMPOSE_FILE_DEV"
        ;;
    prod|production)
        print_info "Usando configuração de PRODUÇÃO"
        COMPOSE_FILE="$COMPOSE_FILE_PROD"
        ;;
    *)
        echo "Ambiente desconhecido: $ENVIRONMENT"
        echo "Use: dev ou prod"
        exit 1
        ;;
esac

# Carregar .env
set -a
source "$ENV_FILE"
set +a

print_info "Executando: docker-compose -f $COMPOSE_FILE $COMMAND"
echo ""

# Executar docker-compose
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" $COMMAND "$@"
