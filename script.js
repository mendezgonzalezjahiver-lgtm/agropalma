// Variables globales
let uploadedFiles = [];
let currentModule = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadStoredData();
});

// Inicializar event listeners
function initializeEventListeners() {
    // Formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFileUpload);
    }
    
    // Formulario de descarga
    const downloadForm = document.getElementById('downloadForm');
    if (downloadForm) {
        downloadForm.addEventListener('submit', handleDownload);
    }
    
    // Input de archivo
    const excelFile = document.getElementById('excelFile');
    if (excelFile) {
        excelFile.addEventListener('change', validateFile);
    }
}

// Cargar datos almacenados
function loadStoredData() {
    const stored = localStorage.getItem('agropalma_nomina_files');
    if (stored) {
        uploadedFiles = JSON.parse(stored);
        updatePeriodOptions();
    }
}

// Mostrar módulo de empresa
function showCompanyModule() {
    hideAllModules();
    document.getElementById('companyModule').style.display = 'block';
    currentModule = 'company';
    updatePeriodOptions();
}

// Mostrar módulo de empleados
function showEmployeeModule() {
    hideAllModules();
    document.getElementById('employeeModule').style.display = 'block';
    currentModule = 'employee';
    updatePeriodOptions();
}

// Ocultar todos los módulos
function hideAllModules() {
    document.getElementById('companyModule').style.display = 'none';
    document.getElementById('employeeModule').style.display = 'none';
}

// Validar archivo
function validateFile(event) {
    const file = event.target.files[0];
    if (!file) return true;
    
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    
    if (!validTypes.includes(file.type)) {
        showAlert('Por favor, seleccione un archivo Excel válido (.xlsx o .xls)', 'error');
        event.target.value = '';
        return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
        showAlert('El archivo no puede superar los 10MB', 'error');
        event.target.value = '';
        return false;
    }
    
    return true;
}

// Manejar subida de archivo
async function handleFileUpload(event) {
    event.preventDefault();
    
    const period = document.getElementById('period').value;
    const cedula = document.getElementById('cedula').value.trim();
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    
    if (!period || !file) {
        showAlert('Por favor, complete todos los campos obligatorios', 'error');
        return;
    }
    
    showProgress(true);
    
    try {
        // Leer archivo Excel
        const data = await readExcelFile(file);
        
        // Filtrar por cédula si se proporcionó
        let filteredData = data;
        if (cedula) {
            filteredData = data.filter(employee => {
                const empCedula = (employee.cedula || employee.CÉDULA || employee.Cedula || '').toString().trim();
                return empCedula === cedula;
            });
            
            if (filteredData.length === 0) {
                showAlert(`No se encontró ningún empleado con la cédula ${cedula}`, 'error');
                showProgress(false);
                return;
            }
        }
        
        // Convertir a PDFs individuales
        const pdfFiles = await convertToPDFs(filteredData, period);
        
        // Guardar información
        const fileInfo = {
            period: period,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            employeeCount: filteredData.length,
            pdfFiles: pdfFiles,
            cedula: cedula || null
        };
        
        // Verificar si ya existe información para este período
        const existingIndex = uploadedFiles.findIndex(f => f.period === period);
        if (existingIndex !== -1) {
            // Merge con archivos existentes
            uploadedFiles[existingIndex].pdfFiles = [...uploadedFiles[existingIndex].pdfFiles, ...pdfFiles];
            uploadedFiles[existingIndex].employeeCount += filteredData.length;
        } else {
            uploadedFiles.push(fileInfo);
        }
        
        localStorage.setItem('agropalma_nomina_files', JSON.stringify(uploadedFiles));
        
        const message = cedula 
            ? `Se ha procesado 1 desprendible para ${cedula} en el período ${period}`
            : `Se han procesado ${filteredData.length} desprendibles para el período ${period}`;
        
        showAlert(message, 'success');
        
        // Limpiar formulario
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.error('Error al procesar archivo:', error);
        showAlert('Error al procesar el archivo. Por favor, inténtelo nuevamente.', 'error');
    } finally {
        showProgress(false);
    }
}

