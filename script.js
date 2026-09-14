const menuBtn = document.querySelector(".menu-btn"),
    navbar = document.querySelector(".navbar");
const searchBtn = document.querySelector(".search-btn"),
    searchBox = document.querySelector(".search-box"),
    closeSearch = document.querySelector("#closeSearch"),
    searchInput = document.querySelector("#searchInput");
const foodSearch = document.querySelector("#foodSearch"),
    foodCards = document.querySelectorAll(".food-card"),
    noResults = document.querySelector("#noResults");
const categories = document.querySelectorAll(".category");
const cartBtn = document.querySelector(".cart-btn"),
    cartCount = document.querySelector(".cart-count"),
    cartSidebar = document.querySelector(".cart-sidebar"),
    cartOverlay = document.querySelector(".cart-overlay"),
    closeCart = document.querySelector(".close-cart"),
    cartItemsContainer = document.querySelector("#cartItems"),
    cartSubtotal = document.querySelector("#cartSubtotal"),
    deliveryFeeElement = document.querySelector("#deliveryFee"),
    cartTotal = document.querySelector("#cartTotal"),
    checkoutBtn = document.querySelector(".checkout-btn");
const toast = document.querySelector("#toast"),
    toastMessage = document.querySelector("#toastMessage");

const foods = [
    {
        id: 1,
        name: "Classic Beef Burger",
        category: "burger",
        price: 199,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 2,
        name: "Margherita Pizza",
        category: "pizza",
        price: 299,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 3,
        name: "Crispy Chicken",
        category: "chicken",
        price: 249,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 4,
        name: "Double Cheese Burger",
        category: "burger",
        price: 279,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 5,
        name: "Pepperoni Pizza",
        category: "pizza",
        price: 349,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 6,
        name: "Chocolate Cake",
        category: "dessert",
        price: 149,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 7,
        name: "Chicken Wings",
        category: "chicken",
        price: 229,
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=300&q=80"
    },
    {
        id: 8,
        name: "Cold Coffee",
        category: "drink",
        price: 129,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=300&q=80"
    }
];

let cart = JSON.parse(localStorage.getItem("foodieCart") || "[]");
if (!Array.isArray(cart)) cart = [];

const money = n => `₹${n}`;
function saveCart() {
    localStorage.setItem("foodieCart", JSON.stringify(cart));
}
function toastMsg(msg) {
    toastMessage.textContent = msg;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

menuBtn.addEventListener("click", () => {
    navbar.classList.toggle("active");
    const i = menuBtn.querySelector("i");
    i.classList.toggle("fa-bars");
    i.classList.toggle("fa-xmark");
});
document
    .querySelectorAll(".navbar a")
    .forEach(a =>
        a.addEventListener("click", () => navbar.classList.remove("active"))
    );

searchBtn.addEventListener("click", () => {
    searchBox.classList.add("active");
    setTimeout(() => searchInput.focus(), 200);
});
closeSearch.addEventListener("click", () => {
    searchBox.classList.remove("active");
    searchInput.value = "";
});
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        searchBox.classList.remove("active");
        navbar.classList.remove("active");
        closeCartSidebar();
        checkoutModal.classList.remove("active");
        successModal.classList.remove("active");
    }
});

let currentCategory = "all";
function filterFoods(value = "") {
    value = value.toLowerCase().trim();
    let count = 0;
    foodCards.forEach(card => {
        const matchCategory =
            currentCategory === "all" ||
            card.dataset.category === currentCategory;
        const matchName = card.dataset.name.toLowerCase().includes(value);
        card.style.display = matchCategory && matchName ? "" : "none";
        if (matchCategory && matchName) count++;
    });
    noResults.classList.toggle("show", count === 0);
}
searchInput.addEventListener("input", () => filterFoods(searchInput.value));
foodSearch.addEventListener("input", () => filterFoods(foodSearch.value));
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        searchBox.classList.remove("active");
        document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
    }
});

categories.forEach(c =>
    c.addEventListener("click", () => {
        categories.forEach(x => x.classList.remove("active"));
        c.classList.add("active");
        currentCategory = c.dataset.category;
        filterFoods(foodSearch.value);
    })
);

function addToCart(id) {
    const food = foods.find(x => x.id === id);
    if (!food) return;
    const existing = cart.find(x => x.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...food, quantity: 1 });
    saveCart();
    updateCart();
    toastMsg(`${food.name} added to cart`);
}
document
    .querySelectorAll(".add-cart")
    .forEach(b => b.addEventListener("click", () => addToCart(+b.dataset.id)));

function changeQuantity(id, amount) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) cart = cart.filter(x => x.id !== id);
    saveCart();
    updateCart();
}
function removeItem(id) {
    cart = cart.filter(x => x.id !== id);
    saveCart();
    updateCart();
    toastMsg("Item removed");
}

