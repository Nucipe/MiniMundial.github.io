// CONFIGURACIÓN DE SUPABASE (Cambia esto con tus credenciales)
const SUPABASE_URL = "https://dwxqyeumcfdpfursscja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eHF5ZXVtY2ZkcGZ1cnNzY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzYzODQsImV4cCI6MjA5NjMxMjM4NH0.JxzBHDUXVHaSIHMJ0UbbpYPAIuFDG3MnHBJuVMGr6FQ";


const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Banco de datos de jugadores reales para alimentar el draft aleatorio
const JUGADORES_POOL = [
  { n: "Pelé", p: "DEL", v: 98 }, { n: "Maradona", p: "DEL", v: 97 }, { n: "Cruyff", p: "DEL", v: 95 },
  { n: "Ronaldo Nazário", p: "DEL", v: 96 }, { n: "Messi", p: "DEL", v: 98 }, { n: "Cristiano R.", p: "DEL", v: 96 },
  { n: "Ronaldinho", p: "DEL", v: 94 }, { n: "Zidane", p: "MED", v: 96 }, { n: "Xavi", p: "MED", v: 93 },
  { n: "Iniesta", p: "MED", v: 94 }, { n: "Modric", p: "MED", v: 92 }, { n: "Pirlo", p: "MED", v: 92 },
  { n: "Gullit", p: "MED", v: 93 }, { n: "Maldini", p: "DEF", v: 95 }, { n: "Roberto Carlos", p: "DEF", v: 91 },
  { n: "Sergio Ramos", p: "DEF", v: 90 }, { n: "Puyol", p: "DEF", v: 90 }, { n: "Cafú", p: "DEF", v: 92 },
  { n: "Beckenbauer", p: "DEF", v: 94 }, { n: "Casillas", p: "POR", v: 92 }, { n: "Buffon", p: "POR", v: 93 },
  { n: "Yashin", p: "POR", v: 94 }, { n: "Neuer", p: "POR", v: 92 }, { n: "Ronald Koeman", p: "DEF", v: 89 },
  { n: "Henry", p: "DEL", v: 93 }, { n: "Kaká", p: "MED", v: 91 }, { n: "Busquets", p: "MED", v: 89 },
  { n: "Van Dijk", p: "DEF", v: 89 }, { n: "Baresi", p: "DEF", v: 93 }, { n: "Kahn", p: "POR", v: 91 }
];

// Configuración de la alineación 4-3-3 estándar (11 jugadores)
const ESQUEMA_TACTICO = [
  { id: "POR1", pos: "POR" },
  { id: "DEF1", pos: "DEF" }, { id: "DEF2", pos: "DEF" }, { id: "DEF3", pos: "DEF" }, { id: "DEF4", pos: "DEF" },
  { id: "MED1", pos: "MED" }, { id: "MED2", pos: "MED" }, { id: "MED3", pos: "MED" },
  { id: "DEL1", pos: "DEL" }, { id: "DEL2", pos: "DEL" }, { id: "DEL3", pos: "DEL" }
];

let miNombre = "";
let idSala = "";
let miRol = ""; 
let datosPartida = {};
let miEquipo = {}; 

const pInicio = document.getElementById("pantalla-inicio");
const pJuego = document.getElementById("pantalla-juego");
const pPartido = document.getElementById("pantalla-partido");

// EVENTOS DE BOTONES INICIALES
document.getElementById("btn-crear").addEventListener("click", async () => {
  miNombre = document.getElementById("input-nombre").value.trim() || "Mister 1";
  idSala = Math.floor(1000 + Math.random() * 9000).toString();
  miRol = "J1";
  
  datosPartida = {
    j1: miNombre, j2: null,
    score_j1: 0, score_j2: 0,
    conteo_j1: 0, conteo_j2: 0, // Cuántos jugadores ha drafteado cada uno
    turno: "J1", pool_actual: null,
    estado_juego: "esperando"
  };

  await supabase.from("partidas").insert([{ id: idSala, estado: datosPartida }]);
  conectarLobby();
});

