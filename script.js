// Список товаров. Чтобы добавить товар, добавьте ещё одну строку.
const PRODUCTS = [
    { id: 1, name: "Диван «Комфорт»", category: "Диваны", price: 32900, emoji: "🛋️", image: "images/sofa-1.jpg", desc: "Угловой, раскладывается, обивка велюр" },
    { id: 2, name: "Диван «Лофт»", category: "Диваны", price: 27500, emoji: "🛋️", image: "images/sofa-2.jpg", desc: "Прямой, три места, ножки из дерева" },
    { id: 3, name: "Кровать «Сон»", category: "Кровати", price: 21900, emoji: "🛏️", image: "images/bed-1.jpg", desc: "Двуспальная, с мягким изголовьем" },
    { id: 4, name: "Кровать «Мини»", category: "Кровати", price: 12900, emoji: "🛏️", image: "images/bed-2.jpg", desc: "Односпальная, с ящиком для белья" },
    { id: 5, name: "Стол «Обед»", category: "Столы", price: 14500, emoji: "🍽️", image: "images/table-1.jpg", desc: "Раздвижной, на 6-8 человек" },
    { id: 6, name: "Стол «Рабочий»", category: "Столы", price: 8900, emoji: "🖥️", image: "images/table-2.jpg", desc: "Компьютерный, с полкой для техники" },
    { id: 7, name: "Стул «Классик»", category: "Стулья", price: 2900, emoji: "🪑", image: "images/chair-1.jpg", desc: "Деревянный, мягкое сиденье" },
    { id: 8, name: "Стул «Бар»", category: "Стулья", price: 3900, emoji: "🪑", image: "images/chair-2.jpg", desc: "Высокий, металлические ножки" },
];

const filtersBox = document.getElementById("filters");
const productsBox = document.getElementById("products");

// Категории берём из самих товаров, плюс «Все»
const categories = ["Все", ...new Set(PRODUCTS.map(p => p.category))];
let currentCategory = "Все";

function formatPrice(value) {
    return value.toLocaleString("ru-RU") + " ₽";
}

function renderFilters() {
    filtersBox.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (cat === currentCategory ? " active" : "");
        btn.textContent = cat;
        btn.addEventListener("click", () => {
            currentCategory = cat;
            renderFilters();
            renderProducts();
        });
        filtersBox.appendChild(btn);
    });
}

function renderProducts() {
    productsBox.innerHTML = "";

    const list = currentCategory === "Все"
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category === currentCategory);

    list.forEach(product => {
        const card = document.createElement("div");
        card.className = "product";

        const img = document.createElement("div");
        img.className = "product-img";

        if (product.image) {
            const photo = document.createElement("img");
            photo.src = product.image;
            photo.alt = product.name;
            photo.loading = "lazy";
            // Если фото не загрузилось, показываем эмодзи
            photo.addEventListener("error", () => {
                photo.remove();
                img.textContent = product.emoji;
            });
            img.appendChild(photo);
        } else {
            img.textContent = product.emoji;
        }

        const body = document.createElement("div");
        body.className = "product-body";

        const title = document.createElement("h3");
        title.textContent = product.name;

        const desc = document.createElement("p");
        desc.className = "product-desc";
        desc.textContent = product.desc;

        const price = document.createElement("div");
        price.className = "product-price";
        price.textContent = formatPrice(product.price);

        const button = document.createElement("button");
        button.className = "add-btn";
        button.textContent = "В корзину";
        button.addEventListener("click", () => addToCart(product.id));

        body.append(title, desc, price, button);
        card.append(img, body);
        productsBox.appendChild(card);
    });
}

renderFilters();
renderProducts();

// ===== Корзина =====
const CART_KEY = "uyut_cart";

// Читаем корзину из браузера и выкидываем всё лишнее
function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY)) || {};
        const clean = {};
        for (const id in saved) {
            const qty = Number(saved[id]);
            const exists = PRODUCTS.some(p => String(p.id) === id);
            if (exists && Number.isInteger(qty) && qty > 0) {
                clean[id] = Math.min(qty, 99);
            }
        }
        return clean;
    } catch (e) {
        return {};
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
        // хранилище недоступно, корзина просто не сохранится
    }
}

// Вид корзины: { "1": 2, "5": 1 }, то есть id товара: количество
let cart = loadCart();

const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const cartItemsBox = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout");

