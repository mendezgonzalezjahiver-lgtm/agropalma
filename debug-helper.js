// DEBUG: Verificar base de datos actual
function verBaseDatos() {
    console.log('🗄️ BASE DE DATOS ACTUAL:');
    console.log('Documentos:', baseDatos.documentos.length);
    console.log('Períodos:', baseDatos.periodos);
    
    baseDatos.documentos.forEach((doc, index) => {
        console.log(`📋 Doc ${index + 1}: ${doc.periodo} - ${doc.empleados.length} empleados`);
        console.log(`   Nombre archivo: ${doc.nombreArchivo}`);
        console.log(`   Primer empleado:`, Object.values(doc.empleados[0] || {}).slice(0, 2).join(' - '));
    });
}

// DEBUG: Agregar botón de depuración
function agregarBotonDebug() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔍 Ver Base Datos';
    debugBtn.className = 'btn btn-sm btn-secondary';
    debugBtn.style.position = 'fixed';
    debugBtn.style.top = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.onclick = verBaseDatos;
    
    document.body.appendChild(debugBtn);
}

// Agregar botón de debug
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(agregarBotonDebug, 2000);
});

// Función global para debug
window.verBaseDatos = verBaseDatos;