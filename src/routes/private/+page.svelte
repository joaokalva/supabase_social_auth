<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ notes, supabase, user } = data);
</script>

{#if user}
	<h1>Private page for user: {user?.email}</h1>
	<h2>Notes</h2>
	<ul>
		{#each notes as note}
			<li>{note.note}</li>
		{/each}
	</ul>
	<form action="?/add-note" method="post">
		<label>
			Add a note
			<input name="note" type="text" />
		</label>
		<button type="submit">Submit</button>
	</form>
{/if}