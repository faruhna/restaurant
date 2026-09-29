import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyApRa-o_DSAikev_sHEh1gaUGPFC9sJIBI",
  authDomain: "restaurant-app-31bbe.firebaseapp.com",
  projectId: "restaurant-app-31bbe",
  storageBucket: "restaurant-app-31bbe.firebasestorage.app",
  messagingSenderId: "284724591836",
  appId: "1:284724591836:web:f1eb2fd4581389ff2c0819",
  measurementId: "G-MNNFNSZ2BM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getTableNumber() {
  const params = new URLSearchParams(window.location.search);
  return params.get("table") || "غير محددة";
}

function displayTableNumber() {
  const tableElem = document.getElementById("table-display");
  if (tableElem) {
    tableElem.textContent = `طاولة رقم: ${getTableNumber()}`;
  }
}

const menuItems = [
  { name: "عصير برتقال", category: "drinks", price: 5000, ingredients: "برتقال طبيعي، سكر", image: "images/orange-juice.jpg" },
  { name: "شاورما دجاج", category: "arabic", price: 12000, ingredients: "دجاج، ثوم، خبز عربي", image: "images/shawarma.jpg" },
  { name: "بيتزا مارجريتا", category: "western", price: 15000, ingredients: "جبنة، طماطم، ريحان", image: "images/pizza.jpg" },
  { name: "بطاطا مقلية", category: "starters", price: 6000, ingredients: "بطاطا، زيت، ملح", image: "images/fries.jpg" },
  { name: "كنافة نابلسية", category: "desserts", price: 10000, ingredients: "جبنة، سميد، قطر", image: "images/kunafa.jpg" }
];

window.adjustQty = function(index, delta) {
  const qtyInput = document.getElementById(`qty-${index}`);
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) || 1;
  val = Math.max(1, val + delta);
  qtyInput.value = val;
};

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
        <textarea id="note-${originalIndex}" placeholder="ملاحظات خاصة (بدون مخلل...)"></textarea>
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

window.addToCart = function(index) {
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
};

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

window.removeItem = function(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartBadge();
};

window.goBack = function() {
  const table = getTableNumber();
  window.location.href = `index.html?table=${table}`;
};

// إرسال الطلب المباشر إلى قاعدة البيانات
window.sendOrder = async function() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showToast("السلة فارغة!");
    return;
  }

  const sendBtn = document.querySelector(".send-btn");
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.textContent = "جاري إرسال الطلب...";
  }

  const table = getTableNumber();
  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  try {
    // إضافة الطلب لقاعدة البيانات
    await addDoc(collection(db, "orders"), {
      tableNumber: table,
      items: cart,
      totalAmount: grandTotal,
      status: "pending", // قيد الانتظار
      createdAt: serverTimestamp()
    });

    localStorage.removeItem("cart");
    window.location.href = `order.html?table=${table}`;
  } catch (error) {
    console.error("Error sending order: ", error);
    alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = "إرسال الطلب إلى المطعم 🚀";
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  displayTableNumber();
  if (document.getElementById("menu-container")) renderMenu(menuItems);
  if (document.getElementById("cart-items")) loadCart();
});