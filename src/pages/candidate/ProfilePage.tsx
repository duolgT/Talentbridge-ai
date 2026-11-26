import { useState, type FormEvent } from 'react'


import {
  UserRound,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

import Button from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

import {
  updateProfile,
  type UpdateProfileData,
} from '../../services/profileService'

import type { Profile } from '../../types/auth'

function getFormValues(
  profile: Profile
): UpdateProfileData {
  return {
    full_name: profile.full_name,
    professional_title: profile.professional_title || '',
    bio: profile.bio || '',
    country: profile.country || '',
    location: profile.location || '',
  }
}

export default function ProfilePage() {
  const profile = useAuthStore(
    (state) => state.profile
  )

  if (!profile) {
    return <p>Profile unavailable.</p>
  }

  return (
    <ProfileForm
      key={profile.id}
      profile={profile}
    />
  )
}

function ProfileForm({
  profile,
}: {
  profile: Profile
}) {

  const setProfile = useAuthStore(
    (state) => state.setProfile
  )

  const [form, setForm] = useState<UpdateProfileData>(
    () => getFormValues(profile)
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const savedValues = getFormValues(profile)

  const hasChanges = Object.keys(form).some(
    (key) =>
      form[key as keyof UpdateProfileData] !==
      savedValues[key as keyof UpdateProfileData]
  )

  const completedFields = Object.values(
    savedValues
  ).filter((value) => value?.trim()).length

  const completion = Math.round(
    (completedFields / 5) * 100
  )

  function handleChange(
    field: keyof UpdateProfileData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setError('')
    setSuccess('')
  }

  function handleReset() {
    setForm(getFormValues(profile))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (saving || !hasChanges) return

    setError('')
    setSuccess('')

    if (form.full_name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }

    try {
      setSaving(true)

      const updatedProfile = await updateProfile(
        profile.id,
        form
      )

      if (
        useAuthStore.getState().session?.user.id
        !== profile.id
      ) {
        return
      }

      setProfile(updatedProfile)
      setForm(getFormValues(updatedProfile))

      setSuccess('Profile updated successfully.')

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update profile.'
      )

    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Page heading */}

      <div>
        <h1 className="text-3xl font-extrabold">
          Professional profile
        </h1>

        <p className="mt-2 text-muted">
          Build a professional identity that reflects
          your skills and potential.
        </p>
      </div>

      {/* Profile overview */}

      <section className="rounded-2xl bg-primary-dark p-6 text-white sm:p-8">

        <div className="flex items-center gap-5">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-bold text-primary-dark">

            {profile.full_name.charAt(0).toUpperCase()
              || <UserRound size={32} />}

          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {profile.full_name || 'Candidate'}
            </h2>

            <p className="mt-1 text-accent">
              {profile.professional_title
                || 'Add your professional title'}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
              <MapPin size={16} />

              {[profile.location, profile.country]
                .filter(Boolean)
                .join(', ') || 'Location not provided'}
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-white/20 pt-5">

          <div className="mb-3 flex justify-between text-sm">
            <span>Basic profile completion</span>

            <span className="font-bold text-accent">
              {completion}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Basic profile completion"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-white/20"
          >
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>

        </div>

      </section>

      {/* Profile form */}

      <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">

        <h2 className="text-xl font-bold">
          Personal information
        </h2>

        <p className="mt-2 text-sm text-muted">
          Update your basic professional details.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={20}
              className="shrink-0"
            />
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
        >

          <fieldset
            disabled={saving}
            className="space-y-6"
          >

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="full_name"
                  className="text-sm font-medium"
                >
                  Full name
                </label>

                <input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) =>
                    handleChange(
                      'full_name',
                      e.target.value
                    )
                  }
                  required
                  maxLength={120}
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="professional_title"
                  className="text-sm font-medium"
                >
                  Professional title
                </label>

                <input
                  id="professional_title"
                  value={form.professional_title || ''}
                  onChange={(e) =>
                    handleChange(
                      'professional_title',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Software Developer"
                  maxLength={120}
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="text-sm font-medium"
                >
                  Country
                </label>

                <input
                  id="country"
                  value={form.country || ''}
                  onChange={(e) =>
                    handleChange(
                      'country',
                      e.target.value
                    )
                  }
                  maxLength={100}
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="text-sm font-medium"
                >
                  Location
                </label>

                <input
                  id="location"
                  value={form.location || ''}
                  onChange={(e) =>
                    handleChange(
                      'location',
                      e.target.value
                    )
                  }
                  placeholder="City or region"
                  maxLength={120}
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                />
              </div>

            </div>

            <div>
              <label
                htmlFor="bio"
                className="text-sm font-medium"
              >
                Professional biography
              </label>

              <textarea
                id="bio"
                rows={5}
                maxLength={1000}
                value={form.bio || ''}
                onChange={(e) =>
                  handleChange('bio', e.target.value)
                }
                placeholder="Describe your experience, skills and professional goals."
                className="mt-2 w-full resize-y rounded-lg border border-border px-4 py-3"
              />

              <p className="mt-2 text-right text-xs text-muted">
                {form.bio?.length || 0}/1000
              </p>
            </div>

          </fieldset>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">

            <button
              type="button"
              onClick={handleReset}
              disabled={saving || !hasChanges}
              className="rounded-lg border border-border px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              Reset changes
            </button>

            <Button
              type="submit"
              loading={saving}
              disabled={!hasChanges || saving}
            >
              <Save size={18} />
              Save changes
            </Button>

          </div>

        </form>

      </section>

    </div>
  )
}