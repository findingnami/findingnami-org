import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign in — Finding Nami',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
      <div className="text-center mb-8">
        <span className="text-brand-orange font-extrabold text-2xl tracking-tight">
          Finding Nami
        </span>
        <p className="mt-1.5 text-stone-500 text-sm">
          Your remote career community
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
