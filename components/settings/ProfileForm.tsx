'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions/settings'
import type { Tables } from '@/types/supabase'

type Profile = Tables<'profiles'>

const INDUSTRIES = [
  'Technology & Software',
  'Marketing & Communications',
  'Finance & Accounting',
  'Healthcare & Wellness',
  'Education & Training',
  'Design & Creative',
  'Customer Service & BPO',
  'Administrative & Operations',
  'Sales & Business Development',
  'Human Resources',
  'Legal & Compliance',
  'Writing & Content',
  'Other',
]

const CAREER_STAGES = [
  { value: 'early', label: 'Early career (0–3 yrs)' },
  { value: 'mid', label: 'Mid-level (4–8 yrs)' },
  { value: 'senior', label: 'Senior (9–15 yrs)' },
  { value: 'exec', label: 'Executive / leadership' },
]

const WORK_SETUPS = [
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
  { value: 'freelance', label: 'Freelance' },
]

const REMOTE_GOALS = [
  { value: 'negotiating-wfh', label: 'Negotiating WFH at current job' },
  { value: 'exploring', label: 'Just exploring options' },
  { value: 'job-hunting', label: 'Actively job hunting' },
  { value: 'freelancing', label: 'Going freelance' },
  { value: 'already-remote', label: 'Already working remotely' },
]

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [industry, setIndustry] = useState(profile.industry ?? '')
  const [careerStage, setCareerStage] = useState(profile.career_stage ?? '')
  const [workSetup, setWorkSetup] = useState(profile.current_work_setup ?? '')
  const [remoteGoal, setRemoteGoal] = useState(profile.remote_goal ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setAvatarPreview(data.publicUrl)
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess(false)

    const result = await updateProfile({
      full_name: fullName,
      bio: bio || null,
      industry: industry || null,
      career_stage: (careerStage as Profile['career_stage']) || null,
      current_work_setup: (workSetup as Profile['current_work_setup']) || null,
      remote_goal: (remoteGoal as Profile['remote_goal']) || null,
      linkedin_url: linkedinUrl || null,
      avatar_url: avatarUrl || null,
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="shrink-0">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center border-2 border-gray-100">
              <span className="text-brand-orange font-bold text-xl">{initials}</span>
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm font-semibold text-brand-orange hover:underline disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Change photo'}
          </button>
          <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, or GIF · max 5MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Full name */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Full name <span className="text-brand-orange">*</span>
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition"
          placeholder="Your full name"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition resize-none"
          placeholder="Tell the community a little about yourself…"
        />
        <p className="text-xs text-stone-400 mt-1 text-right">{bio.length}/300</p>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Industry</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition bg-white"
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      {/* Career stage */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Career stage</label>
        <div className="grid grid-cols-2 gap-2">
          {CAREER_STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setCareerStage(careerStage === s.value ? '' : s.value)}
              className={`text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                careerStage === s.value
                  ? 'bg-brand-orange/10 border-brand-orange text-brand-orange font-semibold'
                  : 'border-gray-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current work setup */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Current work setup
        </label>
        <div className="flex flex-wrap gap-2">
          {WORK_SETUPS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setWorkSetup(workSetup === s.value ? '' : s.value)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                workSetup === s.value
                  ? 'bg-brand-orange/10 border-brand-orange text-brand-orange font-semibold'
                  : 'border-gray-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remote goal */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Remote work goal
        </label>
        <div className="space-y-2">
          {REMOTE_GOALS.map((g) => (
            <label
              key={g.value}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                remoteGoal === g.value
                  ? 'bg-brand-orange/10 border-brand-orange'
                  : 'border-gray-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="remote_goal"
                value={g.value}
                checked={remoteGoal === g.value}
                onChange={() => setRemoteGoal(g.value)}
                className="accent-brand-orange"
              />
              <span className={`text-sm ${remoteGoal === g.value ? 'text-brand-orange font-semibold' : 'text-stone-700'}`}>
                {g.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* LinkedIn URL */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">LinkedIn URL</label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition"
          placeholder="https://linkedin.com/in/yourname"
        />
      </div>

      {/* Error / success */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
      )}
      {success && (
        <p className="text-sm text-brand-green bg-brand-green/10 rounded-xl px-4 py-2.5 font-medium">
          Profile updated successfully.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-brand-orange text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
