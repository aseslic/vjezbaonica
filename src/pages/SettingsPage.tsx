import type { ReactNode } from 'react'
import { catalog, gradeLabel, resolveGrade } from '../content'
import { Page, TopBar } from '../components/Layout'
import { routes } from '../lib/router'
import { SESSION_SIZES, updateSettings, useSettings, type SpeechMode } from '../lib/settings'
import { speak, speechSupported } from '../lib/speech'

interface Choice<T> {
  value: T
  label: string
}

function Segmented<T extends string | number | boolean>({
  legend,
  name,
  value,
  choices,
  onChange,
  note,
}: {
  legend: string
  name: string
  value: T
  choices: Choice<T>[]
  onChange: (value: T) => void
  note?: ReactNode
}) {
  return (
    <fieldset className="setting">
      <legend>{legend}</legend>
      <div className="segmented">
        {choices.map((choice) => (
          <label key={String(choice.value)} className={choice.value === value ? 'on' : undefined}>
            <input
              type="radio"
              name={name}
              checked={choice.value === value}
              onChange={() => onChange(choice.value)}
            />
            {choice.label}
          </label>
        ))}
      </div>
      {note && <p className="setting-note">{note}</p>}
    </fieldset>
  )
}

export function SettingsPage() {
  const settings = useSettings()
  const grade = resolveGrade(settings.grade)?.grade ?? 0
  const canSpeak = speechSupported()

  return (
    <Page paper="grid">
      <TopBar back={routes.home()} />
      <h1 className="page-title">Postavke</h1>

      {catalog.grades.length > 1 && (
        <Segmented
          legend="Razred"
          name="grade"
          value={grade}
          choices={catalog.grades.map((g) => ({ value: g.grade, label: gradeLabel(g.grade) }))}
          onChange={(value) => updateSettings({ grade: value })}
        />
      )}

      <Segmented
        legend="Broj zadataka u jednoj vježbi"
        name="size"
        value={settings.sessionSize}
        choices={SESSION_SIZES.map((n) => ({ value: n, label: String(n) }))}
        onChange={(value) => updateSettings({ sessionSize: value })}
      />

      <Segmented
        legend="Zvukovi"
        name="sounds"
        value={settings.sounds}
        choices={[
          { value: true, label: 'Uključeni' },
          { value: false, label: 'Isključeni' },
        ]}
        onChange={(value) => updateSettings({ sounds: value })}
      />

      {canSpeak ? (
        <Segmented<SpeechMode>
          legend="Čitanje zadataka naglas"
          name="speech"
          value={settings.speech}
          choices={[
            { value: 'off', label: 'Isključeno' },
            { value: 'button', label: 'Na dugme' },
            { value: 'auto', label: 'Automatski' },
          ]}
          onChange={(value) => {
            updateSettings({ speech: value })
            if (value !== 'off') speak('Ovako zvuči čitanje naglas.')
          }}
          note="Koristi glas koji je instaliran na uređaju (bosanski, hrvatski ili srpski)."
        />
      ) : (
        <p className="setting-note">Ovaj pregledač ne podržava čitanje naglas.</p>
      )}

      <p className="about">Vježbaonica, verzija {__APP_VERSION__}</p>
    </Page>
  )
}
