/**
 * VH Studio - Core Interactive Behaviors
 * Includes 60-120fps Gliding Active Filter Indicator, Card Filtering Animations,
 * RequestAnimationFrame Count-up, 3D Tilt, Scroll-Spy Navigation & Lightbox.
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
        const duration = 1600;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
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
    triggerStatsAnimation();


    // ==========================================
    // 3. GLIDING ACTIVE FILTER INDICATOR & ANIMATED FILTERING
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const filterIndicator = document.getElementById('filterIndicator');
    const galleryFilters = document.getElementById('galleryFilters');

    const updateFilterIndicator = (activeBtn) => {
        if (!activeBtn || !filterIndicator || !galleryFilters) return;
        const filterRect = galleryFilters.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();

        const leftOffset = btnRect.left - filterRect.left + galleryFilters.scrollLeft;
        const width = btnRect.width;

        filterIndicator.style.transform = `translate3d(${leftOffset}px, 0, 0)`;
        filterIndicator.style.width = `${width}px`;
    };

    // Filter Buttons Click Listener
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            const activeBtn = e.currentTarget;
            activeBtn.classList.add('active');
            updateFilterIndicator(activeBtn);

            const filterValue = activeBtn.getAttribute('data-filter');

            // Animated Filter Execution
            let delayIndex = 0;
            galleryItems.forEach(item => {
                const matches = filterValue === 'all' || item.classList.contains(filterValue);
                
                if (matches) {
                    item.classList.remove('hide');
                    item.style.display = '';
                    
                    // Staggered smooth entrance
                    const currentDelay = delayIndex * 60;
                    delayIndex++;

                    setTimeout(() => {
                        window.requestAnimationFrame(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translate3d(0, 0, 0) scale(1)';
                            item.style.filter = 'blur(0px)';
                        });
                    }, currentDelay);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translate3d(0, 15px, 0) scale(0.94)';
                    item.style.filter = 'blur(4px)';
                    setTimeout(() => {
                        if (item.style.opacity === '0') {
                            item.classList.add('hide');
                        }
                    }, 300);
                }
            });
        });
    });

    // Initial Indicator Setup & Window Resize Listener
    const activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) {
        setTimeout(() => updateFilterIndicator(activeBtn), 120);
    }

    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.filter-btn.active');
        if (currentActive) updateFilterIndicator(currentActive);
    }, { passive: true });


    // ==========================================
    // 4. SUBTLE 3D CARD TILT MICRO-INTERACTION (60-120FPS)
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

                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }


    // ==========================================
    // 5. SCROLL REVEAL EFFECT (Intersection Observer)
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


    // ==========================================
    // 8. STORAGE & PORTAL DATA MANAGEMENT
    // ==========================================
    const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' };
    const DEFAULT_PUBLIC_PHOTOS = [
        {
            id: 'pub_1',
            title: 'Sacred Vows & Candlelight',
            category: 'wedding',
            categoryName: 'Wedding',
            src: 'assets/images/wedding_ceremony.png',
            camera: 'Canon EOS R5',
            lens: 'RF 85mm f/1.2L USM',
            aperture: 'f/1.4',
            shutter: '1/320s',
            iso: 'ISO 100',
            location: 'Napa Valley, CA',
            desc: 'An emotional exchange of vows under candlelit floral arches as golden hour light bathed the outdoor altar.'
        },
        {
            id: 'pub_2',
            title: 'Sunset Cliffside Serenade',
            category: 'prewedding',
            categoryName: 'Pre-Wedding',
            src: 'assets/images/pre_wedding_sunset.png',
            camera: 'Sony Alpha 7R V',
            lens: 'FE 35mm f/1.4 GM',
            aperture: 'f/1.8',
            shutter: '1/500s',
            iso: 'ISO 100',
            location: 'Big Sur, CA',
            desc: 'Cinematic pre-wedding couple portrait captured along dramatic cliffside trails overlooking the Pacific sunset.'
        },
        {
            id: 'pub_3',
            title: 'Grand Dance & Cold Sparklers',
            category: 'reception',
            categoryName: 'Reception',
            src: 'assets/images/reception_party.png',
            camera: 'Sony Alpha 7R V',
            lens: 'FE 24mm f/1.4 GM',
            aperture: 'f/2.0',
            shutter: '1/200s',
            iso: 'ISO 800',
            location: 'San Francisco Ballroom',
            desc: 'Magic on the dance floor surrounded by crystal chandeliers and cold sparklers for the couple\'s grand entrance.'
        },
        {
            id: 'pub_4',
            title: 'Festive Sangeet Celebration',
            category: 'events',
            categoryName: 'Special Events',
            src: 'assets/images/sangeet_event.png',
            camera: 'Fujifilm GFX 100S',
            lens: 'GF 50mm f/3.5',
            aperture: 'f/2.2',
            shutter: '1/250s',
            iso: 'ISO 640',
            location: 'Jaipur, India',
            desc: 'Dynamic celebration photography capturing high-energy dance performances and colorful festive drapes.'
        },
        {
            id: 'pub_5',
            title: 'Bridal Heirlooms & Rings',
            category: 'details',
            categoryName: 'Details',
            src: 'assets/images/wedding_details.png',
            camera: 'Canon EOS R5',
            lens: 'RF 100mm f/2.8L Macro',
            aperture: 'f/3.2',
            shutter: '1/160s',
            iso: 'ISO 200',
            location: 'Private Estate',
            desc: 'Macro artwork featuring platinum diamond wedding bands nestled among garden white roses and silk ribbons.'
        },
        {
            id: 'pub_6',
            title: 'Eternal Promise',
            category: 'wedding',
            categoryName: 'Wedding',
            src: 'assets/images/hero_wedding.png',
            camera: 'Sony Alpha 7R V',
            lens: 'FE 50mm f/1.2 GM',
            aperture: 'f/1.4',
            shutter: '1/1000s',
            iso: 'ISO 100',
            location: 'Lake Como, Italy',
            desc: 'A breathtaking couple portrait celebrating timeless luxury, quiet romance, and enduring devotion.'
        }
    ];

    const DEFAULT_CLIENT_ACCOUNTS = [
        {
            username: 'elena',
            password: 'wedding2025',
            name: 'Elena & Julian',
            event: 'Napa Valley Luxury Wedding • October 2025',
            photos: [
                { title: 'Sacred Ceremony Exchange', src: 'assets/images/wedding_ceremony.png' },
                { title: 'Sunset Promenade Shoot', src: 'assets/images/pre_wedding_sunset.png' },
                { title: 'First Dance & Sparkler Exit', src: 'assets/images/reception_party.png' },
                { title: 'Ring Heirloom Detail', src: 'assets/images/wedding_details.png' }
            ]
        }
    ];

    // Data Loaders
    const getAdminCreds = () => JSON.parse(localStorage.getItem('vh_admin_creds')) || DEFAULT_ADMIN;
    const saveAdminCreds = (creds) => localStorage.setItem('vh_admin_creds', JSON.stringify(creds));

    const getPublicPhotos = () => JSON.parse(localStorage.getItem('vh_public_photos')) || DEFAULT_PUBLIC_PHOTOS;
    const savePublicPhotos = (photos) => localStorage.setItem('vh_public_photos', JSON.stringify(photos));

    const getClientAccounts = () => JSON.parse(localStorage.getItem('vh_client_accounts')) || DEFAULT_CLIENT_ACCOUNTS;
    const saveClientAccounts = (accounts) => localStorage.setItem('vh_client_accounts', JSON.stringify(accounts));

    // Initialize LocalStorage if empty
    if (!localStorage.getItem('vh_admin_creds')) saveAdminCreds(DEFAULT_ADMIN);
    if (!localStorage.getItem('vh_public_photos')) savePublicPhotos(DEFAULT_PUBLIC_PHOTOS);
    if (!localStorage.getItem('vh_client_accounts')) saveClientAccounts(DEFAULT_CLIENT_ACCOUNTS);

    // ==========================================
    // 9. DYNAMIC PUBLIC PORTFOLIO RENDERER
    // ==========================================
    const renderPublicGrid = () => {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        const photos = getPublicPhotos();
        grid.innerHTML = photos.map((item, idx) => `
            <div class="gallery-item ${item.category} fade-in tilt-effect" data-index="${idx}" data-src="${item.src}" 
                 data-title="${item.title}" 
                 data-category="${item.categoryName || item.category}"
                 data-camera="${item.camera || 'N/A'}"
                 data-lens="${item.lens || 'N/A'}"
                 data-aperture="${item.aperture || 'N/A'}"
                 data-shutter="${item.shutter || 'N/A'}"
                 data-iso="${item.iso || 'N/A'}"
                 data-location="${item.location || 'Global'}"
                 data-desc="${item.desc || ''}">
                <div class="image-wrapper">
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="item-overlay">
                        <span class="view-badge">EXPAND</span>
                        <div class="item-details">
                            <span class="item-category">${(item.categoryName || item.category).toUpperCase()}</span>
                            <h3 class="item-title">${item.title}</h3>
                            <p class="item-loc">📍 ${item.location || 'Location'}</p>
                        </div>
                        <div class="item-exif">
                            <span>${item.lens ? item.lens.split(' ')[0] : 'Prime'}</span>
                            <span>${item.aperture || 'f/1.8'}</span>
                            <span>${item.shutter || '1/250s'}</span>
                            <span>${item.iso || 'ISO 100'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-bind Lightbox & Tilt Events for newly rendered cards
        const newGalleryItems = grid.querySelectorAll('.gallery-item');
        newGalleryItems.forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
        });

        if (!isTouchDevice) {
            newGalleryItems.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -6;
                    const rotateY = ((x - centerX) / centerX) * 6;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                });
            });
        }
    };

    renderPublicGrid();

    // ==========================================
    // 10. CLIENT PORTAL LOGIC
    // ==========================================
    const clientPortalNavBtn = document.getElementById('clientPortalNavBtn');
    const clientLoginModal = document.getElementById('clientLoginModal');
    const clientLoginClose = document.getElementById('clientLoginClose');
    const clientLoginForm = document.getElementById('clientLoginForm');
    const clientLoginError = document.getElementById('clientLoginError');
    const clientGalleryModal = document.getElementById('clientGalleryModal');
    const clientLogoutBtn = document.getElementById('clientLogoutBtn');

    if (clientPortalNavBtn) {
        clientPortalNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clientLoginModal.classList.add('active');
        });
    }

    if (clientLoginClose) {
        clientLoginClose.addEventListener('click', () => {
            clientLoginModal.classList.remove('active');
        });
    }

    if (clientLoginForm) {
        clientLoginModal.addEventListener('click', (e) => {
            if (e.target === clientLoginModal) clientLoginModal.classList.remove('active');
        });

        clientLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('clientUsernameInput').value.trim();
            const passwordInput = document.getElementById('clientPasswordInput').value.trim();

            const accounts = getClientAccounts();
            const account = accounts.find(acc => acc.username.toLowerCase() === usernameInput.toLowerCase() && acc.password === passwordInput);

            if (account) {
                clientLoginError.classList.remove('active');
                clientLoginModal.classList.remove('active');
                openClientGallery(account);
                clientLoginForm.reset();
            } else {
                clientLoginError.textContent = 'Invalid client username or password.';
                clientLoginError.classList.add('active');
            }
        });
    }

    const openClientGallery = (account) => {
        document.getElementById('clientGalleryName').textContent = account.name + "'s Private Gallery";
        document.getElementById('clientGallerySubtitle').textContent = account.event;

        const grid = document.getElementById('clientGalleryGrid');
        grid.innerHTML = (account.photos || []).map(photo => `
            <div class="client-photo-card tilt-effect">
                <img src="${photo.src}" alt="${photo.title}">
                <div class="client-photo-overlay">
                    <span class="client-photo-title">${photo.title}</span>
                    <a href="${photo.src}" download="${photo.title}.png" target="_blank" class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.4rem 0.8rem;">DOWNLOAD</a>
                </div>
            </div>
        `).join('');

        clientGalleryModal.classList.add('active');
    };

    if (clientLogoutBtn) {
        clientLogoutBtn.addEventListener('click', () => {
            clientGalleryModal.classList.remove('active');
        });
    }


    // ==========================================
    // 11. HIDDEN ADMIN PORTAL & DASHBOARD LOGIC
    // ==========================================
    const adminPortalFooterBtn = document.getElementById('adminPortalFooterBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginClose = document.getElementById('adminLoginClose');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginError = document.getElementById('adminLoginError');
    const adminDashboardModal = document.getElementById('adminDashboardModal');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    // Open Admin Login via Footer Link
    if (adminPortalFooterBtn) {
        adminPortalFooterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminLoginModal.classList.add('active');
        });
    }

    // Open Admin Login via Secret Shortcut: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            adminLoginModal.classList.add('active');
        }
    });

    if (adminLoginClose) {
        adminLoginClose.addEventListener('click', () => {
            adminLoginModal.classList.remove('active');
        });
    }

    // Admin Authentication
    if (adminLoginForm) {
        adminLoginModal.addEventListener('click', (e) => {
            if (e.target === adminLoginModal) adminLoginModal.classList.remove('active');
        });

        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userInput = document.getElementById('adminUsernameInput').value.trim();
            const passInput = document.getElementById('adminPasswordInput').value.trim();
            const adminCreds = getAdminCreds();

            if (userInput === adminCreds.username && passInput === adminCreds.password) {
                adminLoginError.classList.remove('active');
                adminLoginModal.classList.remove('active');
                adminDashboardModal.classList.add('active');
                renderAdminDashboard();
                adminLoginForm.reset();
            } else {
                adminLoginError.textContent = 'Invalid administrator credentials.';
                adminLoginError.classList.add('active');
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            adminDashboardModal.classList.remove('active');
        });
    }

    // Admin Navigation Tabs
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabPanes = document.querySelectorAll('.admin-tab-content .tab-pane');

    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            const pane = document.getElementById(`tab-${targetTab}`);
            if (pane) pane.classList.add('active');
        });
    });

    // Render Admin Dashboard Lists
    const renderAdminDashboard = () => {
        // Render Public Photos List
        const publicPhotos = getPublicPhotos();
        document.getElementById('publicPhotosCount').textContent = publicPhotos.length;

        const publicListEl = document.getElementById('adminPublicPhotosList');
        publicListEl.innerHTML = publicPhotos.map(photo => `
            <div class="admin-item-row">
                <img src="${photo.src}" class="admin-item-preview" alt="${photo.title}">
                <div class="admin-item-details">
                    <h4>${photo.title}</h4>
                    <p>Category: <strong>${(photo.categoryName || photo.category).toUpperCase()}</strong> • 📍 ${photo.location}</p>
                </div>
                <button class="btn-danger delete-public-btn" data-id="${photo.id}">DELETE</button>
            </div>
        `).join('');

        // Bind Delete Public Photo
        publicListEl.querySelectorAll('.delete-public-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const updated = getPublicPhotos().filter(p => p.id !== id);
                savePublicPhotos(updated);
                renderPublicGrid();
                renderAdminDashboard();
            });
        });

        // Render Client Accounts List
        const clientAccounts = getClientAccounts();
        document.getElementById('clientAccountsCount').textContent = clientAccounts.length;

        const selectClientAccount = document.getElementById('selectClientAccount');
        selectClientAccount.innerHTML = clientAccounts.map(acc => `<option value="${acc.username}">${acc.name} (${acc.event})</option>`).join('');

        const clientListEl = document.getElementById('adminClientAccountsList');
        clientListEl.innerHTML = clientAccounts.map(acc => `
            <div class="admin-item-row" style="flex-direction: column; align-items: flex-start; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <div>
                        <h4>${acc.name}</h4>
                        <p>${acc.event} | Username: <strong style="color:var(--accent-gold)">${acc.username}</strong> / Password: <strong style="color:var(--accent-gold)">${acc.password}</strong></p>
                    </div>
                    <button class="btn-danger delete-client-btn" data-username="${acc.username}">DELETE CLIENT</button>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Private Photos (${acc.photos ? acc.photos.length : 0}): 
                    ${(acc.photos || []).map((p, pIdx) => `<span style="display:inline-block; margin-right:8px; background:var(--bg-card); padding:2px 8px; border-radius:4px; border:1px solid var(--border-color); margin-top:4px;">${p.title} <a href="#" class="del-client-photo" data-user="${acc.username}" data-index="${pIdx}" style="color:#f87171; margin-left:4px;">&times;</a></span>`).join('')}
                </div>
            </div>
        `).join('');

        // Bind Delete Client Account
        clientListEl.querySelectorAll('.delete-client-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const uname = btn.getAttribute('data-username');
                const updated = getClientAccounts().filter(a => a.username !== uname);
                saveClientAccounts(updated);
                renderAdminDashboard();
            });
        });

        // Bind Delete Specific Client Photo
        clientListEl.querySelectorAll('.del-client-photo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const uname = btn.getAttribute('data-user');
                const pIdx = parseInt(btn.getAttribute('data-index'), 10);
                const accounts = getClientAccounts();
                const targetAcc = accounts.find(a => a.username === uname);
                if (targetAcc && targetAcc.photos) {
                    targetAcc.photos.splice(pIdx, 1);
                    saveClientAccounts(accounts);
                    renderAdminDashboard();
                }
            });
        });
    };

    // Form: Add New Public Photo
    const addPublicPhotoForm = document.getElementById('addPublicPhotoForm');
    if (addPublicPhotoForm) {
        addPublicPhotoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('pubTitle').value.trim();
            const category = document.getElementById('pubCategory').value;
            const categoryName = document.getElementById('pubCategory').options[document.getElementById('pubCategory').selectedIndex].text;
            const location = document.getElementById('pubLocation').value.trim();
            let src = document.getElementById('pubImgUrl').value.trim();
            const fileInput = document.getElementById('pubImgFile');
            const camera = document.getElementById('pubCamera').value.trim() || 'Sony Alpha 7R V';
            const lens = document.getElementById('pubLens').value.trim() || 'FE 50mm f/1.2 GM';
            const desc = document.getElementById('pubDesc').value.trim();

            const processSave = (imageSrc) => {
                const photos = getPublicPhotos();
                photos.unshift({
                    id: 'pub_' + Date.now(),
                    title,
                    category,
                    categoryName,
                    location,
                    src: imageSrc || 'assets/images/wedding_ceremony.png',
                    camera,
                    lens,
                    aperture: 'f/1.4',
                    shutter: '1/250s',
                    iso: 'ISO 100',
                    desc
                });
                savePublicPhotos(photos);
                renderPublicGrid();
                renderAdminDashboard();
                addPublicPhotoForm.reset();
            };

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => processSave(event.target.result);
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                processSave(src);
            }
        });
    }

    // Form: Create New Client Account
    const createClientForm = document.getElementById('createClientForm');
    if (createClientForm) {
        createClientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('newClientName').value.trim();
            const event = document.getElementById('newClientEvent').value.trim();
            const username = document.getElementById('newClientUser').value.trim();
            const password = document.getElementById('newClientPass').value.trim();

            const accounts = getClientAccounts();
            if (accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
                alert('Client username already exists. Please choose another username.');
                return;
            }

            accounts.push({
                name,
                event,
                username,
                password,
                photos: []
            });

            saveClientAccounts(accounts);
            renderAdminDashboard();
            createClientForm.reset();
        });
    }

    // Form: Add Photo to Client Account
    const addClientPhotoForm = document.getElementById('addClientPhotoForm');
    if (addClientPhotoForm) {
        addClientPhotoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedUsername = document.getElementById('selectClientAccount').value;
            const caption = document.getElementById('clientPhotoTitle').value.trim();
            let src = document.getElementById('clientPhotoUrl').value.trim();
            const fileInput = document.getElementById('clientPhotoFile');

            const processSaveClientPhoto = (imageSrc) => {
                const accounts = getClientAccounts();
                const acc = accounts.find(a => a.username === selectedUsername);
                if (acc) {
                    if (!acc.photos) acc.photos = [];
                    acc.photos.push({
                        title: caption,
                        src: imageSrc || 'assets/images/wedding_ceremony.png'
                    });
                    saveClientAccounts(accounts);
                    renderAdminDashboard();
                    addClientPhotoForm.reset();
                }
            };

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => processSaveClientPhoto(event.target.result);
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                processSaveClientPhoto(src);
            }
        });
    }

    // Form: Change Admin Security Credentials
    const changeAdminCredsForm = document.getElementById('changeAdminCredsForm');
    const updateAdminStatus = document.getElementById('updateAdminStatus');
    if (changeAdminCredsForm) {
        changeAdminCredsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newAdminUser = document.getElementById('updateAdminUser').value.trim();
            const newAdminPass = document.getElementById('updateAdminPass').value.trim();

            saveAdminCreds({ username: newAdminUser, password: newAdminPass });
            updateAdminStatus.textContent = 'Admin credentials updated successfully!';
            updateAdminStatus.style.color = '#34d399';
            updateAdminStatus.classList.add('active');

            setTimeout(() => {
                updateAdminStatus.classList.remove('active');
            }, 3000);
        });
    }
});