document.getElementById("btn-unirse").addEventListener("click", async () => {
  miNombre = document.getElementById("input-nombre").value.trim() || "Mister 2";
  idSala = document.getElementById("input-sala").value.trim();
  miRol = "J2";

  const { data } = await supabase.from("partidas").select("estado").eq("id", idSala).single();
  if (data) {
    datosPartida = data.estado;
    datosPartida.j2 = miNombre;
    datosPartida.estado_juego = "jugando";
    await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
    conectarLobby();
  } else {
    alert("Código de sala incorrecto.");
  }
});

function conectarLobby() {
  pInicio.classList.add("oculto");
  pJuego.classList.remove("oculto");
  document.getElementById("id-sala-actual").innerText = idSala;
  
  construirCampoVisual();

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

// CONSTRUIR HUECOS EN EL CAMPO SEGÚN LA ALINEACIÓN 4-3-3
function construirCampoVisual() {
  ["POR", "DEF", "MED", "DEL"].forEach(pos => {
    const linea = document.getElementById(`linea-${pos}`);
    linea.innerHTML = "";
    ESQUEMA_TACTICO.filter(s => s.pos === pos).forEach(slot => {
      const div = document.createElement("div");
      div.className = "slot-futbol";
      div.id = `campo-${slot.id}`;
      div.innerHTML = `<b>${slot.pos}</b><br>Vacío`;
      linea.appendChild(div);
    });
  });
}

function actualizarInterfaz() {
  document.getElementById("nombre-j1").innerText = datosPartida.j1;
  document.getElementById("nombre-j2").innerText = datosPartida.j2 || "Esperando rival...";
  document.getElementById("score-j1").innerText = datosPartida.score_j1;
  document.getElementById("score-j2").innerText = datosPartida.score_j2;
  document.getElementById("turno-actual").innerText = datosPartida.turno === "J1" ? datosPartida.j1 : (datosPartida.j2 || "...");

  // Controlar dado
  const btnDado = document.getElementById("btn-dado");
  if (datosPartida.estado_juego === "jugando" && datosPartida.turno === miRol && !datosPartida.pool_actual) {
    btnDado.disabled = false;
  } else {
    btnDado.disabled = true;
  }

  // Renderizar las 5 opciones del dado del Draft
  const container = document.getElementById("opciones-container");
  container.innerHTML = "";
  
  if (datosPartida.pool_actual) {
    datosPartida.pool_actual.forEach((jugador, index) => {
      const divCromo = document.createElement("div");
      divCromo.className = "cromo";
      divCromo.innerHTML = `
        <span class="cromo-media">${jugador.v}</span>
        <span class="cromo-pos">${jugador.p}</span>
        <span class="cromo-nombre">${jugador.n}</span>
      `;
      
      if (datosPartida.turno === miRol) {
        divCromo.onclick = () => intentarFichar(jugador);
      }
      container.appendChild(divCromo);
    });
  }

  // Si ambos han completado los 11 jugadores, lanzar el simulador de partido
  if (datosPartida.conteo_j1 === 11 && datosPartida.conteo_j2 === 11 && datosPartida.estado_juego !== "finalizado") {
    ejecutarSimulacionPartido();
  }
}

// ACCIÓN: LANZAR DADO (Genera 5 jugadores completamente aleatorios del pool)
document.getElementById("btn-dado").addEventListener("click", async () => {
  let opciones = [];
  const copiaPool = [...JUGADORES_POOL];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * copiaPool.length);
    opciones.push(copiaPool.splice(idx, 1)[0]);
  }
  datosPartida.pool_actual = opciones;
  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
});

