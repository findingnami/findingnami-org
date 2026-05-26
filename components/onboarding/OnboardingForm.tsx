'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { completeOnboarding } from '@/lib/actions/onboarding'

type CareerStage = 'early' | 'mid' | 'senior' | 'exec'
type WorkSetup = 'on-site' | 'hybrid' | 'remote' | 'freelance'
type RemoteGoal = 'negotiating-wfh' | 'job-hunting' | 'freelancing' | 'already-remote'

const INDUSTRIES = [
  'Technology',
  'Marketing & Communications',
  'Finance & Accounting',
  'Healthcare',
  'Education',
  'Creative & Design',
  'Operations & Admin',
  'Customer Success',
  'HR & People',
  'Legal',
  'Sales',
  'Other',
]

const CAREER_STAGE_OPTIONS: { value: CareerStage; label: string; sub: string }[] = [
  { value: 'early', label: 'Early career', sub: '0–3 yrs' },
  { value: 'mid', label: 'Mid career', sub: '4–9 yrs' },
  { value: 'senior', label: 'Senior', sub: '10+ yrs' },
]

const WORK_SETUP_OPTIONS: { value: WorkSetup; label: string }[] = [
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
  { value: 'freelance', label: 'Freelance' },
]

const REMOTE_GOAL_OPTIONS: {
  value: RemoteGoal
  emoji: string
  label: string
  description: string
}[] = [
  {
    value: 'negotiating-wfh',
    emoji: '🏠',
    label: 'Negotiate WFH',
    description: 'I want to work from home with my current employer',
  },
  {
    value: 'job-hunting',
    emoji: '🔍',
    label: 'Find a Remote Job',
    description: "I'm actively looking for a fully remote role",
  },
  {
    value: 'freelancing',
    emoji: '💼',
    label: 'Go Freelance',
    description: 'I want to build my own client base and work independently',
  },
  {
    value: 'already-remote',
    emoji: '✅',
    label: 'Already Remote',
    description: "I'm remote and want to grow, connect, and give back",
  },
]

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
            i <= current ? 'bg-brand-orange' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function SegmentedButtons<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sub?: string }[]
  value: T | ''
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
            value === opt.value
              ? 'bg-brand-orange text-white border-brand-orange'
              : 'border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'
          }`}
        >
          {opt.label}
          {opt.sub && (
            <span
              className={`ml-1 text-xs ${value === opt.value ? 'text-orange-100' : 'text-gray-400'}`}
            >
              ({opt.sub})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function OnboardingForm({ userId }: { userId: string }) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1
  const [fullName, setFullName] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2
  const [industry, setIndustry] = useState('')
  const [careerStage, setCareerStage] = useState<CareerStage | ''>('')
  const [workSetup, setWorkSetup] = useState<WorkSetup | ''>('')
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({})

  // Step 3
  const [remoteGoal, setRemoteGoal] = useState<RemoteGoal | ''>('')
  const [bio, setBio] = useState('')
  const [goalError, setGoalError] = useState('')

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
    if (file.size > 2 * 1024 * 1024) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function goToStep2() {
    if (!fullName.trim()) {
      setFullNameError('Please enter your name')
      return
    }
    setFullNameError('')
    setStep(2)
  }

  function goToStep3() {
    const errors: Record<string, string> = {}
    if (!industry) errors.industry = 'Please select your industry'
    if (!careerStage) errors.careerStage = 'Please select your career stage'
    if (!workSetup) errors.workSetup = 'Please select your work setup'
    setStep2Errors(errors)
    if (Object.keys(errors).length === 0) setStep(3)
  }

  async function handleSubmit() {
    if (!remoteGoal) {
      setGoalError('Please select your remote work goal')
      return
    }
    setGoalError('')
    setIsLoading(true)
    setSubmitError(null)

    let avatarUrl: string | null = null
    if (avatarFile) {
      const supabase = createClient()
      const ext = avatarFile.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    const result = await completeOnboarding({
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
      industry,
      career_stage: careerStage as CareerStage,
      current_work_setup: workSetup as WorkSetup,
      remote_goal: remoteGoal as RemoteGoal,
      bio: bio.trim() || null,
    })

    if (result?.error) {
      setSubmitError(result.error)
      setIsLoading(false)
    }
    // On success the server action redirects to /feed — no client code needed
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
      {/* Wordmark */}
      <div className="text-center mb-6">
        <span className="text-brand-orange font-extrabold text-2xl tracking-tight">
          Finding Nami
        </span>
      </div>

      <StepIndicator current={step} />

      {/* ── Step 1: Let's start with you ── */}
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-stone-500 text-sm leading-relaxed">
            Welcome to Finding Nami. Let&apos;s build your profile so the community knows who you
            are.
          </p>

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="focus:outline-none"
              aria-label="Upload profile photo"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Your photo"
                  className="w-24 h-24 rounded-full object-cover border-2 border-brand-orange"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-orange/10 border-2 border-dashed border-brand-orange/40 flex items-center justify-center">
                  {fullName.trim() ? (
                    <span className="text-brand-orange font-extrabold text-2xl">
                      {getInitials(fullName)}
                    </span>
                  ) : (
                    <svg
                      className="w-9 h-9 text-brand-orange/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  )}
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-brand-orange font-medium hover:underline"
            >
              {avatarPreview ? 'Change photo' : 'Add a photo (optional)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-stone-700">
              What&apos;s your name?
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (fullNameError) setFullNameError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && goToStep2()}
              placeholder="Your full name"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors ${
                fullNameError ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {fullNameError && <p className="text-xs text-red-500">{fullNameError}</p>}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={goToStep2}
              disabled={isLoading}
              className="w-full bg-brand-orange text-white font-semibold rounded-xl py-3 text-sm hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Tell us about your work ── */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-stone-500 text-sm leading-relaxed">
            This helps us connect you with the right people and opportunities in the community.
          </p>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-stone-700">
              What industry are you in?
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value)
                  if (step2Errors.industry) setStep2Errors((prev) => ({ ...prev, industry: '' }))
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors bg-white appearance-none cursor-pointer ${
                  step2Errors.industry ? 'border-red-400' : 'border-gray-200'
                } ${!industry ? 'text-stone-400' : 'text-stone-900'}`}
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {step2Errors.industry && (
              <p className="text-xs text-red-500">{step2Errors.industry}</p>
            )}
          </div>

          {/* Career stage */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">
              Where are you in your career?
            </label>
            <SegmentedButtons
              options={CAREER_STAGE_OPTIONS}
              value={careerStage}
              onChange={(v) => {
                setCareerStage(v)
                if (step2Errors.careerStage)
                  setStep2Errors((prev) => ({ ...prev, careerStage: '' }))
              }}
            />
            {step2Errors.careerStage && (
              <p className="text-xs text-red-500">{step2Errors.careerStage}</p>
            )}
          </div>

          {/* Work setup */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">
              How are you working right now?
            </label>
            <SegmentedButtons
              options={WORK_SETUP_OPTIONS}
              value={workSetup}
              onChange={(v) => {
                setWorkSetup(v)
                if (step2Errors.workSetup)
                  setStep2Errors((prev) => ({ ...prev, workSetup: '' }))
              }}
            />
            {step2Errors.workSetup && (
              <p className="text-xs text-red-500">{step2Errors.workSetup}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="flex-1 border border-gray-200 text-stone-600 font-semibold rounded-xl py-3 text-sm hover:border-stone-300 transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={goToStep3}
              disabled={isLoading}
              className="flex-1 bg-brand-orange text-white font-semibold rounded-xl py-3 text-sm hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: What's your remote work goal? ── */}
      {step === 3 && (
        <div className="space-y-6">
          <p className="text-stone-500 text-sm leading-relaxed">
            Almost there! This is the most important question — it helps us match you with the
            right circles, mentors, and resources.
          </p>

          {/* Remote goal cards */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">
              What are you working toward?
            </label>
            <div className="space-y-2">
              {REMOTE_GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRemoteGoal(opt.value)
                    if (goalError) setGoalError('')
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    remoteGoal === opt.value
                      ? 'border-brand-orange bg-brand-orange/5'
                      : 'border-gray-200 hover:border-brand-green'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none mt-0.5">{opt.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {goalError && <p className="text-xs text-red-500">{goalError}</p>}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-stone-700">
              Anything you&apos;d like the community to know about you?{' '}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= 300) setBio(e.target.value)
              }}
              placeholder="E.g. I'm a project manager trying to make the leap to fully remote. I love connecting with others on the same path."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors resize-none"
            />
            <p className="text-xs text-stone-400 text-right">{bio.length}/300</p>
          </div>

          {submitError && (
            <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg p-3">
              {submitError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isLoading}
              className="flex-1 border border-gray-200 text-stone-600 font-semibold rounded-xl py-3 text-sm hover:border-stone-300 transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-brand-orange text-white font-semibold rounded-xl py-3 text-sm hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Complete my profile →'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
