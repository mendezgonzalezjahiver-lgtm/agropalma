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

// Verificar acceso a administración
function verificarAccesoAdministracion() {
    const password = document.getElementById('adminPassword').value.trim();
    console.log('🔐 Verificando acceso con contraseña:', password);
    
    if (password === 'agropalmasas') {
        console.log('🔓 Acceso concedido a administración');
        document.getElementById('adminPassword').value = ''; // Limpiar campo
        showCompanyModule();
    } else {
        console.log('❌ Clave incorrecta:', password);
        alert('❌ Clave incorrecta. Acceso denegado.');
        document.getElementById('adminPassword').value = ''; // Limpiar campo
        document.getElementById('adminPassword').focus(); // Enfocar campo
    }
}

// Exportar funciones globales
window.showCompanyModule = showCompanyModule;
window.showEmployeeModule = showEmployeeModule;
window.verificarAccesoAdministracion = verificarAccesoAdministracion;
window.descargarDesprendible = descargarDesprendible;

console.log('🎯 Funciones de módulo exportadas');