// Dynamic section navigation for sticky diary layout
(function () {
  const isMobile = () => window.innerWidth <= 750;
  
  function initDesktopNavigation() {
    console.log('[Sticky Navigation] Initializing desktop navigation...');
    
    // Find all scroll anchors in order
    const anchors = Array.from(document.querySelectorAll('.scroll-anchor[id]'));
    console.log('[Sticky Navigation] Found', anchors.length, 'scroll anchors:', anchors.map(a => a.id));
    
    if (anchors.length === 0) {
      console.warn('[Sticky Navigation] No scroll anchors found.');
      return;
    }
    
    // Get all navigation button containers
    const navContainers = document.querySelectorAll('.next-button');
    console.log('[Sticky Navigation] Found', navContainers.length, 'navigation containers');
    
    let buttonsCreated = 0;
    
    navContainers.forEach((container, idx) => {
      // Find the closest scroll-anchor to determine current section
      let currentAnchor = container.closest('.column')?.querySelector('.scroll-anchor[id]');
      
      if (!currentAnchor) {
        const row = container.closest('.row');
        if (row) {
          currentAnchor = row.querySelector('.scroll-anchor[id]');
        }
      }
      
      if (!currentAnchor) {
        const mediaContainer = container.closest('.media-element-container');
        if (mediaContainer) {
          let prevElement = mediaContainer.previousElementSibling;
          while (prevElement) {
            const anchor = prevElement.querySelector?.('.scroll-anchor[id]') || 
                          (prevElement.classList?.contains('scroll-anchor') && prevElement.id ? prevElement : null) ||
                          (prevElement.querySelector ? prevElement.querySelector('.scroll-anchor[id]') : null);
            if (anchor) {
              currentAnchor = anchor;
              break;
            }
            prevElement = prevElement.previousElementSibling;
          }
        }
      }
      
      if (!currentAnchor) {
        console.warn('[Sticky Navigation] Container', idx, 'could not find associated scroll-anchor');
        return;
      }
      
      const currentIndex = anchors.indexOf(currentAnchor);
      if (currentIndex === -1) {
        console.warn('[Sticky Navigation] Anchor not in list:', currentAnchor.id);
        return;
      }
      
      console.log('[Sticky Navigation] Creating buttons for section', currentAnchor.id, '(index', currentIndex + ')');
      
      container.innerHTML = '';
      
      if (currentIndex > 0) {
        const backLink = document.createElement('a');
        backLink.className = 'button1';
        backLink.href = '#' + anchors[currentIndex - 1].id;
        backLink.textContent = 'Back';
        container.appendChild(backLink);
        buttonsCreated++;
        
        if (currentIndex < anchors.length - 1) {
          container.appendChild(document.createTextNode(' '));
        }
      }
      
      if (currentIndex < anchors.length - 1) {
        const nextLink = document.createElement('a');
        nextLink.className = 'button1';
        nextLink.href = '#' + anchors[currentIndex + 1].id;
        nextLink.textContent = 'Next';
        container.appendChild(nextLink);
        buttonsCreated++;
      }
    });
    
    console.log('[Sticky Navigation] Desktop navigation complete! Created', buttonsCreated, 'buttons');
  }
  
  function initMobileNavigation() {
    console.log('[Sticky Navigation] Initializing mobile navigation...');
    
    const anchors = Array.from(document.querySelectorAll('.scroll-anchor[id]'));
    if (anchors.length === 0) {
      console.warn('[Sticky Navigation] No scroll anchors found.');
      return;
    }
    
    // Hide ALL existing navigation containers
    const allNavContainers = document.querySelectorAll('.next-button');
    allNavContainers.forEach(container => {
      container.style.display = 'none';
    });
    
    // Create a new fixed navigation container at the bottom
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav-fixed';
    mobileNav.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 0.75rem 1rem;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0px -10px 39px -19px rgba(0,0,0,0.75);
    `;
    
    // Create Back button
    const backLink = document.createElement('a');
    backLink.className = 'button1';
    backLink.textContent = 'Back';
    backLink.style.cssText = `
      flex: 1;
      padding: 0.35em 1.2em;
      border: 0.1em solid #FFFFFF;
      border-radius: 0.12em;
      text-decoration: none;
      font-family: "Roboto", sans-serif;
      font-weight: bold;
      color: #a03c50;
      text-align: center;
      background: transparent;
    `;
    
    // Create Next button
    const nextLink = document.createElement('a');
    nextLink.className = 'button1';
    nextLink.textContent = 'Next';
    nextLink.style.cssText = `
      flex: 1;
      padding: 0.35em 1.2em;
      border: 0.1em solid #FFFFFF;
      border-radius: 0.12em;
      text-decoration: none;
      font-family: "Roboto", sans-serif;
      font-weight: bold;
      color: #a03c50;
      text-align: center;
      background: transparent;
    `;
    
    mobileNav.appendChild(backLink);
    mobileNav.appendChild(nextLink);
    document.body.appendChild(mobileNav);
    
    console.log('[Sticky Navigation] Mobile fixed navigation created');
    
    // Update button links based on scroll position
    let currentSectionIndex = 0;
    
    function updateButtons() {
      // Find which section is currently in view
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (let i = anchors.length - 1; i >= 0; i--) {
        const anchor = anchors[i];
        const rect = anchor.getBoundingClientRect();
        const anchorTop = window.scrollY + rect.top;
        
        if (scrollPosition >= anchorTop) {
          currentSectionIndex = i;
          break;
        }
      }
      
      // Update Back button - always show but disable on first section
      backLink.style.display = 'block';
      if (currentSectionIndex > 0) {
        backLink.href = '#' + anchors[currentSectionIndex - 1].id;
        backLink.style.opacity = '1';
        backLink.style.pointerEvents = 'auto';
        backLink.style.cursor = 'pointer';
      } else {
        backLink.href = '#';
        backLink.style.opacity = '0.5';
        backLink.style.pointerEvents = 'none';
        backLink.style.cursor = 'default';
      }
      
      // Update Next button - always show but disable on last section
      nextLink.style.display = 'block';
      if (currentSectionIndex < anchors.length - 1) {
        nextLink.href = '#' + anchors[currentSectionIndex + 1].id;
        nextLink.style.opacity = '1';
        nextLink.style.pointerEvents = 'auto';
        nextLink.style.cursor = 'pointer';
      } else {
        nextLink.href = '#';
        nextLink.style.opacity = '0.5';
        nextLink.style.pointerEvents = 'none';
        nextLink.style.cursor = 'default';
      }
      
      console.log('[Sticky Navigation] Current section:', currentSectionIndex, anchors[currentSectionIndex].id);
    }
    
    // Update on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateButtons, 100);
    });
    
    // Initial update
    updateButtons();
    
    console.log('[Sticky Navigation] Mobile navigation complete!');
  }
  
  function initNavigation() {
    if (isMobile()) {
      initMobileNavigation();
    } else {
      initDesktopNavigation();
    }
  }
  
  // Reinitialize on resize if switching between mobile/desktop
  let wasMobile = isMobile();
  window.addEventListener('resize', () => {
    const nowMobile = isMobile();
    if (wasMobile !== nowMobile) {
      wasMobile = nowMobile;
      initNavigation();
    }
  });
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    console.log('[Sticky Navigation] Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    console.log('[Sticky Navigation] DOM already loaded, initializing immediately');
    initNavigation();
  }
})();