// Leer archivo Excel
async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                // Validar estructura
                if (!validateExcelStructure(jsonData)) {
                    reject(new Error('El archivo Excel no tiene la estructura requerida'));
                    return;
                }
                
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Validar estructura del Excel - Versión Flexible
function validateExcelStructure(data) {
    if (!data || data.length === 0) {
        throw new Error('El archivo Excel está vacío o no tiene datos válidos');
    }
    
    // Debug: mostrar columnas encontradas
    console.log('Columnas encontradas:', Object.keys(data[0]));
    
    // Solo verificar que haya datos y al menos una columna
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    
    if (columns.length === 0) {
        throw new Error('El archivo no tiene columnas reconocibles');
    }
    
    console.log(`Archivo válido con ${data.length} filas y ${columns.length} columnas`);
    return true;
}

// Convertir a PDFs individuales - Versión Universal
async function convertToPDFs(data, period) {
    const pdfFiles = [];
    
    for (let i = 0; i < data.length; i++) {
        const employee = data[i];
        
        // Debug: mostrar datos del empleado
        console.log(`Procesando empleado ${i + 1}:`, employee);
        
        // Intentar encontrar identificador único (cedula, id, nombre, o usar índice)
        let identificador = 'EMPLEADO_' + (i + 1);
        
        // Buscar posibles campos de identificación
        const posiblesIds = [
            'CÉDULA', 'cedula', 'Cedula', 'Cédula', 'ID', 'Id', 'id',
            'NOMBRE', 'nombre', 'Nombre', 'NOMBRE COMPLETO', 'Nombre Completo',
            'APELLIDO', 'apellido', 'Apellido', 'APELLIDOS', 'apellidos'
        ];
        
        for (let campo of posiblesIds) {
            if (employee[campo] && employee[campo].toString().trim()) {
                identificador = employee[campo].toString().trim();
                // Limpiar identificador para nombre de archivo
                identificador = identificador.replace(/[^a-zA-Z0-9]/g, '_');
                break;
            }
        }
        
        const pdfData = await generateEmployeePDF(employee, period);
        
        pdfFiles.push({
            cedula: identificador,
            fileName: `desprendible_${identificador}_${period.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            pdfData: pdfData,
            originalData: employee // Guardar datos originales para búsqueda
        });
        
        // Actualizar progreso
        updateProgress(((i + 1) / data.length) * 100);
    }
    
    return pdfFiles;
}

// Generar PDF para empleado - Versión Universal
async function generateEmployeePDF(employee, period) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('AGROPALMA', 105, 20, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Desprendible de Nómina', 105, 30, { align: 'center' });
    
    // Información del período
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Período: ${period}`, 20, 60);
    
    // Información del empleado - Mostrar todas las columnas del Excel
    doc.setFontSize(12);
    let yPosition = 80;
    
    doc.setFont(undefined, 'bold');
    doc.text('Datos del Empleado:', 20, yPosition);
    yPosition += 15;
    
    doc.setFont(undefined, 'normal');
    const columns = Object.keys(employee);
    
    columns.forEach((column, index) => {
        const value = employee[column] || '';
        
        // Alternar colores para mejor legibilidad
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(20, yPosition - 5, 170, 12, 'F');
        }
        
        // Título de la columna
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text(`${column}:`, 25, yPosition + 3);
        
        // Valor de la columna
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        
        // Formatear valores numéricos
        let displayValue = value.toString();
        if (!isNaN(value) && value !== '') {
            displayValue = formatNumber(value);
        }
        
        // Truncar si es muy largo
        if (displayValue.length > 60) {
            displayValue = displayValue.substring(0, 57) + '...';
        }
        
        doc.text(displayValue, 80, yPosition + 3);
        
        yPosition += 12;
        
        // Nueva página si se ocupa demasiado espacio
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 50;
        }
    });
    
    // Pie de página
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Documento generado automáticamente - AGROPALMA', 105, 280, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 105, 285, { align: 'center' });
    doc.text(`Total de campos: ${columns.length}`, 105, 290, { align: 'center' });
    
    return doc.output('datauristring');
}