function renderCart() {
    if (!cart.length) {
        cartItemsContainer.innerHTML = `<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i><h3>Your cart is empty</h3><p>Add some delicious food to get started.</p></div>`;
        return;
    }
    cartItemsContainer.innerHTML = cart
        .map(
            item => `
        <div class="cart-item">
            <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="cart-item-info"><h4>${item.name}</h4><p>${money(item.price)}</p>
            <div class="quantity-controls"><button data-action="minus" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button><span>${item.quantity}</span><button data-action="plus" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button></div></div>
            <button class="remove-item" data-action="remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>`
        )
        .join("");
}
cartItemsContainer.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const id = +b.dataset.id;
    if (b.dataset.action === "plus") changeQuantity(id, 1);
    if (b.dataset.action === "minus") changeQuantity(id, -1);
    if (b.dataset.action === "remove") removeItem(id);
});
function updateCart() {
    renderCart();
    const count = cart.reduce((s, x) => s + x.quantity, 0),
        subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0),
        delivery = subtotal ? 40 : 0;
    cartCount.textContent = count;
    cartSubtotal.textContent = money(subtotal);
    deliveryFeeElement.textContent = money(delivery);
    cartTotal.textContent = money(subtotal + delivery);
    checkoutBtn.disabled = !cart.length;
    checkoutBtn.style.opacity = cart.length ? "1" : ".5";
}
function openCart() {
    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.classList.add("cart-open");
}
function closeCartSidebar() {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.classList.remove("cart-open");
}
cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartSidebar);
cartOverlay.addEventListener("click", closeCartSidebar);

document.querySelectorAll(".favorite-btn").forEach(b =>
    b.addEventListener("click", () => {
        b.classList.toggle("active");
        const i = b.querySelector("i");
        i.classList.toggle("fa-regular");
        i.classList.toggle("fa-solid");
        toastMsg(
            b.classList.contains("active")
                ? "Added to favorites"
                : "Removed from favorites"
        );
    })
);

const checkoutModal = document.querySelector("#checkoutModal"),
    closeCheckout = document.querySelector("#closeCheckout"),
    checkoutForm = document.querySelector("#checkoutForm");
const checkoutSubtotal = document.querySelector("#checkoutSubtotal"),
    checkoutDelivery = document.querySelector("#checkoutDelivery"),
    checkoutTotal = document.querySelector("#checkoutTotal");
const successModal = document.querySelector("#successModal"),
    successClose = document.querySelector("#successClose"),
    orderNumber = document.querySelector("#orderNumber");

function updateCheckoutSummary() {
    const subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0),
        delivery = subtotal ? 40 : 0;
    checkoutSubtotal.textContent = money(subtotal);
    checkoutDelivery.textContent = money(delivery);
    checkoutTotal.textContent = money(subtotal + delivery);
}
checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
        toastMsg("Your cart is empty");
        return;
    }
    updateCheckoutSummary();
    checkoutModal.classList.add("active");
});
closeCheckout.addEventListener("click", () =>
    checkoutModal.classList.remove("active")
);
checkoutModal.addEventListener("click", e => {
    if (e.target === checkoutModal) checkoutModal.classList.remove("active");
});

checkoutForm.addEventListener("submit", e => {
    e.preventDefault();
    const phone = document.querySelector("#customerPhone").value.trim(),
        pin = document.querySelector("#customerPincode").value.trim();
    if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pin)) {
        toastMsg("Enter a valid phone number and pincode");
        return;
    }
    orderNumber.textContent = Math.floor(1000 + Math.random() * 9000);
    checkoutModal.classList.remove("active");
    successModal.classList.add("active");
    cart = [];
    saveCart();
    updateCart();
    checkoutForm.reset();
});
successClose.addEventListener("click", () =>
    successModal.classList.remove("active")
);
successModal.addEventListener("click", e => {
    if (e.target === successModal) successModal.classList.remove("active");
});

const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", scrollY > 20);
    document
        .querySelector(".back-to-top")
        ?.classList.toggle("show", scrollY > 500);
});

const back = document.createElement("button");
back.className = "back-to-top";
back.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
document.body.appendChild(back);
back.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

const revealObserver = new IntersectionObserver(
    entries =>
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("reveal-visible");
                revealObserver.unobserve(e.target);
            }
        }),
    { threshold: 0.12 }
);
document
    .querySelectorAll(
        ".food-card,.category,.about-image,.about-text,.section-heading,.cta-content"
    )
    .forEach(e => {
        e.classList.add("reveal");
        revealObserver.observe(e);
    });

document.querySelectorAll(".navbar a").forEach(a =>
    a.addEventListener("click", e => {
        const target = document.querySelector(a.getAttribute("href"));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    })
);

window.addEventListener("load", () => {
    setTimeout(() => {
        document.querySelector("#pageLoader").classList.add("hide");
        document.body.classList.add("loaded");
    }, 500);
});

updateCart();
