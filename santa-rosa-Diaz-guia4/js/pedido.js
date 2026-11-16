// ===== 3. Estado del pedido y utilidades =====
const pedido = []; // cada ítem: { nombre, precio, cantidad }

const lista = document.getElementById('lista-pedido');
const totalTexto = document.getElementById('total');
const mensajeVacio = document.getElementById('pedido-vacio');
const aviso = document.getElementById('aviso');
const tituloPedido = document.getElementById('titulo-pedido');
const btnVaciar = document.getElementById('btn-vaciar');
const cajaSugerencia = document.getElementById('sugerencia-mantequilla');
const btnAgregarMantequilla = document.getElementById('btn-agregar-mantequilla');

function soles(monto) {
  return 'S/ ' + monto.toFixed(2);
}

function calcularTotal() {
  return pedido.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

function anunciar(mensaje) {
  aviso.textContent = mensaje;
}

// ===== 4. Dibujar la lista con el DOM =====
function render() {
  lista.replaceChildren(); // borra los <li> anteriores

  for (const item of pedido) {
    const li = document.createElement('li');

    const texto = document.createElement('span');
    const subtotal = soles(item.precio * item.cantidad);
    texto.textContent = `${item.cantidad} × ${item.nombre} · ${subtotal}`;

    // Contenedor de botones de acción por ítem (+, -, Quitar)
    const acciones = document.createElement('div');
    acciones.className = 'acciones-item';

    // Reto: Botón restar (-)
    const restarBtn = document.createElement('button');
    restarBtn.type = 'button';
    restarBtn.className = 'btn-cantidad btn-restar';
    restarBtn.dataset.nombre = item.nombre;
    restarBtn.textContent = '−';
    restarBtn.setAttribute('aria-label', `Restar un ${item.nombre}`);

    // Reto: Botón sumar (+)
    const sumarBtn = document.createElement('button');
    sumarBtn.type = 'button';
    sumarBtn.className = 'btn-cantidad btn-sumar';
    sumarBtn.dataset.nombre = item.nombre;
    sumarBtn.textContent = '+';
    sumarBtn.setAttribute('aria-label', `Sumar un ${item.nombre}`);

    // Botón quitar producto completo
    const quitarBtn = document.createElement('button');
    quitarBtn.type = 'button';
    quitarBtn.className = 'btn-quitar';
    quitarBtn.dataset.nombre = item.nombre;
    quitarBtn.textContent = 'Quitar';
    quitarBtn.setAttribute('aria-label', `Quitar ${item.nombre}`);

    acciones.append(restarBtn, sumarBtn, quitarBtn);
    li.append(texto, acciones);
    lista.append(li);
  }

  totalTexto.textContent = soles(calcularTotal());
  mensajeVacio.hidden = pedido.length > 0;
  btnVaciar.hidden = pedido.length === 0;

  // Reto: Sugerencia honesta si hay algún pan en el pedido y aún no se añadió mantequilla
  const hayPan = pedido.some((item) => item.nombre.toLowerCase().includes('pan'));
  const yaTieneMantequilla = pedido.some((item) => item.nombre === 'Mantequilla');
  cajaSugerencia.hidden = !(hayPan && !yaTieneMantequilla);
}

// ===== 5. Añadir, modificar cantidad, quitar y vaciar =====
function agregar(nombre, precio) {
  const existente = pedido.find((item) => item.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    pedido.push({ nombre, precio, cantidad: 1 });
  }
  render();
  anunciar(`Se añadió ${nombre}. Total: ${soles(calcularTotal())}.`);
}

function cambiarCantidad(nombre, delta) {
  const posicion = pedido.findIndex((item) => item.nombre === nombre);
  if (posicion === -1) return;

  pedido[posicion].cantidad += delta;

  // Si la cantidad llega a 0, el producto se quita del pedido
  if (pedido[posicion].cantidad <= 0) {
    pedido.splice(posicion, 1);
    render();
    anunciar(`Se quitó ${nombre}. Total: ${soles(calcularTotal())}.`);
    tituloPedido.focus();
  } else {
    const nuevaCantidad = pedido[posicion].cantidad;
    render();
    anunciar(`Cantidad de ${nombre}: ${nuevaCantidad}. Total: ${soles(calcularTotal())}.`);
  }
}

function quitar(nombre) {
  const posicion = pedido.findIndex((item) => item.nombre === nombre);
  if (posicion === -1) return;
  pedido.splice(posicion, 1);
  render();
  anunciar(`Se quitó ${nombre}. Total: ${soles(calcularTotal())}.`);
  tituloPedido.focus(); // el foco no se pierde
}

// Delegación: un solo oyente para todos los botones "Añadir" del catálogo
document.querySelector('.catalogo').addEventListener('click', (evento) => {
  const boton = evento.target.closest('.btn-anadir');
  if (!boton) return;
  const producto = boton.closest('.producto');
  agregar(producto.dataset.nombre, Number(producto.dataset.precio));
});

// Delegación: un solo oyente para "Sumar (+)", "Restar (−)" y "Quitar" en la lista
lista.addEventListener('click', (evento) => {
  const btnQuitar = evento.target.closest('.btn-quitar');
  if (btnQuitar) {
    quitar(btnQuitar.dataset.nombre);
    return;
  }

  const btnSumar = evento.target.closest('.btn-sumar');
  if (btnSumar) {
    cambiarCantidad(btnSumar.dataset.nombre, 1);
    return;
  }

  const btnRestar = evento.target.closest('.btn-restar');
  if (btnRestar) {
    cambiarCantidad(btnRestar.dataset.nombre, -1);
  }
});

// Reto: Vaciar pedido con confirmación para evitar borrados accidentales
btnVaciar.addEventListener('click', () => {
  if (pedido.length === 0) return;
  const confirmado = confirm('¿Estás seguro de que deseas vaciar todo tu pedido?');
  if (!confirmado) return;

  pedido.length = 0;
  render();
  anunciar('Se vació todo el pedido. Total: S/ 0.00.');
  tituloPedido.focus();
});

// Reto: Añadir mantequilla solo si el usuario hace clic explícitamente
btnAgregarMantequilla.addEventListener('click', () => {
  agregar('Mantequilla', 2.50);
});

// Dibujo inicial
render();
