/**
 * Jednostavan "hash" ruter: adrese izgledaju kao .../#/razred/2/matematika.
 * Radi na GitHub Pages i bilo kojem statičkom hostingu, bez posebnih podešavanja servera.
 */
import { useSyncExternalStore } from 'react'

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '')
  if (hash === '') return '/'
  return hash.startsWith('/') ? hash : `/${hash}`
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, currentPath, () => '/')
}

export function href(path: string): string {
  return `#${path}`
}

export function navigate(path: string, options: { replace?: boolean } = {}): void {
  if (options.replace) {
    window.history.replaceState(null, '', href(path))
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = path
  }
}

/** matchPath('/razred/:grade', '/razred/2') → { grade: '2' } */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const s = path.split('/').filter(Boolean)
  if (p.length !== s.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i])
    else if (p[i] !== s[i]) return null
  }
  return params
}

export const routes = {
  home: () => '/',
  grades: () => '/razred',
  subject: (grade: number, subject: string) => `/razred/${grade}/${subject}`,
  topic: (grade: number, subject: string, topic: string) => `/razred/${grade}/${subject}/${topic}`,
  practice: (grade: number, subject: string, topic: string) => `/razred/${grade}/${subject}/${topic}/vjezba`,
  progress: () => '/napredak',
  settings: () => '/postavke',
}
