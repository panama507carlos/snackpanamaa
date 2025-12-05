/* ---------------------------
  Script principal (JS)
  - productos ampliados
  - carrito funcional con localStorage
  - IA demo integrado (Teachable Machine)
  - chatbot para escribir descripción y obtener recomendaciones
  - menú hamburger, theme toggle, UI helpers
----------------------------*/

/* ---------- DOM refs ---------- */
const productGrid = document.getElementById('product-grid');
const filterEl = document.getElementById('filter');
const searchEl = document.getElementById('search');
const recommendBtn = document.getElementById('recommend-btn');
const recommendGlobalBtn = document.getElementById('recommend-global');

const cartToggle = document.getElementById('cart-toggle');
const cartAside = document.getElementById('cart');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');

const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');
const themeToggle = document.getElementById('themeToggle');
const yearSpan = document.getElementById('year');

const btnIniciarIA = document.getElementById('btnIniciarIA');
const btnStopIA = document.getElementById('btnStopIA');
const btnDetectNow = document.getElementById('btnDetectNow');
const btnUsePrediction = document.getElementById('btnUsePrediction');

const webcamContainer = document.getElementById('webcam-container');
const labelContainerEl = document.getElementById('label-container');

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

/* set year */
yearSpan.textContent = new Date().getFullYear();

/* ---------- PRODUCTS ---------- */
const PRODUCTS = [
  { id:1, name:"Galleta Avena & Miel", tag:"avena", price:3.75, img:"https://i.postimg.cc/GhjbZkH4/unnamed-(1).jpg", desc:"Clásica, saludable y deliciosa."},
  { id:2, name:"Galleta Almendra Deluxe", tag:"almendra", price:4.50, img:"https://i.postimg.cc/9MShYp8b/licensed-image-(1).jpg", desc:"Almendras tostadas, textura premium."},
  { id:3, name:"Doble Chocolate", tag:"chocolate", price:5.00, img:"https://i.postimg.cc/q7qBczBk/Gemini-Generated-Image-9cfu0k9cfu0k9cfu.png", desc:"Intenso sabor a chocolate."},
  { id:4, name:"Chispas Crocantes", tag:"chispas", price:4.25, img:"https://i.postimg.cc/qMJP6WvT/unnamed-(2).jpg", desc:"Chispas generosas, textura crocante."},
  { id:5, name:"Limón Premium", tag:"almendra", price:4.00, img:"https://i.postimg.cc/hvP2hWb6/unnamed-(3).jpg", desc:"Toque cítrico y textura suave."},
  { id:6, name:"Vegana Avena", tag:"vegan", price:3.95, img:"https://i.postimg.cc/GhjbZkH4/unnamed-(1).jpg", desc:"Sin productos animales."},
  { id:7, name:"Mini Choco", tag:"chocolate", price:2.75, img:"https://i.postimg.cc/kgQyCMZc/unnamed-(8).jpg", desc:"Formato snack, ideal para llevar."},
  { id:8, name:"Galleta Rebanada", tag:"almendra", price:3.50, img:"https://i.postimg.cc/8Phypbff/unnamed-(9).jpg", desc:"Clásica presentación."}
];

function renderProducts(list = PRODUCTS){
  productGrid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p class="small">${p.desc}</p>
      <div class="product-meta">
        <strong>$${p.price.toFixed(2)}</strong>
        <div>
          <button class="btn small add-btn" data-id="${p.id}">Añadir</button>
          <button class="btn small outline info-btn" data-id="${p.id}">Detalles</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
  document.querySelectorAll('.add-btn').forEach(b=> b.addEventListener('click', e=> addToCart(Number(e.currentTarget.dataset.id))));
  document.querySelectorAll('.info-btn').forEach(b=> b.addEventListener('click', e=> showDetails(Number(e.currentTarget.dataset.id))));
}

