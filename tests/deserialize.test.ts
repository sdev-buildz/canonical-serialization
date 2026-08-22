import {
  assignToKey,
  canonicalSerialization,
  deserialize,
} from '@canonical-serialization'
import { describe, expect, it } from 'vitest'
import { getTestObj } from './testDataForCircularReferences'

it('deserializes non-objects.', () => {
  const toSerialize = [
    1,
    3,
    '1',
    '2',
    'value',
    'random',
    true,
    false,
    null,
    undefined,
  ]

  for (const item of toSerialize) {
    expect(deserialize(canonicalSerialization(item))).toBe(item)
  }
})

it('deserializes objects.', () => {
  const testObj = {
    b: 1,
    d: {
      v: 3,
      a: 1,
    },
    c: '3',
  }

  const serializedString = canonicalSerialization(testObj, {
    keepCircularReferences: true,
  })

  const deserializedResult = deserialize(serializedString)

  expect(deserializedResult).toStrictEqual(testObj)
})

it('deserializes objects, while restoring circular references.', () => {
  const testObj = getTestObj()

  const serializedString = canonicalSerialization(testObj, {
    keepCircularReferences: true,
  })

  const deserializedResult = deserialize(serializedString)

  expect(deserializedResult).toStrictEqual(testObj)
})

describe('assignToKey', () => {
  it('assigns to objects by keys', () => {
    const original = {
      a: 3,
      v: {
        b: '2',
      },
      n: 's',
      '2': '2',
      c: 'random',
      b: 'b',
    }
    const idx = '2' satisfies keyof typeof original
    const newValue = 'new'
    const input = structuredClone(original)

    assignToKey(input, idx, newValue)

    expect(input).toStrictEqual({
      ...original,
      [idx]: newValue,
    })
  })
  it('assigns to arrays by indexes', () => {
    const original = [5, 6, 3, 'df', 'ha']

    const idx = 3
    const newValue = 'new'
    const input = structuredClone(original)

    assignToKey(input, idx, newValue)

    expect(input).toStrictEqual([
      ...original.slice(0, idx),
      newValue,
      ...original.slice(idx + 1),
    ])
  })
})
