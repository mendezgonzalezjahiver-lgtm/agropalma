// Base de datos improvisada en memoria
let database = {
    empleados: [],
    periodos: [],
    documentos: []
};

// Función para inicializar base de datos
function inicializarBaseDatos() {
    const stored = localStorage.getItem('agropalma_database');
    if (stored) {
        database = JSON.parse(stored);
    }
    console.log('Base de datos inicializada:', database);
}

// Guardar base de datos
function guardarBaseDatos() {
    localStorage.setItem('agropalma_database', JSON.stringify(database));
}

// Agregar documento a la base de datos
function agregarDocumento(periodo, archivo, datos) {
    const documento = {
        id: Date.now(),
        periodo: periodo,
        archivo: archivo.name,
        fechaCarga: new Date().toISOString(),
        empleados: datos
    };
    
    database.documentos.push(documento);
    
    // Agregar período si no existe
    if (!database.periodos.includes(periodo)) {
        database.periodos.push(periodo);
    }
    
    // Agregar empleados
    datos.forEach(empleado => {
        const empleadoData = {
            ...empleado,
            documentoId: documento.id,
            periodo: periodo,
            fechaCarga: documento.fechaCarga
        };
        database.empleados.push(empleadoData);
    });
    
    guardarBaseDatos();
    console.log('Documento agregado a base de datos:', documento);
    return documento;
}

// Buscar empleado por cualquier criterio
function buscarEmpleado(criterio, periodo) {
    const resultados = database.empleados.filter(emp => {
        if (periodo && emp.periodo !== periodo) return false;
        
        // Buscar en todos los campos
        for (let campo in emp) {
            if (emp[campo] && 
                emp[campo].toString().toLowerCase().includes(criterio.toLowerCase())) {
                return true;
            }
        }
        return false;
    });
    
    return resultados;
}

// Obtener todos los períodos disponibles
function obtenerPeriodos() {
    return database.periodos.sort();
}

// Limpiar base de datos (opcional)
function limpiarBaseDatos() {
    database = {
        empleados: [],
        periodos: [],
        documentos: []
    };
    localStorage.removeItem('agropalma_database');
    console.log('Base de datos limpiada');
}