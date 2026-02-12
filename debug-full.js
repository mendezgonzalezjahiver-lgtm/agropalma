// Botón para ver/debug base de datos
function agregarBotonDebug() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔍 Ver Base Datos';
    debugBtn.className = 'btn btn-sm btn-warning';
    debugBtn.style.position = 'fixed';
    debugBtn.style.top = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.onclick = function() {
        console.clear();
        console.log('🗄️ BASE DE DATOS AGROPALMA:');
        console.log('Documentos:', window.agropalma.baseDatos.documentos.length);
        console.log('Períodos:', window.agropalma.baseDatos.periodos);
        
        window.agropalma.baseDatos.documentos.forEach((doc, index) => {
            console.log(`\n📋 Documento ${index + 1}: ${doc.periodo}`);
            console.log(`   Nombre: ${doc.nombreArchivo}`);
            console.log(`   Empleados: ${doc.empleados.length}`);
            console.log(`   Fecha: ${doc.fechaCarga}`);
            
            doc.empleados.forEach((emp, empIndex) => {
                const cedula = Object.keys(emp).find(key => {
                    const lowerKey = key.toLowerCase();
                    return lowerKey.includes('cedula') || lowerKey.includes('documento') || lowerKey.includes('id');
                });
                
                console.log(`   👤 Emp ${empIndex + 1}: ${cedula ? emp[cedula] : 'SIN CÉDULA'} - ${Object.values(emp).slice(0, 2).join(' - ')}`);
            });
        });
        
        alert('📊 Base de datos mostrada en consola (F12)');
    };
    
    document.body.appendChild(debugBtn);
}

// Agregar botón cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(agregarBotonDebug, 2000);
});