// SISTEMA FINAL QUE SÍ FUNCIONA - BASE DE DATOS LOCAL
let baseDatos = {
    documentos: [],
    periodos: ["Enero 2026 - Periodo 1", "Enero 2026 - Periodo 2", "Febrero 2026 - Periodo 1", "Febrero 2026 - Periodo 2", 
               "Marzo 2026 - Periodo 1", "Marzo 2026 - Periodo 2", "Abril 2026 - Periodo 1", "Abril 2026 - Periodo 2",
               "Mayo 2026 - Periodo 1", "Mayo 2026 - Periodo 2", "Junio 2026 - Periodo 1", "Junio 2026 - Periodo 2"]
};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema AGROPALMA...');
    
    cargarBaseDatos();
    inicializarEventListeners();
    
    // Verificar que elementos existen
    const uploadForm = document.getElementById('uploadForm');
    const downloadForm = document.getElementById('downloadForm');
    const companyModule = document.getElementById('companyModule');
    const employeeModule = document.getElementById('employeeModule');
    
    console.log('📋 Elementos encontrados:');
    console.log('  uploadForm:', !!uploadForm);
    console.log('  downloadForm:', !!downloadForm);
    console.log('  companyModule:', !!companyModule);
    console.log('  employeeModule:', !!employeeModule);
    console.log('  adminPassword:', !!document.getElementById('adminPassword'));
    console.log('  documentId:', !!document.getElementById('documentId'));
    
    console.log('📋 Períodos disponibles:', baseDatos.periodos);
    console.log('📊 Documentos en BD:', baseDatos.documentos.length);
    
    console.log('✅ Sistema AGROPALMA iniciado completamente');
});

// Cargar base datos desde localStorage
function cargarBaseDatos() {
    const guardado = localStorage.getItem('agropalma_database');
    if (guardado) {
        baseDatos = JSON.parse(guardado);
    }
}

// Guardar base datos
function guardarBaseDatos() {
    localStorage.setItem('agropalma_database', JSON.stringify(baseDatos));
}

// Inicializar event listeners
function inicializarEventListeners() {
    console.log('🔧 Inicializando event listeners...');
    
    // Formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            console.log('📤 Formulario de subida enviado');
            e.preventDefault();
            procesarArchivo(e);
        });
        console.log('✅ Event listener para uploadForm agregado');
    } else {
        console.error('❌ uploadForm no encontrado');
    }
    
    // Formulario de descarga
    const downloadForm = document.getElementById('downloadForm');
    if (downloadForm) {
        downloadForm.addEventListener('submit', function(e) {
            console.log('📥 Formulario de descarga enviado');
            e.preventDefault();
            descargarDocumento(e);
        });
        console.log('✅ Event listener para downloadForm agregado');
    } else {
        console.error('❌ downloadForm no encontrado');
    }
    
    // Validar archivo
    const excelFile = document.getElementById('excelFile');
    if (excelFile) {
        excelFile.addEventListener('change', function(e) {
            console.log('📁 Archivo seleccionado:', e.target.files[0]?.name);
            validarArchivo(e);
        });
        console.log('✅ Event listener para excelFile agregado');
    } else {
        console.error('❌ excelFile no encontrado');
    }
    
    // Campo de contraseña - permitir Enter
    const adminPassword = document.getElementById('adminPassword');
    if (adminPassword) {
        adminPassword.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                console.log('🔑 Enter presionado en contraseña');
                verificarAccesoAdministracion();
            }
        });
        console.log('✅ Event listener para adminPassword agregado');
    } else {
        console.error('❌ adminPassword no encontrado');
    }
    
    console.log('✅ Todos los event listeners inicializados');
}

// Validar archivo
function validarArchivo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    console.log('📁 Validando archivo:', archivo.name);
    console.log('📏 Tamaño:', (archivo.size / 1024).toFixed(2), 'KB');
    
    const extensionesPermitidas = ['.xlsx', '.xls', '.csv'];
    const nombreArchivo = archivo.name.toLowerCase();
    
    const esValido = extensionesPermitidas.some(ext => nombreArchivo.endsWith(ext));
    
    if (!esValido) {
        alert('❌ Por favor, seleccione un archivo Excel (.xlsx, .xls) o CSV (.csv)');
        event.target.value = '';
        return false;
    }
    
    if (archivo.size === 0) {
        alert('❌ El archivo está vacío');
        event.target.value = '';
        return false;
    }
    
    console.log('✅ Archivo válido:', archivo.name);
    return true;
}

