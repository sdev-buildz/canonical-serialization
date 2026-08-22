import { areStructurallyEqual } from '@canonical-serialization'
import { describe, expect, it } from 'vitest'
import { getTestObj } from './testDataForCircularReferences'

describe('objects without circular references', () => {
  const obj = {
    c: '1',
    v: 'b',
    d: {
      ba: 'string',
      33: 'random',
    },
  }

  it('returns true, if equal.', () => {
    expect(areStructurallyEqual(obj, structuredClone(obj))).toBe(true)
  })

  it('returns false, if not equal', () => {
    expect(
      areStructurallyEqual(obj, {
        ...structuredClone(obj),
        d: { ...obj.d, ba: 'different' },
      })
    ).toBe(false)
  })
})

describe('objects with circular references', () => {
  const obj = getTestObj()

  it('returns true, if equal.', () => {
    expect(areStructurallyEqual(obj, structuredClone(obj))).toBe(true)
  })

  it('returns false, if references are missing.', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objCopy = getTestObj() as any
    const differentObj = {
      ...objCopy,
      d: {
        ...objCopy.d,
        q: {
          ...objCopy.d.q,
          a: undefined,
        },
      },
    }

    expect(areStructurallyEqual(obj, differentObj)).toBe(false)
  })

  it('returns false, if references point to different nodes.', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objCopy = getTestObj() as any
    const differentObj = {
      ...objCopy,
      d: {
        ...objCopy.d,
        q: {
          ...objCopy.d.q,
          a: objCopy.d.a,
        },
      },
    }

    expect(areStructurallyEqual(obj, differentObj)).toBe(false)
  })
})
