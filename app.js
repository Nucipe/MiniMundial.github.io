// CONFIGURACIÓN DE SUPABASE (Cambia esto con tus credenciales)
const SUPABASE_URL = "https://dwxqyeumcfdpfursscja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eHF5ZXVtY2ZkcGZ1cnNzY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzYzODQsImV4cCI6MjA5NjMxMjM4NH0.JxzBHDUXVHaSIHMJ0UbbpYPAIuFDG3MnHBJuVMGr6FQ";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Base de datos local mockeada de equipos históricos para el juego
const EQUIPOS_HISTORICOS = [
  { nombre: "España 2010", estrellas: [{ n: "Casillas", p: "POR", v: 92 }, { n: "Xavi", p: "MED", v: 94 }, { n: "Iniesta", p: "MED", v: 95 }] },
  { nombre: "Brasil 1970", estrellas: [{ n: "Pelé", p: "DEL", v: 99 }, { n: "Jairzinho", p: "DEL", v: 93 }, { n: "Carlos Alberto", p: "DEF", v: 91 }] },
  { nombre: "Argentina 1986", estrellas: [{ n: "Maradona", p: "MED", v: 98 }, { n: "Valdano", p: "DEL", v: 88 }, { n: "Ruggeri", p: "DEF", v: 87 }] },
  { nombre: "Francia 1998", estrellas: [{ n: "Zidane", p: "MED", v: 96 }, { n: "Desailly", p: "DEF", v: 90 }, { n: "Barthez", p: "POR", v: 88 }] }
];

// Estado de la app local
let miNombre = "";
let idSala = "";
let miRol = ""; // "J1" o "J2"
let datosPartida = {};
let miAlineacion = { POR: null, DEF: null, MED: null, DEL: null };

// Elementos del DOM
const pInicio = document.getElementById("pantalla-inicio");
const pJuego = document.getElementById("pantalla-juego");

// INICIAR O UNIRSE A UNA SALA
document.getElementById("btn-crear").addEventListener("click", async () => {
  miNombre = document.getElementById("input-nombre").value || "Jugador 1";
  idSala = Math.floor(1000 + Math.random() * 9000).toString(); // Código de 4 dígitos
  miRol = "J1";

  datosPartida = {
    j1: miNombre, j2: null,
    score_j1: 0, score_j2: 0,
    turno: "J1", dado_resultado: null,
    estado_juego: "esperando"
  };

  const { error } = await supabase.from("partidas").insert([{ id: idSala, estado: datosPartida }]);
  if (!error) iniciarLobby();
});

document.getElementById("btn-unirse").addEventListener("click", async () => {
  miNombre = document.getElementById("input-nombre").value || "Jugador 2";
  idSala = document.getElementById("input-sala").value.trim();
  miRol = "J2";

  const { data, error } = await supabase.from("partidas").select("estado").eq("id", idSala).single();
  
  if (data && data.estado) {
    datosPartida = data.estado;
    datosPartida.j2 = miNombre;
    datosPartida.estado_juego = "jugando";
    
    await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
    iniciarLobby();
  } else {
    alert("La sala no existe.");
  }
});

