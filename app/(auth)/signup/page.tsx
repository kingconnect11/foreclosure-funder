import { signUp } from '@/actions/auth'

export default function SignUpPage() {
  return (
    <div>
      <h1>Create Account</h1>
      <form action={signUp}>
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input id="full_name" name="full_name" type="text" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <div>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input id="confirm_password" name="confirm_password" type="password" required />
        </div>
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  )
}
