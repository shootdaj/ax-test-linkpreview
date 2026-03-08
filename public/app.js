document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('preview-form');
  const urlInput = document.getElementById('url-input');
  const submitBtn = document.getElementById('submit-btn');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const errorMessage = document.getElementById('error-message');
  const previewCard = document.getElementById('preview-card');
  const cardLink = document.getElementById('card-link');
  const cardImageContainer = document.getElementById('card-image-container');
  const cardImage = document.getElementById('card-image');
  const cardFavicon = document.getElementById('card-favicon');
  const cardDomain = document.getElementById('card-domain');
  const cardTitle = document.getElementById('card-title');
  const cardDescription = document.getElementById('card-description');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    showLoading();
    hideError();
    hidePreview();

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch preview');
      }

      showPreview(data);
    } catch (err) {
      showError(err.message);
    } finally {
      hideLoading();
    }
  });

  function showLoading() {
    loading.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading...';
  }

  function hideLoading() {
    loading.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Preview';
  }

  function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
  }

  function hideError() {
    error.classList.add('hidden');
  }

  function showPreview(data) {
    // Set link
    cardLink.href = data.url;

    // Set image
    if (data.image) {
      cardImage.src = data.image;
      cardImage.alt = data.title || 'Preview image';
      cardImageContainer.classList.remove('hidden');

      // Hide image container if image fails to load
      cardImage.onerror = () => {
        cardImageContainer.classList.add('hidden');
      };
    } else {
      cardImageContainer.classList.add('hidden');
    }

    // Set favicon
    if (data.favicon) {
      cardFavicon.src = data.favicon;
      cardFavicon.onerror = () => {
        cardFavicon.style.display = 'none';
      };
      cardFavicon.style.display = '';
    } else {
      cardFavicon.style.display = 'none';
    }

    // Set text content
    cardDomain.textContent = data.domain || '';
    cardTitle.textContent = data.title || data.url;
    cardDescription.textContent = data.description || '';

    // Show/hide description
    if (!data.description) {
      cardDescription.style.display = 'none';
    } else {
      cardDescription.style.display = '';
    }

    previewCard.classList.remove('hidden');
  }

  function hidePreview() {
    previewCard.classList.add('hidden');
  }
});
