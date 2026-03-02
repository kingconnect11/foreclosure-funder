'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGroupNotes(pipelineId: string, groupNotes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // RLS ensures only deal room admin can update
  const { error } = await supabase
    .from('investor_pipeline')
    .update({ group_notes: groupNotes })
    .eq('id', pipelineId)

  if (error) throw error
  revalidatePath('/admin')
}
