// Compatibilidad del motor de voz entre navegadores
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    // Desactivamos el modo continuo para asegurar compatibilidad total en móviles
    recognition.continuous = false; 
    recognition.interimResults = false;
}

const reactor = document.getElementById('arcReactor');
const statusText = document.getElementById('status-text');
const speechResult = document.getElementById('speech-result');

let jarvisEscuchando = false; 

// Actualización inicial de la interfaz
if (!recognition) {
    statusText.innerText = "ERROR DE SISTEMA";
    speechResult.innerText = "Tu navegador no soporta control por voz (Usa Chrome o Edge).";
} else {
    statusText.innerText = "SISTEMA EN ESPERA";
    speechResult.innerText = "Toca el Reactor Arc para hablar con J.A.R.V.I.S.";
}

// CONTROLADOR DE CLIC / TOQUE TÁCTIL (Compatible con ordenadores y móviles)
reactor.addEventListener('click', () => {
    if (!recognition) return;

    if (!jarvisEscuchando) {
        encenderMicrofono();
    } else {
        apagarMicrofono();
    }
});

function encenderMicrofono() {
    try {
        window.speechSynthesis.cancel(); // Detiene cualquier voz activa antes de escuchar
        recognition.start();
    } catch(e) {
        // Evita errores si ya estaba intentando arrancar
    }
}

function apagarMicrofono() {
    try {
        recognition.stop();
    } catch(e) {}
}

// --- EVENTOS DEL MICRÓFONO ---

recognition.onstart = () => {
    jarvisEscuchando = true;
    reactor.classList.add('active'); // El reactor empieza a brillar y girar rápido
    statusText.innerText = "J.A.R.V.I.S. ESCUCHANDO";
    speechResult.innerText = "Hable ahora, Señor...";
};

recognition.onerror = (event) => {
    console.error("Error de reconocimiento:", event.error);
    apagarMicrofono();
};

recognition.onend = () => {
    jarvisEscuchando = false;
    // Si no está procesando una respuesta de voz, devuelve el reactor a su estado normal
    if (!window.speechSynthesis.speaking) {
        reactor.classList.remove('active');
        statusText.innerText = "SISTEMA EN ESPERA";
        speechResult.innerText = "Toca el Reactor Arc para hablar de nuevo.";
    }
};

recognition.onresult = (event) => {
    const comando = event.results[0][0].transcript.toLowerCase().trim();
    speechResult.innerText = `Escuchado: "${comando}"`;
    
    // Pequeño retardo visual antes de responder
    statusText.innerText = "PROCESANDO...";
    responderComando(comando);
};

// --- PROCESADOR DE COMANDOS INTELIGENTE ---

