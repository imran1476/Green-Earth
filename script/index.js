 // API endpoints
    const API_BASE = 'https://openapi.programming-hero.com/api';
    const ALL_PLANTS = API_BASE + '/plants';
    const ALL_CATEGORIES = API_BASE + '/categories';
    const CATEGORY_BY_ID = (id) => API_BASE + '/category/' + id;
    const PLANT_BY_ID = (id) => API_BASE + '/plant/' + id;

    // DOM
    const allCategory = document.getElementById('all-category');
    const treeContainer = document.getElementById('tree-container');
    const spinner = document.getElementById('spinner');
    const itemCount = document.getElementById('item-count');
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    // state
    let cart = [];
    let activeCategoryId = null;

    // helper: show spinner
    function showSpinner() { spinner.classList.remove('hidden'); }
    function hideSpinner() { spinner.classList.add('hidden'); }

    // safe extractor for arrays
    function extractArray(obj) {
      if (!obj) return [];
      if (Array.isArray(obj)) return obj;
      // common wrappers used by some APIs
      for (const k of ['data', 'plants', 'news', 'items', 'results', 'news_category']) {
        if (obj[k] && Array.isArray(obj[k])) return obj[k];
      }
      // fallback: if object has numeric keys
      const vals = Object.values(obj).filter(v => Array.isArray(v));
      if (vals.length) return vals[0];
      return [];
    }

    // load categories
    function loadCategory() {
      fetch(ALL_CATEGORIES)
        .then(res => res.json())
        .then(data => {
          const cats = extractArray(data);
          if (cats.length === 0 && data && data.categories) cats = data.categories; // double-check
          displayCategory(cats);
        })
        .catch(err => console.error(err));
    }

    function displayCategory(categories) {
      allCategory.innerHTML = '';
      // add "All Trees" button
      const liAll = document.createElement('li');
      liAll.innerHTML = `<button class="w-full text-left px-3 py-2 rounded hover:bg-emerald-100" data-id="all">All Trees</button>`;
      allCategory.appendChild(liAll);
      liAll.querySelector('button').addEventListener('click', () => { setActiveCategory('all'); loadAllPlants(); });

      categories.forEach(cat => {
        const id = cat.category_id || cat.id || cat.categoryId || cat.category_id;
        const name = cat.category_name || cat.name || cat.category_name || cat.title || 'Category';
        const li = document.createElement('li');
        li.innerHTML = `<button class="w-full menu menu-sm z-1 text-left px-3 py-2 rounded hover:bg-emerald-100" data-id="${id}">${name}</button>`;
        allCategory.appendChild(li);
        li.querySelector('button').addEventListener('click', () => { setActiveCategory(id); loadCategories(id); });
      });

      // set first category active
    }

    function setActiveCategory(id) {
      activeCategoryId = id;
      document.querySelectorAll('#all-category button').forEach(btn => {
        btn.classList.remove('bg-emerald-700', 'text-white');
      });
      const activeBtn = Array.from(document.querySelectorAll('#all-category button')).find(b => b.dataset.id == id || (id === 'all' && b.dataset.id == 'all'));
      if (activeBtn) activeBtn.classList.add('bg-emerald-700', 'text-white');
    }

    // load all plants
    function loadAllPlants() {
      showSpinner();
      fetch(ALL_PLANTS)
        .then(res => res.json())
        .then(data => {
          const arr = extractArray(data);
          displayLoadCategories(arr);
        })
        .catch(err => console.error(err))
        .finally(() => hideSpinner());
    }

    // load by category id
    function loadCategories(id) {
      if (!id) return;
      showSpinner();
      fetch(CATEGORY_BY_ID(id))
        .then(res => res.json())
        .then(data => {
          const arr = extractArray(data);
          displayLoadCategories(arr);
        })
        .catch(err => console.error(err))
        .finally(() => hideSpinner());
    }

    // display cards
    function displayLoadCategories(trees) {
      treeContainer.innerHTML = '';
      const list = Array.isArray(trees) ? trees : extractArray(trees);
      itemCount.textContent = list.length;
      if (list.length === 0) {
        treeContainer.innerHTML = '<p class="text-center text-slate-600">No plants found.</p>';
        return;
      }
      list.forEach(plant => {
        // helpers to get properties safely
        const id = plant.id || plant.plant_id || plant.plantId || plant._id || plant.id;
        const name = plant.name || plant.plant_name || plant.title || 'No name';
        const img = plant.image || plant.thumbnail || plant.img || plant.image_url || 'https://via.placeholder.com/400x250?text=No+Image';
        const desc = plant.description || plant.details || plant.about || plant.short_description || '';
        const category = plant.category || plant.category_name || plant.categoryName || (plant.categories && plant.categories[0]) || 'General';
        const price = plant.price || plant.cost || plant.amount || plant.price_in_tk || 500;

        const card = document.createElement('article');
        card.className = 'bg-white p-4 rounded-lg shadow-sm';
        card.innerHTML = `
          <img src="${img}" alt="${name}" class="w-full h-40 object-cover rounded-md mb-3">
          <h3 class="font-semibold text-lg leading-6 hover:underline cursor-pointer" data-id="${id}">${name}</h3>
          <p class="text-sm text-slate-600 truncate-3">${desc}</p>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-xs bg-emerald-100 px-2 py-1 rounded">${category}</div>
            <div class="font-semibold">৳${price}</div>
          </div>
          <div class="mt-3">
            <button class="add-to-cart w-full bg-emerald-700 text-white py-2 rounded" data-id="${id}" data-name="${escapeHtml(name)}" data-price="${price}">Add to Cart</button>
          </div>
        `;
        treeContainer.appendChild(card);

        // name click -> modal
        card.querySelector('h3').addEventListener('click', () => openModalWithPlant(id));
        // add to cart
        card.querySelector('.add-to-cart').addEventListener('click', (e) => {
          const b = e.currentTarget;
          const pid = b.dataset.id;
          const pname = unescapeHtml(b.dataset.name);
          const pprice = Number(b.dataset.price) || 0;
          addToCart({ id: pid, name: pname, price: pprice });
        });
      });
    }

    // modal
    function openModalWithPlant(id) {
      if (!id) return;
      modalContent.innerHTML = '<div class="p-6 text-center">Loading...</div>';
      modal.classList.remove('hidden');
      fetch(PLANT_BY_ID(id))
        .then(res => res.json())
        .then(data => {
          const p = extractArray(data)[0] || data.data || data;
          const name = p.name || p.plant_name || p.title || 'No name';
          const img = p.image || p.image_url || p.thumbnail || 'https://via.placeholder.com/600x350?text=No+Image';
          const desc = p.description || p.details || p.about || 'No details available.';
          const price = p.price || p.cost || p.amount || 500;
          modalContent.innerHTML = `
         
            <div class="grid md:grid-cols-2 gap-4">
              <div><img src="${img}" alt="${name}" class="w-full h-60 object-cover rounded-md mb-3"></div>
              <div>
            
                <h2 class="text-xl font-bold mb-2">${name}</h2>
                
                <p class="text-sm text-slate-700 mb-3">${desc}</p>
                <div class="font-semibold mb-3">Price: ৳${price}</div>
               
              </div>
               <button class="bg-emerald-700 text-white px-4 py-2 rounded" id="modal-add">Add to Cart</button>
            </div>
            
            
          `;
          document.getElementById('modal-add').addEventListener('click', () => {
            addToCart({ id, name, price });
            closeModal();
          });
        })
        .catch(err => { modalContent.innerHTML = '<div class="p-6">Failed to load details.</div>'; console.error(err); });
    }

    function closeModal() { modal.classList.add('hidden'); modalContent.innerHTML = ''; }
    document.getElementById('modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // cart functions
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

    // form submit
    document.getElementById('plant-form').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks! Your request has been received.');
      e.target.reset();
    });

    // helpers for HTML attribute escaping
    function escapeHtml(text) { return String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
    function unescapeHtml(text) { return String(text).replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }

    // init
    loadCategory();
    loadAllPlants();