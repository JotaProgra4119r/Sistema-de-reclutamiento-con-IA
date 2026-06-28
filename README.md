# 🎯 TalentMosaic — Motor Híbrido de Segmentación de Talento y NLP

Una plataforma web full-stack de nivel industrial diseñada para la automatización, preprocesamiento, análisis estadístico avanzado e inferencia predictiva en tiempo real sobre datos de capital humano.

## ✨ Características Principales

- **Motor Híbrido de ML**: Segmentación numérica + Procesamiento de Lenguaje Natural (NLP)
- **4 Modelos de Clustering**: Algoritmos no supervisados para análisis avanzado
- **Procesamiento en Tiempo Real**: Inferencia predictiva de alto rendimiento
- **Full-Stack Industrial**: Backend robusto + Frontend responsivo
- **Soporte Masivo de Datos**: Procesamiento de datasets grandes en CSV

---

## 📋 Requisitos del Sistema

Antes de comenzar, asegúrate de tener instalado:

| Componente | Versión Mínima | Notas |
|-----------|-----------------|-------|
| **Python** | 3.10+ | Requiere compilador de 64 bits |
| **Node.js** | 18.0.0+ | Se recomienda versión LTS |
| **npm** | 8.0.0+ | Gestor de paquetes de Node |
| **SO** | Windows 10/11, Linux, macOS | Cualquier plataforma moderna |
| **Terminal** | PowerShell (Win) / Bash | Para ejecutar comandos |

---

## 🚀 Guía de Instalación

### Paso 1: Clonar el Repositorio

Asegúrate de estar en la raíz del proyecto (`OLC2_EJ26_ML_-45-TalentMosaic`). La estructura debe verse así:

```
OLC2_EJ26_ML_-45-TalentMosaic/
├── .venv/              # Entorno virtual de Python
├── Backend/            # Servidor FastAPI
├── Front-end/          # Interfaz React + Vite
├── Datasets/           # Archivos CSV de prueba
└── README.md
```

### Paso 2: Configurar el Backend (FastAPI)

Abre tu **primera terminal** y ejecuta:

```powershell
# Windows: Permitir ejecución de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Activar entorno virtual desde la raíz
.\.venv\Scripts\Activate.ps1

# Navegar al directorio Backend
cd Backend

# Iniciar servidor con recarga automática
uvicorn main:app --reload
```

**Resultado esperado**: El servidor estará disponible en `http://localhost:8000`

### Paso 3: Configurar el Frontend (React + Vite)

Abre tu **segunda terminal** en paralelo y ejecuta:

```powershell
# Navegar al directorio Frontend
cd Front-end

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con recarga en caliente
npm run dev
```

**Resultado esperado**: La aplicación estará disponible en `http://localhost:5173`

---

## 🛠️ Comandos de Mantenimiento

Si necesitas reinstalar dependencias o resolver problemas:

### Frontend - Reinstalar Dependencias (si hay conflictos con Recharts)

```powershell
cd Front-end
npm install --legacy-peer-deps
```

### Backend - Reinstalar Dependencias Python (si falla el entorno)

```powershell
cd Backend
pip install fastapi uvicorn pandas scikit-learn pydantic python-multipart matplotlib jinja2 numpy
```

### Limpiar Caché de Node (si hay problemas de compilación)

```powershell
cd Front-end
rm -r node_modules package-lock.json
npm install
```

---

## 📁 Estructura del Proyecto

```
OLC2_EJ26_ML_-45-TalentMosaic/
│
├── .venv/                    # Entorno virtual aislado de Python
│
├── Backend/
│   ├── main.py              # Punto de entrada de FastAPI
│   ├── models/              # Modelos de ML (4 algoritmos)
│   ├── routes/              # Endpoints de la API
│   ├── utils/               # Funciones auxiliares y NLP
│   └── requirements.txt      # Dependencias de Python
│
├── Front-end/
│   ├── src/
│   │   ├── components/      # Componentes React reutilizables
│   │   ├── pages/           # Vistas principales
│   │   ├── App.jsx          # Componente raíz
│   │   └── main.jsx         # Punto de entrada
│   ├── package.json         # Dependencias de Node
│   └── vite.config.js       # Configuración de Vite
│
├── Datasets/
│   └── *.csv               # Archivos de datos para pruebas
│
└── README.md               # Este archivo
```

---

## 🎓 Modelos de Machine Learning Incluidos

El sistema implementa **4 algoritmos de clustering** no supervisado:

1. **K-Means**: Particionamiento basado en centroides
2. **DBSCAN**: Clustering basado en densidad
3. **Hierarchical Clustering**: Agrupamiento jerárquico
4. **Gaussian Mixture Models (GMM)**: Modelos probabilísticos

Cada modelo es optimizado para diferentes tipos de datos de capital humano.

---

## 📊 Primeros Pasos

1. **Inicia ambas terminales** (Backend y Frontend)
2. **Abre tu navegador** en `http://localhost:5173`
3. **Carga un dataset** desde la carpeta `Datasets/`
4. **Selecciona un modelo** de clustering
5. **Visualiza los resultados** en tiempo real

---

## 🐛 Troubleshooting

### Puerto 8000 ya está en uso (Backend)

```powershell
uvicorn main:app --reload --port 8001
```

### Puerto 5173 ya está en uso (Frontend)

```powershell
npm run dev -- --port 5174
```

### Error de conexión Backend-Frontend

Verifica que:
- ✅ El backend esté corriendo en `http://localhost:8000`
- ✅ El frontend intente conectar a la URL correcta
- ✅ No haya firewall bloqueando los puertos

### Problema con dependencias matemáticas (Python)

```powershell
pip install --upgrade numpy scipy scikit-learn
```

---

## 📚 Tecnologías Utilizadas

**Backend:**
- FastAPI (Framework HTTP moderno)
- Pandas (Manipulación de datos)
- Scikit-learn (Algoritmos ML)
- Python 3.10+

**Frontend:**
- React (Interfaz de usuario)
- Vite (Compilador rápido)
- Recharts (Visualización de datos)
- Node.js 18+

**Data Science:**
- NumPy (Cálculos numéricos)
- Matplotlib (Gráficos)
- NLP (Procesamiento de texto)

---

## 👥 Contribuciones

Si encuentras un bug o tienes una mejora, por favor:
1. Crea un issue describiendo el problema
2. Especifica tu versión de Python, Node.js y SO
3. Incluye logs de error si es posible

---

## 📝 Licencia

Este proyecto está disponible bajo la **Licencia MIT**. Eres libre de usar, modificar y distribuir este código con la única condición de incluir el aviso de licencia original.

Para más detalles, consulta el archivo `LICENSE` en la raíz del proyecto.

---

## 📧 Soporte

Para preguntas, bugs o sugerencias, contacta a: **ronysagui123@gmail.com**

---

**Última actualización**: Junio 2026
