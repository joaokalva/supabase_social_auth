<script>
	export let data;
	$: ({ supabase } = data);
</script>

<header>
	<nav>
		<a href="/">Home</a>
	</nav>
</header>
<main>
	<slot />
</main>