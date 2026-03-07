'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ClosedOwnedConversionInput {
  address: string
  city: string | null
  state: string | null
  zipCode: string | null
  acquiredAt: string
  purchasePrice: number
  currentValue: number
  constructionCostTotal: number
  legalFeesTotal: number
  interestPaidTotal: number
  notes?: string | null
}

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

export async function changeStageAndConvertToOwned(
  pipelineId: string,
  conversion: ClosedOwnedConversionInput,
  notes?: string
) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => any
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Load pipeline entry with property context and ensure ownership
  const { data: pipelineEntry, error: pipelineError } = await db
    .from('investor_pipeline')
    .select(
      `
      id,
      investor_id,
      property_id,
      deal_room_id,
      moved_to_owned_at,
      properties (
        address,
        city,
        state,
        zip_code,
        foreclosure_amount,
        county_appraisal
      )
    `
    )
    .eq('id', pipelineId)
    .eq('investor_id', user.id)
    .single()

  if (pipelineError || !pipelineEntry) throw new Error('Pipeline entry not found')
  if (pipelineEntry.moved_to_owned_at) {
    return
  }

  // Close the current stage history row
  await supabase
    .from('pipeline_stage_history')
    .update({ exited_at: new Date().toISOString() })
    .eq('pipeline_id', pipelineId)
    .is('exited_at', null)

  // Insert closed stage history row
  const { error: historyError } = await supabase
    .from('pipeline_stage_history')
    .insert({
      pipeline_id: pipelineId,
      stage: 'closed' as any,
      notes: notes ?? null,
    })

  if (historyError) throw historyError

  const property = pipelineEntry.properties ?? {}
  const address = conversion.address || property.address || 'Unknown Address'
  const city = conversion.city || property.city || null
  const state = conversion.state || property.state || null
  const zipCode = conversion.zipCode || property.zip_code || null
  const purchasePrice =
    Number.isFinite(conversion.purchasePrice) && conversion.purchasePrice > 0
      ? conversion.purchasePrice
      : Number(property.foreclosure_amount ?? 0) || 0
  const currentValue =
    Number.isFinite(conversion.currentValue) && conversion.currentValue > 0
      ? conversion.currentValue
      : Number(property.county_appraisal ?? 0) || 0

  const { error: ownedError } = await db.from('owned_properties').upsert(
    {
      investor_id: user.id,
      deal_room_id: pipelineEntry.deal_room_id ?? null,
      source_property_id: pipelineEntry.property_id,
      source_pipeline_id: pipelineId,
      address,
      city,
      state,
      zip_code: zipCode,
      acquired_at: conversion.acquiredAt,
      status: 'active',
      purchase_price: purchasePrice,
      current_value: currentValue,
      construction_cost_total: conversion.constructionCostTotal,
      legal_fees_total: conversion.legalFeesTotal,
      interest_paid_total: conversion.interestPaidTotal,
      notes: conversion.notes ?? null,
    },
    { onConflict: 'source_pipeline_id' }
  )

  if (ownedError) throw ownedError

  const { error: pipelineUpdateError } = await db
    .from('investor_pipeline')
    .update({
      stage: 'closed',
      stage_changed_at: new Date().toISOString(),
      moved_to_owned_at: new Date().toISOString(),
    })
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (pipelineUpdateError) throw pipelineUpdateError

  revalidatePath('/pipeline')
  revalidatePath('/portfolio')
  revalidatePath('/owned')
  revalidatePath('/dashboard')
  if (pipelineEntry.property_id) {
    revalidatePath(`/property/${pipelineEntry.property_id}`)
  }
}

export async function updateNotes(pipelineId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: entry } = await supabase
    .from('investor_pipeline')
    .select('property_id')
    .eq('id', pipelineId)
    .eq('investor_id', user.id)
    .single()

  const { error } = await supabase
    .from('investor_pipeline')
    .update({ notes })
    .eq('id', pipelineId)
    .eq('investor_id', user.id)

  if (error) throw error

  revalidatePath('/pipeline')
  if (entry?.property_id) {
    revalidatePath(`/property/${entry.property_id}`)
  }
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
