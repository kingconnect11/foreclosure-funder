import { signIn } from '@/actions/auth'

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <form action={signIn}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit">Sign in</button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  )
}
