# AGROPALMA - Sistema de Desprendibles de Nómina

Aplicación web profesional para la gestión y descarga de desprendibles quincenales de nómina.

## 🎨 Características del Diseño

- **Colores Corporativos Elegantes**: Dorado (#D4AF37), Verde (#2E7D32) y Azul (#1E3A8A)
- **Interfaz Moderna**: Diseño responsive con animaciones suaves
- **Experiencia de Usuario**: Intuitiva y fácil de usar para empresa y empleados

## 🚀 Funcionalidades

### Para la Empresa
- Subir archivos Excel con desprendibles de nómina
- Conversión automática a PDF individual
- Gestión de períodos quincenales
- Procesamiento por lotes con indicador de progreso

### Para los Empleados
- Descarga fácil por número de cédula
- Selección de período quincenal
- PDFs profesionales con branding AGROPALMA
- Acceso rápido y seguro

## 📁 Estructura del Proyecto

```
agropalma-app/
├── index.html          # Página principal
├── styles.css          # Estilos corporativos
├── script.js           # Funcionalidad JavaScript
├── ejemplo_nomina.csv  # Archivo de ejemplo
└── README.md          # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con variables CSS
- **JavaScript ES6+**: Lógica de la aplicación
- **Bootstrap 5**: Framework CSS
- **SheetJS (xlsx)**: Lectura de archivos Excel
- **jsPDF**: Generación de PDFs
- **LocalStorage**: Almacenamiento local

## 📋 Formato del Archivo Excel

El archivo Excel debe contener las siguientes columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| CÉDULA | Número de identificación | 12345678 |
| NOMBRE COMPLETO | Nombre del empleado | JUAN PÉREZ GONZÁLEZ |
| SALARIO BASE | Salario mensual | 2500000 |
| DEDUCCIONES | Total deducciones | 450000 |
| NETO A PAGAR | Valor neto a pagar | 2050000 |

## 🚀 Cómo Usar

### 1. Abrir la Aplicación
- Abra el archivo `index.html` en su navegador web preferido

### 2. Para la Empresa (Administración)
- Haga clic en "Acceder Administración"
- Seleccione el período quincenal
- Suba el archivo Excel con los datos
- Espere el proceso de conversión automática

### 3. Para los Empleados
- Haga clic en "Acceder Empleados"
- Ingrese su número de cédula
- Seleccione el período deseado
- Descargue su desprendible en PDF

## 🎯 Características Técnicas

### Seguridad
- Validación de archivos (solo Excel)
- Límite de tamaño (10MB)
- Almacenamiento local seguro

### Rendimiento
- Procesamiento asíncrono
- Indicadores de progreso
- Optimización para móviles

### Diseño
- Colores corporativos consistentes
- Tipografía profesional
- Animaciones elegantes

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Dispositivos móviles

## 🔧 Personalización

### Cambiar Colores
Edite las variables CSS en `styles.css`:
```css
:root {
    --gold-primary: #D4AF37;
    --green-primary: #2E7D32;
    --blue-primary: #1E3A8A;
}
```

### Agregar Nuevos Períodos
Los períodos se agregan automáticamente al subir archivos nuevos.

## 📞 Soporte

Para asistencia técnica o personalización:
- Revise la consola del navegador para errores
- Verifique el formato del archivo Excel
- Asegúrese de usar un navegador compatible

## 📄 Licencia

Sistema desarrollado exclusivamente para AGROPALMA S.A.

---

**Desarrollado con ❤️ para AGROPALMA**