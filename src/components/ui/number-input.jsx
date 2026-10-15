import * as React from 'react'
import { useTranslation } from '@/lib/i18n'
import { canonicalNumberDraft, formatNumberDraft, numberSeparators, parseNumberDraft } from '@/lib/numberInput'

// Native numeric constraints still validate the text input, while change events
// expose canonical numeric strings to existing form controllers.
function validate(input, raw, { min, max, step, required }) {
  const probe = document.createElement('input')
  probe.type = 'number'
  for (const [name, value] of Object.entries({ min, max, step })) {
    if (value !== undefined && value !== null) probe.setAttribute(name, String(value))
  }
  probe.required = Boolean(required)
  probe.value = canonicalNumberDraft(raw)
  input.setCustomValidity(probe.validationMessage)
}

export function NumberInput({ value, defaultValue, onChange, onBlur, onFocus, ref, min, max, step, required, ...props }) {
  const { locale } = useTranslation()
  const inputRef = React.useRef(null)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '')
  const current = value === undefined ? uncontrolled : value
  const canonical = current == null ? '' : String(current)
  const matches = draft !== null && (canonicalNumberDraft(draft) === '' ? canonical === '' : Number(draft) === Number(canonical))
  const raw = editing && matches ? draft : canonical
  const display = formatNumberDraft(raw, locale)
  const selection = React.useRef(null)

  React.useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    validate(input, raw, { min, max, step, required })
    if (selection.current !== null && document.activeElement === input) {
      const { decimal } = numberSeparators(locale)
      const meaningful = char => /[0-9-]/.test(char) || char === decimal
      let remaining = selection.current
      let position = 0
      while (position < display.length && remaining > 0) {
        if (meaningful(display[position])) remaining--
        position++
      }
      input.setSelectionRange(position, position)
      selection.current = null
    }
  }, [raw, display, min, max, step, required, locale])

  return <input
    {...props}
    ref={node => {
      inputRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }}
    type="text"
    inputMode={props.inputMode ?? (step === undefined || Number.isInteger(Number(step)) ? 'numeric' : 'decimal')}
    value={display}
    required={required}
    onFocus={event => { setEditing(true); onFocus?.(event) }}
    onBlur={event => { setEditing(false); setDraft(null); onBlur?.(event) }}
    onKeyDown={event => {
      props.onKeyDown?.(event)
      if (event.defaultPrevented) return
      const input = event.currentTarget
      const position = input.selectionStart
      if (position !== input.selectionEnd) return
      const { group } = numberSeparators(locale)
      if (event.key === 'Backspace' && position > 1 && input.value[position - 1] === group) input.setSelectionRange(position - 2, position)
      if (event.key === 'Delete' && input.value[position] === group) input.setSelectionRange(position, position + 2)
    }}
    onChange={event => {
      const { decimal } = numberSeparators(locale)
      let text = event.target.value
      const cursor = event.target.selectionStart
      // Some mobile decimal keyboards emit a point even for Indonesian.
      if (decimal === ',' && event.nativeEvent.data === '.' && event.nativeEvent.inputType === 'insertText') {
        text = text.slice(0, cursor - 1) + ',' + text.slice(cursor)
      }
      const next = parseNumberDraft(text, locale)
      if (next === null || (canonicalNumberDraft(next) !== '' && !Number.isFinite(Number(next)))) return
      selection.current = [...text.slice(0, cursor)].filter(char => /[0-9-]/.test(char) || char === decimal).length
      setDraft(next)
      const numeric = canonicalNumberDraft(next)
      if (value === undefined) setUncontrolled(numeric)
      validate(event.target, next, { min, max, step, required })
      const change = Object.create(event)
      Object.defineProperties(change, {
        target: { value: { ...event.target, value: numeric, name: event.target.name, id: event.target.id } },
        currentTarget: { value: { ...event.currentTarget, value: numeric } },
      })
      onChange?.(change)
    }}
  />
}
