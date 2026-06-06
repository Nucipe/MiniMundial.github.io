// CONFIGURACIÓN DE SUPABASE (Cambia esto con tus credenciales)
const SUPABASE_URL = "https://dwxqyeumcfdpfursscja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eHF5ZXVtY2ZkcGZ1cnNzY2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzYzODQsImV4cCI6MjA5NjMxMjM4NH0.JxzBHDUXVHaSIHMJ0UbbpYPAIuFDG3MnHBJuVMGr6FQ";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Base de datos real con las plantillas completas, años y selecciones originales
const SELECCIONES_HISTORICAS = [
  {
    nombre: "España", anio: "2010",
    jugadores: [
      { n: "Iker Casillas", p: "POR", v: 93 },
      { n: "Sergio Ramos", p: "DEF", v: 91 }, { n: "Gerard Piqué", p: "DEF", v: 89 }, { n: "Carles Puyol", p: "DEF", v: 91 }, { n: "Joan Capdevila", p: "DEF", v: 84 },
      { n: "Sergio Busquets", p: "MED", v: 89 }, { n: "Xabi Alonso", p: "MED", v: 90 }, { n: "Xavi Hernández", p: "MED", v: 94 }, { n: "Andrés Iniesta", p: "MED", v: 95 },
      { n: "David Villa", p: "DEL", v: 92 }, { n: "Pedro Rodríguez", p: "DEL", v: 85 }, { n: "Fernando Torres", p: "DEL", v: 88 }
    ]
  },
  {
    nombre: "Brasil", anio: "1970",
    jugadores: [
      { n: "Félix", p: "POR", v: 82 },
      { n: "Carlos Alberto", p: "DEF", v: 92 }, { n: "Brito", p: "DEF", v: 85 }, { n: "Piazza", p: "DEF", v: 86 }, { n: "Everaldo", p: "DEF", v: 84 },
      { n: "Clodoaldo", p: "MED", v: 88 }, { n: "Gérson", p: "MED", v: 91 }, { n: "Rivelino", p: "MED", v: 93 },
      { n: "Jairzinho", p: "DEL", v: 93 }, { n: "Tostão", p: "DEL", v: 90 }, { n: "Pelé", p: "DEL", v: 99 }
    ]
  },
  {
    nombre: "Argentina", anio: "1986",
    jugadores: [
      { n: "Nery Pumpido", p: "POR", v: 85 },
      { n: "José Brown", p: "DEF", v: 84 }, { n: "Oscar Ruggeri", p: "DEF", v: 88 }, { n: "José Cuciuffo", p: "DEF", v: 83 },
      { n: "Sergio Batista", p: "MED", v: 85 }, { n: "Ricardo Giusti", p: "MED", v: 84 }, { n: "Jorge Burruchaga", p: "MED", v: 89 }, { n: "Julio Olarticoechea", p: "MED", v: 83 }, { n: "Diego Maradona", p: "MED", v: 98 },
      { n: "Jorge Valdano", p: "DEL", v: 89 }, { n: "Pedro Pasculli", p: "DEL", v: 82 }
    ]
  },
  {
    nombre: "Francia", anio: "1998",
    jugadores: [
      { n: "Fabien Barthez", p: "POR", v: 89 },
      { n: "Lilian Thuram", p: "DEF", v: 92 }, { n: "Laurent Blanc", p: "DEF", v: 90 }, { n: "Marcel Desailly", p: "DEF", v: 93 }, { n: "Bixente Lizarazu", p: "DEF", v: 89 },
      { n: "Didier Deschamps", p: "MED", v: 88 }, { n: "Christian Karembeu", p: "MED", v: 84 }, { n: "Emmanuel Petit", p: "MED", v: 87 }, { n: "Zinedine Zidane", p: "MED", v: 97 },
      { n: "Youri Djorkaeff", p: "DEL", v: 88 }, { n: "Stéphane Guivarc'h", p: "DEL", v: 80 }, { n: "Thierry Henry", p: "DEL", v: 86 }
    ]
  },
  {
    nombre: "Italia", anio: "2006",
    jugadores: [
      { n: "Gianluigi Buffon", p: "POR", v: 94 },
      { n: "Gianluca Zambrotta", p: "DEF", v: 89 }, { n: "Fabio Cannavaro", p: "DEF", v: 94 }, { n: "Marco Materazzi", p: "DEF", v: 86 }, { n: "Fabio Grosso", p: "DEF", v: 85 },
      { n: "Gennaro Gattuso", p: "MED", v: 88 }, { n: "Andrea Pirlo", p: "MED", v: 93 }, { n: "Simone Perrotta", p: "MED", v: 83 }, { n: "Francesco Totti", p: "MED", v: 91 },
      { n: "Mauro Camoranesi", p: "DEL", v: 86 }, { n: "Luca Toni", p: "DEL", v: 88 }
    ]
  }
];

