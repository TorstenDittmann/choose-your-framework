<script lang="ts">
	import Appwrite from "./appwrite";
	import Chart from "svelte-frappe-charts";

	import { onMount } from "svelte";
	import { votes, history, notifications } from "./store";
	import Toast from "./Toast.svelte";
	import logoAngular from "./assets/Angular.svg";
	import logoReact from "./assets/React.svg";
	import logoSvelte from "./assets/Svelte.svg";
	import logoVue from "./assets/Vue.svg";

	let voted: string;

	const sdk = Appwrite();
	sdk.setEndpoint("https://appwrite-realtime.monitor-api.com/v1");
	sdk.setProject("6053363c00af7");
	const votesUnsubscribe = sdk.subscribe(
		"collections.60533a4bec463.documents",
		(message) => {
			const data = [message.payload];
			votes.update(data.reduce(voteReducer, {}));
		}
	);
	sdk.subscribe("collections.60533681b159f.documents", (message) => {
		const data = [message.payload];
		history.update(data.reduce(historyReducer, {}));
	});
	const colors = ["#dd1b16", "#61dbfb", "#ff3b00", "#42b883"];
	const logos = {
		Angular: logoAngular,
		React: logoReact,
		Svelte: logoSvelte,
		Vue: logoVue,
	};
	const voteReducer = (acc, doc) => {
		return {
			...acc,
			[doc.name]: doc.votes,
		};
	};
	const historyReducer = (acc, doc) => {
		return {
			...acc,
			[doc.framework]: doc.data ?? new Array(10).fill(0),
		};
	};
	const upvote = async (framework) => {
		if (voted) {
			return;
		}
		voted = framework;
		const request = await fetch(
			location.origin + "/api/upvote?framework=" + framework
		);
		await request.json();
	};
	$: graphVotes = {
		labels: Object.keys($votes),
		datasets: [
			{
				values: Object.values($votes),
			},
		],
	};
	$: graphHistory = {
		labels: ["10m", "9m", "8m", "7m", "6m", "5m", "4m", "3m", "2m", "1m"],
		datasets: Object.entries($history).map(([key, values]) => {
			return {
				name: key,
				values: values ?? new Array(10).fill(0),
			};
		}),
	};
	$: {
		if (voted) {
			setTimeout(() => (voted = null), 1500);
		}
	}
	onMount(async () => {
		const historyDocs = await sdk.database.listDocuments("60533681b159f");
		const votesDocs = await sdk.database.listDocuments("60533a4bec463");

		votes.update(votesDocs.documents.reduce(voteReducer, {}), true);
		history.update(historyDocs.documents.reduce(historyReducer, {}));

		setTimeout(votesUnsubscribe, 10000);
	});
</script>

<main>
	<h1>Choose your Framework</h1>
	<div class="frameworks">
		{#each Object.entries($votes) as [framework, votes]}
			<div
				on:click={() => upvote(framework)}
				class:voted={voted === framework}
			>
				<img src={logos[framework]} alt={framework} />
				<p>{votes}</p>
				<h1>+1</h1>
			</div>
		{/each}
	</div>
	<Chart
		height={80}
		data={graphVotes}
		type="percentage"
		maxSlices={4}
		{colors}
	/>

	<h1>History</h1>
	<Chart {colors} data={graphHistory} type="line" />
	<h1>About</h1>
	<p>
		This page serves as an example of the upcoming real-time feature for
		Appwrite. The realtime feature on Appwrite lets you listen to all
		server-side events from Appwrite and gets the associated payload
		delivered in realtime via WebSockets. For example, the client can
		receive all changes to a document in real time and thus always have the
		most current version of the document without further REST queries.
	</p>
	<p>Powered by <a href="https://appwrite.io">Appwrite</a></p>
	<a href="https://appwrite.io">
		<img
			class="appwrite"
			src="https://appwrite.io/images-ee/press/logo-1.png"
			alt="Appwrite Logo"
		/>
	</a>
	<div class="message-box">
		{#each $notifications as notification}
			<Toast>
				{notification.label}
			</Toast>
		{/each}
	</div>
</main>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Poppins&display=swap");
	:root {
		font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI",
			Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
			sans-serif;
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 800px;
		margin: 0 auto;
	}
	h1 {
		color: #f02e65;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	p {
		font-weight: 300;
		line-height: 1.5;
	}
	main .frameworks {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 200px;
		gap: 0px 0px;
		grid-template-areas: ". . . .";
	}
	main .frameworks div {
		cursor: pointer;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 100%;
		transition: all 0.2s;
		user-select: none;
	}
	main .frameworks div h1 {
		display: none;
	}
	main .frameworks div.voted p,
	main .frameworks div.voted img {
		display: none;
	}
	main .frameworks div.voted h1 {
		display: unset;
		transform: scale(0.5);
		animation-name: voted;
		animation-iteration-count: infinite;
		animation-duration: 1.5s;
	}
	main .frameworks div img {
		height: 5rem;
		transition: height 0.2s;
	}
	main .frameworks div:hover p {
		display: none;
	}
	main .frameworks div:hover img {
		height: 10rem;
	}
	img.appwrite {
		width: 12rem;
	}
	.message-box {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		top: 0;
		right: 0;
		width: 16rem;
		height: 100vh;
	}
	:global(.frappe-chart .chart-legend) {
		display: none;
	}
	@keyframes voted {
		0% {
			transform: scale(0);
		}
		10%,
		90% {
			transform: scale(1.5);
		}
		100% {
			transform: scale(0);
		}
	}
</style>
