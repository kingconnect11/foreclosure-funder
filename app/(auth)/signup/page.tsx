import { SignupForm } from '@/components/auth/signup-form'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return <SignupForm error={params.error} />
}
