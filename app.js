// 全局状态管理
let allRecipes = [];
let currentCategory = 'all';
let searchQuery = '';

// 获取页面 DOM 元素
const recipeGrid = document.getElementById('recipe-grid');
const categoryItems = document.querySelectorAll('.nav-item');
const searchInput = document.getElementById('search-input');
const sectionTitle = document.getElementById('section-title');
const modal = document.getElementById('details-modal');
const modalBody = document.querySelector('.modal-body');
const closeBtn = document.querySelector('.close-btn');

// 1. 初始化程序：从 JSON 文件获取数据
async function fetchRecipes() {
    try {
        const response = await fetch('recipes.json');
        if (!response.ok) throw new Error('无法加载菜谱数据');
        allRecipes = await response.json();

        // 首页默认不显示 hidden:true 的隐藏菜谱
        renderRecipes(allRecipes.filter(r => !r.hidden)); 
    } catch (error) {
        recipeGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">加载失败: ${error.message}</p>`;
    }
}

// 2. 动态生成菜谱卡片组件
function renderRecipes(recipes) {
    if (!recipeGrid) return;
    recipeGrid.innerHTML = ''; 
    
    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999; padding: 40px;">暂无符合当前筛选条件的菜谱数据</p>';
        return;
    }

    recipes.forEach(recipe => {
        const starRating = '★'.repeat(recipe.difficulty) + '☆'.repeat(3 - recipe.difficulty);
        
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${recipe.image}" alt="${recipe.name}" class="card-image" onerror="this.src='https://via.placeholder.com/300x180?text=${recipe.name}'">
            </div>
            <div class="card-info">
                <h3 class="card-title">${recipe.name}</h3>
                <div class="card-meta">
                    <span>厨id: ${recipe.author}</span>
                    <span>时间: ${recipe.uploadTime}</span>
                </div>
                <div class="card-footer">
                    <span>难度: <span class="stars">${starRating}</span></span>
                    <span style="color:#f4b057; font-weight:bold;">查看详细做法 →</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openDetailModal(recipe));
        recipeGrid.appendChild(card);
    });
}

// 3. 组合过滤与搜索过滤逻辑
function filterAndSearch() {
    let filtered = allRecipes;
    const rawQuery = searchQuery.trim();
    const query = rawQuery.toLowerCase();

    // 隐藏菜谱机制：
    // 普通情况下 hidden:true 的菜谱不会出现在首页、分类页或普通搜索结果里。
    // 只有当用户准确搜索签约主厨的厨 id 时，才显示该主厨的隐藏菜谱。
    const matchedChefId = rawQuery !== '' ? allRecipes.find(r =>
        r.hidden === true &&
        r.chefId &&
        r.chefId.toLowerCase() === query
    )?.chefId : null;

    if (matchedChefId) {
        filtered = allRecipes.filter(r =>
            r.hidden === true &&
            r.chefId &&
            r.chefId.toLowerCase() === query
        );

        if (sectionTitle) {
            sectionTitle.textContent = `签约主厨 ${matchedChefId} 的菜谱`;
        }

        renderRecipes(filtered);
        return;
    }

    // 非厨 id 搜索时，隐藏菜谱全部排除
    filtered = filtered.filter(r => !r.hidden);

    if (currentCategory !== 'all') {
        filtered = filtered.filter(r => r.category === currentCategory);
    }

    if (rawQuery !== '') {
        filtered = filtered.filter(r =>
            r.name.toLowerCase().includes(query) ||
            r.ingredients.some(i => i.toLowerCase().includes(query))
        );
    }

    renderRecipes(filtered);
}

// 4. 事件监听器设置
if (categoryItems.length > 0) {
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            currentCategory = item.getAttribute('data-category');

            if (sectionTitle) {
                sectionTitle.textContent = currentCategory === 'all' ? '今日推荐菜谱' : `${currentCategory} 精选`;
            }

            filterAndSearch();
        });
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterAndSearch();
    });
}

// 5. 详情弹窗逻辑
function openDetailModal(recipe) {
    if (!modal || !modalBody) return;

    const starRating = '★'.repeat(recipe.difficulty) + '☆'.repeat(3 - recipe.difficulty);
    const ingredientsHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join('');
    const instructionsHTML = recipe.instructions.map(step => `<li>${step}</li>`).join('');

    modalBody.innerHTML = `
        <h2>${recipe.name}</h2>
        <p style="color:#777; font-size:14px; margin-bottom:10px;">
            分类: ${recipe.category} | 难度: <span style="color:#ffbe1a">${starRating}</span> | 厨 id: ${recipe.author} | 时间: ${recipe.uploadTime}
            ${recipe.chefId ? ` | 厨 id: ${recipe.chefId}` : ''}
        </p>

        <img src="${recipe.image}" alt="${recipe.name}" class="modal-img" onerror="this.src='https://via.placeholder.com/600x250?text=${recipe.name}'">
        
        <div class="modal-section">
            <h3>所需食材</h3>
            <ul>${ingredientsHTML}</ul>
        </div>
        
        <div class="modal-section">
            <h3>详细做法流程</h3>
            <ol>${instructionsHTML}</ol>
        </div>
    `;

    modal.style.display = 'flex';
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
}

window.addEventListener('click', (e) => { 
    if (modal && e.target === modal) modal.style.display = 'none'; 
});

// ================= 🔄 首页大图自动轮播逻辑 =================
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const container = document.querySelector('.carousel-container');
    
    if (slides.length === 0 || !prevBtn || !nextBtn || !container) return;

    let currentIndex = 0;
    let timer = null;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextSlide() {
        let next = (currentIndex + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        let prev = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    function startTimer() {
        timer = setInterval(nextSlide, 3000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    nextBtn.addEventListener('click', () => { 
        stopTimer(); 
        nextSlide(); 
        startTimer(); 
    });

    prevBtn.addEventListener('click', () => { 
        stopTimer(); 
        prevSlide(); 
        startTimer(); 
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { 
            stopTimer(); 
            showSlide(index); 
            startTimer(); 
        });
    });

    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', startTimer);

    startTimer();
}

// 启动执行
fetchRecipes();
initCarousel();