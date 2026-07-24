/**
 * Ajay Studio - Core Interactive Behaviors
 * Handles Gallery Filtering, Immersive Lightbox, Scroll Reveals, Nav Toggle & Forms
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. RESPONSIVE NAVIGATION MOBILE MENU
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const header = document.querySelector('.main-header');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            header.classList.toggle('menu-open');
        });

        // Close menu when clicking links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                header.classList.remove('menu-open');
            });
        });
    }


    // ==========================================
    // 2. SCROLL REVEAL EFFECT (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver support
        revealElements.forEach(el => el.classList.add('visible'));
    }


    // ==========================================
    // 3. DYNAMIC GALLERY FILTERING
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from other buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const filterValue = e.currentTarget.getAttribute('data-filter');

            galleryItems.forEach(item => {
                // Determine if item matches selection
                const matches = filterValue === 'all' || item.classList.contains(filterValue);
                
                if (matches) {
                    item.classList.remove('hide');
                    // Add subtle delay to visual entrance
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    // Delay adding the hide class to allow opacity transition
                    setTimeout(() => {
                        item.classList.add('hide');
                    }, 400);
                }
            });
        });
    });


    // ==========================================
    // 4. IMMERSIVE LIGHTBOX WITH EXIF DATA
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxLocation = document.getElementById('lightboxLocation');
    const lightboxDesc = document.getElementById('lightboxDesc');
    
    // EXIF Elements
    const exifCamera = document.getElementById('exifCamera');
    const exifLens = document.getElementById('exifLens');
    const exifAperture = document.getElementById('exifAperture');
    const exifShutter = document.getElementById('exifShutter');
    const exifIso = document.getElementById('exifIso');
    
    // Control Buttons
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentItemIndex = 0;
    let visibleGalleryItems = [];

    // Open Lightbox
    const openLightbox = (item) => {
        // Collect currently visible items for sliding behavior
        visibleGalleryItems = Array.from(galleryItems).filter(item => !item.classList.contains('hide'));
        currentItemIndex = visibleGalleryItems.indexOf(item);

        updateLightboxData(item);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop body scrolling
    };

    // Update Lightbox contents based on item node
    const updateLightboxData = (item) => {
        const src = item.getAttribute('data-src');
        const title = item.getAttribute('data-title');
        const category = item.getAttribute('data-category');
        const camera = item.getAttribute('data-camera');
        const lens = item.getAttribute('data-lens');
        const aperture = item.getAttribute('data-aperture');
        const shutter = item.getAttribute('data-shutter');
        const iso = item.getAttribute('data-iso');
        const location = item.getAttribute('data-location');
        const desc = item.getAttribute('data-desc');

        // Apply with fade transition effect
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImg.src = src;
            lightboxImg.alt = title;
            lightboxImg.style.opacity = '1';
        }, 150);

        lightboxCategory.textContent = category;
        lightboxTitle.textContent = title;
        lightboxLocation.textContent = `📍 ${location}`;
        lightboxDesc.textContent = desc;

        exifCamera.textContent = camera;
        exifLens.textContent = lens;
        exifAperture.textContent = aperture;
        exifShutter.textContent = shutter;
        exifIso.textContent = iso;
    };

    // Next / Previous logic
    const showNext = () => {
        if (visibleGalleryItems.length <= 1) return;
        currentItemIndex = (currentItemIndex + 1) % visibleGalleryItems.length;
        updateLightboxData(visibleGalleryItems[currentItemIndex]);
    };

    const showPrev = () => {
        if (visibleGalleryItems.length <= 1) return;
        currentItemIndex = (currentItemIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
        updateLightboxData(visibleGalleryItems[currentItemIndex]);
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    // Click listeners on items
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            openLightbox(item);
        });
    });

    // Close and Nav handlers
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNext);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

    // Click outside image modal to close
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            showNext();
        } else if (e.key === 'ArrowLeft') {
            showPrev();
        }
    });


    // ==========================================
    // 5. INTERACTIVE BOOKING & INQUIRY FORM
    // ==========================================
    const inquiryForm = document.getElementById('inquiryForm');
    const formSuccess = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (inquiryForm && formSuccess) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Add loading state
            inquiryForm.classList.add('submitting');
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) submitBtn.disabled = true;

            // Simulate form submission to backend
            setTimeout(() => {
                inquiryForm.classList.remove('submitting');
                formSuccess.classList.add('active');
                inquiryForm.reset();
                if (submitBtn) submitBtn.disabled = false;
            }, 1800);
        });

        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                formSuccess.classList.remove('active');
            });
        }
    }
});
