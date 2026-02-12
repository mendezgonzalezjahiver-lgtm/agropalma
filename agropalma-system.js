// SISTEMA FINAL AGROPALMA - CORREGIDO Y FUNCIONAL
const agropalma = {
    baseDatos: {
        documentos: [],
        periodos: ["Enero 2026 - Periodo 1", "Enero 2026 - Periodo 2", "Febrero 2026 - Periodo 1", "Febrero 2026 - Periodo 2", 
                   "Marzo 2026 - Periodo 1", "Marzo 2026 - Periodo 2", "Abril 2026 - Periodo 1", "Abril 2026 - Periodo 2",
                   "Mayo 2026 - Periodo 1", "Mayo 2026 - Periodo 2", "Junio 2026 - Periodo 1", "Junio 2026 - Periodo 2"]
    },

    // Inicializar sistema
    init() {
        console.log('🚀 Iniciando sistema AGROPALMA...');
        
        this.cargarBaseDatos();
        this.verificarEstadoBaseDatos();
        
        console.log('✅ Sistema AGROPALMA iniciado correctamente');
        console.log('📊 Documentos en BD:', this.baseDatos.documentos.length);
        
        // Agregar evento de submit para evitar recargas
        this.setupEventPrevention();
    },

    // Prevenir recargas de página
    setupEventPrevention() {
        document.addEventListener('submit', function(e) {
            e.preventDefault();
        }, true);
    },

    // Verificar estado de la base de datos
    verificarEstadoBaseDatos() {
        console.log('🔍 Verificando estado de la base de datos...');
        
        // Verificar localStorage
        try {
            const datosGuardados = localStorage.getItem('agropalma_database');
            console.log('💾 Datos en localStorage:', datosGuardados ? 'Existen' : 'No existen');
            console.log('📏 Tamaño en localStorage:', datosGuardados ? datosGuardados.length : 0, 'bytes');
            
            if (datosGuardados) {
                const datosParseados = JSON.parse(datosGuardados);
                console.log('📊 Documentos parseados:', datosParseados.documentos?.length || 0);
                
                // Si hay más documentos en memoria que en localStorage, sincronizar
                if (this.baseDatos.documentos.length > (datosParseados.documentos?.length || 0)) {
                    console.log('🔄 Sincronizando memoria con localStorage...');
                    this.guardarBaseDatos();
                }
            }
        } catch (error) {
            console.error('❌ Error verificando localStorage:', error);
        }
        
        // Mostrar resumen
        console.log('📋 Resumen de la base de datos:');
        console.log('  Documentos en memoria:', this.baseDatos.documentos.length);
        console.log('  Períodos disponibles:', this.baseDatos.periodos.length);
        
        this.baseDatos.documentos.forEach((doc, index) => {
            console.log(`    ${index + 1}. ${doc.periodo} - ${doc.empleados.length} empleados`);
        });
    },

    // Cargar base datos desde localStorage
    cargarBaseDatos() {
        try {
            const guardado = localStorage.getItem('agropalma_database');
            if (guardado) {
                this.baseDatos = JSON.parse(guardado);
                console.log('💾 Base de datos cargada:', this.baseDatos.documentos.length, 'documentos');
            }
        } catch (error) {
            console.error('❌ Error cargando base de datos:', error);
        }
    },

    // Guardar base datos
    guardarBaseDatos() {
        try {
            localStorage.setItem('agropalma_database', JSON.stringify(this.baseDatos));
            console.log('💾 Base de datos guardada exitosamente');
        } catch (error) {
            console.error('❌ Error guardando base de datos:', error);
            throw new Error('Error al guardar los datos: ' + error.message);
        }
    },

    // Verificar acceso a administración
    verificarAccesoAdministracion() {
        const password = document.getElementById('adminPassword').value.trim();
        
        if (password === 'agropalmasas') {
            console.log('🔓 Acceso concedido a administración');
            document.getElementById('adminPassword').value = '';
            this.showCompanyModule();
        } else {
            alert('❌ Clave incorrecta. Acceso denegado.');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    },

    // Mostrar módulo empresa
    showCompanyModule() {
        console.log('🏢 Mostrando módulo de administración');
        document.getElementById('companyModule').style.display = 'block';
        document.getElementById('employeeModule').style.display = 'none';
    },

    // Mostrar módulo empleados
    showEmployeeModule() {
        console.log('👤 Mostrando módulo de empleados');
        document.getElementById('companyModule').style.display = 'none';
        document.getElementById('employeeModule').style.display = 'block';
    },

    // Procesar archivo
    procesarArchivo(event) {
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
        console.log('📋 Período:', periodo);
        console.log('🆔 Cédula filtro:', cedula || 'Todos');
        
        this.mostrarProgreso(true);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                console.log('✅ Archivo leído exitosamente');
                
                const datos = this.procesarExcel(e.target.result, cedula);
                
                this.guardarEnBaseDatos(periodo, archivo.name, datos);
                this.generarYGuardarPDFs(datos, periodo);
                
                alert(`✅ ÉXITO: Se procesaron ${datos.length} empleados correctamente`);
                document.getElementById('uploadForm').reset();
                
            } catch (error) {
                console.error('❌ Error procesando archivo:', error);
                alert('❌ Error al procesar el archivo: ' + error.message);
            } finally {
                setTimeout(() => this.mostrarProgreso(false), 2000);
            }
        };
        
        reader.onerror = () => {
            alert('❌ Error al leer el archivo');
            this.mostrarProgreso(false);
        };
        
        reader.readAsArrayBuffer(archivo);
    },

    // Procesar Excel/CSV
    procesarExcel(buffer, filtroCedula) {
        try {
            const data = new Uint8Array(buffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            console.log('📋 Filas encontradas:', jsonData.length);
            console.log('📄 Columnas:', Object.keys(jsonData[0] || {}));
            
            if (!jsonData || jsonData.length === 0) {
                throw new Error('El archivo está vacío o no contiene datos válidos');
            }
            
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
            throw new Error('Error al procesar el archivo Excel: ' + error.message);
        }
    },

    // Guardar en base de datos
    guardarEnBaseDatos(periodo, nombreArchivo, datos) {
        console.log('💾 Guardando en base de datos...');
        console.log('  Período:', periodo);
        console.log('  Archivo:', nombreArchivo);
        console.log('  Empleados:', datos.length);
        console.log('  Primer empleado:', datos[0]);
        
        // Verificar si el documento ya existe
        const existeDocumento = this.baseDatos.documentos.find(doc => doc.periodo === periodo);
        if (existeDocumento) {
            console.log('⚠️ El documento para este período ya existe, reemplazando...');
            // Eliminar el existente
            this.baseDatos.documentos = this.baseDatos.documentos.filter(doc => doc.periodo !== periodo);
            // Eliminar el período duplicado
            this.baseDatos.periodos = this.baseDatos.periodos.filter(p => p !== periodo);
        }
        
        const documento = {
            id: Date.now(),
            periodo: periodo,
            nombreArchivo: nombreArchivo,
            fechaCarga: new Date().toISOString(),
            cantidadEmpleados: datos.length,
            empleados: datos
        };
        
        this.baseDatos.documentos.push(documento);
        
        if (!this.baseDatos.periodos.includes(periodo)) {
            this.baseDatos.periodos.push(periodo);
        }
        
        console.log('💾 Intentando guardar en localStorage...');
        this.guardarBaseDatos();
        
        console.log('✅ Documento guardado en memoria:', documento);
        console.log('📊 Total documentos en memoria:', this.baseDatos.documentos.length);
        
        // Verificar que se guardó correctamente
        this.verificarGuardadoExitoso();
    },

    // Verificar que el guardado fue exitoso
    verificarGuardadoExitoso() {
        try {
            const datosRecuperados = localStorage.getItem('agropalma_database');
            if (datosRecuperados) {
                const datosParseados = JSON.parse(datosRecuperados);
                console.log('✅ Verificación: Datos guardados correctamente en localStorage');
                console.log('📊 Documentos en localStorage:', datosParseados.documentos.length);
                
                // Verificar consistencia
                if (datosParseados.documentos.length !== this.baseDatos.documentos.length) {
                    console.error('❌ INCONSISTENCIA: Diferencia entre memoria y localStorage');
                    console.error('  Memoria:', this.baseDatos.documentos.length);
                    console.error('  localStorage:', datosParseados.documentos.length);
                } else {
                    console.log('✅ Consistencia verificada entre memoria y localStorage');
                }
            } else {
                console.error('❌ ERROR: No se encontraron datos en localStorage después de guardar');
            }
        } catch (error) {
            console.error('❌ Error verificando guardado:', error);
        }
    },

    // Generar PDFs
    generarYGuardarPDFs(datos, periodo) {
        datos.forEach((empleado, index) => {
            setTimeout(() => {
                const pdf = this.crearPDFEmpleado(empleado, periodo);
                
                if (!window.pdfsGuardados) {
                    window.pdfsGuardados = [];
                }
                
                window.pdfsGuardados.push(pdf);
                console.log(`📄 PDF generado para empleado ${index + 1}`);
                
            }, index * 50);
        });
    },

    // Crear PDF individual
    crearPDFEmpleado(empleado, periodo) {
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
        
        const columnas = Object.keys(empleado);
        columnas.forEach((columna, index) => {
            const valor = empleado[columna] || '';
            
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
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
        
        const idEmpleado = this.obtenerIdEmpleado(empleado);
        const fileName = `desprendible_${idEmpleado}_${periodo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        
        return {
            id: Date.now() + Math.random(),
            periodo: periodo,
            empleado: empleado,
            fileName: fileName,
            pdfData: doc.output('datauristring'),
            idEmpleado: idEmpleado
        };
    },

    // Obtener ID para nombre de archivo
    obtenerIdEmpleado(empleado) {
        const posiblesIds = ['CÉDULA', 'cedula', 'DOCUMENTO', 'documento', 'ID', 'NOMBRE', 'nombre', 'NOMBRE APELLIDO'];
        
        for (let campo of posiblesIds) {
            if (empleado[campo] && empleado[campo].toString().trim()) {
                return empleado[campo].toString().replace(/[^a-zA-Z0-9]/g, '_');
            }
        }
        
        return 'EMPLEADO_' + Math.floor(Math.random() * 10000);
    },

    // Descargar documento - VERSIÓN CORREGIDA
    descargarDocumento(event) {
        event.preventDefault();
        
        const criterio = document.getElementById('documentId').value.trim();
        const periodo = document.getElementById('downloadPeriod').value;
        
        if (!criterio || !periodo) {
            alert('❌ Por favor, complete todos los campos');
            return;
        }
        
        console.log('🔍 Buscando:', criterio, 'en período:', periodo);
        console.log('📊 Total documentos en BD:', this.baseDatos.documentos.length);
        
        // Mostrar todos los documentos disponibles para debug
        console.log('📋 Documentos disponibles:');
        this.baseDatos.documentos.forEach((doc, index) => {
            console.log(`  ${index + 1}. ${doc.periodo} - ${doc.empleados.length} empleados`);
        });
        
        // Buscar documento por período
        const documentoEncontrado = this.baseDatos.documentos.find(doc => doc.periodo === periodo);
        
        if (!documentoEncontrado) {
            console.log('❌ Documento no encontrado para período:', periodo);
            alert(`❌ No se encontraron desprendibles para el período ${periodo}`);
            return;
        }
        
        console.log('✅ Documento encontrado:', documentoEncontrado.nombreArchivo);
        console.log('👥 Empleados en documento:', documentoEncontrado.empleados.length);
        
        // Mostrar todos los empleados del documento para debug
        console.log('👥 Empleados disponibles:');
        documentoEncontrado.empleados.forEach((emp, index) => {
            console.log(`  ${index + 1}.`, Object.values(emp).slice(0, 2).join(' - '));
        });
        
        // Buscar empleado por criterio
        const empleadoEncontrado = documentoEncontrado.empleados.find(emp => {
            // Buscar en todos los campos del empleado
            const encontrado = Object.values(emp).some(val => 
                val && val.toString().toLowerCase().includes(criterio.toLowerCase())
            );
            
            if (encontrado) {
                console.log('✅ Empleado encontrado:', emp);
            }
            
            return encontrado;
        });
        
        if (!empleadoEncontrado) {
            console.log('❌ Empleado no encontrado con criterio:', criterio);
            
            // Mostrar ayuda con todos los empleados disponibles
            let mensajeAyuda = `❌ No se encontró ningún empleado con "${criterio}" en el período ${periodo}.\n\n`;
            mensajeAyuda += `Empleados disponibles en este período (${documentoEncontrado.empleados.length}):\n`;
            
            documentoEncontrado.empleados.slice(0, 10).forEach((emp, i) => {
                const info = Object.values(emp).slice(0, 3).join(' - ');
                mensajeAyuda += `${i+1}. ${info}\n`;
            });
            
            if (documentoEncontrado.empleados.length > 10) {
                mensajeAyuda += `... y ${documentoEncontrado.empleados.length - 10} más`;
            }
            
            alert(mensajeAyuda);
            return;
        }
        
        console.log('✅ Empleado encontrado, generando PDF...');
        console.log('👤 Datos del empleado:', empleadoEncontrado);
        
        try {
            // Generar PDF
            const pdf = this.crearPDFEmpleado(empleadoEncontrado, periodo);
            
            console.log('📄 PDF generado, nombre del archivo:', pdf.fileName);
            console.log('📏 Tamaño del PDF:', pdf.pdfData.length, 'caracteres');
            
            // Verificar que el PDF se generó correctamente
            if (!pdf.pdfData || pdf.pdfData.length < 1000) {
                throw new Error('El PDF se generó incorrectamente');
            }
            
            // Descargar PDF con más verificación
            const link = document.createElement('a');
            link.href = pdf.pdfData;
            link.download = pdf.fileName;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            
            console.log('🔗 Link de descarga creado:', link.download);
            
            // Forzar el click
            link.click();
            
            // Esperar un momento antes de remover
            setTimeout(() => {
                document.body.removeChild(link);
                console.log('✅ Link de descarga removido');
            }, 100);
            
            // Mensaje de éxito
            setTimeout(() => {
                alert(`✅ Desprendible descargado exitosamente:\n${pdf.fileName}`);
            }, 500);
            
        } catch (error) {
            console.error('❌ Error generando o descargando PDF:', error);
            alert('❌ Error al generar o descargar el desprendible: ' + error.message);
        }
    },

    // Mostrar resultados de búsqueda - VERSIÓN SIMPLE (sin usar más)
    mostrarResultadosEmpleado(cedula, resultados) {
        // Esta función ya no se usa en la versión simple
        console.log('mostrarResultadosEmpleado no se usa en la versión simple');
    },

    // Obtener nombre del empleado
    obtenerNombreEmpleado(empleado) {
        const camposNombre = ['NOMBRE', 'nombre', 'NOMBRE COMPLETO', 'Nombre Completo', 'APELLIDO', 'apellido', 'NOMBRE APELLIDO'];
        
        for (let campo of camposNombre) {
            if (empleado[campo] && empleado[campo].toString().trim()) {
                return empleado[campo].toString();
            }
        }
        
        return null;
    },

    // Descargar desprendible específico
    descargarDesprendible(periodo, cedula) {
        console.log('📄 Descargando desprendible:', periodo, 'para cédula:', cedula);
        
        try {
            const documento = this.baseDatos.documentos.find(doc => doc.periodo === periodo);
            if (!documento) {
                alert('❌ Documento no encontrado');
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
                alert('❌ Empleado no encontrado');
                return;
            }
            
            const pdf = this.crearPDFEmpleado(empleado, periodo);
            
            const link = document.createElement('a');
            link.href = pdf.pdfData;
            link.download = pdf.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ Desprendible descargado:', pdf.fileName);
            alert(`✅ Desprendible descargado: ${pdf.fileName}`);
            
        } catch (error) {
            console.error('❌ Error descargando desprendible:', error);
            alert('❌ Error al descargar el desprendible: ' + error.message);
        }
    },

    // Mostrar/ocultar progreso
    mostrarProgreso(mostrar) {
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
};

// Inicializar sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    agropalma.init();
});

// Hacer disponible globalmente
window.agropalma = agropalma;

console.log('🎯 Sistema AGROPALMA cargado correctamente');
