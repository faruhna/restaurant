const RESTAURANT_WHATSAPP = "963934339676"; 

// استخراج رقم الطاولة من URL
function getTableNumber() {
  const params = new URLSearchParams(window.location.search);
  return params.get("table") || "غير محددة";
}

// عرض رقم الطاولة في الواجهة
function displayTableNumber() {
  const tableElem = document.getElementById("table-display");
  if (tableElem) {
    tableElem.textContent = `طاولة رقم: ${getTableNumber()}`;
  }
}

const menuItems = [
  {
    name: "عصير برتقال",
    category: "drinks",
    price: 5000,
    ingredients: "برتقال طبيعي، سكر",
    image: "images/orange-juice.jpg"
  },
  {
    name: "شاورما دجاج",
    category: "arabic",
    price: 12000,
    ingredients: "دجاج، ثوم، خبز عربي",
    image: "images/shawarma.jpg"
  },
  {
    name: "بيتزا مارجريتا",
    category: "western",
    price: 15000,
    ingredients: "جبنة، طماطم، ريحان",
    image: "images/pizza.jpg"
  },
  {
    name: "بطاطا مقلية",
    category: "starters",
    price: 6000,
    ingredients: "بطاطا، زيت، ملح",
    image: "images/fries.jpg"
  },
  {
    name: "كنافة نابلسية",
    category: "desserts",
    price: 10000,
    ingredients: "جبنة، سميد، قطر",
    image: "images/kunafa.jpg"
  }
];

// تغيير الكمية في بطاقة المنتج
function adjustQty(index, delta) {
  const qtyInput = document.getElementById(`qty-${index}`);
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) || 1;
  val = Math.max(1, val + delta);
  qtyInput.value = val;
}

