// Auto-sync Impressions & Price fields and update ad preview

document.addEventListener('DOMContentLoaded', function() {
  const impressionsInput = document.getElementById('ad-impressions');
  const priceInput = document.getElementById('ad-price');
  const minImpressions = 200;
  const minPrice = 1;
  const impressionsStep = 200;
  const priceStep = 1;

  // Prevent infinite loop
  let updating = false;

  // Impressions -> Price
  impressionsInput.addEventListener('input', function() {
    if (updating) return;
    updating = true;
    let impressions = parseInt(impressionsInput.value, 10) || minImpressions;
    if (impressions < minImpressions) impressions = minImpressions;
    impressions = Math.round(impressions / impressionsStep) * impressionsStep;
    impressionsInput.value = impressions;
    let price = Math.ceil((impressions / 200) * 1 / priceStep) * priceStep;
    if (price < minPrice) price = minPrice;
    priceInput.value = price;
    updating = false;
  });

  // Price -> Impressions
  priceInput.addEventListener('input', function() {
    if (updating) return;
    updating = true;
    let price = parseInt(priceInput.value, 10) || minPrice;
    if (price < minPrice) price = minPrice;
    price = Math.round(price / priceStep) * priceStep;
    priceInput.value = price;
    let impressions = Math.ceil((price / 1) * 200 / impressionsStep) * impressionsStep;
    if (impressions < minImpressions) impressions = minImpressions;
    impressionsInput.value = impressions;
    updating = false;
  });

  // Live Ad Preview
  const headlineInput = document.getElementById('ad-headline');
  const descInput = document.getElementById('ad-desc');
  const imgInput = document.getElementById('ad-img-url');
  const ctaInput = document.getElementById('ad-cta');
  const linkInput = document.getElementById('ad-link');

  const previewHeadline = document.getElementById('ad-preview-headline');
  const previewDesc = document.getElementById('ad-preview-desc');
  const previewImage = document.getElementById('ad-preview-image');
  const previewCTA = document.getElementById('ad-preview-cta');

  function updatePreview() {
    previewHeadline.textContent = headlineInput.value || 'Your Ad Headline';
    previewDesc.textContent = descInput.value || 'Short description';
    previewCTA.textContent = ctaInput.value || 'Learn More';
    previewCTA.href = linkInput.value || '#';
    if (imgInput.value) {
      previewImage.style.backgroundImage = `url('${imgInput.value}')`;
      previewImage.style.backgroundSize = 'cover';
      previewImage.style.backgroundPosition = 'center';
      previewImage.style.borderRadius = '12px';
      previewImage.style.width = '48px';
      previewImage.style.height = '48px';
    } else {
      previewImage.style.backgroundImage = '';
      previewImage.style.background = 'rgba(126,217,87,0.12)';
      previewImage.style.width = '48px';
      previewImage.style.height = '48px';
      previewImage.style.borderRadius = '12px';
    }
  }

  headlineInput.addEventListener('input', updatePreview);
  descInput.addEventListener('input', updatePreview);
  imgInput.addEventListener('input', updatePreview);
  ctaInput.addEventListener('input', updatePreview);
  linkInput.addEventListener('input', updatePreview);

  updatePreview(); // Initial preview

  // Handle form submission to backend/Stripe
  const adForm = document.getElementById('ad-submit-form');
  adForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
      headline: headlineInput.value,
      description: descInput.value,
      image_url: imgInput.value,
      cta: ctaInput.value,
      ad_link: linkInput.value,
      impressions: impressionsInput.value,
      price: priceInput.value
    };
    try {
      const response = await fetch('http://localhost:4242/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        alert('Error creating payment session. Please try again.');
      }
    } catch (err) {
      alert('Could not connect to payment server. Please try again.');
    }
  });
});
