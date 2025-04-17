// Ad Preview Live Update

document.addEventListener('DOMContentLoaded', function () {
    const headlineInput = document.getElementById('ad-headline');
    const descInput = document.getElementById('ad-desc');
    const imgUrlInput = document.getElementById('ad-img-url');
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
        const url = imgUrlInput.value.trim();
        if (url) {
            previewImage.style.backgroundImage = `url('${url}')`;
            previewImage.textContent = '';
        } else {
            previewImage.style.backgroundImage = '';
            previewImage.textContent = '\uD83C\uDF33'; // tree emoji fallback
        }
    }

    [headlineInput, descInput, imgUrlInput, ctaInput, linkInput].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Initialize with defaults
    updatePreview();
});