/* Filter & Search */
function applyFilters(){
  const q = (searchEl?.value || '').toLowerCase();
  const tag = filterEl?.value || 'all';
  let filtered = PRODUCTS.filter(p => (tag === 'all' || p.tag === tag));
  if(q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  renderProducts(filtered);
}

searchEl?.addEventListener('input', applyFilters);
filterEl?.addEventListener('change', applyFilters);
recommendBtn?.addEventListener('click', ()=> {
  if(lastPrediction && lastPrediction.className) applyPredictionFilter(lastPrediction.className);
  else { filterEl.value='chocolate'; applyFilters(); showToast('Filtrando por Chocolate (demo)'); }
});
recommendGlobalBtn?.addEventListener('click', ()=> { document.getElementById('productos').scrollIntoView({behavior:'smooth'}); setTimeout(()=> recommendBtn.click(), 300); });

/* ---------- CART (localStorage) ---------- */
let cart = JSON.parse(localStorage.getItem('snack_cart') || '[]');

function saveCart(){ localStorage.setItem('snack_cart', JSON.stringify(cart)); updateCartUI(); }

function addToCart(id){
  const p = PRODUCTS.find(x=> x.id === id);
  cart.push({...p});
  saveCart();
  showToast(`${p.name} añadido al carrito`);
}

function removeFromCart(index){
  cart.splice(index,1);
  saveCart();
}

function clearCart(){
  cart = [];
  saveCart();
}

function updateCartUI(){
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p style="opacity:.8">Carrito vacío</p>';
  } else {
    cart.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;">
          <img src="${item.img}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover">
          <div>
            <div style="font-weight:700">${item.name}</div>
            <div style="font-size:13px;color:#8b776e">$${item.price.toFixed(2)}</div>
          </div>
        </div>
        <div>
          <button class="btn outline remove-btn" data-i="${i}">Eliminar</button>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });
    document.querySelectorAll('.remove-btn').forEach(b => b.addEventListener('click', e=>{
      removeFromCart(Number(e.currentTarget.dataset.i));
    }));
  }
  const total = cart.reduce((s, it) => s + it.price, 0);
  cartTotalEl.textContent = total.toFixed(2);
  cartCountEl.textContent = cart.length;
}

cartToggle?.addEventListener('click', ()=> { cartAside.classList.add('open'); updateCartUI(); });
cartClose?.addEventListener('click', ()=> cartAside.classList.remove('open'));

clearCartBtn?.addEventListener('click', ()=> { clearCart(); showToast('Carrito vaciado'); });
document.getElementById('clear-cart')?.addEventListener('click', ()=> { clearCart(); showToast('Carrito vaciado'); });
checkoutBtn?.addEventListener('click', ()=> {
  if(cart.length === 0){ showToast('El carrito está vacío'); return; }
  showToast('Simulación de pago iniciada (demo)');
  setTimeout(()=> { clearCart(); showToast('Compra completada (demo)'); cartAside.classList.remove('open'); }, 1200);
});

renderProducts();
updateCartUI();

/* ---------- UI helpers ---------- */
function showToast(msg, timeout=1600){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(()=> t.style.display = 'none', timeout);
}

/* Menú + Tema */
menuToggle?.addEventListener('click', ()=> nav.classList.toggle('open'));
themeToggle?.addEventListener('click', ()=> document.documentElement.classList.toggle('dark'));
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', ()=> nav.classList.remove('open')));

/* Detalles de producto */
function showDetails(id){
  const p = PRODUCTS.find(x=> x.id === id);
  if(!p) return;
  alert(`${p.name}\n\n${p.desc}\n\nPrecio: $${p.price.toFixed(2)}`);
}

/* Contacto */
document.getElementById('contact-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  showToast('Mensaje enviado (demo)');
  document.getElementById('c-name').value = '';
  document.getElementById('c-email').value = '';
  document.getElementById('c-msg').value = '';
});

document.getElementById('contact-clear')?.addEventListener('click', ()=>{
  document.getElementById('c-name').value = '';
  document.getElementById('c-email').value = '';
  document.getElementById('c-msg').value = '';
  showToast('Formulario limpiado');
});

/* ---------- IA: Teachable Machine + Chatbot ---------- */
let tmModel, webcamTM, maxPredictions;
let lastPrediction = null;
let tmLoopActive = false;

async function ensureTMLibs(){
  if(window.tmImage) return;
  await new Promise((res, rej)=>{
    const s1 = document.createElement('script');
    s1.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";
    s1.onload = ()=>{
      const s2 = document.createElement('script');
      s2.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js";
      s2.onload = res;
      s2.onerror = rej;
      document.body.appendChild(s2);
    };
    s1.onerror = rej;
    document.body.appendChild(s1);
  });
}