// عرض عناصر المنيو
function renderMenu(items) {
  const container = document.getElementById("menu-container");
  if (!container) return;

  container.innerHTML = "";
  items.forEach((item) => {
    const originalIndex = menuItems.findIndex(m => m.name === item.name);
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="card-body">
        <h3>${item.name}</h3>
        <p class="ingredients">${item.ingredients}</p>
        <p class="price">${item.price.toLocaleString()} ل.س</p>
        
        <textarea id="note-${originalIndex}" placeholder="ملاحظات خاصة (بدون مخلل، زيادة ثوم...)"></textarea>
        
        <div class="qty-control">
          <button type="button" onclick="adjustQty(${originalIndex}, -1)">-</button>
          <input type="number" id="qty-${originalIndex}" value="1" min="1" readonly>
          <button type="button" onclick="adjustQty(${originalIndex}, 1)">+</button>
        </div>

        <button class="add-btn" onclick='addToCart(${originalIndex})'>إضافة إلى السلة 🛒</button>
      </div>
    `;
    container.appendChild(div);
  });

  updateCartBadge();
  updateCartLink();
}

function updateCartLink() {
  const cartLink = document.getElementById("cart-link");
  if (cartLink) {
    const table = getTableNumber();
    cartLink.href = `cart.html?table=${table}`;
  }
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalCount;
}

function filterCategory(category, btnElement) {
  if (btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
  }

  if (category === "all") {
    renderMenu(menuItems);
  } else {
    const filtered = menuItems.filter(item => item.category === category);
    renderMenu(filtered);
  }
}

function addToCart(index) {
  const item = { ...menuItems[index] };
  const noteInput = document.getElementById(`note-${index}`);
  const qtyInput = document.getElementById(`qty-${index}`);
  
  const note = noteInput ? noteInput.value : "";
  const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
  
  item.notes = note;
  item.quantity = qty;
  item.total = item.price * qty;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));

  if (noteInput) noteInput.value = "";
  if (qtyInput) qtyInput.value = 1;

  updateCartBadge();
  showToast(`تم إقرار "${item.name}" بالطلب`);
}

function showToast(message) {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<span>✓</span> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>السلة فارغة حالياً</p>
        <button class="secondary-btn" onclick="goBack()">تصفح قائمة الطعام</button>
      </div>`;
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.total;
    const div = document.createElement("div");
    div.className = "cart-item-card";
    div.innerHTML = `
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>العدد: ${item.quantity} × ${item.price.toLocaleString()} ل.س</p>
        ${item.notes ? `<p class="item-note">ملاحظة: ${item.notes}</p>` : ''}
        <p class="price">الإجمالي: ${item.total.toLocaleString()} ل.س</p>
      </div>
      <button class="delete-btn" onclick="removeItem(${index})">حذف 🗑️</button>
    `;
    container.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "invoice-total";
  totalDiv.textContent = `المجموع الكلي: ${total.toLocaleString()} ل.س`;
  container.appendChild(totalDiv);
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartBadge();
}

function goBack() {
  const table = getTableNumber();
  window.location.href = `menu.html?table=${table}`;
}

// تحويل تلقائي من واتساب الزبون لطلب المطعم
function sendOrder() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showToast("السلة فارغة!");
    return;
  }

  const table = getTableNumber();
  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  let whatsappMessage = `*طلب جديد من الطاولة رقم: ${table}*\n------------------\n`;
  cart.forEach(item => {
    whatsappMessage += `• ${item.name} (عدد ${item.quantity}) - ${item.total.toLocaleString()} ل.س\n`;
    if (item.notes) whatsappMessage += `  ملاحظة: ${item.notes}\n`;
  });
  whatsappMessage += `------------------\n*المجموع الكلي: ${grandTotal.toLocaleString()} ل.س*`;

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappURL = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodedMessage}`;

  localStorage.setItem("finalOrder", JSON.stringify(cart));
  localStorage.removeItem("cart");

  // فتح الواتساب للزبون لإرسال الرسالة إليك فوراً
  window.open(whatsappURL, '_blank');
  window.location.href = `order.html?table=${table}`;
}

// عرض واجهة الشكر والألعاب التفاعلية الجديدة
function showThankYouAndGames() {
  const container = document.getElementById("order-details");
  if (!container) return;

  const table = getTableNumber();

  container.innerHTML = `
    <div class="thankyou-card">
      <div class="success-icon">✨</div>
      <h2>شكراً لاختياركم مطعمنا!</h2>
      <p>تم إرسال طلبكم بنجاح للطاولة رقم <strong>${table}</strong>، وجاري تحضيره بكل حب 🍕🍔</p>
      <button class="secondary-btn" onclick="goBack()">إضافة طلب جديد ➕</button>
      
      <div class="game-container">
        <h3>🎮 تسلَّ بالألعاب التفاعلية حتى يصل طلبك!</h3>
        <div class="game-selector">
          <button class="game-tab-btn active" onclick="switchGame('memory', this)">🧠 قوة الذاكرة</button>
          <button class="game-tab-btn" onclick="switchGame('math', this)">⚡ التحدي السريع</button>
        </div>

        <!-- 1. لعبة الذاكرة -->
        <div id="game-memory" class="game-box">
          <p class="game-desc">طابق صور الأطعمة المتشابهة بأقل عدد من المحاولات!</p>
          <div class="memory-grid" id="memory-board"></div>
          <div class="game-status" id="memory-status">المحاولات: 0</div>
          <button class="restart-btn" onclick="initMemoryGame()">إعادة اللعبة 🔄</button>
        </div>

        <!-- 2. لعبة التحدي السريع -->
        <div id="game-math" class="game-box" style="display: none;">
          <p class="game-desc">حل أكبر عدد من المسائل الحسابية خلال الوقت!</p>
          <div class="math-score" id="math-score">النقاط: 0</div>
          <div class="math-problem" id="math-problem">أضغط "ابدأ" للعب</div>
          <div class="math-options" id="math-options"></div>
          <button class="restart-btn" id="math-start-btn" onclick="startMathGame()">ابدأ التحدي 🚀</button>
        </div>

      </div>
    </div>
  `;

  initMemoryGame();
}

function switchGame(gameName, btnElem) {
  document.getElementById('game-memory').style.display = 'none';
  document.getElementById('game-math').style.display = 'none';

  document.querySelectorAll('.game-tab-btn').forEach(b => b.classList.remove('active'));
  if(btnElem) btnElem.classList.add('active');

  document.getElementById(`game-${gameName}`).style.display = 'block';
  if(gameName === 'memory') initMemoryGame();
}

/* ==========================================
   1. لعبة تطابق الذاكرة (Memory Game)
   ========================================== */
const memoryIcons = ['🍕', '🍕', '🍔', '🍔', '🍟', '🍟', '🥤', '🥤', '🍰', '🍰', '🍦', '🍦'];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;

function initMemoryGame() {
  const board = document.getElementById('memory-board');
  if(!board) return;
  board.innerHTML = '';
  flippedCards = [];
  matchedPairs = 0;
  memoryMoves = 0;
  document.getElementById('memory-status').textContent = `المحاولات: 0`;

  const shuffled = [...memoryIcons].sort(() => Math.random() - 0.5);
  shuffled.forEach((icon, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.icon = icon;
    card.dataset.index = index;
    card.innerHTML = `<span class="card-icon">${icon}</span>`;
    card.addEventListener('click', () => handleCardClick(card));
    board.appendChild(card);
  });
}

function handleCardClick(card) {
  if (flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    memoryMoves++;
    document.getElementById('memory-status').textContent = `المحاولات: ${memoryMoves}`;
    const [card1, card2] = flippedCards;

    if (card1.dataset.icon === card2.dataset.icon) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      matchedPairs++;
      flippedCards = [];
      if (matchedPairs === memoryIcons.length / 2) {
        document.getElementById('memory-status').textContent = `🎉 أسطوري! أكملت اللعبة في ${memoryMoves} محاولة!`;
      }
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        flippedCards = [];
      }, 900);
    }
  }
}

/* ==========================================
   2. لعبة التحدي السريع (Math Speed Game)
   ========================================== */
let mathScore = 0;
let currentAnswer = 0;

function startMathGame() {
  mathScore = 0;
  document.getElementById('math-score').textContent = `النقاط: ${mathScore}`;
  document.getElementById('math-start-btn').style.display = 'none';
  generateMathProblem();
}

function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const isPlus = Math.random() > 0.4;
  
  if(isPlus) {
    currentAnswer = num1 + num2;
    document.getElementById('math-problem').textContent = `${num1} + ${num2} = ?`;
  } else {
    const max = Math.max(num1, num2);
    const min = Math.min(num1, num2);
    currentAnswer = max - min;
    document.getElementById('math-problem').textContent = `${max} - ${min} = ?`;
  }

  const options = [currentAnswer];
  while(options.length < 3) {
    const wrong = currentAnswer + (Math.floor(Math.random() * 10) - 5);
    if(wrong >= 0 && !options.includes(wrong)) options.push(wrong);
  }
  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.getElementById('math-options');
  optionsContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'math-opt-btn';
    btn.textContent = opt;
    btn.onclick = () => checkMathAns(opt);
    optionsContainer.appendChild(btn);
  });
}

function checkMathAns(selected) {
  if (selected === currentAnswer) {
    mathScore += 10;
    showToast("إجابة صحيحة! +10");
  } else {
    showToast("إجابة خاطئة!");
  }
  document.getElementById('math-score').textContent = `النقاط: ${mathScore}`;
  generateMathProblem();
}

document.addEventListener("DOMContentLoaded", () => {
  displayTableNumber();
  if (document.getElementById("menu-container")) renderMenu(menuItems);
  if (document.getElementById("cart-items")) loadCart();
  if (document.getElementById("order-details")) showThankYouAndGames();
});