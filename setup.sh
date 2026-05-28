#!/bin/bash

# 🚀 FutBot Chat - Setup Script
# Script para facilitar o setup inicial do projeto

set -e

echo "╔═════════════════════════════════════════════════════════════╗"
echo "║           🤖 FutBot Chat - Setup Inicial                   ║"
echo "╚═════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está na raiz do projeto
if [ ! -f "README.md" ]; then
    print_error "Deve estar na raiz do projeto (futbot/)"
    exit 1
fi

print_success "Estou na raiz do projeto"
echo ""

# Menu principal
echo "O que deseja fazer?"
echo ""
echo "1. 🐳 Executar com Docker (Recomendado)"
echo "2. 🖥️  Desenvolvimento Local"
echo "3. 📚 Ver Documentação"
echo "4. ✅ Validar Instalação"
echo "5. 🧹 Limpar Containers"
echo "6. ❌ Sair"
echo ""
read -p "Escolha uma opção (1-6): " choice

case $choice in
    1)
        echo ""
        print_info "Iniciando stack com Docker..."
        echo ""
        
        if ! command -v docker &> /dev/null; then
            print_error "Docker não está instalado"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose não está instalado"
            exit 1
        fi
        
        print_success "Docker e Docker Compose encontrados"
        echo ""
        print_info "Iniciando: Ollama + Backend + Frontend"
        echo ""
        docker-compose up --build
        ;;
        
    2)
        echo ""
        print_info "Setup para Desenvolvimento Local"
        echo ""
        
        # Backend
        echo "┌─ Backend Setup"
        cd backend
        
        if [ ! -d "node_modules" ]; then
            print_info "Instalando dependências do backend..."
            npm install
            print_success "Backend dependências instaladas"
        else
            print_success "Backend dependências já instaladas"
        fi
        
        cd ..
        echo "└─ Backend pronto"
        echo ""
        
        # Frontend
        echo "┌─ Frontend Setup"
        cd frontend
        
        if [ ! -d "node_modules" ]; then
            print_info "Instalando dependências do frontend..."
            npm install
            print_success "Frontend dependências instaladas"
        else
            print_success "Frontend dependências já instaladas"
        fi
        
        cd ..
        echo "└─ Frontend pronto"
        echo ""
        
        print_success "Setup completo!"
        echo ""
        echo "Próximos passos:"
        echo ""
        echo "Terminal 1 (Ollama):"
        echo "  $ ollama serve"
        echo ""
        echo "Terminal 2 (Backend):"
        echo "  $ cd backend && npm run dev"
        echo ""
        echo "Terminal 3 (Frontend):"
        echo "  $ cd frontend && npm run dev"
        echo ""
        echo "Depois acesse: http://localhost:3000"
        ;;
        
    3)
        echo ""
        print_info "Documentação Disponível:"
        echo ""
        echo "  📖 README.md .................. Documentação Completa"
        echo "  ⚡ QUICKSTART.md ............. Início Rápido"
        echo "  🔌 API.md .................... API WebSocket"
        echo "  ✅ VALIDATION.md ............ Checklist"
        echo "  🏗️  ARCHITECTURE.md ......... Arquitetura"
        echo "  📋 IMPLEMENTATION.md ........ Resumo Mudanças"
        echo ""
        read -p "Qual documento deseja abrir? (1-6 ou arquivo): " doc
        
        case $doc in
            1) open_doc="README.md" ;;
            2) open_doc="QUICKSTART.md" ;;
            3) open_doc="API.md" ;;
            4) open_doc="VALIDATION.md" ;;
            5) open_doc="ARCHITECTURE.md" ;;
            6) open_doc="IMPLEMENTATION.md" ;;
            *) open_doc="$doc" ;;
        esac
        
        if command -v cat &> /dev/null; then
            head -100 "$open_doc"
            echo ""
            print_info "Para ver o arquivo completo: cat $open_doc"
        fi
        ;;
        
    4)
        echo ""
        print_info "Validando Instalação..."
        echo ""
        
        # Verificar Docker
        if command -v docker &> /dev/null; then
            print_success "Docker instalado"
        else
            print_warning "Docker não instalado"
        fi
        
        # Verificar Node.js
        if command -v node &> /dev/null; then
            NODE_VERSION=$(node -v)
            print_success "Node.js $NODE_VERSION instalado"
        else
            print_warning "Node.js não instalado"
        fi
        
        # Verificar npm
        if command -v npm &> /dev/null; then
            NPM_VERSION=$(npm -v)
            print_success "npm $NPM_VERSION instalado"
        else
            print_warning "npm não instalado"
        fi
        
        # Verificar Ollama
        if command -v ollama &> /dev/null; then
            print_success "Ollama instalado"
        else
            print_warning "Ollama não instalado (não obrigatório com Docker)"
        fi
        
        # Verificar backend
        echo ""
        if [ -f "backend/package.json" ]; then
            print_success "Backend package.json encontrado"
        fi
        
        if [ -f "backend/.env" ]; then
            print_success "Backend .env configurado"
        else
            print_warning "Backend .env não encontrado"
        fi
        
        if [ -d "backend/node_modules" ]; then
            print_success "Backend node_modules instalado"
        else
            print_warning "Backend node_modules não instalado"
        fi
        
        # Verificar frontend
        echo ""
        if [ -f "frontend/package.json" ]; then
            print_success "Frontend package.json encontrado"
        fi
        
        if [ -d "frontend/node_modules" ]; then
            print_success "Frontend node_modules instalado"
        else
            print_warning "Frontend node_modules não instalado"
        fi
        
        # Verificar Docker images
        echo ""
        print_info "Imagens Docker:"
        docker images | grep -E 'futbot|ollama|node' || print_warning "Nenhuma imagem relevante encontrada"
        
        # Verificar containers rodando
        echo ""
        print_info "Containers em execução:"
        docker ps | grep -E 'futbot|ollama' || print_warning "Nenhum container em execução"
        
        echo ""
        print_success "Validação completa!"
        ;;
        
    5)
        echo ""
        print_warning "Limpando containers e images do FutBot..."
        echo ""
        
        print_info "Parando containers..."
        docker-compose down || print_warning "Nenhum container em execução"
        
        print_info "Removendo images..."
        docker rmi futbot-frontend futbot-backend 2>/dev/null || print_warning "Images não encontradas"
        
        print_success "Limpeza completa!"
        echo ""
        print_info "Para reiniciar: docker-compose up --build"
        ;;
        
    6)
        echo ""
        print_info "Saindo..."
        exit 0
        ;;
        
    *)
        print_error "Opção inválida"
        exit 1
        ;;
esac

echo ""
print_success "Pronto para começar! 🚀"