// ACCIÓN: INTENTAR COLOCAR UN JUGADOR EN EL EQUIPO
async function intentarFichar(jugador) {
  // Buscar si tenemos un hueco libre en la táctica para esa posición
  const slotLibre = ESQUEMA_TACTICO.find(slot => slot.pos === jugador.p && !miEquipo[slot.id]);

  if (!slotLibre) {
    alert(`¡No tienes hueco en la formación para otro ${jugador.p}! Elige a un jugador de otra posición.`);
    return;
  }

  // Asignar al jugador localmente
  miEquipo[slotLibre.id] = jugador;
  
  // Actualizar el nodo visual del campo de fútbol
  const divSlot = document.getElementById(`campo-${slotLibre.id}`);
  divSlot.className = "slot-futbol ocupado";
  divSlot.innerHTML = `<b>${jugador.p}</b><br>${jugador.n}<br>⭐ ${jugador.v}`;

  // Actualizar datos globales de puntuación (media aritmética acumulada)
  if (miRol === "J1") {
    datosPartida.conteo_j1++;
    datosPartida.score_j1 = Math.round((datosPartida.score_j1 * (datosPartida.conteo_j1 - 1) + jugador.v) / datosPartida.conteo_j1);
  } else {
    datosPartida.conteo_j2++;
    datosPartida.score_j2 = Math.round((datosPartida.score_j2 * (datosPartida.conteo_j2 - 1) + jugador.v) / datosPartida.conteo_j2);
  }

  // Pasar el turno al rival y limpiar el dado
  datosPartida.turno = miRol === "J1" ? "J2" : "J1";
  datosPartida.pool_actual = null;

  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
}

// MOTOR DE SIMULACIÓN DEL PARTIDO (Minuto a minuto tipo simulador de texto)
async function ejecutarSimulacionPartido() {
  datosPartida.estado_juego = "finalizado";
  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);

  pJuego.classList.add("oculto");
  pPartido.classList.remove("oculto");

  document.getElementById("final-nombre-j1").innerText = datosPartida.j1;
  document.getElementById("final-nombre-j2").innerText = datosPartida.j2;

  let golesJ1 = 0;
  let golesJ2 = 0;
  let minuto = 0;
  
  const marcador1 = document.getElementById("goles-j1");
  const marcador2 = document.getElementById("goles-j2");
  const textoMinuto = document.getElementById("minuto-partido");
  const textoEvento = document.getElementById("texto-evento");

  // El porcentaje de probabilidad de gol depende de la diferencia de medias entre equipos
  const ventajaJ1 = (datosPartida.score_j1 - datosPartida.score_j2) * 2; 

  const intervalo = setInterval(() => {
    minuto += 15;
    if (minuto > 90) {
      clearInterval(intervalo);
      
      // Manejar empates al final del partido
      if (golesJ1 === golesJ2) {
        textoMinuto.innerText = "Final 90'";
        textoEvento.innerText = "¡Empate técnico! Se decide en la tanda de penaltis...";
        setTimeout(() => {
          if (datosPartida.score_j1 >= datosPartida.score_j2) {
            golesJ1 += 1; marcador1.innerText = golesJ1;
            document.getElementById("estado-final-juego").innerText = `¡${datosPartida.j1} gana en los penaltis! 🏆`;
          } else {
            golesJ2 += 1; marcador2.innerText = golesJ2;
            document.getElementById("estado-final-juego").innerText = `¡${datosPartida.j2} gana en los penaltis! 🏆`;
          }
        }, 2000);
      } else {
        textoMinuto.innerText = "Fin del Partido";
        const ganador = golesJ1 > golesJ2 ? datosPartida.j1 : datosPartida.j2;
        document.getElementById("estado-final-juego").innerText = `🎉 ¡Victoria y campeonato para ${ganador}! 🎉`;
      }
      return;
    }

    textoMinuto.innerText = `Minuto ${minuto}'`;

    // Algoritmo aleatorio ponderado de ocasiones de gol
    const suceso = Math.random() * 100;
    if (suceso < 20 + ventajaJ1) {
      golesJ1++;
      marcador1.innerText = golesJ1;
      textoEvento.innerText = `⚽ ¡GOOOL de ${datosPartida.j1}! Remate espectacular ajustado al palo.`;
    } else if (suceso > 80 + ventajaJ1) {
      golesJ2++;
      marcador2.innerText = golesJ2;
      textoEvento.innerText = `⚽ ¡GOOOL de ${datosPartida.j2}! Jugada colectiva perfecta que termina en el fondo de la red.`;
    } else {
      const frases = [
        "Balón disputado intensamente en el centro del campo.",
        "¡Paradón del guardameta para salvar a su equipo!",
        "Falta táctica cortando el contraataque peligroso.",
        "El disparo se marcha rozando el travesaño exterior."
      ];
      textoEvento.innerText = frases[Math.floor(Math.random() * frases.length)];
    }

  }, 1200); // Avanza cada 1.2 segundos por tramo de partido
}