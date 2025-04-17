// Ad for Good Modal Interactivity

document.addEventListener('DOMContentLoaded', function () {
    const openBtn = document.getElementById('ad-get-started');
    const modalOverlay = document.getElementById('ad-modal-overlay');
    const closeBtn = document.getElementById('ad-modal-close');

    if (openBtn && modalOverlay && closeBtn) {
        openBtn.addEventListener('click', function () {
            modalOverlay.classList.add('active');
            modalOverlay.setAttribute('aria-hidden', 'false');
            closeBtn.focus();
        });
        closeBtn.addEventListener('click', function () {
            modalOverlay.classList.remove('active');
            modalOverlay.setAttribute('aria-hidden', 'true');
        });
        // Close modal on overlay click (not modal box)
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
                modalOverlay.setAttribute('aria-hidden', 'true');
            }
        });
        // ESC key closes modal
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                modalOverlay.classList.remove('active');
                modalOverlay.setAttribute('aria-hidden', 'true');
            }
        });
    }
});
