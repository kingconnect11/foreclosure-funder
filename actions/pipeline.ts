'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveToPipeline(propertyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's deal_room_id to set on pipeline entry
  const { data: profile } = await supabase
    .from('profiles')
    .select('deal_room_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('investor_pipeline').insert({
    investor_id: user.id,
    property_id: propertyId,
    deal_room_id: profile?.deal_room_id ?? null,
    stage: 'watching' as const,
  })

  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath(`/property/${propertyId}`)
}

export async function changeStage(pipelineId: string, newStage: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Close the current stage history row (set exited_at)
  await supabase
    .from('pipeline_stage_history')
    .update({ exited_at: new Date().toISOString() })
    .eq('pipeline_id', pipelineId)
    .is('exited_at', null)

  // Insert new stage history row
  const { error: historyError } = await supabase
    .from('pipeline_stage_history')
    .insert({
      pipeline_id: pipelineId,
      stage: newStage as any,
      notes: notes ?? null,
    })

  if (historyError) throw historyError

  // Update the pipeline entry stage (existing behavior)
  const { error } = await supabase
    .from('investor_pipeline')
    .update({
      stage: newStage as any,
      stage_changed_at: new Date().toISOString()
    })
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error

  // Get property_id to revalidate the property detail page
  const { data: entry } = await supabase
    .from('investor_pipeline')
    .select('property_id')
    .eq('id', pipelineId)
    .single()

  revalidatePath('/pipeline')
  if (entry?.property_id) {
    revalidatePath(`/property/${entry.property_id}`)
  }
}

export async function updateNotes(pipelineId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('investor_pipeline')
    .update({ notes })
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error
}

export async function removeFromPipeline(pipelineId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('investor_pipeline')
    .delete()
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
}