// Estructura táctica 4-3-3 obligatoria
const ESQUEMA_TACTICO = [
  { id: "POR1", pos: "POR" },
  { id: "DEF1", pos: "DEF" }, { id: "DEF2", pos: "DEF" }, { id: "DEF3", pos: "DEF" }, { id: "DEF4", pos: "DEF" },
  { id: "MED1", pos: "MED" }, { id: "MED2", pos: "MED" }, { id: "MED3", pos: "MED" },
  { id: "DEL1", pos: "DEL" }, { id: "DEL2", pos: "DEL" }, { id: "DEL3", pos: "DEL" }
];

let miNombre = ""; let idSala = ""; let miRol = ""; 
let datosPartida = {}; let miEquipo = {}; 

const pInicio = document.getElementById("pantalla-inicio");
const pJuego = document.getElementById("pantalla-juego");
const pPartido = document.getElementById("pantalla-partido");

// CREAR O UNIRSE A SALA
document.getElementById("btn-crear").addEventListener("click", async () => {
  miNombre = document.getElementById("input-nombre").value.trim() || "Mister 1";
  idSala = Math.floor(1000 + Math.random() * 9000).toString();
  miRol = "J1";
  
  datosPartida = {
    j1: miNombre, j2: null,
    score_j1: { POR: 0, DEF: 0, MED: 0, DEL: 0 }, // Puntuación desglosada por líneas tácticas
    score_j2: { POR: 0, DEF: 0, MED: 0, DEL: 0 },
    conteo_j1: 0, conteo_j2: 0,
    turno: "J1", seleccion_dado: null,
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
  
  // Calcular y mostrar las medias globales en el marcador
  document.getElementById("score-j1").innerText = calcularMediaGlobal(datosPartida.score_j1);
  document.getElementById("score-j2").innerText = calcularMediaGlobal(datosPartida.score_j2);
  
  document.getElementById("turno-actual").innerText = datosPartida.turno === "J1" ? datosPartida.j1 : (datosPartida.j2 || "...");

  const btnDado = document.getElementById("btn-dado");
  if (datosPartida.estado_juego === "jugando" && datosPartida.turno === miRol && !datosPartida.seleccion_dado) {
    btnDado.disabled = false;
  } else {
    btnDado.disabled = true;
  }

  const containerInfoDado = document.getElementById("info-dado-seleccion");
  const containerOpciones = document.getElementById("opciones-container");
  containerOpciones.innerHTML = "";
  
  if (datosPartida.seleccion_dado) {
    // Mostrar la Selección y el Año que han salido en el dado
    containerInfoDado.innerHTML = `🎲 Ha salido: <b>${datosPartida.seleccion_dado.nombre} (${datosPartida.seleccion_dado.anio})</b>`;
    
    // Desplegar la plantilla ENTERA de jugadores de esa selección
    datosPartida.seleccion_dado.jugadores.forEach(jugador => {
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
      containerOpciones.appendChild(divCromo);
    });
  } else {
    containerInfoDado.innerHTML = "Lanza el dado para descubrir la plantilla disponible.";
  }

  if (datosPartida.conteo_j1 === 11 && datosPartida.conteo_j2 === 11 && datosPartida.estado_juego !== "finalizado") {
    ejecutarSimulacionPartido();
  }
}

function calcularMediaGlobal(scorePorLineas) {
  const suma = scorePorLineas.POR + scorePorLineas.DEF + scorePorLineas.MED + scorePorLineas.DEL;
  return suma === 0 ? 0 : Math.round(suma / 4);
}

// AL SER EL DADO, ELIGE UNA SELECCIÓN ENTERA AL AZAR
document.getElementById("btn-dado").addEventListener("click", async () => {
  const idx = Math.floor(Math.random() * SELECCIONES_HISTORICAS.length);
  datosPartida.seleccion_dado = SELECCIONES_HISTORICAS[idx];
  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
});

async function intentarFichar(jugador) {
  // Buscar si queda algún hueco libre en la táctica para la posición del jugador
  const slotLibre = ESQUEMA_TACTICO.find(slot => slot.pos === jugador.p && !miEquipo[slot.id]);

  // BLOQUEO: Si ya no tienes posiciones libres para ese rol, no se permite el fichaje
  if (!slotLibre) {
    alert(`¡Imposible! Ya tienes cubiertos todos tus puestos para la posición de: ${jugador.p}. Elige a otro jugador.`);
    return;
  }

  miEquipo[slotLibre.id] = jugador;
  
  const divSlot = document.getElementById(`campo-${slotLibre.id}`);
  divSlot.className = "slot-futbol ocupado";
  divSlot.innerHTML = `<b>${jugador.p}</b><br>${jugador.n}<br>⭐ ${jugador.v}`;

  // Guardar puntuaciones desglosadas por líneas tácticas (para el simulador final)
  if (miRol === "J1") {
    datosPartida.conteo_j1++;
    datosPartida.score_j1[jugador.p] = Math.round((datosPartida.score_j1[jugador.p] + jugador.v) / (datosPartida.score_j1[jugador.p] === 0 ? 1 : 1.5));
  } else {
    datosPartida.conteo_j2++;
    datosPartida.score_j2[jugador.p] = Math.round((datosPartida.score_j2[jugador.p] + jugador.v) / (datosPartida.score_j2[jugador.p] === 0 ? 1 : 1.5));
  }

  datosPartida.turno = miRol === "J1" ? "J2" : "J1";
  datosPartida.seleccion_dado = null; // Limpiar dado para el siguiente turno

  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);
}

// MOTOR DE SIMULACIÓN AVANZADA (TÁCTICA POR LÍNEAS + SUERTE)
async function ejecutarSimulacionPartido() {
  datosPartida.estado_juego = "finalizado";
  await supabase.from("partidas").update({ estado: datosPartida }).eq("id", idSala);

  pJuego.classList.add("oculto");
  pPartido.classList.remove("oculto");

  document.getElementById("final-nombre-j1").innerText = datosPartida.j1;
  document.getElementById("final-nombre-j2").innerText = datosPartida.j2;

  let golesJ1 = 0; let golesJ2 = 0; let minuto = 0;
  
  const marcador1 = document.getElementById("goles-j1");
  const marcador2 = document.getElementById("goles-j2");
  const textoMinuto = document.getElementById("minuto-partido");
  const textoEvento = document.getElementById("texto-evento");

  // EXTRACCIÓN DE VALORES TÁCTICOS POR LÍNEA
  const s1 = datosPartida.score_j1;
  const s2 = datosPartida.score_j2;

  const intervalo = setInterval(() => {
    minuto += 15;
    if (minuto > 90) {
      clearInterval(intervalo);
      
      if (golesJ1 === golesJ2) {
        textoMinuto.innerText = "Final 90'";
        textoEvento.innerText = "¡Empate en el marcador! El título se decide en la tanda de penaltis...";
        setTimeout(() => {
          // En los penaltis influye la calidad del portero más un factor suerte
          const penaltisJ1 = s1.POR + Math.random() * 20;
          const penaltisJ2 = s2.POR + Math.random() * 20;
          if (penaltisJ1 >= penaltisJ2) {
            golesJ1++; marcador1.innerText = golesJ1;
            document.getElementById("estado-final-juego").innerText = `¡${datosPartida.j1} gana la tanda de penaltis gracias a su portero! 🏆`;
          } else {
            golesJ2++; marcador2.innerText = golesJ2;
            document.getElementById("estado-final-juego").innerText = `¡${datosPartida.j2} gana la tanda de penaltis gracias a su portero! 🏆`;
          }
        }, 2500);
      } else {
        textoMinuto.innerText = "Fin del Partido";
        const ganador = golesJ1 > golesJ2 ? datosPartida.j1 : datosPartida.j2;
        document.getElementById("estado-final-juego").innerText = `🎉 ¡${ganador} se corona Campeón del Draft! 🎉`;
      }
      return;
    }

    textoMinuto.innerText = `Minuto ${minuto}'`;

    // 1. DUELO DE MEDIOCAMPO: Determina quién genera el ataque en este tramo de 15 minutos
    const suerteMediocampo = (Math.random() * 30) - 15; // Factor suerte +-15 puntos
    const controlJ1 = s1.MED - s2.MED + suerteMediocampo;

    if (controlJ1 > 0) {
      // Ataca Jugador 1: Su ataque contra la defensa del Jugador 2
      const suerteAtaque = (Math.random() * 20) - 10;
      const ataqueExitoso = (s1.DEL - s2.DEF + suerteAtaque) > -5;

      if (ataqueExitoso) {
        // El portero del Jugador 2 intenta pararla
        const suertePortero = Math.random() * 40;
        if (s2.POR + suertePortero > s1.DEL + 10) {
          textoEvento.innerText = `🧤 ¡Qué ocasión de ${datosPartida.j1}! Pero su disparo es atajado por un portero estelar.`;
        } else {
          golesJ1++; marcador1.innerText = golesJ1;
          textoEvento.innerText = `⚽ ¡GOOOL de ${datosPartida.j1}! El ataque supera a la defensa rival y bate al guardameta.`;
        }
      } else {
        textoEvento.innerText = `🛡️ ${datosPartida.j1} domina la posesión, pero la zaga central de ${datosPartida.j2} corta el peligro.`;
      }
    } else {
      // Ataca Jugador 2: Su ataque contra la defensa del Jugador 1
      const suerteAtaque = (Math.random() * 20) - 10;
      const ataqueExitoso = (s2.DEL - s1.DEF + suerteAtaque) > -5;

      if (ataqueExitoso) {
        // El portero del Jugador 1 intenta pararla
        const suertePortero = Math.random() * 40;
        if (s1.POR + suertePortero > s2.DEL + 10) {
          textoEvento.innerText = `🧤 ¡La tuvo ${datosPartida.j2}! Impresionante estirada del portero para mandarla a córner.`;
        } else {
          golesJ2++; marcador2.innerText = golesJ2;
          textoEvento.innerText = `⚽ ¡GOOOL de ${datosPartida.j2}! Jugada rápida colectiva que termina rompiendo las redes.`;
        }
      } else {
        textoEvento.innerText = `🛡️ ${datosPartida.j2} sube líneas, pero la línea defensiva de ${datosPartida.j1} se mantiene impecable.`;
      }
    }

  }, 1500);
}