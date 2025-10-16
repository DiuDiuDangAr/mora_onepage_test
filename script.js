document.addEventListener('DOMContentLoaded', () => {
  const leadForm = document.querySelector('.lead-form');
  const successField = document.querySelector('.form__success');
  const floatingCta = document.querySelector('.floating-cta');
  const yearLabel = document.getElementById('year');

  if (yearLabel) yearLabel.textContent = new Date().getFullYear();

  const smoothScrollTo = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  };

  // ============================
  // 表單 submit (改用 Fetch API)
  // ============================
  if (leadForm && successField) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // 阻止表單預設提交行為
      
      // 顯示送出中
      successField.textContent = '資料送出中,請稍候...';
      successField.style.color = '#0066cc';

      try {
        // 收集表單資料
        const formData = new FormData(leadForm);
        const payload = {
          name: formData.get('name'),
          email: formData.get('email'),
          company: formData.get('company'),
          role: formData.get('role'),
          message: formData.get('message'),
          createdAt: new Date().toISOString(),
        };

        // 發送到 Apps Script
        const apiUrl = 'https://script.google.com/macros/s/AKfycby5H_9T5q_csMjUSJZn6-EriFVAbj2aEAZnbFKioPipl2HDpc7bDDC2yymOJn2OeuDm/exec';
        
        // 選用:如果啟用 API Key,加入 header
        const headers = {
          'Content-Type': 'application/json',
          // 'X-API-Key': 'mora_secret_key_2024' // 如果 Apps Script 啟用 API Key,取消註解
        };
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
          mode: 'cors' // 改用 cors 模式,因為我們已經設定好 CORS headers
        });
        
        // 檢查回應
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '提交失敗');
        }
        
        const result = await response.json();
        if (result.status !== 'success') {
          throw new Error(result.message || '提交失敗');
        }

        // 注意:no-cors 模式下無法讀取 response,但資料會送達
        successField.textContent = '✓ 已收到您的需求,顧問將於 24 小時內與您聯繫。';
        successField.style.color = '#059669';
        leadForm.reset();

        // localStorage 備份
        try {
          const stored = JSON.parse(localStorage.getItem('mora-leads') ?? '[]');
          stored.push(payload);
          localStorage.setItem('mora-leads', JSON.stringify(stored));
        } catch (error) {
          console.warn('無法儲存至 localStorage', error);
        }

        setTimeout(() => { 
          successField.textContent = ''; 
        }, 8000);

      } catch (error) {
        console.error('提交失敗:', error);
        successField.textContent = '❌ 提交失敗,請稍後再試或直接聯繫我們。';
        successField.style.color = '#dc2626';
        
        setTimeout(() => { 
          successField.textContent = ''; 
        }, 8000);
      }
    });
  }

  // ============================
  // Floating CTA
  // ============================
  if (floatingCta) {
    floatingCta.addEventListener('click', () => {
      const targetSelector = floatingCta.dataset.scroll ?? '#lead-form';
      smoothScrollTo(targetSelector);
    });
  }

  // ============================
  // Anchor smooth scroll
  // ============================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const hash = anchor.getAttribute('href');
      if (hash && hash.length > 1) {
        event.preventDefault();
        smoothScrollTo(hash);
      }
    });
  });
});
