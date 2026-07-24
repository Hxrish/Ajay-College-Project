/**
 * Ajay Studio - Core Interactive Behaviors
 * Includes 60-120fps RequestAnimationFrame Count-up, Subtle 3D Card Tilt,
 * Scroll-Spy Navigation, Gallery Filtering & Lightbox Modal.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. RESPONSIVE NAVIGATION & SCROLL SPY
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const header = document.getElementById('mainHeader');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (menuToggle && navMenu && header) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            header.classList.toggle('menu-open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                header.classList.remove('menu-open');
            });
        });
    }

    // Smooth scroll for internal hash links with header offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active Nav Highlight on Scroll (Scroll Spy)
    const highlightNavOnScroll = () => {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ==========================================
    // 2. 60-120FPS REQUESTANIMATIONFRAME COUNT-UP
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-num');
    let animatedStats = false;

    const animateCountUp = (element, target) => {
        let startTimestamp = null;
        const duration = 1600; // ms

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function: easeOutCubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * target);
            
            element.textContent = currentVal;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = target;
            }
        };

        window.requestAnimationFrame(step);
    };

    const triggerStatsAnimation = () => {
        const statsSection = document.getElementById('heroStats');
        if (!statsSection || animatedStats) return;

        const rect = statsSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            animatedStats = true;
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
                animateCountUp(stat, target);
            });
        }
    };

    window.addEventListener('scroll', triggerStatsAnimation, { passive: true });
    // Trigger on load if already in viewport
    triggerStatsAnimation();


    // ==========================================
    // 3. SUBTLE 3D CARD TILT MICRO-INTERACTION (60-120FPS)
    // ==========================================
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        const tiltCards = document.querySelectorAll('.tilt-effect');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -6; // Max 6deg tilt
                const rotateY = ((x - centerX) / centerX) * 6;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }


    // ==========================================
    // 4. SCROLL REVEAL EFFECT (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }


    // ==========================================
    // 5. DYNAMIC GALLERY FILTERING
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const filterValue = e.currentTarget.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const matches = filterValue === 'all' || item.classList.contains(filterValue);
                
                if (matches) {
                    item.classList.remove('hide');
                    item.style.opacity = '1';
                    item.style.transform = 'translate3d(0, 0, 0)';
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });


    // ==========================================
    // 6. IMMERSIVE LIGHTBOX MODAL WITH EXIF DATA
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

    const openLightbox = (item) => {
        visibleGalleryItems = Array.from(galleryItems).filter(i => !i.classList.contains('hide'));
        currentItemIndex = visibleGalleryItems.indexOf(item);
        if (currentItemIndex < 0) currentItemIndex = 0;

        updateLightboxData(visibleGalleryItems[currentItemIndex]);
        if (lightbox) {
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const updateLightboxData = (item) => {
        if (!item) return;

        const src = item.getAttribute('data-src') || '';
        const title = item.getAttribute('data-title') || 'Untitled';
        const category = item.getAttribute('data-category') || 'Photography';
        const camera = item.getAttribute('data-camera') || 'N/A';
        const lens = item.getAttribute('data-lens') || 'N/A';
        const aperture = item.getAttribute('data-aperture') || 'N/A';
        const shutter = item.getAttribute('data-shutter') || 'N/A';
        const iso = item.getAttribute('data-iso') || 'N/A';
        const location = item.getAttribute('data-location') || 'Global';
        const desc = item.getAttribute('data-desc') || '';

        if (lightboxImg) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = src;
                lightboxImg.alt = title;
                lightboxImg.style.opacity = '1';
            }, 120);
        }

        if (lightboxCategory) lightboxCategory.textContent = category;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxLocation) lightboxLocation.textContent = `📍 ${location}`;
        if (lightboxDesc) lightboxDesc.textContent = desc;

        if (exifCamera) exifCamera.textContent = camera;
        if (exifLens) exifLens.textContent = lens;
        if (exifAperture) exifAperture.textContent = aperture;
        if (exifShutter) exifShutter.textContent = shutter;
        if (exifIso) exifIso.textContent = iso;
    };

    const showNext = () => {
        visibleGalleryItems = Array.from(galleryItems).filter(i => !i.classList.contains('hide'));
        if (visibleGalleryItems.length <= 1) return;
        currentItemIndex = (currentItemIndex + 1) % visibleGalleryItems.length;
        updateLightboxData(visibleGalleryItems[currentItemIndex]);
    };

    const showPrev = () => {
        visibleGalleryItems = Array.from(galleryItems).filter(i => !i.classList.contains('hide'));
        if (visibleGalleryItems.length <= 1) return;
        currentItemIndex = (currentItemIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
        updateLightboxData(visibleGalleryItems[currentItemIndex]);
    };

    const closeLightbox = () => {
        if (lightbox) lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    galleryItems.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNext);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrev();
    });


    // ==========================================
    // 7. SERVICE BUTTON QUICK SELECT & FORM SUBMIT
    // ==========================================
    const projectTypeSelect = document.getElementById('projectType');
    const serviceButtons = document.querySelectorAll('.service-btn');

    serviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectValue = btn.getAttribute('data-select');
            if (selectValue && projectTypeSelect) {
                projectTypeSelect.value = selectValue;
            }
        });
    });

    const inquiryForm = document.getElementById('inquiryForm');
    const formSuccess = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (inquiryForm && formSuccess) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            inquiryForm.classList.add('submitting');
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) submitBtn.disabled = true;

            setTimeout(() => {
                inquiryForm.classList.remove('submitting');
                formSuccess.classList.add('active');
                inquiryForm.reset();
                if (submitBtn) submitBtn.disabled = false;
            }, 1200);
        });

        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                formSuccess.classList.remove('active');
            });
        }
    }
});
