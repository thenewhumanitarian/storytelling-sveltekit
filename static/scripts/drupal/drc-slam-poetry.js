document.addEventListener('DOMContentLoaded', function () {
	// Change republish this article text to republish this investigation
	// document.querySelector('.article__republish-btn').innerText = 'Republish this investigation'
	// Add label to top saying "Slam Poetry"
	// Create a new div
	let labelDiv = document.createElement('div');
	labelDiv.style.position = 'relative';
	labelDiv.style.background = '#EEDF24';
	// Add the desired class to the new div
	labelDiv.classList.add('header-label--slam-poetry');
	// Create a new paragraph and set its styles and content
	let labelParagraph = document.createElement('p');
	labelParagraph.innerText = 'Slam Poetry';
	// Append the paragraph to the new div
	labelDiv.appendChild(labelParagraph);
	// Select the .article__overview container
	let container = document.querySelector('.article__overview');
	// Insert the new div as the first child of the container
	if (container.firstChild) {
		container.insertBefore(labelDiv, container.firstChild);
	} else {
		container.appendChild(labelDiv);
	}
});