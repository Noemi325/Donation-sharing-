// =======================================================
// 1. 全域變數和輔助函式
// =======================================================

const ITEM_STORAGE_KEY = 'donatedItems';
// 設定最大捐贈項目數量上限為 100
const MAX_ITEMS = 100; 

const donationForm = document.getElementById('donation-form');
const itemImageInput = document.getElementById('itemImage');
const imagePreviewDiv = document.getElementById('imagePreview');
const itemListDiv = document.getElementById('item-list');
const successModal = document.getElementById('success-modal');
const modalClose = document.getElementById('modalClose');
const modalBack = document.getElementById('modalBack');
const modalGoto = document.getElementById('modalGoto'); 
const allFilters = document.querySelectorAll('.filters button'); 

// 儲存最新的 Base64 圖片數據
let currentBase64Image = null; 

/**
 * 從 localStorage 讀取所有捐贈項目
 * @returns {Array} 捐贈項目列表
 */
function getItems() {
    const data = localStorage.getItem(ITEM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 將項目列表儲存到 localStorage
 * @param {Array} items 項目列表
 */
function saveItems(items) {
    // 這裡我們假設 localStorage 還有足夠空間，因為我們有 MAX_ITEMS 限制
    localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

// =======================================================
// 2. 渲染邏輯：將儲存的項目顯示在頁面上
// =======================================================

function renderItems(items) {
    if (!itemListDiv) return;
    itemListDiv.innerHTML = '';
    
    if (items.length === 0) {
        itemListDiv.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #888;">目前沒有可用的捐贈項目。</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('item-card');
        
        const imageUrl = item.image ? item.image : 'placeholder.jpg'; 
        
        card.innerHTML = `
            <div class="item-image-wrap">
                <img src="${imageUrl}" alt="${item.itemName}" class="item-image" />
            </div>
            <div class="item-info">
                <h4>${item.itemName} (${item.condition})</h4>
                <p>分類: <strong>${item.category}</strong></p>
                <p class="item-description">${item.description.substring(0, 50)}...</p>
            </div>
        `;
        itemListDiv.appendChild(card);
    });
}

// =======================================================
// 3. 實時圖片預覽功能 (Image Preview)
// =======================================================

if (itemImageInput && imagePreviewDiv) {
    itemImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; 
        currentBase64Image = null; 

        if (file) {
            imagePreviewDiv.innerHTML = '';
            
            if (!file.type.startsWith('image/')) {
                imagePreviewDiv.innerHTML = '<p class="error-text">請上傳有效的圖片檔案。</p>';
                return;
            }

            const reader = new FileReader();
            
            reader.onload = function(e) {
                currentBase64Image = e.target.result; 

                const img = document.createElement('img');
                img.src = currentBase64Image;
                img.alt = "Item Preview";
                img.classList.add('preview-image'); 
                
                imagePreviewDiv.appendChild(img);
            };
            
            reader.readAsDataURL(file);
        } else {
            imagePreviewDiv.innerHTML = '';
        }
    });
}


// =======================================================
// 4. 表單提交與數據儲存邏輯 (Form Submission and Storage)
// =======================================================

if (donationForm) {
    donationForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        
        const items = getItems();

        // 檢查數量是否達到上限 (100 個)
        if (items.length >= MAX_ITEMS) {
            alert(`已達到捐贈上限（${MAX_ITEMS} 個項目）。無法新增項目。`);
            return;
        }

        // 從表單中獲取數據
        const formData = new FormData(donationForm);
        
        // 🚨 修正：如果圖片還在讀取中，強制彈出警告
     if (itemImageInput.files.length > 0 && !currentBase64Image) {
    alert("請等待圖片載入完成後再提交。");
    return;
}

        const newItem = {
            id: Date.now(), 
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            condition: formData.get('condition'),
            description: formData.get('description'),
            tags: formData.get('tags'),
            featured: formData.get('featured') === 'yes',
            image: currentBase64Image // 使用 Base64 圖片
        };

        // 儲存項目
        items.unshift(newItem); 
        saveItems(items);
        
        // 顯示成功模態視窗
        if (successModal) {
            successModal.style.display = 'flex'; 
        }

        // 🚨 修正連續提交問題：使用延遲重設
        setTimeout(() => {
            donationForm.reset();
            imagePreviewDiv.innerHTML = '';
            currentBase64Image = null;
        }, 100); 
        
        // 更新列表
        renderItems(items);
    });
}

// =======================================================
// 5. 模態視窗處理 (Modal Handling)
// =======================================================

if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (successModal) successModal.style.display = 'none';
    });
}

if (modalBack) {
    modalBack.addEventListener('click', () => {
        if (successModal) successModal.style.display = 'none';
    });
}

// 點擊 Modal 外部時關閉
window.addEventListener('click', (event) => {
    if (successModal && event.target == successModal) {
        successModal.style.display = 'none';
    }
});

// =======================================================
// 6. 頁面初始化
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 初始渲染項目列表
    renderItems(getItems());

    // 滾動效果 (Navbar)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const stickyNav = () => {
            if (window.scrollY > 150) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        };
        window.addEventListener('scroll', stickyNav);
    }
    
    // 滾動漸入效果 
    const fadeInElements = document.querySelectorAll('.fade-in');
    
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    };

    const options = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver(observerCallback, options);

    fadeInElements.forEach(el => {
        el.classList.add('invisible'); 
        observer.observe(el);
    });

    // 篩選功能 (Placeholder)
    if (allFilters.length > 0) {
        allFilters.forEach(button => {
            button.addEventListener('click', (e) => {
                allFilters.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
});
