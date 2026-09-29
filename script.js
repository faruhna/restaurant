// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApRa-o_DSAikev_sHEh1gaUGPFC9sJIBI",
  authDomain: "restaurant-app-31bbe.firebaseapp.com",
  projectId: "restaurant-app-31bbe",
  storageBucket: "restaurant-app-31bbe.firebasestorage.app",
  messagingSenderId: "284724591836",
  appId: "1:284724591836:web:f1eb2fd4581389ff2c0819",
  measurementId: "G-MNNFNSZ2BM"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let allProducts = [];

// قائمة الوجبات الأساسية لضمان ظهور القائمة كاملة أمام الزبون فوراً
const defaultProducts = [
    { id: '1', name: 'بيتزا مارجريتا', price: 25000, category: 'غربي', description: 'جبنة موزاريلا مع صلصة طماطم فاخرة', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
    { id: '2', name: 'بيتزا تشيز برغر', price: 32000, category: 'غربي', description: 'لحم مفروم، جبنة، وصلصة خاصة', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300' },
    { id: '3', name: 'وجبة شاورما دجاج', price: 18000, category: 'شرقي', description: 'شاورما دجاج مع ثوم وبطاطا ومخلل', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300' },
    { id: '4', name: 'شيش طاووق', price: 22000, category: 'شرقي', description: 'قطع دجاج مشوية مع التوابل الخاصة', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300' },
    { id: '5', name: 'بطاطا مقلية', price: 9000, category: 'مقبلات', description: 'بطاطا مقرمشة ساخنة مع البهارات', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300' },
    { id: '6', name: 'متبل باذنجان', price: 10000, category: 'مقبلات', description: 'باذنجان مشوي مع طحينة وثوم', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=300' },
    { id: '7', name: 'عصير برتقال طازج', price: 8000, category: 'مشروبات', description: 'عصير برتقال طبيعي 100% منعش', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300' },
    { id: '8', name: 'كولا', price: 5000, category: 'مشروبات', description: 'مشروب غازي بارد', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300' },
    { id: '9', name: 'كنافة بالجبنة', price: 20000, category: 'حلويات', description: 'كنافة ساخنة مع الجبنة والقطر والفستق', image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=300' },
    { id: '10', name: 'تشيز كيك', price: 23000, category: 'حلويات', description: 'تشيز كيك غني بصوص الفراولة', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300' }
];

document.addEventListener('DOMContentLoaded', () => {
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

// جلب المنتجات (من قاعدة البيانات أو القائمة الافتراضية لضمان عدم بقاء الصفحة فارغة)
function loadProducts() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '<p style="color: white; text-align: center;">جاري تحميل القائمة...</p>';

    db.collection("products").get().then((querySnapshot) => {
        allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });

        // إذا كانت قاعدة البيانات فارغة، نستخدم القائمة الافتراضية لترى كل الوجبات مباشرة
        if (allProducts.length === 0) {
            allProducts = defaultProducts;
        }

        displayProducts(allProducts);
    }).catch((error) => {
        console.error("Error getting products: ", error);
        displayProducts(defaultProducts);
    });
}

// عرض الوجبات في الصفحة
function displayProducts(products) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
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

// تصفية حسب القسم
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

// إضافة للسلة وتخزينها محلياً
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
    alert(`تمت إضافة "${name}" إلى السلة! 🛒`);
};

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = totalCount;
    }
}