// Procesar archivo
function procesarArchivo(event) {
    event.preventDefault();
    
    console.log('🔄 Iniciando procesamiento...');
    
    const periodo = document.getElementById('period').value;
    const cedula = document.getElementById('cedula').value.trim();
    const archivo = document.getElementById('excelFile').files[0];
    
    if (!periodo || !archivo) {
        alert('❌ Por favor, complete los campos obligatorios');
        return;
    }
    
    console.log('📁 Archivo seleccionado:', archivo.name);
    console.log('📏 Tamaño:', archivo.size, 'bytes');
    console.log('📋 Tipo:', archivo.type);
    
    mostrarProgreso(true);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            console.log('✅ Archivo leído exitosamente');
            console.log('📊 Resultado del lector:', e.target.result ? 'Exitoso' : 'Vacío');
            
            const datos = procesarExcel(e.target.result, cedula);
            
            console.log('🎉 Datos procesados exitosamente:', datos.length, 'empleados');
            
            guardarEnBaseDatos(periodo, archivo.name, datos);
            generarYGuardarPDFs(datos, periodo);
            
            alert(`✅ ÉXITO: Se procesaron ${datos.length} empleados correctamente`);
            document.getElementById('uploadForm').reset();
            
        } catch (error) {
            console.error('❌ Error procesando archivo:', error);
            console.error('🔍 Detalles del error:', error.stack);
            alert('❌ Error al procesar el archivo: ' + error.message);
        } finally {
            setTimeout(() => mostrarProgreso(false), 2000);
        }
    };
    
    reader.onerror = function(event) {
        console.error('❌ Error del FileReader:', event);
        alert('❌ Error al leer el archivo. Verifique que no esté dañado.');
        mostrarProgreso(false);
    };
    
    reader.onabort = function() {
        console.log('⚠️ Lectura de archivo abortada');
        mostrarProgreso(false);
    };
    
    reader.readAsArrayBuffer(archivo);
}

// Procesar Excel/CSV
function procesarExcel(buffer, filtroCedula) {
    console.log('📊 Leyendo archivo...');
    console.log('📏 Tamaño del buffer:', buffer.length, 'bytes');
    
    try {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('📚 Hojas encontradas:', workbook.SheetNames);
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No se encontraron hojas en el archivo Excel');
        }
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        console.log('📋 Filas encontradas:', jsonData.length);
        console.log('📄 Columnas:', Object.keys(jsonData[0] || {}));
        console.log('📄 Primera fila completa:', jsonData[0]);
        
        if (!jsonData || jsonData.length === 0) {
            throw new Error('El archivo está vacío o no contiene datos válidos');
        }
        
        // Filtrar por cédula si se proporcionó
        let resultado = jsonData;
        if (filtroCedula) {
            resultado = jsonData.filter(emp => {
                return Object.values(emp).some(val => 
                    val && val.toString().toLowerCase().includes(filtroCedula.toLowerCase())
                );
            });
            console.log(`🔍 Filtrado por "${filtroCedula}": ${resultado.length} resultados`);
        }
        
        if (resultado.length === 0) {
            throw new Error(`No se encontraron empleados${filtroCedula ? ' con el criterio "' + filtroCedula + '"' : ''} en el archivo`);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Error procesando Excel:', error);
        throw new Error('Error al procesar el archivo Excel: ' + error.message);
    }
}

// Guardar en base de datos
function guardarEnBaseDatos(periodo, nombreArchivo, datos) {
    console.log('💾 Guardando en base de datos...');
    console.log('  Período:', periodo);
    console.log('  Archivo:', nombreArchivo);
    console.log('  Empleados:', datos.length);
    
    const documento = {
        id: Date.now(),
        periodo: periodo,
        nombreArchivo: nombreArchivo,
        fechaCarga: new Date().toISOString(),
        cantidadEmpleados: datos.length,
        empleados: datos
    };
    
    baseDatos.documentos.push(documento);
    
    // Agregar período si no existe
    if (!baseDatos.periodos.includes(periodo)) {
        baseDatos.periodos.push(periodo);
        console.log('📅 Nuevo período agregado:', periodo);
    }
    
    try {
        guardarBaseDatos();
        console.log('✅ Documento guardado exitosamente:', documento);
        console.log('📊 Total documentos en BD:', baseDatos.documentos.length);
    } catch (error) {
        console.error('❌ Error guardando en localStorage:', error);
        throw new Error('Error al guardar los datos: ' + error.message);
    }
}

