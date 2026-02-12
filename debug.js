// Función de debug para verificar que todo esté funcionando
function debugCheck() {
    console.log('=== DEBUG AGROPALMA ===');
    console.log('Botón de subir:', document.getElementById('uploadForm'));
    console.log('Botón de descargar:', document.getElementById('downloadForm'));
    console.log('Input de archivo:', document.getElementById('excelFile'));
    console.log('Archivos guardados:', uploadedFiles);
    console.log('Event listeners registrados');
}

// Agregar debug al inicio
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadStoredData();
    debugCheck();
});