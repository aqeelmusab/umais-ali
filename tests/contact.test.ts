import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateContact } from '../src/contact'

test('validateContact: accepts a well-formed submission', () => {
  const r = validateContact({
    name: '  Jane Doe  ',
    email: 'jane@example.com',
    message: 'Hi there, this is a real message.',
  })
  assert.equal(r.ok, true)
  assert.equal(r.honeypot, false)
  assert.deepEqual(r.errors, {})
  // trims whitespace
  assert.equal(r.values.name, 'Jane Doe')
})

test('validateContact: flags honeypot regardless of other fields', () => {
  const r = validateContact({
    name: 'Bot',
    email: 'bot@bot.com',
    message: 'short', // would otherwise fail length
    website: 'http://spam',
  })
  assert.equal(r.honeypot, true)
  assert.equal(r.ok, false)
})

test('validateContact: rejects short / long name', () => {
  assert.ok(validateContact({ name: 'A', email: 'a@b.co', message: 'a'.repeat(20) }).errors.name)
  assert.ok(
    validateContact({ name: 'x'.repeat(81), email: 'a@b.co', message: 'a'.repeat(20) }).errors.name,
  )
})

test('validateContact: rejects invalid emails', () => {
  for (const email of ['', 'no-at-sign', 'foo@bar', 'foo @bar.co', 'a@b.', '@b.co']) {
    const r = validateContact({ name: 'Jane Doe', email, message: 'a'.repeat(20) })
    assert.ok(r.errors.email, `expected error for email: "${email}"`)
  }
})

test('validateContact: rejects email longer than 200 chars', () => {
  const email = `${'a'.repeat(200)}@b.co` // valid shape, > 200 length
  const r = validateContact({ name: 'Jane Doe', email, message: 'a'.repeat(20) })
  assert.ok(r.errors.email)
})

test('validateContact: rejects too-short / too-long message', () => {
  assert.ok(
    validateContact({ name: 'Jane Doe', email: 'a@b.co', message: 'short' }).errors.message,
  )
  assert.ok(
    validateContact({ name: 'Jane Doe', email: 'a@b.co', message: 'x'.repeat(2001) }).errors.message,
  )
})

test('validateContact: tolerates missing / null body', () => {
  const r = validateContact(null)
  assert.equal(r.ok, false)
  assert.equal(r.honeypot, false)
  assert.ok(r.errors.name && r.errors.email && r.errors.message)
})

test('validateContact: coerces non-string values to strings', () => {
  // Express body parsers can yield arrays for repeated fields; mimic that.
  const r = validateContact({
    name: 12345 as unknown as string,
    email: 'a@b.co',
    message: 'a'.repeat(20),
  })
  assert.equal(r.values.name, '12345')
  assert.equal(r.errors.name, undefined)
})
