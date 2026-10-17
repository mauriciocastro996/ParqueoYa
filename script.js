// ==========================================
// 1. CONEXIÓN A SUPABASE (Base de datos de Ibsen)
// ==========================================
const SUPABASE_URL = "https://xpjiiknsobbmaytjlaig.supabase.co/rest/v1/parqueo";
const API_KEY = "sb_publishable_A-oXd90wBvPbw1iCKnGeLw_BAxclw9U"; 

const opcionesFetch = {
  headers: {
    "apikey": API_KEY,
    "Authorization": `Bearer ${API_KEY}`
  }
};

// ==========================================
// 2. CONFIGURACIÓN DEL MAPA
// ==========================================
const mapa = L.map('mapa').setView([14.9715, -89.5296], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(mapa);

let marcadores = [];

// ==========================================
// 3. OBTENER DATOS Y CONSTRUIR INTERFAZ
// ==========================================
function cargarParqueos() {
  fetch(SUPABASE_URL, opcionesFetch)
    .then(respuesta => respuesta.json())
    .then(datos => {
      
      // Limpiar mapa y contenedor de tarjetas para actualizarlos con los datos más recientes
      marcadores.forEach(marcador => mapa.removeLayer(marcador));
      marcadores = [];
      
      const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
      contenedorTarjetas.innerHTML = ''; 

      datos.forEach(parqueo => {
        // --- A. ACTUALIZAR MAPA ---
        let colorPunto = parqueo.espacios_disponibles > 0 ? "🟢" : "🔴";
        let googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${parqueo.latitud},${parqueo.longitud}`;
        
        let popupContenido = `
          <div style="text-align: center;">
            <h3 style="margin: 0 0 5px 0;">${parqueo.nombre}</h3>
            <p style="margin: 5px 0;"><b>Estado:</b> ${colorPunto} ${parqueo.espacios_disponibles} libres</p>
            <p style="margin: 5px 0;"><b>Tarifa:</b> ${parqueo.tarifa}</p>
            <hr>
            <a href="${googleMapsLink}" target="_blank" style="background: #007bff; color: white; padding: 8px 12px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">📍 Cómo llegar</a>
          </div>
        `;

        let nuevoMarcador = L.marker([parqueo.latitud, parqueo.longitud])
         .addTo(mapa)
         .bindPopup(popupContenido);
        marcadores.push(nuevoMarcador);

        // --- B. CONSTRUIR TARJETAS HTML ---
        let estadoClase = parqueo.espacios_disponibles > 0 ? "disponible-texto" : "lleno-texto";
        let estadoTexto = parqueo.espacios_disponibles > 0 ? "Disponible" : "Lleno";

        // Preparar los datos limpios para pasarlos a la ventana modal
        let btnClick = `mostrarDetalles('${parqueo.nombre}', ${parqueo.espacios_disponibles}, ${parqueo.capacidad_total}, '${parqueo.tarifa}', '${parqueo.horario}', '${googleMapsLink}')`;

        let tarjetaHTML = `
            <article class="parqueo-card">
                <div class="card-superior">
                    <div>
                        <h3>${parqueo.nombre}</h3>
                        <p>Zacapa</p>
                    </div>
                    <span class="estado ${estadoClase}">${estadoTexto}</span>
                </div>

                <div class="espacios">
                    <div>
                        <strong>${parqueo.espacios_disponibles}</strong>
                        <span>espacios libres</span>
                    </div>
                    <div>
                        <strong>${parqueo.capacidad_total}</strong>
                        <span>espacios totales</span>
                    </div>
                </div>

                <div class="informacion-card">
                    <p>${parqueo.tarifa}</p>
                    <p>${parqueo.horario}</p>
                </div>

                <button class="boton-detalles" onclick="${btnClick}">
                    Ver detalles
                </button>
            </article>
        `;
        
        contenedorTarjetas.innerHTML += tarjetaHTML;
      });
    })
    .catch(error => console.error("Error al cargar datos desde Supabase:", error));
}

// Iniciar y refrescar datos cada 3 segundos
cargarParqueos();
setInterval(cargarParqueos, 3000);

// ==========================================
// 4. LÓGICA DE LA VENTANA MODAL (DETALLES)
// ==========================================
function mostrarDetalles(nombre, libres, totales, tarifa, horario, linkMapa) {
    document.getElementById("modalNombre").textContent = nombre;
    document.getElementById("modalEspacios").textContent = libres;
    document.getElementById("modalTotales").textContent = totales;
    document.getElementById("modalTarifa").textContent = tarifa;
    document.getElementById("modalHorario").textContent = horario;
    document.getElementById("modalUbicacion").href = linkMapa;

    // Cambiar el indicador visual del modal dependiendo de los espacios
    let circulo = document.getElementById("modalCirculo");
    let estadoTexto = document.getElementById("modalEstadoTexto");
    
    if (libres > 0) {
        circulo.className = "circulo verde";
        estadoTexto.textContent = "Disponible";
    } else {
        circulo.className = "circulo rojo"; // Asegúrate de tener una clase .rojo en tu CSS para background-color: red;
        estadoTexto.textContent = "Lleno";
    }

    document.getElementById("modal").style.display = "flex";
}

function cerrarDetalles() {
    document.getElementById("modal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        cerrarDetalles();
    }
};
