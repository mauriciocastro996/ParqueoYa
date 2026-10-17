// 1. Datos de conexión a la base de datos (Supabase)
const SUPABASE_URL = "https://xpjiiknsobbmaytjlaig.supabase.co/rest/v1/parqueo";
const API_KEY = "sb_publishable_A-oXd90wBvPbw1iCKnGeLw_BAxclw9U"; 

const opcionesFetch = {
  headers: {
    "apikey": API_KEY,
    "Authorization": `Bearer ${API_KEY}`
  }
};

// 2. Inicializar el Mapa centrado en Zacapa
// Las coordenadas [14.9715, -89.5296] son de Zacapa, ajústalas si es necesario
const mapa = L.map('mapa').setView([14.9715, -89.5296], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(mapa);

// Variable para guardar los marcadores y no duplicarlos al actualizar
let marcadores = [];

// 3. Función principal para cargar y actualizar los datos en tiempo real
function cargarParqueos() {
  fetch(SUPABASE_URL, opcionesFetch)
    .then(respuesta => respuesta.json())
    .then(datos => {
      
      // Limpiar los marcadores anteriores del mapa
      marcadores.forEach(marcador => mapa.removeLayer(marcador));
      marcadores = [];
      
      datos.forEach(parqueo => {
        // Determinar color (Verde si hay espacio, Rojo si está lleno)
        let color = parqueo.espacios_disponibles > 0 ? "🟢" : "🔴";
        
        // Crear la ventanita emergente del mapa con el botón de "Cómo llegar"
        let popupContenido = `
          <div style="text-align: center;">
            <h3 style="margin: 0 0 5px 0;">${parqueo.nombre}</h3>
            <p style="margin: 5px 0;"><b>Estado:</b> ${color} ${parqueo.espacios_disponibles} espacios libres</p>
            <p style="margin: 5px 0;"><b>Tarifa:</b> ${parqueo.tarifa}</p>
            <p style="margin: 5px 0;"><b>Horario:</b> ${parqueo.horario}</p>
            <hr>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${parqueo.latitud},${parqueo.longitud}" target="_blank" style="background: #007bff; color: white; padding: 8px 12px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">📍 Cómo llegar</a>
          </div>
        `;

        // Colocar el marcador en el mapa con sus coordenadas
        let nuevoMarcador = L.marker([parqueo.latitud, parqueo.longitud])
         .addTo(mapa)
         .bindPopup(popupContenido);
         
        marcadores.push(nuevoMarcador);

        // EXTRA: Si tienes un texto en tu HTML con id="contador", lo actualiza aquí:
        let textoContador = document.getElementById("contador");
        if(textoContador) {
            textoContador.innerText = parqueo.espacios_disponibles;
        }
      });
    })
    .catch(error => console.error("Error al cargar datos:", error));
}

// 4. Ejecutar la función la primera vez que carga la página
cargarParqueos();

// 5. El truco final: Refrescar silenciosamente los datos cada 3 segundos
setInterval(cargarParqueos, 3000);