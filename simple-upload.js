// Sistema simplificado de subida de archivos
let documentosProcesados = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarBaseDatos();
    inicializarEventListenersSimplificado();
    cargarPeriodosExistentes();
});

// Inicializar event listeners simplificados
function inicializarEventListenersSimplificado() {
    // Formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', procesarArchivoSimple);
    }
    
    // Formulario de descarga
    const downloadForm = document.getElementById('downloadForm');
    if (downloadForm) {
        downloadForm.addEventListener('submit', buscarYDescargar);
    }
}

// Procesar archivo de forma simplificada
async function procesarArchivoSimple(event) {
    event.preventDefault();
    
    const periodo = document.getElementById('period').value;
    const cedula = document.getElementById('cedula').value.trim();
    const archivoInput = document.getElementById('excelFile');
    const archivo = archivoInput.files[0];
    
    if (!periodo || !archivo) {
        alert('Por favor, seleccione un período y un archivo');
        return;
    }
    
    console.log('Procesando archivo:', archivo.name);
    console.log('Período:', periodo);
    
    mostrarProgreso(true);
    
    try {
        // Leer el archivo sin validaciones estrictas
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                console.log('Datos leídos:', jsonData.length, 'filas');
                console.log('Primer fila:', jsonData[0]);
                
                // Filtrar por cédula si se proporcionó
                let datosProcesar = jsonData;
                if (cedula) {
                    datosProcesar = jsonData.filter(emp => {
                        return Object.values(emp).some(val => 
                            val && val.toString().includes(cedula)
                        );
                    });
                    console.log('Filtrado por cédula:', datosProcesar.length, 'resultados');
                }
                
                // Agregar a la base de datos
                const documento = agregarDocumento(periodo, archivo, datosProcesar);
                
                // Generar PDFs
                generarPDFsSimplificados(datosProcesar, periodo);
                
                alert(`✅ Se procesaron ${datosProcesar.length} empleados correctamente`);
                
                // Limpiar formulario
                document.getElementById('uploadForm').reset();
                
                // Actualizar períodos disponibles
                cargarPeriodosExistentes();
                
            } catch (error) {
                console.error('Error procesando Excel:', error);
                alert('Error al procesar el archivo Excel: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            alert('Error al leer el archivo');
        };
        
        reader.readAsArrayBuffer(archivo);
        
    } catch (error) {
        console.error('Error general:', error);
        alert('Error: ' + error.message);
    } finally {
        setTimeout(() => mostrarProgreso(false), 2000);
    }
}

// Generar PDFs de forma simplificada
function generarPDFsSimplificados(datos, periodo) {
    datos.forEach((empleado, index) => {
        setTimeout(() => {
            const pdf = generarPDFIndividual(empleado, periodo);
            documentosProcesados.push(pdf);
            console.log(`PDF generado para empleado ${index + 1}`);
        }, index * 100); // Pequeña demora para no sobrecargar
    });
}

// Generar PDF individual simplificado
function generarPDFIndividual(empleado, periodo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('AGROPALMA', 105, 25, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('DESPRENDIBLE DE NÓMINA', 105, 40, { align: 'center' });
    
    // Información del período
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Período: ${periodo}`, 20, 70);
    
    // Datos del empleado - todas las columnas
    doc.setFontSize(12);
    let y = 90;
    
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL EMPLEADO:', 20, y);
    y += 15;
    
    // Mostrar todas las columnas
    const columnas = Object.keys(empleado);
    columnas.forEach((columna, index) => {
        const valor = empleado[columna] || '';
        
        // Color alterno
        if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y - 8, 170, 12, 'F');
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text(`${columna}:`, 25, y);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        let valorMostrar = valor.toString();
        if (!isNaN(valor) && valor !== '') {
            valorMostrar = '$' + new Intl.NumberFormat('es-CO').format(valor);
        }
        doc.text(valorMostrar, 80, y);
        
        y += 12;
        
        // Nueva página si es necesario
        if (y > 250) {
            doc.addPage();
            y = 50;
        }
    });
    
    // Pie de página
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Documento generado automáticamente - AGROPALMA', 105, 280, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 105, 285, { align: 'center' });
    
    // Guardar el PDF
    const idEmpleado = obtenerIdEmpleado(empleado);
    const fileName = `desprendible_${idEmpleado}_${periodo}.pdf`;
    
    const pdfData = doc.output('datauristring');
    
    return {
        id: Date.now() + Math.random(),
        periodo: periodo,
        empleado: empleado,
        fileName: fileName,
        pdfData: pdfData
    };
}

// Obtener ID del empleado para nombrar archivo
function obtenerIdEmpleado(empleado) {
    // Buscar posibles identificadores
    const posiblesIds = ['CÉDULA', 'cedula', 'ID', 'NOMBRE', 'nombre', 'APELLIDO'];
    
    for (let campo of posiblesIds) {
        if (empleado[campo] && empleado[campo].toString().trim()) {
            return empleado[campo].toString().replace(/[^a-zA-Z0-9]/g, '_');
        }
    }
    
    return 'EMPLEADO_' + Math.floor(Math.random() * 10000);
}

// Buscar y descargar
function buscarYDescargar(event) {
    event.preventDefault();
    
    const criterio = document.getElementById('documentId').value.trim();
    const periodo = document.getElementById('downloadPeriod').value;
    
    if (!criterio || !periodo) {
        alert('Por favor, complete todos los campos');
        return;
    }
    
    console.log('Buscando:', criterio, 'en período:', periodo);
    
    // Buscar en base de datos
    const resultados = buscarEmpleado(criterio, periodo);
    
    if (resultados.length === 0) {
        alert(`No se encontró ningún empleado con "${criterio}" en el período ${periodo}`);
        return;
    }
    
    // Tomar el primer resultado y generar PDF
    const empleado = resultados[0];
    const pdf = generarPDFIndividual(empleado, periodo);
    
    // Descargar
    const link = document.createElement('a');
    link.href = pdf.pdfData;
    link.download = pdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Desprendible descargado: ${pdf.fileName}`);
}

// Cargar períodos existentes en el select
function cargarPeriodosExistentes() {
    const periodos = obtenerPeriodos();
    const selects = [
        document.getElementById('period'),
        document.getElementById('downloadPeriod')
    ];
    
    selects.forEach(select => {
        if (select) {
            const currentValue = select.value;
            const options = ['<option value="">Seleccione un período</option>'];
            
            periodos.forEach(periodo => {
                options.push(`<option value="${periodo}">${periodo}</option>`);
            });
            
            select.innerHTML = options.join('');
            
            // Restaurar valor si existía
            if (currentValue && periodos.includes(currentValue)) {
                select.value = currentValue;
            }
        }
    });
}

// Mostrar/ocultar progreso
function mostrarProgreso(mostrar) {
    const progressContainer = document.getElementById('uploadProgress');
    if (progressContainer) {
        progressContainer.style.display = mostrar ? 'block' : 'none';
        if (mostrar) {
            const progressBar = progressContainer.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }
    }
}

// Funciones de módulo (mantener compatibilidad)
function showCompanyModule() {
    document.getElementById('companyModule').style.display = 'block';
    document.getElementById('employeeModule').style.display = 'none';
}

function showEmployeeModule() {
    document.getElementById('companyModule').style.display = 'none';
    document.getElementById('employeeModule').style.display = 'block';
}

// Exportar funciones
window.showCompanyModule = showCompanyModule;
window.showEmployeeModule = showEmployeeModule;