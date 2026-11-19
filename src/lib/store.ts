/**
 * Mala "prodavnica" stanja koja se čuva u localStorage pregledača.
 * Podaci ostaju samo na tom uređaju – ništa se ne šalje na internet.
 */
import { useSyncExternalStore } from 'react'

export function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Pregledač ne dozvoljava spremanje (npr. privatni način rada) – aplikacija i dalje radi.
  }
}

export interface Store<T> {
  get: () => T
  set: (next: T | ((prev: T) => T)) => void
  subscribe: (listener: () => void) => () => void
  use: () => T
  /** Zaboravlja stanje iz memorije (koristi se u testovima). */
  reset: () => void
}

export function createStore<T>(key: string, sanitize: (raw: unknown) => T): Store<T> {
  let state: T | undefined
  const listeners = new Set<() => void>()

  const get = (): T => {
    if (state === undefined) state = sanitize(readJson(key))
    return state
  }
  const set = (next: T | ((prev: T) => T)) => {
    state = typeof next === 'function' ? (next as (prev: T) => T)(get()) : next
    writeJson(key, state)
    listeners.forEach((listener) => listener())
  }
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const use = () => useSyncExternalStore(subscribe, get, get)
  const reset = () => {
    state = undefined
  }
  return { get, set, subscribe, use, reset }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