// Generar PDFs
function generarYGuardarPDFs(datos, periodo) {
    datos.forEach((empleado, index) => {
        setTimeout(() => {
            const pdf = crearPDFEmpleado(empleado, periodo);
            
            // Guardar PDF en memoria para descarga
            if (!window.pdfsGuardados) {
                window.pdfsGuardados = [];
            }
            
            window.pdfsGuardados.push(pdf);
            console.log(`📄 PDF generado: ${pdf.fileName}`);
            
        }, index * 50);
    });
}

// Crear PDF individual
function crearPDFEmpleado(empleado, periodo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Encabezado AGROPALMA
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
    
    // Período
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Período: ${periodo}`, 20, 70);
    
    // Datos del empleado
    doc.setFontSize(12);
    let y = 90;
    
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL EMPLEADO:', 20, y);
    y += 15;
    
    // Mostrar TODAS las columnas
    const columnas = Object.keys(empleado);
    columnas.forEach((columna, index) => {
        const valor = empleado[columna] || '';
        
        // Color de fondo alternado
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(20, y - 8, 170, 12, 'F');
        }
        
        // Etiqueta
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text(`${columna}:`, 25, y);
        
        // Valor
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        let valorMostrar = valor.toString();
        
        // Formatear números
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
    
    // Nombre del archivo
    const idEmpleado = obtenerIdEmpleado(empleado);
    const fileName = `desprendible_${idEmpleado}_${periodo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    
    return {
        id: Date.now() + Math.random(),
        periodo: periodo,
        empleado: empleado,
        fileName: fileName,
        pdfData: doc.output('datauristring'),
        idEmpleado: idEmpleado
    };
}

// Obtener ID para nombre de archivo
function obtenerIdEmpleado(empleado) {
    const posiblesIds = ['CÉDULA', 'cedula', 'DOCUMENTO', 'documento', 'ID', 'NOMBRE', 'nombre', 'NOMBRE APELLIDO'];
    
    for (let campo of posiblesIds) {
        if (empleado[campo] && empleado[campo].toString().trim()) {
            return empleado[campo].toString().replace(/[^a-zA-Z0-9]/g, '_');
        }
    }
    
    return 'EMPLEADO_' + Math.floor(Math.random() * 10000);
}

// Descargar documento - Nueva implementación
function descargarDocumento(event) {
    event.preventDefault();
    
    const cedula = document.getElementById('documentId').value.trim();
    
    if (!cedula) {
        alert('❌ Por favor, ingrese su número de cédula');
        return;
    }
    
    console.log('🔍 Buscando desprendibles para cédula:', cedula);
    console.log('📊 Total documentos en base de datos:', baseDatos.documentos.length);
    
    // Buscar todos los documentos que contengan esta cédula
    const resultados = [];
    
    baseDatos.documentos.forEach((doc, index) => {
        console.log(`📋 Revisando documento ${index + 1}: ${doc.periodo} (${doc.empleados.length} empleados)`);
        
        const empleado = doc.empleados.find(emp => {
            // Buscar solo en campos de cédula
            const camposCedula = ['CÉDULA', 'cedula', 'DOCUMENTO', 'documento', 'ID', 'Id', 'id'];
            
            const encontrado = camposCedula.some(campo => {
                const valor = emp[campo] ? emp[campo].toString().trim() : '';
                const coinciden = valor === cedula || valor.replace(/[^\d]/g, '') === cedula.replace(/[^\d]/g, '');
                if (coinciden) {
                    console.log(`✅ Cédula encontrada en campo ${campo}: ${valor}`);
                }
                return coinciden;
            });
            
            return encontrado;
        });
        
        if (empleado) {
            console.log(`👤 Empleado encontrado en período: ${doc.periodo}`);
            resultados.push({
                periodo: doc.periodo,
                empleado: empleado,
                fechaCarga: doc.fechaCarga
            });
        }
    });
    
    console.log('📋 Resultados encontrados:', resultados.length);
    
    // Mostrar resultados
    mostrarResultadosEmpleado(cedula, resultados);
}

// Mostrar resultados de búsqueda
function mostrarResultadosEmpleado(cedula, resultados) {
    const resultadoContainer = document.getElementById('downloadResult');
    
    if (resultados.length === 0) {
        resultadoContainer.innerHTML = `
            <div class="result-list">
                <div class="no-results">
                    <h4>No se encontraron desprendibles</h4>
                    <p>No hay desprendibles disponibles para la cédula ${cedula}</p>
                </div>
            </div>
        `;
    } else {
        const resultadosHTML = resultados.map((result, index) => {
            const fechaFormateada = new Date(result.fechaCarga).toLocaleDateString('es-CO');
            const nombreEmpleado = obtenerNombreEmpleado(result.empleado);
            
            // Escapar comillas para evitar problemas con JavaScript
            const periodoEscapado = result.periodo.replace(/'/g, "\\'");
            const cedulaEscapada = cedula.replace(/'/g, "\\'");
            
            return `
                <div class="result-item">
                    <div>
                        <span class="result-period">${result.periodo}</span>
                        <span class="result-date">${fechaFormateada}</span>
                        ${nombreEmpleado ? `<div style="font-size: 0.9rem; color: var(--gray-medium); margin-top: 0.25rem;">${nombreEmpleado}</div>` : ''}
                    </div>
                    <button class="btn-download" onclick="descargarDesprendible('${periodoEscapado}', '${cedulaEscapada}')" title="Descargar desprendible">
                        <svg class="btn-download-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                        Descargar
                    </button>
                </div>
            `;
        }).join('');
        
        resultadoContainer.innerHTML = `
            <div class="result-header">
                Resultados para cédula ${cedula} (${resultados.length} desprendible${resultados.length > 1 ? 's' : ''})
            </div>
            <div class="result-list">
                ${resultadosHTML}
            </div>
        `;
    }
    
    resultadoContainer.style.display = 'block';
}

// Obtener nombre del empleado
function obtenerNombreEmpleado(empleado) {
    const camposNombre = ['NOMBRE', 'nombre', 'NOMBRE COMPLETO', 'Nombre Completo', 'APELLIDO', 'apellido', 'NOMBRE APELLIDO'];
    
    for (let campo of camposNombre) {
        if (empleado[campo] && empleado[campo].toString().trim()) {
            return empleado[campo].toString();
        }
    }
    
    return null;
}

// Descargar desprendible específico
function descargarDesprendible(periodo, cedula) {
    console.log('📄 Descargando desprendible:', periodo, 'para cédula:', cedula);
    
    try {
        // Buscar el empleado
        const documento = baseDatos.documentos.find(doc => doc.periodo === periodo);
        if (!documento) {
            alert('❌ Documento no encontrado para el período: ' + periodo);
            return;
        }
        
        const empleado = documento.empleados.find(emp => {
            const camposCedula = ['CÉDULA', 'cedula', 'DOCUMENTO', 'documento', 'ID', 'Id', 'id'];
            return camposCedula.some(campo => {
                const valor = emp[campo] ? emp[campo].toString().trim() : '';
                return valor === cedula || valor.replace(/[^\d]/g, '') === cedula.replace(/[^\d]/g, '');
            });
        });
        
        if (!empleado) {
            alert('❌ Empleado no encontrado con cédula: ' + cedula);
            return;
        }
        
        console.log('✅ Empleado encontrado:', Object.values(empleado).slice(0, 2).join(' - '));
        
        // Generar y descargar PDF
        console.log('📄 Generando PDF...');
        const pdf = crearPDFEmpleado(empleado, periodo);
        
        console.log('💾 Iniciando descarga...');
        const link = document.createElement('a');
        link.href = pdf.pdfData;
        link.download = pdf.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Desprendible descargado:', pdf.fileName);
        
        // Mostrar confirmación
        alert(`✅ Desprendible descargado:\n${pdf.fileName}`);
        
    } catch (error) {
        console.error('❌ Error descargando desprendible:', error);
        alert('❌ Error al descargar el desprendible: ' + error.message);
    }
}
    
    console.log('🔍 Buscando:', criterio, 'en período:', periodo);
    console.log('📊 Base de datos:', baseDatos.documentos.length, 'documentos');
    
    // Buscar en base de datos primero
    let empleadoEncontrado = null;
    let documentoEncontrado = null;
    
    // Buscar documento por período
    documentoEncontrado = baseDatos.documentos.find(doc => doc.periodo === periodo);
    
    if (documentoEncontrado) {
        console.log('📋 Documento encontrado:', documentoEncontrado.nombreArchivo);
        console.log('👥 Empleados en documento:', documentoEncontrado.empleados.length);
        
        // Buscar empleado por cédula exacta
        empleadoEncontrado = documentoEncontrado.empleados.find(emp => {
            // Buscar solo en campos de cédula
            const camposCedula = ['CÉDULA', 'cedula', 'DOCUMENTO', 'documento', 'ID', 'Id', 'id'];
            
            const encontrado = camposCedula.some(campo => {
                const valor = emp[campo] ? emp[campo].toString().trim() : '';
                return valor === criterio || valor.replace(/[^\d]/g, '') === criterio.replace(/[^\d]/g, '');
            });
            
            if (encontrado) {
                console.log('✅ Empleado encontrado:', Object.values(emp).slice(0, 2).join(' - '));
            }
            
            return encontrado;
        });
    }
    
    if (!empleadoEncontrado) {
        // Mostrar todos los empleados disponibles para ayudar
        let mensajeAyuda = `❌ No se encontró ningún empleado con "${criterio}" en el período ${periodo}.\n\n`;
        
        if (documentoEncontrado) {
            mensajeAyuda += 'Empleados disponibles:\n';
            documentoEncontrado.empleados.slice(0, 10).forEach((emp, i) => {
                const info = Object.values(emp).slice(0, 3).join(' - ');
                mensajeAyuda += `${i+1}. ${info}\n`;
            });
            
            if (documentoEncontrado.empleados.length > 10) {
                mensajeAyuda += `... y ${documentoEncontrado.empleados.length - 10} más`;
            }
        } else {
            mensajeAyuda += 'No hay documentos cargados para este período.';
        }
        
        alert(mensajeAyuda);
        return;
    }
    
    console.log('📄 Generando PDF...');
    
    // Generar PDF
    const pdf = crearPDFEmpleado(empleadoEncontrado, periodo);
    
    // Descargar PDF
    const link = document.createElement('a');
    link.href = pdf.pdfData;
    link.download = pdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Desprendible descargado: ${pdf.fileName}`);
}

// Mostrar/ocultar progreso
function mostrarProgreso(mostrar) {
    const contenedor = document.getElementById('uploadProgress');
    if (contenedor) {
        contenedor.style.display = mostrar ? 'block' : 'none';
        
        if (mostrar) {
            const barra = contenedor.querySelector('.progress-bar');
            if (barra) {
                barra.style.width = '100%';
            }
            
            const texto = contenedor.querySelector('.progress-text');
            if (texto) {
                texto.textContent = 'Procesando archivo...';
            }
        }
    }
}

// Verificar acceso a administración
function verificarAccesoAdministracion() {
    const password = document.getElementById('adminPassword').value.trim();
    
    if (password === 'agropalmasas') {
        console.log('🔓 Acceso concedido a administración');
        document.getElementById('adminPassword').value = ''; // Limpiar campo
        showCompanyModule();
    } else {
        alert('❌ Clave incorrecta. Acceso denegado.');
        document.getElementById('adminPassword').value = ''; // Limpiar campo
        document.getElementById('adminPassword').focus(); // Enfocar campo
    }
}

// Funciones de módulo
function showCompanyModule() {
    console.log('🏢 Mostrando módulo de administración');
    document.getElementById('companyModule').style.display = 'block';
    document.getElementById('employeeModule').style.display = 'none';
}

function showEmployeeModule() {
    console.log('👤 Mostrando módulo de empleados');
    document.getElementById('companyModule').style.display = 'none';
    document.getElementById('employeeModule').style.display = 'block';
}

// Exportar funciones globales
window.showCompanyModule = showCompanyModule;
window.showEmployeeModule = showEmployeeModule;
window.verificarAccesoAdministracion = verificarAccesoAdministracion;
window.descargarDesprendible = descargarDesprendible;

// Debug
console.log('🎯 Sistema cargado. Períodos:', baseDatos.periodos.length);
console.log('📁 Documentos en BD:', baseDatos.documentos.length);