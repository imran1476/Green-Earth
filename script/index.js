// API 
const API_BASE = 'https://openapi.programming-hero.com/api';
const ALL_PLANTS = API_BASE + '/plants';
const ALL_CATEGORIES = API_BASE + '/categories';
const CATEGORY_BY_ID = (id) => API_BASE + '/category/' + id;
const PLANT_BY_ID = (id) => API_BASE + '/plant/' + id;

// DOM elements
const allCategory = document.getElementById('all-category');
const treeContainer = document.getElementById('tree-container');
const spinner = document.getElementById('spinner');
const itemCount = document.getElementById('item-count');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

// Global state
let cart = [];
let allPlantsData = []; 
let activeCategoryId = null;

// Helper functions
function showSpinner() {
    spinner.classList.remove('hidden');
    spinner.classList.add('flex');
}

function hideSpinner() {
    spinner.classList.add('hidden');
    spinner.classList.remove('flex');
}

function extractArray(obj) {
    if (!obj || typeof obj !== 'object') return [];
    if (Array.isArray(obj)) return obj;
    for (const key of ['data', 'plants', 'news', 'items', 'results', 'news_category', 'categories']) {
        if (obj[key] && Array.isArray(obj[key])) return obj[key];
    }
    const firstArray = Object.values(obj).find(v => Array.isArray(v));
    return firstArray || [];
}

