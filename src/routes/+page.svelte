<script>
	export let data;
</script>

<h1>Welcome to Supabase!</h1>
{#if !data.user }
	<a href="/auth">Please log in</a>
{:else}
	<a href="/private">See my notes</a><br>
<a href="/account">Account settings</a>
{/if}

<p>User: </p><pre style="font-size:4">{JSON.stringify(data.user, null, 2)}</pre>