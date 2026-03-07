import { redirect } from 'next/navigation'

export default async function OwnedAliasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.length > 0) {
      query.set(key, value)
      continue
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry.length > 0) query.append(key, entry)
      }
    }
  }

  const suffix = query.toString()
  redirect(suffix ? `/portfolio?${suffix}` : '/portfolio')
}