function escapeHtml(text) {
    return String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function unescapeHtml(text) {
    return String(text).replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Data loading functions
function loadCategory() {
    fetch(ALL_CATEGORIES)
        .then(res => res.json())
        .then(data => {
            const cats = extractArray(data);
            displayCategory(cats);
            setActiveCategory('all');
        })
        .catch(err => console.error('Failed to load categories:', err));
}

function loadAllPlants() {
    showSpinner();
    fetch(ALL_PLANTS)
        .then(res => res.json())
        .then(data => {
            allPlantsData = extractArray(data);
            displayPlants(allPlantsData);
        })
        .catch(err => {
            console.error('Failed to load all plants:', err);
            treeContainer.innerHTML = '<p class="text-center text-red-500">Failed to load plants. Please try again later.</p>';
            itemCount.textContent = 0;
        })
        .finally(() => hideSpinner());
}

function loadCategoryPlants(id) {
    if (id === 'all') {
        displayPlants(allPlantsData);
        return;
    }
    const filteredPlants = allPlantsData.filter(plant =>
        (plant.category && plant.category.toLowerCase().includes(id.toLowerCase())) ||
        (plant.categories && plant.categories.some(cat => cat.toLowerCase().includes(id.toLowerCase())))
    );
    displayPlants(filteredPlants);
}

function displayPlants(plants) {
    treeContainer.innerHTML = '';
    const list = plants || [];
    itemCount.textContent = list.length;

    if (list.length === 0) {
        treeContainer.innerHTML = '<p class="text-center text-slate-600">No plants found in this category.</p>';
        return;
    }

    list.forEach(plant => {
        const id = plant.id || plant.plant_id || plant._id;
        const name = plant.name || plant.plant_name || plant.title || 'No name';
        const img = plant.image || plant.thumbnail || 'https://via.placeholder.com/400x250?text=No+Image';
        const desc = plant.description || plant.details || plant.about || plant.short_description || '';
        const category = plant.category || (plant.categories && plant.categories[0]) || 'General';
        const price = plant.price || plant.cost || 500;

        const card = document.createElement('article');
        card.className = 'bg-white p-4 rounded-lg shadow-sm';
        card.innerHTML = `
            <img src="${img}" alt="${name}" class="w-full h-40 object-cover rounded-md mb-3">
            <h3 class="font-semibold text-lg leading-6 hover:underline cursor-pointer" data-id="${id}">${name}</h3>
            <p class="text-sm  h-[60px] overflow-x-auto text-ellipsis text-slate-600">${desc.length > 100 ? desc.substring(0, 100) + '...' : desc}</p>
            <div class="mt-3 flex items-center justify-between">
                <div class="text-xs bg-emerald-100 px-2 py-1 rounded">${category}</div>
                <div class="font-semibold">৳${price}</div>
            </div>
            <div class="mt-3">
                <button class="add-to-cart w-full bg-emerald-700 text-white py-2 rounded transition-transform duration-200
 hover:-translate-y-1 cursor-pointer hover:bg-emerald-800" data-id="${id}" data-name="${escapeHtml(name)}" data-price="${price}">Add to Cart</button>
            </div>
        `;
        treeContainer.appendChild(card);

        card.querySelector('h3').addEventListener('click', () => openModalWithPlant(id));
        card.querySelector('.add-to-cart').addEventListener('click', (e) => {
            const b = e.currentTarget;
            const pid = b.dataset.id;
            const pname = unescapeHtml(b.dataset.name);
            const pprice = Number(b.dataset.price) || 0;
            alert("✅ " + pname + " added to cart successfully!");
            addToCart({ id: pid, name: pname, price: pprice });
        });
    });
}

// UI and event handling
function displayCategory(categories) {
    allCategory.innerHTML = '';
    const liAll = document.createElement('li');
    liAll.innerHTML = `<button class="w-full text-left px-3 py-2 rounded hover:bg-emerald-100" data-id="all">All Trees</button>`;
    allCategory.appendChild(liAll);
    liAll.querySelector('button').addEventListener('click', () => {
        setActiveCategory('all');
        loadCategoryPlants('all');
    });

    categories.forEach(cat => {
        const id = cat.category_id || cat.id || cat.categoryId;
        const name = cat.category_name || cat.name || cat.title || 'Category';
        const li = document.createElement('li');
        li.innerHTML = `<button class="w-full menu menu-sm z-1 text-left px-3 py-2 rounded hover:bg-emerald-100" data-id="${id}">${name}</button>`;
        allCategory.appendChild(li);
        li.querySelector('button').addEventListener('click', () => {
            setActiveCategory(id);
            loadCategoryPlants(name); 
        });
    });
}

function setActiveCategory(id) {
    activeCategoryId = id;
    document.querySelectorAll('#all-category button').forEach(btn => {
        btn.classList.remove('bg-emerald-700', 'text-white');
    });
    const activeBtn = Array.from(document.querySelectorAll('#all-category button')).find(b => b.dataset.id == id);
    if (activeBtn) activeBtn.classList.add('bg-emerald-700', 'text-white');
}

function openModalWithPlant(id) {
    if (!id) return;
    modalContent.innerHTML = '<div class="p-6 text-center">Loading...</div>';
    modal.classList.remove('hidden');

    const p = allPlantsData.find(plant => plant.id == id || plant.plant_id == id || plant._id == id);

    if (p) {
        const name = p.name || p.plant_name || 'No name';
        const img = p.image || p.thumbnail || 'https://via.placeholder.com/400x250?text=No+Image';
        const desc = p.description || p.details || 'No details available.';
        const price = p.price || 500;

        modalContent.innerHTML = `
            <div class="grid md:grid-cols-2 gap-4">
                <div><img src="${img}" alt="${name}" class="w-full h-60 object-cover rounded-md mb-3"></div>
                <div>
                    <h2 class="text-xl font-bold mb-2">${name}</h2>
                    
                    <p class="text-sm text-slate-700 mb-3">${desc}</p>
                    <div class="font-semibold mb-3">Price: ৳${price}</div>
                    <button class="bg-emerald-700 text-white px-4 py-2 rounded transition-transform duration-200
 hover:-translate-y-1 cursor-pointer hover:bg-emerald-800" id="modal-add">Add to Cart</button>
                </div>
            </div>
        `;
        document.getElementById('modal-add').addEventListener('click', () => {
           
            addToCart({ id, name, price });
    
            closeModal();
            
        });
    } else {
        modalContent.innerHTML = '<div class="p-6 text-center">Failed to load details.</div>';
    }
}

function closeModal() {
    modal.classList.add('hidden');
    modalContent.innerHTML = '';
}
document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Cart functions
function addToCart(item) {
    cart.push(item);
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach((c, i) => {
        total += Number(c.price) || 0;
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-emerald-50 p-2 rounded';
        div.innerHTML = `
            <div>
                <div class="font-semibold">${c.name}</div>
                <div class="text-xs text-slate-600">৳${c.price}</div>
            </div>
            <button class="text-red-500 text-sm remove-btn">✕</button>
        `;
        div.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(i));
        cartList.appendChild(div);
    });
    cartTotal.textContent = `৳${total}`;
}

// Form submit
document.getElementById('plant-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! Your request has been received.');
    e.target.reset();
});

// Initial load
loadCategory();
loadAllPlants();