import {
  ShieldCheck,
  BadgeCheck,
  MapPin,
  Globe,
  BriefcaseBusiness,
  GraduationCap,
  FileCheck,
} from 'lucide-react'

import { QRCodeSVG } from 'qrcode.react'

import type {
  PassportData,
} from '../../types/passport'

interface PassportCardProps {
  data: PassportData
  shareUrl?: string
}

export default function PassportCard({
  data,
  shareUrl,
}: PassportCardProps) {

  const initials = data.full_name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'TB'

  const stats = [
    {
      label: 'Verified skills',
      value: data.verified_skills.length,
      icon: BadgeCheck,
    },
    {
      label: 'Approved evidence',
      value: data.approved_evidence_count,
      icon: FileCheck,
    },
    {
      label: 'Experience',
      value: data.experience_count,
      icon: BriefcaseBusiness,
    },
    {
      label: 'Education',
      value: data.education_count,
      icon: GraduationCap,
    },
  ]

  return (

    <article
      id="passport-print-area"
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
    >

      {/* Passport header */}

      <header className="bg-[#123C35] p-6 text-white sm:p-10">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <ShieldCheck
              size={36}
              className="text-[#D5F76A]"
            />

            <div>

              <h2 className="text-lg font-bold">
                UjuziLink
              </h2>

              <p className="text-xs text-white/60">
                Professional credential platform
              </p>

            </div>

          </div>

          <Globe
            size={25}
            className="text-[#D5F76A]"
          />

        </div>

        <div className="my-6 border-t border-white/20" />

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5F76A]">
          Digital Skills Passport
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-5">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#D5F76A] text-2xl font-extrabold text-[#123C35]">

            {initials}

          </div>

          <div className="min-w-0 flex-1">

            <h1 className="break-words text-3xl font-extrabold">

              {data.full_name || 'UjuziLink candidate'}

            </h1>

            <p className="mt-2 text-lg text-[#D5F76A]">

              {data.professional_title ||
                'Professional candidate'}

            </p>

            <div className="mt-3 flex items-center gap-2 text-sm text-white/70">

              <MapPin size={16} />

              {data.country || 'Not specified'}

            </div>

          </div>

        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 text-xs text-white/60">

          <p className="break-all">
            Passport ID: {data.passport_id}
          </p>

          <p>

            {data.published_at
              ? `Published: ${new Date(
                  data.published_at
                ).toLocaleDateString()}`
              : 'Private preview'}

          </p>

        </div>

      </header>

      {/* Passport content */}

      <div className="space-y-8 p-6 sm:p-10">

        {/* Statistics */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          {stats.map((item) => (

            <div
              key={item.label}
              className="rounded-xl bg-[#F6F8F5] p-4"
            >

              <item.icon
                size={22}
                className="text-[#16826B]"
              />

              <p className="mt-3 text-2xl font-extrabold text-[#123C35]">

                {item.value}

              </p>

              <p className="mt-1 text-xs text-slate-500">

                {item.label}

              </p>

            </div>

          ))}

        </div>

        {/* Verified skills */}

        <section>

          <div className="flex items-center gap-3">

            <BadgeCheck
              size={26}
              className="text-[#16826B]"
            />

            <h2 className="text-xl font-bold text-[#123C35]">

              Verified professional competencies

            </h2>

          </div>

          <p className="mt-2 text-sm text-slate-500">

            Skills supported by evidence approved
            through the UjuziLink review process.

          </p>

          {data.verified_skills.length === 0 ? (

            <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">

              <ShieldCheck
                size={36}
                className="mx-auto text-slate-400"
              />

              <p className="mt-4 font-semibold text-slate-700">

                No verified skills yet

              </p>

              <p className="mt-2 text-sm text-slate-500">

                Submit supporting evidence
                for professional verification.

              </p>

            </div>

          ) : (

            <div className="mt-5 divide-y divide-slate-100">

              {data.verified_skills.map((skill) => (

                <div
                  key={skill.id}
                  className="flex flex-wrap items-center gap-4 py-4"
                >

                  <div className="rounded-xl bg-[#EAF3EE] p-3">

                    <BadgeCheck
                      size={24}
                      className="text-[#16826B]"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="font-bold text-[#123C35]">

                      {skill.name}

                    </h3>

                    <p className="mt-1 text-sm text-slate-500">

                      {skill.category}

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      {skill.evidence_count} approved
                      evidence {skill.evidence_count === 1
                        ? 'record'
                        : 'records'}

                    </p>

                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                    Verified

                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* QR verification */}

        {shareUrl && (

          <section className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 p-5">

            <div className="shrink-0 rounded-lg bg-white p-2">

              <QRCodeSVG
                value={shareUrl}
                size={128}
                level="M"
                marginSize={4}
              />

            </div>

            <div className="min-w-0 flex-1">

              <h3 className="font-bold text-[#123C35]">

                Verify this passport online

              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">

                Scan the QR code to access the
                current published professional
                credentials.

              </p>

              <a
                href={shareUrl}
                className="mt-3 block break-all text-xs font-medium text-[#16826B]"
              >

                {shareUrl}

              </a>

            </div>

          </section>

        )}

        {/* Disclaimer */}

        <footer className="border-t border-slate-200 pt-5">

          <p className="text-xs leading-relaxed text-slate-500">

            UjuziLink verifies supporting evidence
            through its platform review process.
            This passport is not a government-issued
            identity document, academic accreditation,
            professional licence or authorization to work.

            Experience and education counts represent
            candidate-reported records.

          </p>

        </footer>

      </div>

    </article>
  )
}