// Manejar descarga - Versión Universal
async function handleDownload(event) {
    event.preventDefault();
    
    const documentId = document.getElementById('documentId').value.trim();
    const period = document.getElementById('downloadPeriod').value;
    
    if (!documentId || !period) {
        showAlert('Por favor, complete todos los campos', 'error');
        return;
    }
    
    // Buscar archivo
    const fileInfo = uploadedFiles.find(f => f.period === period);
    
    if (!fileInfo) {
        showAlert('No se encontraron desprendibles para el período seleccionado', 'error');
        return;
    }
    
    // Buscar empleado - Búsqueda flexible
    let employeePDF = null;
    
    // 1. Búsqueda exacta por cédula/identificador
    employeePDF = fileInfo.pdfFiles.find(pdf => pdf.cedula === documentId);
    
    // 2. Si no encuentra, búsqueda parcial en nombre
    if (!employeePDF) {
        employeePDF = fileInfo.pdfFiles.find(pdf => {
            if (!pdf.originalData) return false;
            
            // Buscar en todos los campos del empleado
            for (let campo in pdf.originalData) {
                if (pdf.originalData[campo] && 
                    pdf.originalData[campo].toString().toLowerCase().includes(documentId.toLowerCase())) {
                    return true;
                }
            }
            return false;
        });
    }
    
    if (!employeePDF) {
        // Mostrar empleados disponibles para ayudar
        const empleadosDisponibles = fileInfo.pdfFiles.map(pdf => pdf.cedula).join(', ');
        showAlert(`No se encontró un desprendible para "${documentId}"\nEmpleados disponibles: ${empleadosDisponibles}`, 'error');
        return;
    }
    
    // Descargar PDF
    downloadPDF(employeePDF.pdfData, employeePDF.fileName);
    showAlert('Desprendible descargado exitosamente', 'success');
}

// Descargar PDF
function downloadPDF(pdfData, fileName) {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Actualizar opciones de período (ya no se necesita para select, se mantiene por compatibilidad)
function updatePeriodOptions() {
    // Esta función ya no es necesaria con campos de texto manuales
    // Se mantiene para evitar errores en otras partes del código
}

// Formatear período (ya no se usa, pero se mantiene por compatibilidad)
function formatPeriod(period) {
    return period;
}

// Formatear número
function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

// Mostrar progreso
function showProgress(show) {
    const progressContainer = document.getElementById('uploadProgress');
    if (show) {
        progressContainer.style.display = 'block';
        updateProgress(0);
    } else {
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);
    }
}

// Actualizar progreso
function updateProgress(percentage) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    progressBar.style.width = `${percentage}%`;
    
    if (percentage < 100) {
        progressText.textContent = `Procesando... ${Math.round(percentage)}%`;
    } else {
        progressText.textContent = 'Proceso completado';
    }
}

// Mostrar alerta
function showAlert(message, type) {
    const resultContainer = document.getElementById('downloadResult');
    const alertDiv = document.createElement('div');
    
    alertDiv.className = `alert-custom alert-${type}-custom`;
    alertDiv.textContent = message;
    
    resultContainer.innerHTML = '';
    resultContainer.appendChild(alertDiv);
    resultContainer.style.display = 'block';
    
    // Auto ocultar después de 5 segundos
    setTimeout(() => {
        resultContainer.style.display = 'none';
    }, 5000);
}

// Función de utilidad para limpiar datos
function cleanString(str) {
    if (!str) return '';
    return str.toString().trim().replace(/[^\w\s-]/gi, '');
}

// Exportar funciones para uso global
window.showCompanyModule = showCompanyModule;
window.showEmployeeModule = showEmployeeModule;