document.addEventListener('DOMContentLoaded', function () {
	// Add label to top saying "Slam Poetry"
	// let labelDiv = document.createElement('div');
	// labelDiv.style.position = 'relative';
	// labelDiv.style.background = '#EEDF24';
	// labelDiv.classList.add('header-label--slam-poetry');
	
	// let labelParagraph = document.createElement('p');
	// labelParagraph.innerText = 'Slam Poetry';
	// labelDiv.appendChild(labelParagraph);
	
	// let container = document.querySelector('.article__overview');
	// if (container.firstChild) {
	// 	container.insertBefore(labelDiv, container.firstChild);
	// } else {
	// 	container.appendChild(labelDiv);
	// }

	// Language toggle functionality for videos
	function initializeVideoToggles() {
		const videoContainers = document.querySelectorAll('.margin-break[data-video-fr][data-video-en]');
		
		videoContainers.forEach(container => {
			const iframe = container.querySelector('iframe');
			if (!iframe) return;
			
			// Get video IDs from data attributes
			const videoEn = container.getAttribute('data-video-en');
			const videoFr = container.getAttribute('data-video-fr');
			
			// Find the language toggle buttons for this video
			const toggleContainer = container.nextElementSibling;
			if (!toggleContainer || !toggleContainer.classList.contains('video-language-toggle')) {
				return;
			}
			
			const enButton = toggleContainer.querySelector('.lang-btn-en');
			const frButton = toggleContainer.querySelector('.lang-btn-fr');
			
			if (!enButton || !frButton) return;
			
			// Set default to English
			loadVideo(iframe, videoEn);
			
			// Add click event listeners
			enButton.addEventListener('click', function() {
				loadVideo(iframe, videoEn);
				setActiveButton(enButton, frButton);
			});
			
			frButton.addEventListener('click', function() {
				loadVideo(iframe, videoFr);
				setActiveButton(frButton, enButton);
			});
		});
	}
	
	function loadVideo(iframe, videoId) {
		const newSrc = `https://www.youtube.com/embed/${videoId}?si=_GH_gvRbaBIs3QAl`;
		iframe.src = newSrc;
	}
	
	function setActiveButton(activeBtn, inactiveBtn) {
		activeBtn.classList.add('active');
		inactiveBtn.classList.remove('active');
	}
	
	// Initialize video toggles
	initializeVideoToggles();
});