function responderComando(comando) {
    // 1. Conversación Básica
    if (comando.includes('cómo estás') || comando.includes('estado del sistema')) {
        hablar("Todos los sistemas operativos y estables. Energía del reactor al cien por ciento.");
    } 
    else if (comando.includes('hora')) {
        const ahora = new Date();
        hablar(`Son las ${ahora.getHours()} con ${ahora.getMinutes()}.`);
    }
    // 2. Comandos de Navegación / Búsqueda
    else if (comando.includes('abre google')) {
        hablar("Abriendo el buscador, Señor.");
        redirigir('https://google.com');
    }
    else if (comando.includes('busca') || comando.includes('internet')) {
        let busqueda = comando.replace(/^busca en internet/, '').replace(/^busca/, '').trim();
        if (busqueda) {
            hablar(`Buscando ${busqueda} en la red.`);
            redirigir(`https://www.google.com/search?q=${encodeURIComponent(busqueda)}`);
        } else {
            hablar("¿Qué desea que busque, Señor?");
        }
    }
    else if (comando.includes('bloc') || comando.includes('escribe') || comando.includes('notas')) {
        hablar("Abriendo un nuevo lienzo de texto.");
        redirigir('https://docs.new'); 
    }
    else if (comando.includes('calculadora') || comando.includes('calcula')) {
        hablar("Desplegando la calculadora.");
        redirigir('https://www.google.com/search?q=calculadora'); 
    }
    else if (comando.includes('música') || comando.includes('youtube')) {
        hablar("Conectando con la plataforma multimedia.");
        redirigir('https://youtube.com');
    }
    
    // 3. NUEVOS COMANDOS PARA APPS MÓVILES Y PC (Enlaces dinámicos)
    else if (comando.includes('abre whatsapp')) {
        hablar("Abriendo su servicio de mensajería, Señor.");
        
        // DETECTOR INTELIGENTE DE WHATSAPP
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (esMovil) {
            redirigir('whatsapp://'); // Abre la App nativa en móviles
        } else {
            redirigir('https://web.whatsapp.com'); // Abre WhatsApp Web en ordenadores
        }
    }
    else if (comando.includes('abre facebook')) {
        hablar("Conectando con la red social, Señor.");
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        redirigir(esMovil ? 'fb://' : 'https://facebook.com'); 
    }
    else if (comando.includes('abre instagram')) {
        hablar("Desplegando el feed de Instagram.");
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        redirigir(esMovil ? 'instagram://' : 'https://instagram.com');
    }
    else if (comando.includes('abre twitter') || comando.includes('abre x')) {
        hablar("Abriendo la red de microblogging.");
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        redirigir(esMovil ? 'twitter://' : 'https://x.com');
    }
    else if (comando.includes('abre spotify')) {
        hablar("Iniciando su reproductor de música, Señor.");
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        redirigir(esMovil ? 'spotify://' : 'https://open.spotify.com');
    }
    else if (comando.includes('abre contactos') || comando.includes('agenda')) {
        hablar("Desplegando su agenda de contactos, Señor.");
        
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (esMovil) {
            redirigir('tel:'); // Abre la app de teléfono/contactos nativa en el móvil
        } else {
            // En PC, al no tener agenda telefónica nativa por web, le podemos abrir los contactos de Google
            redirigir('https://contacts.google.com'); 
        }
    }

    // 4. Comando de Apagado Visual
    else if (comando.includes('descansa') || comando.includes('silencio') || comando.includes('adiós')) {
        hablar("Entendido, Señor. Desconectando sistemas principales.");
        reactor.classList.remove('active');
        statusText.innerText = "SISTEMA EN ESPERA";
    }
    // 5. No reconocido
    else {
        hablar("Comando no reconocido en la base de datos, Señor.");
    }
}

// --- FUNCIÓN DE REDIRECCIÓN EN MÓVILES (RENOVADA ANTI-BLOQUEO) ---
function redirigir(url) {
    // Esperamos 2.2 segundos a que Jarvis termine de hablar de forma fluida
    setTimeout(() => {
        // Creamos un elemento de enlace dinámico invisible
        const enlaceFake = document.createElement('a');
        enlaceFake.href = url;
        
        // Si es una URL web normal (HTTP/HTTPS) en PC, la abrimos en pestaña nueva para no pisar a Jarvis.
        // Si es un protocolo de app (whatsapp://) o estamos en móvil, lo abrimos en la misma pantalla.
        const esWebNormal = url.startsWith('http');
        const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (esWebNormal && !esMovil) {
            enlaceFake.target = '_blank'; // Abre pestaña nueva en ordenadores para webs
        } else {
            enlaceFake.target = '_self';  // Abre app o redirige en móviles
        }
        
        // Lo inyectamos temporalmente en el documento, simulamos el clic físico y lo destruimos
        document.body.appendChild(enlaceFake);
        enlaceFake.click();
        document.body.removeChild(enlaceFake);
    }, 2200);
}

// --- SALIDA DE VOZ SINTETIZADA ---
function hablar(texto) {
    // Nos aseguramos de que el reactor brille mientras Jarvis habla
    reactor.classList.add('active');
    statusText.innerText = "J.A.R.V.I.S. HABLANDO";

    const ssu = new SpeechSynthesisUtterance(texto);
    const voces = window.speechSynthesis.getVoices();
    
    // Selector de voz en español (Prioriza voces graves masculinas si existen)
    const vozJarvis = voces.find(voz => voz.lang.includes('es') && (voz.name.toLowerCase().includes('male') || voz.name.toLowerCase().includes('google') || voz.name.toLowerCase().includes('microsoft')));
    
    if (vozJarvis) ssu.voice = vozJarvis;
    
    ssu.lang = 'es-ES';
    ssu.rate = 1.0; 
    ssu.pitch = 0.85; // Voz ligeramente más grave estilo armadura

    ssu.onend = () => {
        // Cuando Jarvis termina de hablar, el reactor vuelve a su estado pasivo de espera
        reactor.classList.remove('active');
        statusText.innerText = "SISTEMA EN ESPERA";
        speechResult.innerText = "Toca el Reactor Arc para hablar de nuevo.";
    };

    window.speechSynthesis.speak(ssu);
}

// Precarga de voces para iOS y Android
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