function findProduct(id) {
    return PRODUCTS.find(p => String(p.id) === String(id));
}

function addToCart(id) {
    cart[id] = Math.min((cart[id] || 0) + 1, 99);
    saveCart();
    updateCart();
}

function changeQty(id, delta) {
    const next = (cart[id] || 0) + delta;
    if (next <= 0) {
        delete cart[id];
    } else {
        cart[id] = Math.min(next, 99);
    }
    saveCart();
    updateCart();
}

function removeFromCart(id) {
    delete cart[id];
    saveCart();
    updateCart();
}

function updateCart() {
    let count = 0;
    let total = 0;

    cartItemsBox.innerHTML = "";

    const ids = Object.keys(cart);

    if (ids.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Корзина пуста";
        cartItemsBox.appendChild(empty);
    }

    ids.forEach(id => {
        const product = findProduct(id);
        const qty = cart[id];
        count += qty;
        total += product.price * qty;

        const item = document.createElement("div");
        item.className = "cart-item";

        const name = document.createElement("div");
        name.className = "cart-item-name";
        name.textContent = product.name;

        const price = document.createElement("div");
        price.className = "cart-item-price";
        price.textContent = formatPrice(product.price) + " за штуку";

        const row = document.createElement("div");
        row.className = "cart-item-row";

        const qtyBox = document.createElement("div");
        qtyBox.className = "qty";

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.addEventListener("click", () => changeQty(id, -1));

        const number = document.createElement("span");
        number.textContent = qty;

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.addEventListener("click", () => changeQty(id, 1));

        qtyBox.append(minus, number, plus);

        const right = document.createElement("div");
        const sum = document.createElement("b");
        sum.textContent = formatPrice(product.price * qty);
        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.textContent = "🗑";
        remove.addEventListener("click", () => removeFromCart(id));
        right.append(sum, remove);

        row.append(qtyBox, right);
        item.append(name, price, row);
        cartItemsBox.appendChild(item);
    });

    cartCount.textContent = count;
    cartTotal.textContent = formatPrice(total);
    checkoutBtn.disabled = count === 0;
}

function openCart() {
    drawer.classList.add("open");
    overlay.classList.add("open");
}

function closeCart() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
}

document.getElementById("cart-open").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeCart();
});

// ===== Оформление заказа =====
const SHOP_TELEGRAM = "Gty9qe"; // username в Telegram без @, куда придёт заказ

const cartFoot = document.getElementById("cart-foot");
const orderForm = document.getElementById("order-form");
const orderNote = document.getElementById("order-note");

// Переключаем вид панели: корзина или форма заказа
function showForm(show) {
    cartItemsBox.hidden = show;
    cartFoot.hidden = show;
    orderForm.hidden = !show;
    orderNote.textContent = "";
}

function showError(text) {
    orderNote.textContent = text;
}

checkoutBtn.addEventListener("click", () => showForm(true));
document.getElementById("back-btn").addEventListener("click", () => showForm(false));

document.getElementById("clear-btn").addEventListener("click", () => {
    cart = {};
    saveCart();
    updateCart();
});

document.getElementById("send-order").addEventListener("click", () => {
    const name = document.getElementById("order-name").value.trim();
    const phone = document.getElementById("order-phone").value.trim();
    const address = document.getElementById("order-address").value.trim();
    const comment = document.getElementById("order-comment").value.trim();
    const digits = phone.replace(/\D/g, "");

    const ids = Object.keys(cart);
    if (ids.length === 0) return showError("Корзина пуста");
    if (!name) return showError("Введите имя");
    if (digits.length < 10) return showError("Введите телефон полностью");
    if (!address) return showError("Введите адрес доставки");

    let total = 0;
    const lines = ids.map((id, i) => {
        const product = findProduct(id);
        const qty = cart[id];
        total += product.price * qty;
        return `${i + 1}. ${product.name} × ${qty} = ${formatPrice(product.price * qty)}`;
    });

    const text = [
        "Новый заказ из магазина «Уют»",
        "",
        ...lines,
        "",
        `Итого: ${formatPrice(total)}`,
        "",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Адрес: ${address}`,
        comment ? `Комментарий: ${comment}` : "",
    ].join("\n");

    const url = "https://t.me/" + SHOP_TELEGRAM + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank");

    showError("Открылся Telegram: нажмите «Отправить», чтобы заказ ушёл.");
});

updateCart();