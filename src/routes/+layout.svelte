<script lang="ts">
	import '@feltcoop/felt/style.css';
	import {base} from '$app/paths';

	import './style.css';
</script>

<svelte:head>
	<title>@ryanatkn/tuneup</title>
	<link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<slot />
