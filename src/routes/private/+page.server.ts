import type { Actions, PageServerLoad } from './$types';
import { invalidate } from '$app/navigation';

export const load: PageServerLoad = async ({ depends, locals: { supabase } }) => {
	depends('supabase:db:notes');
	const { data: notes } = await supabase.from('notes').select('id,note').order('id');
	return { notes: notes ?? [] };
};

export const actions: Actions = {
	'add-note': async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const note = formData.get('note') as string;
		if (!note) return;

		const { error } = await supabase.from('notes').insert({ note });
		if (error) console.error(error);

		// invalidate('supabase:db:notes'); // Not sure what this does, but causes an error for a split second
	},
}