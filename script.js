// ============================================
// Advanced Web Development Documentation Portal
// Interactive JavaScript Functionality
// ============================================

// ==================== Constants & Configuration ====================
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'webdev-docs-theme',
        PROGRESS: 'webdev-docs-progress',
        VISITED_SECTIONS: 'webdev-docs-visited'
    },
    THEMES: {
        DARK: 'dark-theme',
        LIGHT: 'light-theme'
    },
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 100
};

// ==================== State Management ====================
const state = {
    currentTheme: 'dark-theme',
    visitedSections: new Set(),
    currentSection: 'introduction',
    isSidebarOpen: false,
    searchResults: []
};

// ==================== DOM Elements ====================
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarClose: document.getElementById('sidebarClose'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.section'),
    
    // Search
    searchInput: document.getElementById('searchInput'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    
    // Progress
    progressBar: document.getElementById('progressBar'),
    completedSections: document.getElementById('completedSections'),
    totalSections: document.getElementById('totalSections'),
    progressPercentage: document.getElementById('progressPercentage'),
    
    // Main Content
    mainContent: document.getElementById('mainContent')
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Web Dev Documentation Portal Initialized');
    
    initializeTheme();
    initializeNavigation();
    initializeSearch();
    initializeExpandables();
    initializeScrollAnimations();
    initializeProgressTracking();
    initializeSidebar();
    loadUserProgress();
    
    // Set total sections count
    elements.totalSections.textContent = elements.sections.length;
});

// ==================== Theme Management ====================
function initializeTheme() {
    // Load saved theme or use default
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.THEMES.DARK;
    state.currentTheme = savedTheme;
    document.body.className = savedTheme;
    updateThemeIcon();
    
    // Theme toggle event listener
    elements.themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    state.currentTheme = state.currentTheme === CONFIG.THEMES.DARK 
        ? CONFIG.THEMES.LIGHT 
        : CONFIG.THEMES.DARK;
    
    document.body.className = state.currentTheme;
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, state.currentTheme);
    updateThemeIcon();
    
    // Add animation effect
    elements.themeToggle.style.transform = 'scale(1.2) rotate(360deg)';
    setTimeout(() => {
        elements.themeToggle.style.transform = '';
    }, CONFIG.ANIMATION_DURATION);
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = state.currentTheme === CONFIG.THEMES.DARK ? '🌙' : '☀️';
}

// ==================== Navigation System ====================
function initializeNavigation() {
    // Add click handlers to navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Handle URL hash on load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        scrollToSection(targetId);
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    
    // Update active state
    elements.navLinks.forEach(link => link.classList.remove('active'));
    this.classList.add('active');
    
    // Scroll to section
    scrollToSection(targetId);
    
    // Update URL
    history.pushState(null, null, `#${targetId}`);
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    // Mark section as visited
    markSectionVisited(targetId);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - CONFIG.SCROLL_OFFSET;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        state.currentSection = sectionId;
    }
}

function updateActiveNavLink() {
    let currentSection = '';
    
    elements.sections.forEach(section => {
        const sectionTop = section.offsetTop - CONFIG.SCROLL_OFFSET - 50;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    if (currentSection && currentSection !== state.currentSection) {
        state.currentSection = currentSection;
        
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
        
        markSectionVisited(currentSection);
    }
}

// ==================== Search Functionality ====================
function initializeSearch() {
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm.length === 0) {
        clearSearch();
        return;
    }
    
    // Filter navigation items
    elements.navLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        const listItem = link.parentElement;
        
        if (text.includes(searchTerm)) {
            listItem.style.display = 'block';
            highlightSearchTerm(link, searchTerm);
        } else {
            listItem.style.display = 'none';
        }
    });
    
    // Search in content (basic implementation)
    searchInContent(searchTerm);
}

function highlightSearchTerm(element, term) {
    // Simple highlight implementation
    const text = element.textContent;
    const regex = new RegExp(`(${term})`, 'gi');
    
    // Store original text if not already stored
    if (!element.dataset.originalText) {
        element.dataset.originalText = text;
    }
}

