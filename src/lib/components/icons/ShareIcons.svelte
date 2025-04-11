<script>
	let showIcons = false;

	function toggleShare() {
		showIcons = !showIcons;
	}
</script>

<div class="share-icons flex items-center justify-center gap-2">
	<!-- Share label only on mobile when icons are hidden -->
	<button
		class="block cursor-pointer text-black text-sm sm:hidden"
		onclick={toggleShare}
		class:hidden={showIcons}
	>
		Share
	</button>
	<!-- BlueSky -->
	<div class={`flex items-center gap-2 ${showIcons ? 'block' : 'hidden'} sm:flex`}>
		<a
			class="text-black hover:text-burgundy"
			href="#"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share on BlueSky"
			title="Share on BlueSky"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 63 63"
				fill="none"
				class="inline h-full w-auto"
			>
				<path
					class="fill-current transition-colors duration-500"
					d="M14.4393 6.76949C21.5475 12.2437 29.1931 23.3431 32.0002 29.2997C34.8075 23.3436 42.4527 12.2436 49.561 6.76949C54.6899 2.81951 63 -0.236753 63 9.48845C63 11.4307 61.9145 25.8044 61.2778 28.1379C59.0647 36.2508 51.0004 38.3201 43.827 37.0677C56.3659 39.2569 59.5557 46.5083 52.667 53.7597C39.584 67.5316 33.8629 50.3043 32.3963 45.8901C32.1276 45.0808 32.0018 44.7022 32 45.0241C31.9981 44.7022 31.8724 45.0808 31.6037 45.8901C30.1377 50.3043 24.4167 67.5321 11.333 53.7597C4.44419 46.5083 7.63385 39.2564 20.173 37.0677C12.9994 38.3201 4.93495 36.2508 2.7222 28.1379C2.08551 25.8042 1 11.4305 1 9.48845C1 -0.236753 9.3103 2.81951 14.439 6.76949H14.4393Z"
					fill="black"
				/>
			</svg>
		</a>
		<!-- LinkedIn -->
		<a
			class="text-black hover:text-burgundy"
			href="#"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share on LinkedIn"
			title="Share on LinkedIn"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 38 38"
				fill="none"
				class="inline h-full w-auto pb-1"
			>
				<g clip-path="url(#clip0_236_2262)">
					<g clip-path="url(#clip1_236_2262)">
						<path
							d="M8.60456 4.96093C8.60456 7.20374 6.94686 9.02186 4.2215 9.02186C1.65769 9.02186 0 7.20374 0 4.96093C0 2.71811 1.71037 0.899994 4.33037 0.899994C6.95037 0.899994 8.55188 2.66195 8.60456 4.96093ZM0.214236 38.3434V12.2229H8.33764V38.3434H0.214236Z"
							class="fill-current transition-colors duration-500"
						/>
						<path
							d="M13.1976 20.5553C13.1976 17.2981 13.0923 14.5745 12.9834 12.2228H20.0391L20.4149 15.8556H20.5765C21.6441 14.1463 24.2641 11.6367 28.6472 11.6367C33.9926 11.6367 37.9998 15.2168 37.9998 22.9069V38.3434H29.8764V23.8686C29.8764 20.5026 28.6999 18.2072 25.7603 18.2072C23.5161 18.2072 22.1815 19.755 21.5915 21.2502C21.3772 21.7837 21.3246 22.5314 21.3246 23.279V38.3399H13.2011V20.5518L13.1976 20.5553Z"
							class="fill-current transition-colors duration-500"
						/>
					</g>
				</g>
			</svg>
		</a>
		<!-- WhatsApp -->
		<a
			class="text-black hover:text-burgundy"
			href="#"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share on WhatsApp"
			title="Share on WhatsApp"
		>
			<svg class="pt-0.5" xmlns="http://www.w3.org/2000/svg"
				><path
					class="fill-current transition-colors duration-500"
					d="M17.078 2.928A9.928 9.928 0 0 0 10.01 0C4.505 0 .024 4.479.022 9.985a9.962 9.962 0 0 0 1.333 4.992L0 20l5.233-1.237a9.981 9.981 0 0 0 4.773 1.216h.004c5.506 0 9.987-4.48 9.99-9.985a9.921 9.921 0 0 0-2.922-7.066Zm-2.18 10.626c-.207.583-1.226 1.145-1.684 1.186-.458.042-.887.207-2.995-.624-2.538-1-4.14-3.601-4.264-3.767-.125-.167-1.019-1.353-1.019-2.581s.645-1.832.874-2.081a.916.916 0 0 1 .666-.312c.166 0 .333 0 .478.006.178.007.375.016.562.431.222.494.707 1.728.77 1.853.061.125.103.271.02.437-.083.166-.125.27-.249.416-.125.146-.262.325-.374.437-.125.124-.255.26-.11.509.146.25.646 1.067 1.388 1.728.954.85 1.758 1.113 2.008 1.239.25.125.395.104.54-.063.147-.166.625-.728.79-.978.167-.25.334-.208.563-.125.229.083 1.456.687 1.705.812.25.125.416.187.478.291.062.103.062.603-.146 1.186Z"
				/></svg
			>
		</a>
		<!-- Email -->
		<a
			class="text-black hover:text-burgundy opacity-0 sm:opacity-100"
			href="#"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share via Email"
			title="Share via Email"
		>
			<svg
				class="pt-0.75"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 100 100"
				style="enable-background:new 0 0 100 100"
				xml:space="preserve"
				><path
					d="M8 971.4c-2.2 0-4 1.8-4 4v54c0 2.2 1.8 4 4 4h84c2.2 0 4-1.8 4-4v-54c0-2.2-1.8-4-4-4H8zm6.6 6h70.9L50 1010.3l-35.4-32.9zm-4.6 3.9 38 35.2c1.1 1.1 2.9 1.1 4.1 0l38-35.2v46.1H10v-46.1z"
					class="fill-current transition-colors duration-500"
					transform="translate(0 -952.362)"
				/></svg
			>
		</a>
	</div>
</div>

<style>
	.share-icons a {
		height: 100%;
		width: auto;
	}
	.share-icons a svg {
		width: 20px;
		height: 24px;
	}
</style>
