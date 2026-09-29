/* ============================================================
   Dispensa — vista «postular»: entrevista de admisión interactiva.
   Izquierda: formulario por pasos. Derecha: «Así viaja tu solicitud».
   Prefijo de clases: .po-   (estilos en css/v-postular.css)
   Regla: nunca se revela si un correo ya es socio.
   ============================================================ */
(function () {
  const D = window.DEMO;
  const ico = (n, c) => D.ico(n, c);
  const esp = ms => D.fx.espera(ms);
  let limpiezas = [];
  let vivo = 0; // se incrementa al salir: corta animaciones en curso

  const PASOS = [
    { id: 'datos', t: 'Tus datos', ico: 'usuario' },
    { id: 'salud', t: 'Tu salud', ico: 'corazon' },
    { id: 'docs', t: 'Documentos', ico: 'adjunto' },
    { id: 'entrevista', t: 'Entrevista', ico: 'comunicado' },
    { id: 'consent', t: 'Consentimiento', ico: 'escudo' },
    { id: 'revision', t: 'Revisión', ico: 'check' }
  ];
  const MOTIVOS = ['Dolor crónico', 'Insomnio', 'Ansiedad', 'Epilepsia', 'Tratamiento oncológico', 'Fibromialgia', 'Migraña', 'Otro'];
  const DOCS = [
    { id: 'cedF', t: 'Cédula · frente', ico: 'cedula' },
    { id: 'cedR', t: 'Cédula · reverso', ico: 'cedula' },
    { id: 'ant', t: 'Certificado de antecedentes', ico: 'documento' },
    { id: 'rec', t: 'Receta médica', ico: 'receta' }
  ];
  const PREGUNTAS = [
    { id: 'exp', q: '¿Has usado cannabis medicinal antes?', o: ['Nunca', 'Alguna vez', 'Regularmente'] },
    { id: 'forma', q: '¿Cómo prefieres usarlo?', o: ['Flor', 'Aceite', 'Tópico', 'Comestible'] },
    { id: 'entrega', q: '¿Cómo quieres recibir tus pedidos?', o: ['Despacho a domicilio', 'Retiro en el local'] },
    { id: 'supo', q: '¿Cómo supiste de nosotros?', o: ['Mi médico', 'Un amigo', 'Redes sociales', 'Otro'] }
  ];
  const CONSENT = [
    { id: 'c1', t: 'Declaro que mi uso es exclusivamente medicinal.' },
    { id: 'c2', t: 'Autorizo el tratamiento de mis datos de salud según la Ley 21.719, solo para fines del club.' },
    { id: 'c3', t: 'Leí y acepto el reglamento interno de Raíz Austral.' }
  ];
  const ETIQUETA = { nombre: 'Nombre', rut: 'RUT', email: 'Correo', tel: 'Teléfono', comuna: 'Comuna', nac: 'Nacimiento', motivos: 'Motivo', receta: 'Receta', gramos: 'Gramaje' };

  /* ---------- RUT (módulo 11) ---------- */
  function dvRut(num) {
    let s = 0, m = 2;
    for (let i = String(num).length - 1; i >= 0; i--) { s += +String(num)[i] * m; m = m === 7 ? 2 : m + 1; }
    const r = 11 - (s % 11);
    return r === 11 ? '0' : r === 10 ? 'K' : String(r);
  }
  function limpiaRut(v) { return v.replace(/[^0-9kK]/g, '').toUpperCase(); }
  function formatoRut(v) {
    const l = limpiaRut(v); if (l.length < 2) return l;
    const cuerpo = l.slice(0, -1), dv = l.slice(-1);
    return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
  }
  function rutValido(v) {
    const l = limpiaRut(v); if (l.length < 8) return false;
    return dvRut(l.slice(0, -1)) === l.slice(-1);
  }
  const RUT_EJEMPLO = (() => { const n = 16482937; return formatoRut(n + dvRut(n)); })();

  function edad(nac) {
    if (!nac) return null;
    const h = new Date(D.hoy()), n = new Date(nac);
    let e = h.getFullYear() - n.getFullYear();
    if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) e--;
    return e;
  }
  const correoOk = v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);

  /* ---------- miniaturas de ejemplo (dibujos SVG como imagen) ---------- */
  function ejemplo(id) {
    const base = (inner, fondo) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110"><rect width="160" height="110" rx="10" fill="${fondo}"/>${inner}</svg>`);
    if (id === 'cedF') return base('<rect x="10" y="10" width="140" height="16" rx="4" fill="#47917B"/><text x="16" y="22" font-size="9" font-family="sans-serif" fill="#fff" font-weight="700">REPÚBLICA DE CHILE</text><rect x="14" y="34" width="40" height="52" rx="5" fill="#c9b8d8"/><circle cx="34" cy="52" r="10" fill="#8a6fa6"/><path d="M20 84c3-12 25-12 28 0" fill="#8a6fa6"/><rect x="62" y="38" width="70" height="7" rx="3" fill="#8a7a9a"/><rect x="62" y="52" width="54" height="6" rx="3" fill="#b3a7c2"/><rect x="62" y="64" width="62" height="6" rx="3" fill="#b3a7c2"/><rect x="62" y="80" width="40" height="8" rx="3" fill="#F4C542"/>', '#EDE6F3');
    if (id === 'cedR') return base('<rect x="10" y="12" width="140" height="10" rx="3" fill="#b3a7c2"/><g fill="#1F0E33">' + Array.from({ length: 26 }, (_, i) => `<rect x="${14 + i * 5}" y="30" width="${i % 3 ? 2 : 3}" height="26"/>`).join('') + '</g><rect x="12" y="66" width="136" height="8" rx="2" fill="#8a7a9a"/><rect x="12" y="80" width="136" height="8" rx="2" fill="#8a7a9a"/><rect x="12" y="94" width="100" height="8" rx="2" fill="#8a7a9a"/>', '#EDE6F3');
    if (id === 'ant') return base('<rect x="30" y="8" width="100" height="94" rx="6" fill="#fff"/><circle cx="80" cy="26" r="9" fill="none" stroke="#47917B" stroke-width="3"/><rect x="44" y="44" width="72" height="5" rx="2" fill="#8a7a9a"/><rect x="44" y="56" width="60" height="5" rx="2" fill="#b3a7c2"/><rect x="44" y="68" width="66" height="5" rx="2" fill="#b3a7c2"/><text x="44" y="92" font-size="9" font-family="sans-serif" fill="#2F7D62" font-weight="700">SIN ANOTACIONES</text>', '#DCEBE3');
    return base('<rect x="30" y="8" width="100" height="94" rx="6" fill="#fff"/><text x="40" y="30" font-size="16" font-family="serif" fill="#8A3FA0" font-weight="700">Rx</text><rect x="40" y="40" width="80" height="5" rx="2" fill="#8a7a9a"/><rect x="40" y="52" width="64" height="5" rx="2" fill="#b3a7c2"/><rect x="40" y="64" width="70" height="5" rx="2" fill="#b3a7c2"/><path d="M44 88c6 0 8-10 12-10s2 8 6 8 5-6 9-6 3 6 12 5" fill="none" stroke="#1F0E33" stroke-width="2"/><text x="92" y="92" font-size="9" font-family="sans-serif" fill="#FF6B35" font-weight="700">30 g/mes</text>', '#F7F0E3');
  }

  function estadoVacio() {
    return {
      paso: 0, nombre: '', rut: '', email: '', tel: '', comuna: '', nac: '',
      motivos: [], tieneReceta: 'si', recDesde: '', recHasta: '', gramos: 30,
      docs: {}, resp: {}, consent: {}, enviado: false
    };
  }
  let d = estadoVacio();

  /* ============================================================
     PLANTILLAS
     ============================================================ */
  function campo(id, label, tipo, extra) {
    return `<div class="campo po-campo" data-campo="${id}">
      <label for="po-${id}">${label}</label>
      <div class="po-input-env"><input id="po-${id}" name="${id}" type="${tipo}" ${extra || ''}><span class="po-estado" aria-hidden="true"></span></div>
      <p class="po-msg" aria-live="polite"></p></div>`;
  }

  function pasoDatos() {
    return `<h2 class="po-h">Hola, <em>empecemos por ti.</em></h2>
      <p class="po-lead">Solo el comité verá esto. Palabra de CogoMan.</p>
      <div class="po-grid2">
        ${campo('nombre', 'Nombre completo', 'text', 'autocomplete="name" placeholder="Como aparece en tu cédula"')}
        ${campo('rut', 'RUT', 'text', 'inputmode="text" autocomplete="off" placeholder="12.345.678-9" maxlength="12"')}
        ${campo('email', 'Correo', 'email', 'autocomplete="email" placeholder="tucorreo@ejemplo.cl"')}
        ${campo('tel', 'Teléfono', 'tel', 'autocomplete="tel" placeholder="+56 9 1234 5678"')}
        ${campo('comuna', 'Comuna', 'text', 'list="po-comunas" placeholder="Ej: Ñuñoa"')}
        ${campo('nac', 'Fecha de nacimiento', 'date', `max="${D.hoy()}"`)}
      </div>
      <datalist id="po-comunas">${['Providencia', 'Ñuñoa', 'Santiago', 'Las Condes', 'La Florida', 'Maipú', 'Macul', 'Valparaíso', 'Viña del Mar', 'Concón'].map(c => `<option value="${c}">`).join('')}</datalist>`;
  }

  function pasoSalud() {
    return `<h2 class="po-h">Cuéntanos <em>para qué lo necesitas.</em></h2>
      <p class="po-lead">Elige uno o varios. Sin juicios, solo para acompañarte mejor.</p>
      <div class="po-chips" role="group" aria-label="Motivo de uso medicinal">
        ${MOTIVOS.map(m => `<button type="button" class="po-chip" data-motivo="${m}" aria-pressed="false">${m}</button>`).join('')}
      </div>
      <h3 class="po-h3">¿Tienes receta médica?</h3>
      <div class="po-segmento" role="radiogroup" aria-label="¿Tienes receta?">
        <button type="button" role="radio" data-receta="si" aria-checked="true">${ico('check')} Sí, tengo</button>
        <button type="button" role="radio" data-receta="no" aria-checked="false">Aún no</button>
      </div>
      <div class="po-receta-si">
        <div class="po-grid2">
          ${campo('recDesde', 'Vigente desde', 'date')}
          ${campo('recHasta', 'Vigente hasta', 'date')}
        </div>
        <div class="po-gramos">
          <label for="po-gramos">Gramos al mes que indica tu receta</label>
          <div class="po-gramos-fila"><input id="po-gramos" type="range" min="5" max="60" step="5" value="30"><b><span class="po-g-num">30</span> g</b></div>
          <p class="po-mano">ese número será tu cupo mensual, ni más ni menos</p>
        </div>
      </div>
      <div class="po-receta-no" hidden>
        <p class="po-aviso">${ico('receta')} Puedes postular igual. Para canjear necesitas receta vigente; el comité te orienta para conseguirla.</p>
      </div>`;
  }

  function pasoDocs() {
    return `<h2 class="po-h">Tus documentos, <em>en un arrastre.</em></h2>
      <p class="po-lead">Foto o PDF. Arrástralos aquí o tócalos para elegir.</p>
      <div class="po-docs">
        ${DOCS.map(x => `<div class="po-drop" data-doc="${x.id}" tabindex="0" role="button" aria-label="Subir ${x.t}">
          <input type="file" accept="image/*,application/pdf" hidden>
          <div class="po-drop-vacio">${ico(x.ico)}<b>${x.t}</b><small>Arrastra o toca para elegir</small></div>
          <div class="po-drop-lleno"><img alt=""><span class="po-drop-nombre"></span><span class="po-drop-ok">${ico('check')}</span></div>
          <button type="button" class="po-ejemplo">Usar archivo de ejemplo</button>
        </div>`).join('')}
      </div>
      <p class="po-mano po-centro">tus archivos viajan cifrados y solo los ve el comité</p>`;
  }

  function pasoEntrevista() {
    return `<h2 class="po-h">Una mini <em>entrevista.</em></h2>
      <p class="po-lead">Cuatro preguntas. Ninguna respuesta es incorrecta.</p>
      <div class="po-preguntas">
        ${PREGUNTAS.map(p => `<fieldset class="po-pregunta" data-preg="${p.id}"><legend>${p.q}</legend>
          <div class="po-chips">${p.o.map(o => `<button type="button" class="po-chip" data-op="${o}" aria-pressed="false">${o}</button>`).join('')}</div></fieldset>`).join('')}
      </div>`;
  }

  function pasoConsent() {
    return `<h2 class="po-h">Lo importante, <em>en claro.</em></h2>
      <p class="po-lead">Tres sí y seguimos.</p>
      <div class="po-consent">
        ${CONSENT.map(c => `<label class="po-check"><input type="checkbox" data-consent="${c.id}"><span class="po-caja">${ico('check')}</span><span>${c.t}</span></label>`).join('')}
      </div>
      <p class="po-aviso po-aviso-ley">${ico('ley')} Puedes pedir ver, corregir o eliminar tus datos cuando quieras. Nunca se venden ni se comparten.</p>`;
  }

  function pasoRevision() {
    return `<h2 class="po-h">Revisa <em>y envía.</em></h2>
      <p class="po-lead">Si algo no cuadra, tócalo para corregir.</p>
      <div class="po-resumen"></div>
      <div class="po-faltan" hidden></div>
      <button type="button" class="btn btn-arcoiris po-enviar">${ico('correo')} Enviar mi solicitud</button>
      <p class="po-mano po-centro">después de esto, te escribimos al correo</p>`;
  }

  function formulario() {
    const cuerpos = [pasoDatos(), pasoSalud(), pasoDocs(), pasoEntrevista(), pasoConsent(), pasoRevision()];
    return `
    <section class="po-form" aria-label="Solicitud de ingreso">
      <header class="po-cab">
        <a class="po-marca" href="#club">${ico('hoja')}<span><b>Raíz Austral</b><small>Solicitud de ingreso</small></span></a>
        <button type="button" class="btn btn-token btn-sm po-rellenar">${ico('rayo')} Rellenar con datos de ejemplo</button>
      </header>
      <div class="po-prog">
        <div class="po-prog-txt"><span class="po-prog-paso">Paso 1 de 6</span><span class="po-prog-nombre">Tus datos</span><span class="po-mini-exp" title="Datos en tu expediente">${ico('documento')}<b class="po-mini-n">0</b></span></div>
        <div class="progreso"><i style="width:16.6%"></i></div>
        <ol class="po-migas">${PASOS.map((p, i) => `<li><button type="button" data-ir-paso="${i}" aria-label="Ir a ${p.t}">${ico(p.ico)}<span>${p.t}</span></button></li>`).join('')}</ol>
      </div>
      <div class="po-pasos">${cuerpos.map((c, i) => `<div class="po-paso" data-paso="${i}" ${i ? 'hidden' : ''}>${c}</div>`).join('')}</div>
      <nav class="po-nav">
        <button type="button" class="btn btn-fantasma po-atras">${ico('atras')} Atrás</button>
        <button type="button" class="btn btn-primario po-sig">Siguiente ${ico('flecha')}</button>
      </nav>
      <div class="po-listo" hidden>
        <div class="po-listo-ico">${ico('correo')}</div>
        <h2 class="po-h">¡Solicitud <em>enviada!</em></h2>
        <p class="po-lead">Si todo está en orden, te llegará un correo de bienvenida. Mira cómo viaja, en vivo.</p>
        <p class="po-mano">(por privacidad, aquí nunca te diremos nada sobre otras cuentas)</p>
      </div>
    </section>`;
  }

  function viaje() {
    return `
    <aside class="po-viaje" data-etapa="llenando" aria-label="Así viaja tu solicitud">
      <p class="po-v-eyebrow">En vivo</p>
      <h2 class="po-v-titulo">Así viaja <em>tu solicitud</em></h2>

      <div class="po-v-nodo po-exp">
        <div class="po-exp-carpeta">
          <div class="po-exp-cab">${ico('documento')}<b>Expediente</b><span class="po-exp-folio mono">S-0419</span></div>
          <ul class="po-exp-lista"><li class="po-exp-vacio">Llena el formulario y mira cómo cae cada dato aquí ↓</li></ul>
          <p class="po-exp-res"></p>
          <div class="po-exp-adj" aria-label="Adjuntos"></div>
        </div>
      </div>

      <div class="po-v-ruta r1"><i></i></div>

      <div class="po-v-nodo po-comite">
        <div class="po-v-cab">${ico('socios')}<b>Panel del comité</b><span class="po-v-estado">esperando…</span></div>
        <div class="po-comite-caras">
          ${['MP', 'JR', 'AV'].map(x => `<span class="po-cara"><i>${x}</i><em>${ico('check')}</em></span>`).join('')}
        </div>
        <div class="po-sello" aria-hidden="true"><span>APROBADA</span></div>
      </div>

      <div class="po-v-ruta r2"><i></i></div>

      <div class="po-v-fila">
        <div class="po-v-nodo po-correo">
          <div class="po-v-cab">${ico('correo')}<b>Tu correo</b><span class="po-badge">1</span></div>
          <div class="po-sobre"><svg viewBox="0 0 80 54" aria-hidden="true"><rect x="2" y="2" width="76" height="50" rx="6"/><path class="po-solapa" d="M4 6l36 26 36-26"/></svg><span>¡Bienvenido/a!</span></div>
        </div>
        <div class="po-v-nodo po-billetera">
          <div class="po-v-cab">${ico('billetera')}<b>Tu billetera</b></div>
          <div class="po-bill-saldo"><span class="moneda">T</span><b class="po-bill-num">0</b><small>tokens</small></div>
          <span class="chip aviso po-mem-chip">Membresía pendiente de pago</span>
        </div>
      </div>

      <div class="po-pago">
        <button type="button" class="btn btn-arcoiris btn-bloque po-pagar">${ico('membresia')} Pagar membresía $20.000</button>
        <div class="po-pagado" hidden>
          <p class="po-pagado-t">Tu año empieza hoy</p>
          <p class="po-pagado-f">vence el <b class="po-vence"></b></p>
          <button type="button" class="btn btn-primario btn-bloque po-entrar">${ico('telefono')} Entrar a la app</button>
        </div>
      </div>
      <p class="po-v-nota po-mano">esperando tu solicitud… sin apuro</p>
    </aside>`;
  }

  /* ============================================================
     LÓGICA
     ============================================================ */
  function montar(raiz) {
    const $ = s => raiz.querySelector(s), $$ = s => [...raiz.querySelectorAll(s)];
    const pasos = $$('.po-paso');
    const lista = $('.po-exp-lista'), adj = $('.po-exp-adj');
    const panel = $('.po-viaje');
    const enExp = new Set();
    const movil = () => matchMedia('(max-width: 960px)').matches;

    /* ----- navegación entre pasos ----- */
    function irPaso(n, dir) {
      n = Math.max(0, Math.min(PASOS.length - 1, n));
      if (n === d.paso && !dir) return;
      const ant = d.paso; d.paso = n;
      pasos.forEach((p, i) => {
        p.hidden = i !== n;
        p.classList.remove('po-entra-der', 'po-entra-izq');
      });
      void pasos[n].offsetWidth;
      pasos[n].classList.add(n >= ant ? 'po-entra-der' : 'po-entra-izq');
      $('.po-prog-paso').textContent = `Paso ${n + 1} de ${PASOS.length}`;
      $('.po-prog-nombre').textContent = PASOS[n].t;
      $('.po-prog .progreso > i').style.width = ((n + 1) / PASOS.length * 100) + '%';
      $$('.po-migas li').forEach((li, i) => { li.classList.toggle('actual', i === n); li.classList.toggle('hecho', i < n); });
      $('.po-atras').disabled = n === 0;
      $('.po-sig').hidden = n === PASOS.length - 1;
      if (n === PASOS.length - 1) resumen();
      const f = $('.po-form');
      if (f.getBoundingClientRect().top < 0) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('.po-atras').addEventListener('click', () => irPaso(d.paso - 1));
    $('.po-sig').addEventListener('click', () => irPaso(d.paso + 1));
    $$('[data-ir-paso]').forEach(b => b.addEventListener('click', () => irPaso(+b.dataset.irPaso)));

    /* ----- tarjetita que vuela al expediente ----- */
    function alExpediente(clave, texto, desde) {
      const nuevo = !enExp.has(clave);
      enExp.add(clave);
      let li = lista.querySelector(`[data-k="${clave}"]`);
      const vacio = lista.querySelector('.po-exp-vacio'); if (vacio) vacio.remove();
      if (!li) { li = document.createElement('li'); li.dataset.k = clave; lista.appendChild(li); }
      li.innerHTML = `${ico('check')}<span>${ETIQUETA[clave] || clave}</span><b></b>`;
      li.querySelector('b').textContent = texto;
      lista.scrollTop = lista.scrollHeight;
      $('.po-mini-n').textContent = enExp.size;
      if (nuevo) { $('.po-mini-exp').classList.remove('pulso'); void $('.po-mini-exp').offsetWidth; $('.po-mini-exp').classList.add('pulso'); }
      if (D.fx.reducido || movil() || !desde) { li.classList.add('po-cae'); return; }
      const a = desde.getBoundingClientRect(), b = li.getBoundingClientRect();
      const t = document.createElement('div');
      t.className = 'po-vuela'; t.textContent = `${ETIQUETA[clave] || clave}: ${texto}`;
      t.style.left = a.left + 'px'; t.style.top = a.top + 'px';
      document.body.appendChild(t);
      li.style.opacity = 0;
      const dx = b.left - a.left, dy = b.top - a.top;
      t.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * .5}px, ${dy * .5 - 60}px) scale(.9) rotate(-4deg)`, opacity: 1, offset: .5 },
        { transform: `translate(${dx}px, ${dy}px) scale(.7)`, opacity: .3 }
      ], { duration: 800, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = () => { t.remove(); li.style.opacity = ''; li.classList.remove('po-cae'); void li.offsetWidth; li.classList.add('po-cae'); };
    }

    /* ----- campos de texto ----- */
    function validar(id) {
      const env = $(`[data-campo="${id}"]`); if (!env) return true;
      const v = d[id] || ''; let ok = null, msg = '';
      if (id === 'rut' && v) { ok = rutValido(v); msg = ok ? 'Dígito verificador correcto' : (limpiaRut(v).length >= 8 ? 'El dígito verificador no calza' : 'Sigue escribiendo…'); if (!ok && limpiaRut(v).length < 8) ok = null; }
      else if (id === 'email' && v) { ok = correoOk(v); msg = ok ? '' : 'Revisa el formato del correo'; }
      else if (id === 'nac' && v) { const e = edad(v); ok = e >= 18; msg = ok ? `${e} años · mayor de edad` : 'Debes ser mayor de 18 años'; }
      else if (id === 'nombre' && v) { ok = v.trim().split(/\s+/).length >= 2; msg = ok ? '' : 'Nombre y apellido, porfa'; }
      else if (v) ok = true;
      env.classList.toggle('ok', ok === true); env.classList.toggle('mal', ok === false);
      env.querySelector('.po-estado').innerHTML = ok === true ? ico('check') : ok === false ? ico('x') : '';
      env.querySelector('.po-msg').textContent = msg;
      return ok === true;
    }
    function textoExp(id) {
      if (id === 'nac') return `${edad(d.nac)} años`;
      if (id === 'recDesde' || id === 'recHasta') return '';
      return d[id];
    }
    ['nombre', 'rut', 'email', 'tel', 'comuna', 'nac', 'recDesde', 'recHasta'].forEach(id => {
      const inp = $('#po-' + id); if (!inp) return;
      inp.addEventListener('input', () => {
        if (id === 'rut') { const pos = inp.value.length; inp.value = formatoRut(inp.value); if (pos) inp.setSelectionRange(inp.value.length, inp.value.length); }
        d[id] = inp.value; validar(id);
      });
      inp.addEventListener('change', () => {
        d[id] = inp.value;
        if (id.startsWith('rec')) { if (d.recDesde && d.recHasta) alExpediente('receta', `${D.fmt.fechaCorta(d.recDesde)} → ${D.fmt.fechaCorta(d.recHasta)}`, inp); return; }
        if (validar(id)) alExpediente(id, textoExp(id), inp);
      });
    });

    /* ----- salud ----- */
    $$('[data-motivo]').forEach(b => b.addEventListener('click', () => {
      const m = b.dataset.motivo, on = !d.motivos.includes(m);
      d.motivos = on ? d.motivos.concat(m) : d.motivos.filter(x => x !== m);
      b.setAttribute('aria-pressed', on);
      if (d.motivos.length) alExpediente('motivos', d.motivos.join(', '), b);
    }));
    $$('[data-receta]').forEach(b => b.addEventListener('click', () => {
      d.tieneReceta = b.dataset.receta;
      $$('[data-receta]').forEach(x => x.setAttribute('aria-checked', x === b));
      $('.po-receta-si').hidden = d.tieneReceta !== 'si';
      $('.po-receta-no').hidden = d.tieneReceta === 'si';
      if (d.tieneReceta === 'no') alExpediente('receta', 'La subirá después', b);
    }));
    const rango = $('#po-gramos');
    rango.addEventListener('input', () => { d.gramos = +rango.value; $('.po-g-num').textContent = d.gramos; rango.style.setProperty('--p', ((d.gramos - 5) / 55 * 100) + '%'); });
    rango.addEventListener('change', () => alExpediente('gramos', `${d.gramos} g/mes`, rango));
    rango.style.setProperty('--p', '45.45%');

    /* ----- documentos ----- */
    function ponerDoc(zona, src, nombre, esPdf) {
      const id = zona.dataset.doc;
      d.docs[id] = { nombre };
      const img = zona.querySelector('.po-drop-lleno img');
      if (esPdf) { img.removeAttribute('src'); zona.classList.add('pdf'); } else { img.src = src; zona.classList.remove('pdf'); }
      zona.querySelector('.po-drop-nombre').textContent = nombre;
      zona.classList.add('lleno');
      // miniatura que vuela y se apila en el expediente
      const mini = document.createElement('span');
      mini.className = 'po-adj-mini';
      mini.style.setProperty('--r', ((Object.keys(d.docs).length % 2 ? -1 : 1) * (3 + Object.keys(d.docs).length * 2)) + 'deg');
      mini.innerHTML = esPdf ? `${ico('documento')}<small>PDF</small>` : `<img alt="" src="${src}">`;
      mini.title = DOCS.find(x => x.id === id).t;
      const previo = adj.querySelector(`[data-doc="${id}"]`); if (previo) previo.remove();
      mini.dataset.doc = id; adj.appendChild(mini);
      if (!D.fx.reducido && !movil()) {
        const a = zona.getBoundingClientRect(), b = mini.getBoundingClientRect();
        mini.animate([
          { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(1.8) rotate(0)`, opacity: .9 },
          { transform: `translate(0,0) scale(1) rotate(var(--r))`, opacity: 1 }
        ], { duration: 850, easing: 'cubic-bezier(.34,1.3,.64,1)' });
      }
      $('.po-mini-n').textContent = enExp.size + Object.keys(d.docs).length;
    }
    $$('.po-drop').forEach(z => {
      const inp = z.querySelector('input');
      const leer = f => {
        if (!f) return;
        const esPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
        if (esPdf) { ponerDoc(z, '', f.name, true); return; }
        const r = new FileReader(); r.onload = () => ponerDoc(z, r.result, f.name, false); r.readAsDataURL(f);
      };
      z.addEventListener('click', e => { if (!e.target.closest('.po-ejemplo')) inp.click(); });
      z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
      inp.addEventListener('change', () => leer(inp.files[0]));
      z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('sobre'); });
      z.addEventListener('dragleave', () => z.classList.remove('sobre'));
      z.addEventListener('drop', e => { e.preventDefault(); z.classList.remove('sobre'); leer(e.dataTransfer.files[0]); });
      z.querySelector('.po-ejemplo').addEventListener('click', e => { e.stopPropagation(); ponerDoc(z, ejemplo(z.dataset.doc), 'ejemplo-' + z.dataset.doc.toLowerCase() + '.jpg', false); });
    });

    /* ----- entrevista ----- */
    $$('.po-pregunta').forEach(fs => fs.querySelectorAll('[data-op]').forEach(b => b.addEventListener('click', () => {
      d.resp[fs.dataset.preg] = b.dataset.op;
      fs.querySelectorAll('[data-op]').forEach(x => x.setAttribute('aria-pressed', x === b));
      fs.classList.add('respondida');
      ETIQUETA['p_' + fs.dataset.preg] = fs.querySelector('legend').textContent.replace(/^¿|\?$/g, '').split(' ').slice(0, 3).join(' ') + '…';
      alExpediente('p_' + fs.dataset.preg, b.dataset.op, b);
    })));

    /* ----- consentimiento ----- */
    $$('[data-consent]').forEach(c => c.addEventListener('change', () => {
      d.consent[c.dataset.consent] = c.checked;
      const n = CONSENT.filter(x => d.consent[x.id]).length;
      if (n) alExpediente('consent', `${n} de 3 aceptados`, c.closest('.po-check'));
    }));
    ETIQUETA.consent = 'Consentimientos';

    /* ----- revisión ----- */
    function faltantes() {
      const f = [];
      if (!(d.nombre && d.nombre.trim().split(/\s+/).length >= 2)) f.push(['Nombre completo', 0]);
      if (!rutValido(d.rut || '')) f.push(['RUT válido', 0]);
      if (!correoOk(d.email || '')) f.push(['Correo', 0]);
      if (!(edad(d.nac) >= 18)) f.push(['Mayor de edad', 0]);
      if (!d.motivos.length) f.push(['Motivo de uso', 1]);
      if (!d.docs.cedF || !d.docs.cedR) f.push(['Cédula por ambos lados', 2]);
      if (CONSENT.some(x => !d.consent[x.id])) f.push(['Los tres consentimientos', 4]);
      return f;
    }
    function resumen() {
      const filas = [
        ['Tus datos', 0, [d.nombre, d.rut, d.email, d.tel, d.comuna, d.nac ? edad(d.nac) + ' años' : ''].filter(Boolean).join(' · ') || '—'],
        ['Tu salud', 1, [d.motivos.join(', '), d.tieneReceta === 'si' ? `receta ${d.gramos} g/mes` : 'receta pendiente'].filter(Boolean).join(' · ')],
        ['Documentos', 2, `${Object.keys(d.docs).length} de 4 adjuntos`],
        ['Entrevista', 3, `${Object.keys(d.resp).length} de 4 respuestas`],
        ['Consentimiento', 4, `${CONSENT.filter(x => d.consent[x.id]).length} de 3 aceptados`]
      ];
      const r = $('.po-resumen');
      r.innerHTML = filas.map(([t, p, v]) => `<button type="button" class="po-res-fila" data-ir-paso="${p}"><span class="po-res-ico">${ico(PASOS[p].ico)}</span><span><b>${t}</b><small></small></span>${ico('flecha')}</button>`).join('');
      r.querySelectorAll('small').forEach((s, i) => { s.textContent = filas[i][2]; });
      r.querySelectorAll('[data-ir-paso]').forEach(b => b.addEventListener('click', () => irPaso(+b.dataset.irPaso)));
      const f = faltantes(), box = $('.po-faltan');
      box.hidden = !f.length;
      box.innerHTML = f.length ? `<b>${ico('reloj')} Falta poquito:</b> ${f.map(([t, p]) => `<button type="button" data-ir-paso="${p}">${t}</button>`).join('')}` : '';
      box.querySelectorAll('[data-ir-paso]').forEach(b => b.addEventListener('click', () => irPaso(+b.dataset.irPaso)));
      $('.po-enviar').disabled = f.length > 0;
    }

    /* ----- rellenar con ejemplo (para la presentación) ----- */
    let rellenando = false;
    $('.po-rellenar').addEventListener('click', async () => {
      if (rellenando || d.enviado) return; rellenando = true;
      const yo = vivo, sigue = () => yo === vivo;
      const btn = $('.po-rellenar'); btn.disabled = true;
      const tip = async (id, txt) => {
        const inp = $('#po-' + id); if (!sigue()) return;
        inp.focus({ preventScroll: true });
        if (inp.type === 'date') { inp.value = txt; inp.dispatchEvent(new Event('input', { bubbles: true })); await esp(250); }
        else await D.fx.tipear(inp, txt, 26);
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        await esp(260);
      };
      irPaso(0, 1); await esp(300);
      await tip('nombre', 'Martina Lagos Pizarro');
      await tip('rut', RUT_EJEMPLO.replace(/\./g, '').replace('-', ''));
      await tip('email', 'martina.lagos@correo.cl');
      await tip('tel', '+56 9 8765 4321');
      await tip('comuna', 'Ñuñoa');
      await tip('nac', '1991-04-17');
      if (!sigue()) return;
      irPaso(1); await esp(500);
      for (const m of ['Dolor crónico', 'Insomnio']) { $(`[data-motivo="${m}"]`).click(); await esp(350); }
      await tip('recDesde', D.masDias(D.hoy(), -20));
      await tip('recHasta', D.masDias(D.hoy(), 160));
      for (const g of [20, 25, 30]) { rango.value = g; rango.dispatchEvent(new Event('input')); await esp(120); }
      rango.dispatchEvent(new Event('change')); await esp(450);
      if (!sigue()) return;
      irPaso(2); await esp(500);
      for (const z of $$('.po-drop')) { if (!sigue()) return; z.querySelector('.po-ejemplo').click(); await esp(520); }
      irPaso(3); await esp(450);
      const elige = { exp: 'Alguna vez', forma: 'Aceite', entrega: 'Despacho a domicilio', supo: 'Mi médico' };
      for (const [k, v] of Object.entries(elige)) { if (!sigue()) return; $(`[data-preg="${k}"] [data-op="${v}"]`).click(); await esp(380); }
      irPaso(4); await esp(450);
      for (const c of $$('[data-consent]')) { if (!sigue()) return; c.checked = true; c.dispatchEvent(new Event('change')); await esp(330); }
      irPaso(5);
      btn.disabled = false; rellenando = false;
      D.fx.toast('Formulario completo', 'Listo para enviar al comité.', '✎');
    });

    /* ----- envío y viaje animado ----- */
    function etapa(e) { panel.dataset.etapa = e; }
    $('.po-enviar').addEventListener('click', async () => {
      if (faltantes().length || d.enviado) return;
      d.enviado = true;
      const yo = vivo, sigue = () => yo === vivo;
      const n = D.state.solicitudes.length;
      const folio = 'S-0' + (419 + Math.max(0, n - 3));
      const meses = d.recDesde && d.recHasta ? Math.max(1, Math.round(D.diasEntre(d.recDesde, d.recHasta) / 30)) : 0;
      const sol = {
        id: folio, nombre: d.nombre.trim(), edad: edad(d.nac), comuna: d.comuna || '—',
        motivo: d.motivos.join(', ') || 'Sin indicar', adjuntos: Object.keys(d.docs).length, hace: 'ahora',
        receta: d.tieneReceta === 'si' ? `${meses || '—'} meses · ${d.gramos} g/mes` : 'Falta receta',
        incompleta: d.tieneReceta !== 'si' || Object.keys(d.docs).length < 4,
        email: d.email, tel: d.tel, rut: d.rut, entrevista: Object.assign({}, d.resp)
      };
      $('.po-exp-folio').textContent = folio;
      $('.po-exp-res').textContent = `${enExp.size} datos · ${Object.keys(d.docs).length} adjuntos · sellado`;
      D.state.solicitudes.unshift(sol);
      D.evento('solicitud', `Nueva postulación de ${sol.nombre}`);

      // el formulario da paso al estado «enviado»
      $('.po-pasos').hidden = true; $('.po-nav').hidden = true; $('.po-prog').hidden = true; $('.po-rellenar').hidden = true;
      $('.po-listo').hidden = false;
      raiz.classList.add('enviado');
      if (movil()) { await esp(900); if (!sigue()) return; panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); await esp(600); }
      else panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      const nota = $('.po-v-nota'); const decir = t => { nota.textContent = t; };
      etapa('enviado'); decir('cerrando el expediente…'); await esp(1100); if (!sigue()) return;
      etapa('viaja1'); decir('rumbo al comité…'); await esp(1400); if (!sigue()) return;
      etapa('comite'); decir('el comité está leyendo con calma'); $('.po-comite .po-v-estado').textContent = 'revisando';
      for (const c of $$('.po-cara')) { await esp(650); if (!sigue()) return; c.classList.add('ok'); }
      await esp(400); if (!sigue()) return;
      etapa('aprobado'); $('.po-comite .po-v-estado').textContent = 'aprobada';
      sol.estado = 'aprobada';
      D.evento('aprobacion', `Comité aprobó a ${sol.nombre} · cuenta creada`);
      decir('¡aprobada! ahora va la bienvenida');
      const s = $('.po-sello').getBoundingClientRect(); D.fx.confeti(s.left + s.width / 2, s.top + s.height / 2, 40);
      await esp(1300); if (!sigue()) return;
      etapa('viaja2'); await esp(1300); if (!sigue()) return;
      etapa('correo'); decir('te llegó un correo ✉');
      D.notificar({ titulo: `¡Bienvenido/a a ${D.state.dispensario.nombre}!`, txt: 'Tu solicitud fue aprobada. Paga tu membresía anual para activar tu cuenta.', tipo: 'bienvenida' });
      D.fx.toast('Correo de bienvenida enviado', d.email, '✉');
      await esp(1300); if (!sigue()) return;
      etapa('billetera'); decir('tu billetera ya existe. falta un pasito');
    });

    $('.po-pagar').addEventListener('click', async () => {
      const b = $('.po-pagar'); b.disabled = true; b.innerHTML = `<span class="po-girando">${ico('actualizar')}</span> Pagando con Webpay…`;
      await esp(1300);
      const vence = D.masDias(D.hoy(), 365);
      b.hidden = true;
      $('.po-vence').textContent = D.fmt.fecha(vence);
      $('.po-pagado').hidden = false;
      const chip = $('.po-mem-chip'); chip.className = 'chip ok po-mem-chip'; chip.textContent = 'Membresía activa';
      etapa('pagado'); $('.po-v-nota').textContent = 'bienvenida a la comunidad ♡';
      D.evento('pago', `${d.nombre.trim().split(' ')[0]} pagó su membresía · $20.000 por Webpay`);
      const r = $('.po-pagado').getBoundingClientRect();
      D.fx.confeti(r.left + r.width / 2, r.top, 110);
    });
    $('.po-entrar').addEventListener('click', () => D.ir('socio'));

    irPaso(0, 1);
  }

  D.views.postular = {
    titulo: 'Postular a Raíz Austral',
    render(el) {
      vivo++; limpiezas = []; d = estadoVacio();
      el.innerHTML = `<div class="po"><div class="po-fondo" aria-hidden="true"></div><div class="po-marco">${formulario()}${viaje()}</div></div>`;
      montar(el.querySelector('.po'));
    },
    salir() { vivo++; limpiezas.forEach(f => { try { f(); } catch (e) { } }); limpiezas = []; document.querySelectorAll('.po-vuela').forEach(x => x.remove()); }
  };
})();
