<!--
	"Here's what we bring": the four project points, each with a small white line icon.
	Shared by the landing page and the About box on the wall, so the text and look stay in step.
-->
<ul class="points">
	<li>
		<svg viewBox="0 0 24 24" aria-hidden="true"
			><path d="M3.5 20.5h17" /><path d="M5.5 20.5v-6M9 20.5v-10M12.5 20.5v-4" /><circle
				cx="17.5"
				cy="8"
				r="2.5"
			/><path d="M14 20.5v-1.5a3.5 3.5 0 0 1 7 0v1.5" /></svg
		>
		<span>
			<strong>Data and human stories, together.</strong> Bringing data and evidence together with first-hand
			accounts from affected communities.
		</span>
	</li>
	<li>
		<svg viewBox="0 0 24 24" aria-hidden="true"
			><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path
				d="M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5Z"
			/><circle cx="16.8" cy="7.6" r="1.6" fill="currentColor" stroke="none" /></svg
		>
		<span>
			<strong>Beyond the headline wars.</strong> Most research focuses on a few high-profile conflicts.
			We draw on our reporting from crises that rarely make the news.
		</span>
	</li>
	<li>
		<svg viewBox="0 0 24 24" aria-hidden="true"
			><path d="M4 20.5h16" /><path d="M12 20.5v-8" /><path
				d="M12 13.5c0-3.3-2.4-5.5-6-5.5 0 3.3 2.4 5.5 6 5.5Z"
			/><path d="M12 11c0-3.6 2.6-6 6.5-6 0 3.6-2.6 6-6.5 6Z" /></svg
		>
		<span>
			<strong>Beyond carbon.</strong> We look at the harms that outlast the fighting: poisoned water,
			ruined farmland, displacement and land left unusable for years.
		</span>
	</li>
	<li>
		<svg viewBox="0 0 24 24" aria-hidden="true"
			><circle cx="12" cy="5.5" r="2.2" /><circle cx="5.5" cy="17.5" r="2.2" /><circle
				cx="18.5"
				cy="17.5"
				r="2.2"
			/><path d="M10.9 7.4 6.6 15.6M13.1 7.4l4.3 8.2M7.7 17.5h8.6" /></svg
		>
		<span>
			<strong>Convening expertise across disciplines and regions.</strong> Evidence and expertise do not
			consistently reach across sectors, leaving the wider consequences of conflict poorly understood.
			We bring actors together to show what we know, what remains unknown and where action is most needed.
		</span>
	</li>
</ul>

<style>
	.points {
		display: grid;
		gap: 0.9rem;
		margin: 1.1rem 0 0;
		padding: 0;
		list-style: none;
	}
	/* Each point starts with a small white line icon, in the thin style of the header icons. */
	li {
		display: grid;
		grid-template-columns: 1.75rem minmax(0, 1fr);
		gap: 0.8rem;
		align-items: start;
	}
	svg {
		width: 1.75rem;
		height: 1.75rem;
		margin-top: -0.05rem;
		fill: none;
		stroke: #fff;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		color: #fff;
	}
	strong {
		color: #fff;
	}
</style>
