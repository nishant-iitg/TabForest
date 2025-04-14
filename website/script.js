// Initialize AOS with optimized settings
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    disable: 'mobile',
    easing: 'ease-out'
});

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

const handleScroll = () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scrolled');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scrolled')) {
        navbar.classList.remove('scrolled');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scrolled')) {
        navbar.classList.add('scrolled');
    }
    lastScroll = currentScroll;
};

window.addEventListener('scroll', debounce(handleScroll, 100));

// Smooth scrolling with active navigation
const navLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll('section');

const updateActiveLink = () => {
    const scrollPosition = window.pageYOffset + 50;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const id = section.getAttribute('id');
            const link = document.querySelector(`a[href="#${id}"]`);
            
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            if (link) {
                link.classList.add('active');
            }
        }
    });
};

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update active link immediately
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            link.classList.add('active');
        }
    });
});

// Intersection Observer for lazy loading
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, {
        threshold: 0.1
    });
    
    images.forEach(img => observer.observe(img));
};

// Initialize lazy loading
lazyLoadImages();

// Add loading state to buttons
const buttons = document.querySelectorAll('button, .primary-btn, .secondary-btn');

const addLoadingState = (button) => {
    button.classList.add('loading');
    setTimeout(() => {
        button.classList.remove('loading');
    }, 2000);
};

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('primary-btn') || e.target.classList.contains('secondary-btn')) {
            addLoadingState(e.target);
        }
    });
});

// Mobile menu toggle
const mobileMenu = () => {
    const navLinks = document.querySelector('.nav-links');
    const burger = document.createElement('button');
    burger.className = 'burger-menu';
    burger.setAttribute('aria-label', 'Toggle navigation menu');
    burger.innerHTML = '<i class="fas fa-bars"></i>';
    
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
    });
    
    document.querySelector('.navbar .container').prepend(burger);
};

// Initialize mobile menu on smaller screens
if (window.innerWidth <= 768) {
    mobileMenu();
}

// Resize event listener
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const burger = document.querySelector('.burger-menu');
        if (burger) burger.remove();
    }
});

// Add parallax effect to hero section
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
});

// Feature card animations
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(1.2) rotate(10deg)';
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(1) rotate(0)';
    });
});

// Stat card animations
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const number = this.querySelector('.stat-number');
        number.style.transform = 'scale(1.2)';
    });
    
    card.addEventListener('mouseleave', function() {
        const number = this.querySelector('.stat-number');
        number.style.transform = 'scale(1)';
    });
});

// Browser button animations
const browserButtons = document.querySelectorAll('.browser-btn');
browserButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(1.2)';
    });
    
    button.addEventListener('mouseleave', function() {
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(1)';
    });
});
