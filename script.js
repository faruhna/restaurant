// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyApRa-o_DSAikev_sHEh1gaUGPFC9sJIBI",
  authDomain: "restaurant-app-31bbe.firebaseapp.com",
  projectId: "restaurant-app-31bbe",
  storageBucket: "restaurant-app-31bbe.firebasestorage.app",
  messagingSenderId: "284724591836",
  appId: "1:284724591836:web:f1eb2fd4581389ff2c0819",
  measurementId: "G-MNNFNSZ2BM"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let allProducts = [];

// جلب المنتجات من Firestore عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // قراءة رقم الطاولة من الرابط URL
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
        document.getElementById('table-number').textContent = tableParam;
        localStorage.setItem('tableNumber', tableParam);
    } else {
        const savedTable = localStorage.getItem('tableNumber') || '1';
        document.getElementById('table-number').textContent = savedTable;
    }

    loadProducts();
    updateCartCount();
});

// دالة جلب المنتجات
function loadProducts() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '<p style="color: white; text-align: center;">جاري تحميل القائمة...</p>';

    db.collection("products").get().then((querySnapshot) => {
        allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });

        displayProducts(allProducts);
    }).catch((error) => {
        console.error("Error getting products: ", error);
        menuContainer.innerHTML = '<p style="color: red; text-align: center;">حدث خطأ أثناء تحميل القائمة.</p>';
    });
}

// دالة عرض المنتجات في الصفحة
function displayProducts(products) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';

    if (products.length === 0) {
        menuContainer.innerHTML = '<p style="color: white; text-align: center;">لا توجد وجبات متوفرة حالياً.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image || 'images/default.jpg'}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="description">${product.description || ''}</p>
                <div class="product-footer">
                    <span class="price">${product.price} ل.س</span>
                    <button class="add-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">إضافة +</button>
                </div>
            </div>
        `;
        menuContainer.appendChild(productCard);
    });
}

// دالة تصفية الأصناف (تصفية الأكل)
window.filterCategory = function(category) {
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        displayProducts(filtered);
    }
};

// دالة إضافة منتج للسلة
window.addToCart = function(id, name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
};

// تحديث عدد عناصر السلة
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = totalCount;
    }
}
