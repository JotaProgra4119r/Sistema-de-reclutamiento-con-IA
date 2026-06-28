#TalentMosaic — Motor Híbrido de Segmentación de Talento y NLP

Este proyecto es una plataforma web full-stack de nivel industrial diseñada para la automatización, preprocesamiento, análisis estadístico avanzado e inferencia predictiva en tiempo real sobre datos de capital humano. El sistema implementa un motor híbrido de Machine Learning capaz de ejecutar segmentación numérica y procesamiento de lenguaje natural (NLP) a través de cuatro modelos de clustering no supervisado.

---

Requisitos del Sistema

Antes de iniciar la instalación, asegúrese de contar con los siguientes entornos globales configurados en su máquina:

* **Sistema Operativo:** Windows 10/11 o Linux/macOS.
* **Python:** v3.10 o superior (Se requiere compilador de 64 bits para el soporte de dependencias matemáticas).
* **Node.js:** v18.0.0 o superior (Recomendado LTS) junto al gestor de paquetes `npm`.
* **Terminal Recomendada:** PowerShell (en Windows) o Bash Terminal.

---
Guía de Instalación Paso a Paso

### 1. Clonación y Estructura de Carpetas
Al abrir el entorno, asegúrese de estar parado en la raíz del proyecto (`OLC2_EJ26_ML_-45-TalentMosaic`), donde visualizará la siguiente jerarquía:
```text
├── .venv/               # Entorno virtual de Python (Raíz)
├── Backend/             # Código fuente del servidor (FastAPI)
├── Front-end/           # Interfaz de usuario (React + Vite)
└── Datasets/            # Archivos masivos de prueba (.csv)


Terminal 1: Encender el Backend (FastAPI)
Abre la primera terminal y copia este bloque completo para romper el bloqueo de Windows, activar tu entorno virtual de la raíz y encender Uvicorn:

PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\.venv\Scripts\Activate.ps1
cd Backend
uvicorn main:app --reload
Terminal 2: Encender el Frontend (React + Vite)
Abre una segunda terminal en paralelo para la interfaz visual y pega este bloque para moverte a la carpeta y levantar el compilador en caliente:

PowerShell
cd Front-end
npm run dev
Comandos de Mantenimiento (Por si los necesitas)
Si en algún momento necesitas reinstalar dependencias porque tu compañero metió algo nuevo o quieres limpiar la caché de Node, usa estos comandos sueltos en sus respectivas carpetas:

Para forzar la instalación del frente si choca Recharts:

PowerShell
cd Front-end
npm install --legacy-peer-deps
Para reinstalar las dependencias matemáticas si falla Python:

PowerShell
pip install fastapi uvicorn pandas scikit-learn pydantic python-multipart matplotlib jinja2 we