function searchInContent(term) {
    // This is a simplified content search
    // In a production app, this would be more sophisticated
    const allCards = document.querySelectorAll('.card');
    let resultsCount = 0;
    
    allCards.forEach(card => {
        const content = card.textContent.toLowerCase();
        if (content.includes(term)) {
            resultsCount++;
            card.style.opacity = '1';
        } else {
            card.style.opacity = '0.3';
        }
    });
    
    state.searchResults = resultsCount;
}

function clearSearch() {
    elements.searchInput.value = '';
    
    // Reset navigation items
    elements.navLinks.forEach(link => {
        link.parentElement.style.display = 'block';
        if (link.dataset.originalText) {
            link.textContent = link.dataset.originalText;
        }
    });
    
    // Reset content opacity
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.style.opacity = '1';
    });
    
    state.searchResults = [];
}

// ==================== Expandable Cards ====================
function initializeExpandables() {
    const expandables = document.querySelectorAll('.expandable');
    
    expandables.forEach(card => {
        const header = card.querySelector('.card-header') || card.querySelector('.faq-question');
        if (header && !header.hasAttribute('data-initialized')) {
            header.setAttribute('data-initialized', 'true');
        }
    });
}

// Global toggle function (called from HTML onclick)
window.toggleExpand = function(element) {
    const card = element.closest('.card') || element.closest('.faq-card');
    const isExpanded = card.classList.contains('expanded');
    
    if (isExpanded) {
        card.classList.remove('expanded');
    } else {
        card.classList.add('expanded');
    }
    
    // Animate icon rotation
    const icon = card.querySelector('.expand-icon');
    if (icon) {
        icon.style.transition = 'transform 0.3s ease';
    }
};

// ==================== Scroll Animations ====================
function initializeScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.animation = 'fadeIn 0.8s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all sections
    elements.sections.forEach(section => {
        observer.observe(section);
    });
    
    // Observe cards for stagger effect
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// ==================== Progress Tracking ====================
function initializeProgressTracking() {
    // Scroll progress bar
    window.addEventListener('scroll', updateScrollProgress);
    
    // Section completion tracking
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const sectionId = entry.target.getAttribute('id');
                markSectionVisited(sectionId);
            }
        });
    }, {
        threshold: 0.5
    });
    
    elements.sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

function updateScrollProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = (scrollTop / documentHeight) * 100;
    
    elements.progressBar.style.width = `${scrollPercentage}%`;
}

function markSectionVisited(sectionId) {
    if (!state.visitedSections.has(sectionId)) {
        state.visitedSections.add(sectionId);
        updateProgressDisplay();
        saveUserProgress();
    }
}

function updateProgressDisplay() {
    const completedCount = state.visitedSections.size;
    const totalCount = elements.sections.length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    
    elements.completedSections.textContent = completedCount;
    elements.progressPercentage.textContent = `${percentage}%`;
    
    // Animate the update
    animateNumber(elements.completedSections, completedCount);
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = target > current ? 1 : -1;
    
    if (current !== target) {
        const interval = setInterval(() => {
            const newValue = parseInt(element.textContent) + increment;
            element.textContent = newValue;
            
            if (newValue === target) {
                clearInterval(interval);
            }
        }, 50);
    }
}

// ==================== Sidebar Management ====================
function initializeSidebar() {
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (elements.sidebarClose) {
        elements.sidebarClose.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && state.isSidebarOpen) {
            if (!elements.sidebar.contains(e.target) && 
                !elements.sidebarToggle.contains(e.target)) {
                closeSidebar();
            }
        }
    });
}

function toggleSidebar() {
    state.isSidebarOpen = !state.isSidebarOpen;
    
    if (state.isSidebarOpen) {
        elements.sidebar.classList.add('active');
    } else {
        elements.sidebar.classList.remove('active');
    }
}

function closeSidebar() {
    state.isSidebarOpen = false;
    elements.sidebar.classList.remove('active');
}

