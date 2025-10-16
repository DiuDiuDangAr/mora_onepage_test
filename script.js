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
        const response = await fetch('https://script.google.com/macros/s/AKfycbzrcaEXTKWxoXdN_jNDk2ldbrr-F3S2oedCwgR-DS3zeB6UZ4_1xKODMseUGl-fdo7p/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          mode: 'no-cors' // 重要:因為 Apps Script 的 CORS 限制
        });

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
