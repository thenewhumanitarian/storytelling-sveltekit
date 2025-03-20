<footer>
	<div class="torn-paper torn-paper--bottom"></div>
	<div class="left">
		<h1>The Lebanon Displacement Diaries</h1>
	</div>
</footer>

<style>
	footer {
		position: relative;
		background-color: black;
		box-shadow: 0px -10px 30px rgba(0, 0, 0, 0.2);
		padding: 5rem 3rem 3rem 3rem;
		/* margin-top: 5rem; */
	}
	.left {
		left: 2.5rem;
	}
	.left h1 {
		font-size: 4rem;
		width: 300px;
		font-size: 4rem;
		line-height: 0.875;
		margin-bottom: 2rem;
		letter-spacing: -2px;
		color: #ebe4cb;
		border-left: 6px solid #ebe4cb;
		padding-left: 1rem;
		/* line-height: 1; */
		/* color: #F8CD4D; */
	}
	@media screen and (max-width: 640px) {
		.left h1 {
			font-size: 2.3rem !important;
			width: 100%;
			line-height: 1;
			margin: 0;
		}
	}
	:global(.torn-paper--bottom) {
		position: absolute;
		height: 5rem;
		overflow: hidden;
		top: -5rem;
		background-image: url('/assets/ldd/patterns/torn-paper--bottom@2x.png');
		background-size: contain;
	}
</style>
