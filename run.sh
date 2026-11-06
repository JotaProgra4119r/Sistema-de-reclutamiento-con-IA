#!/usr/bin/env bash
# =============================================================================
# TalentMosaic - RRHH Platform Launcher para Linux / Debian / Ubuntu / macOS
# =============================================================================

set -e

# Configuración de colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=================================================================${NC}"
echo -e "${GREEN}  🌿 TALENTMOSAIC — PLATAFORMA DE RRHH Y CLUSTERING INTELIGENTE  ${NC}"
echo -e "${CYAN}=================================================================${NC}"
echo ""

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 1. Comprobar instalación de Python
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}[ERROR] No se encontró Python 3 instalado en el sistema.${NC}"
    echo "Instálalo ejecutando: sudo apt update && sudo apt install -y python3 python3-venv python3-pip"
    exit 1
fi

# 2. Comprobar instalación de Node.js y npm
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
    echo -e "${RED}[ERROR] Node.js o npm no están instalados.${NC}"
    echo "Instálalos ejecutando: sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

echo -e "${BLUE}[1/4] Verificando entorno virtual de Python...${NC}"
VENV_DIR="$PROJECT_ROOT/.venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creando entorno virtual en $VENV_DIR..."
    $PYTHON_CMD -m venv "$VENV_DIR"
fi

# Activar entorno virtual
source "$VENV_DIR/bin/activate"

echo -e "${BLUE}[2/4] Verificando dependencias del Backend...${NC}"
if [ -f "$PROJECT_ROOT/Backend/requirements.txt" ]; then
    pip install --upgrade pip --quiet
    pip install -r "$PROJECT_ROOT/Backend/requirements.txt" --quiet
fi

echo -e "${BLUE}[3/4] Verificando dependencias del Frontend...${NC}"
if [ ! -d "$PROJECT_ROOT/Front-end/node_modules" ]; then
    echo "Instalando paquetes de Node.js en Front-end..."
    (cd "$PROJECT_ROOT/Front-end" && npm install)
fi

echo -e "${BLUE}[4/4] Verificando base de datos y archivos planos en /Database...${NC}"
mkdir -p "$PROJECT_ROOT/Database"

# Manejador de parada segura (Ctrl+C / SIGINT / SIGTERM)
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servidores de Backend y Frontend...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}TalentMosaic detenido correctamente.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo ""
echo -e "${GREEN}Iniciando servicios en segundo plano...${NC}"
echo -e "  🔹 Backend FastAPI:  ${CYAN}http://localhost:8000${NC} (Swagger docs: http://localhost:8000/docs)"
echo -e "  🔹 Frontend React:    ${CYAN}http://localhost:5173${NC}"
echo ""

# Iniciar Backend
export PYTHONPATH="$PROJECT_ROOT/Backend:$PYTHONPATH"
cd "$PROJECT_ROOT/Backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Iniciar Frontend
cd "$PROJECT_ROOT/Front-end"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

cd "$PROJECT_ROOT"

echo -e "${CYAN}=================================================================${NC}"
echo -e "${GREEN}  ✓ Sistema iniciado exitosamente. Presiona [Ctrl + C] para salir. ${NC}"
echo -e "${CYAN}=================================================================${NC}"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