// ==================== Local Storage Management ====================
function saveUserProgress() {
    const progress = {
        visitedSections: Array.from(state.visitedSections),
        lastVisited: new Date().toISOString()
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

function loadUserProgress() {
    const savedProgress = localStorage.getItem(CONFIG.STORAGE_KEYS.PROGRESS);
    
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            state.visitedSections = new Set(progress.visitedSections || []);
            updateProgressDisplay();
            
            console.log(`📊 Loaded progress: ${state.visitedSections.size} sections visited`);
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

// ==================== Utility Functions ====================

// Throttle function for performance optimization
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// Debounce function for search
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ==================== Additional Interactive Features ====================

// Add scroll-to-top button functionality
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(button);
    
    button.addEventListener('click', scrollToTop);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
}

// Initialize scroll-to-top button
createScrollToTopButton();

// ==================== Keyboard Navigation ====================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.searchInput.focus();
    }
    
    // Escape to close sidebar on mobile
    if (e.key === 'Escape' && state.isSidebarOpen) {
        closeSidebar();
    }
    
    // Arrow keys for navigation
    if (e.altKey) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateSection('prev');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateSection('next');
        }
    }
});

function navigateSection(direction) {
    const currentIndex = Array.from(elements.sections).findIndex(
        section => section.id === state.currentSection
    );
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % elements.sections.length;
    } else {
        newIndex = currentIndex - 1 < 0 ? elements.sections.length - 1 : currentIndex - 1;
    }
    
    const newSection = elements.sections[newIndex];
    if (newSection) {
        scrollToSection(newSection.id);
    }
}

// ==================== Copy Code Functionality ====================
function initializeCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-example');
    
    codeBlocks.forEach(block => {
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '📋 Copy';
        copyButton.setAttribute('aria-label', 'Copy code');
        
        copyButton.addEventListener('click', () => {
            const code = block.querySelector('code').textContent;
            copyToClipboard(code);
            
            // Visual feedback
            copyButton.innerHTML = '✅ Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '📋 Copy';
            }, 2000);
        });
        
        block.style.position = 'relative';
        block.appendChild(copyButton);
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Initialize code blocks
initializeCodeBlocks();

// ==================== Analytics & Tracking (Placeholder) ====================
function trackPageView(sectionId) {
    // Placeholder for analytics
    console.log(`📈 Page view: ${sectionId}`);
}

function trackInteraction(action, label) {
    // Placeholder for interaction tracking
    console.log(`🎯 Interaction: ${action} - ${label}`);
}

// ==================== Performance Monitoring ====================
function measurePerformance() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`⚡ Page load time: ${loadTime}ms`);
        });
    }
}

measurePerformance();

// ==================== Export State (for debugging) ====================
window.appState = state;
window.appConfig = CONFIG;

// ==================== Service Worker Registration (Optional) ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('✅ Service Worker registered'))
        //     .catch(err => console.log('❌ Service Worker registration failed:', err));
    });
}

// ==================== Easter Eggs & Fun Features ====================
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    // Fun animation
    document.body.style.animation = 'rainbow 2s ease infinite';
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
    
    console.log('🎉 Easter egg activated!');
}

// ==================== Responsive Utilities ====================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close sidebar on desktop
        if (window.innerWidth > 768 && state.isSidebarOpen) {
            closeSidebar();
        }
        
        console.log('📱 Window resized');
    }, 250);
});

// ==================== Accessibility Enhancements ====================
function enhanceAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#mainContent';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Announce page changes for screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'announcer';
    document.body.appendChild(announcer);
}

enhanceAccessibility();

function announce(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
        announcer.textContent = message;
    }
}

// ==================== Final Setup ====================
console.log(`
╔═══════════════════════════════════════════╗
║  Web Development Documentation Portal    ║
║  Status: ✅ Fully Loaded                 ║
║  Sections: ${elements.sections.length}                            ║
║  Theme: ${state.currentTheme}                    ║
╚═══════════════════════════════════════════╝
`);

// Log helpful keyboard shortcuts
console.log(`
⌨️  Keyboard Shortcuts:
- Ctrl/Cmd + K: Focus search
- Alt + ↑/↓: Navigate sections
- Escape: Close sidebar/clear search
`);

// ==================== Export Public API ====================
window.WebDevDocs = {
    scrollToSection,
    toggleTheme,
    clearSearch,
    state,
    config: CONFIG
};