// ESCUCHAR CAMBIOS EN TIEMPO REAL
function iniciarLobby() {
  pInicio.classList.add("oculto");
  pJuego.classList.remove("oculto");
  document.getElementById("id-sala-actual").innerText = idSala;
  dibujarSlotsVacios();

  // Suscribirse al canal de tiempo real para esta sala específica
  supabase
    .channel(`sala-${idSala}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partidas', filter: `id=eq.${idSala}` }, 
    payload => {
      datosPartida = payload.new.estado;
      actualizarInterfaz();
    })
    .subscribe();

  actualizarInterfaz();
}

// ACTUALIZAR LA PANTALLA SEGÚN EL ESTADO DE LA BASE DE DATOS
function actualizarInterfaz() {
  document.getElementById("nombre-j1").innerText = datosPartida.j1;
  document.getElementById("nombre-j2").innerText = datosPartida.j2 || "Esperando rival...";
  document.getElementById("score-j1").innerText = datosPartida.score_j1;
  document.getElementById("score-j2").innerText = datosPartida.score_j2;
  document.getElementById("turno-actual").innerText = datosPartida.turno === "J1" ? datosPartida.j1 : (datosPartida.j2 || "...");

  // Controlar botón del dado
  const btnDado = document.getElementById("btn-dado");
  if (datosPartida.estado_juego === "jugando" && datosPartida.turno === miRol && !datosPartida.dado_resultado) {
    btnDado.disabled = false;
  } else {
    btnDado.disabled = true;
  }

  // Mostrar opciones si se ha tirado el dado
  const containerOpciones = document.getElementById("opciones-container");
  containerOpciones.innerHTML = "";
  if (datosPartida.dado_resultado) {
    const equipo = EQUIPOS_HISTORICOS[datosPartida.dado_resultado];
    
    // Crear un botón por cada jugador estrella disponible en ese dado
    equipo.estrellas.forEach(jugador => {
      const btn = document.createElement("button");
      btn.className = "opcion-btn";
      btn.innerText = `${jugador.n} (${jugador.p}) - Valor: ${jugador.v}`;
      
      // Solo el jugador que tiene el turno puede hacer clic
      if (datosPartida.turno === miRol) {
        btn.onclick = () => elegirJugador(jugador);
      } else {
        btn.disabled = true;
      }
      containerOpciones.appendChild(btn);
    });
  }
}

// ACCIÓN: TIRAR DADO
document.getElementById("btn-dado").addEventListener("click", async () => {
  // Elige un índice aleatorio de la lista de equipos
  datosPartida.dado_resultado = Math.floor(Math.random() * EQUIPOS_HISTORICOS.length);
  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
});

// ACCIÓN: SELECCIONAR UN JUGADOR PARA TU FORMACIÓN
async function elegirJugador(jugador) {
  // Colocar en el slot correspondiente si está libre
  if (!miAlineacion[jugador.p]) {
    miAlineacion[jugador.p] = jugador;
    
    // Sumar a la puntuación del jugador actual
    if (miRol === "J1") datosPartida.score_j1 += jugador.v;
    if (miRol === "J2") datosPartida.score_j2 += jugador.v;

    // Cambiar turno y limpiar dado
    datosPartida.turno = miRol === "J1" ? "J2" : "J1";
    datosPartida.dado_resultado = null;

    // Comprobar si el juego termina (ej: cuando llenas tus 4 posiciones principales)
    if (miAlineacion.POR && miAlineacion.DEF && miAlineacion.MED && miAlineacion.DEL) {
       alert("¡Has completado tu alineación base! Espera a que termine tu rival para ver el puntaje final.");
    }

    // Guardar cambios en Supabase para que el rival los vea al instante
    await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
    actualizarTuAlineacionVisual();
  } else {
    alert(`Ya tienes ocupada la posición de ${jugador.p}. Elige otra opción si es posible.`);
  }
}

function dibujarSlotsVacios() {
  const container = document.getElementById("tu-alineacion");
  container.innerHTML = "";
  ["POR", "DEF", "MED", "DEL"].forEach(pos => {
    const div = document.createElement("div");
    div.className = "slot";
    div.id = `slot-${pos}`;
    div.innerHTML = `<b>${pos}</b><br><span class="player-name">Vacío</span>`;
    container.appendChild(div);
  });
}

function actualizarTuAlineacionVisual() {
  for (const pos in miAlineacion) {
    if (miAlineacion[pos]) {
      const slot = document.getElementById(`slot-${pos}`);
      slot.classList.add("lleno");
      slot.innerHTML = `<b>${pos}</b><br>${miAlineacion[pos].n} (${miAlineacion[pos].v})`;
    }
  }
}