async function initIA(){
  try{
    await ensureTMLibs();
    const URL = "https://teachablemachine.withgoogle.com/models/lb-7MkwYG/";
    tmModel = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = tmModel.getTotalClasses();

    webcamTM = new tmImage.Webcam(320, 320, true);
    await webcamTM.setup();
    await webcamTM.play();
    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(webcamTM.canvas);

    labelContainerEl.innerHTML = '';
    for(let i=0;i<maxPredictions;i++) labelContainerEl.appendChild(document.createElement('div'));

    tmLoopActive = true;
    window.requestAnimationFrame(loopPredict);
    showToast('IA iniciada');
  }catch(err){
    console.error(err);
    showToast('Error iniciando IA');
  }
}

async function loopPredict(){
  if(!tmLoopActive) return;
  if(!webcamTM) return;
  webcamTM.update();
  const preds = await tmModel.predict(webcamTM.canvas);
  let best = {className:null, probability:0};
  preds.forEach((p, i) => {
    if(labelContainerEl.childNodes[i]) labelContainerEl.childNodes[i].innerText = `${p.className}: ${p.probability.toFixed(2)}`;
    if(p.probability > best.probability) best = {className:p.className, probability:p.probability};
  });
  lastPrediction = best;
  window.requestAnimationFrame(loopPredict);
}

function stopIA(){
  tmLoopActive = false;
  try{
    const tracks = webcamTM?.webcamElement?.srcObject?.getTracks?.() || [];
    tracks.forEach(t => t.stop());
  } catch(e){}
  webcamContainer.innerHTML = '';
  labelContainerEl.innerHTML = '';
  showToast('IA detenida y cámara apagada');
}

btnIniciarIA?.addEventListener('click', async ()=>{
  btnIniciarIA.disabled = true;
  btnIniciarIA.textContent = 'Iniciando...';
  await initIA();
  btnIniciarIA.textContent = 'IA activa';
  btnIniciarIA.disabled = false;
});

btnStopIA?.addEventListener('click', ()=>{
  stopIA();
  btnIniciarIA.textContent = 'Iniciar IA';
});

btnDetectNow?.addEventListener('click', async ()=>{
  if(!tmModel || !webcamTM){ showToast('Primero inicia la IA'); return; }
  const preds = await tmModel.predict(webcamTM.canvas);
  let best = {className:null, probability:0};
  preds.forEach(p => { if(p.probability > best.probability) best = {className:p.className, probability:p.probability}; });
  lastPrediction = best;
  showToast(`Detectado: ${best.className} ${(best.probability*100).toFixed(0)}%`);
});

btnUsePrediction?.addEventListener('click', ()=>{
  chatInput.focus();
  addBotMessage('Describe la galleta que quieres (ej: "algo crujiente con chocolate") y te recomendaré.');
});

/* Chatbot */
function addUserMessage(text){
  const el = document.createElement('div'); el.className='msg user'; el.textContent = text;
  chatMessages.appendChild(el); chatMessages.scrollTop = chatMessages.scrollHeight;
}
function addBotMessage(text){
  const el = document.createElement('div'); el.className='msg bot'; el.textContent = text;
  chatMessages.appendChild(el); chatMessages.scrollTop = chatMessages.scrollHeight;
}

function analyzeTextAndRecommend(text){
  const t = text.toLowerCase();
  if(t.includes('chisp')) return {tag:'chispas', reason:'buscaste chispas'};
  if(t.includes('chocolate')) return {tag:'chocolate', reason:'mencionaste chocolate'};
  if(t.includes('almendra')) return {tag:'almendra', reason:'mencionaste almendra'};
  if(t.includes('avena') || t.includes('miel')) return {tag:'avena', reason:'mencionaste avena'};
  if(t.includes('veg')) return {tag:'vegan', reason:'mencionaste vegano'};
  
  if(lastPrediction && lastPrediction.className){
    const p = lastPrediction.className.toLowerCase();
    if(p.includes('chisp')) return {tag:'chispas', reason:'IA detectó chispas'};
    if(p.includes('chocolate')) return {tag:'chocolate', reason:'IA detectó chocolate'};
    if(p.includes('avena')) return {tag:'avena', reason:'IA detectó avena'};
  }
  return {tag:'chocolate', reason:'recomendación por defecto'};
}

chatForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const txt = chatInput.value.trim();
  if(!txt) return;
  addUserMessage(txt);

  const rec = analyzeTextAndRecommend(txt);

  // Respuesta bot
  addBotMessage(`Te recomiendo galletas de tipo **${rec.tag}** porque ${rec.reason}.`);

  filterEl.value = rec.tag;
  applyFilters();

  chatInput.value = '';
});