import { assignToIndex, prepareObject } from '@canonical-serialization'
import { afterEach, beforeEach } from 'node:test'
import { describe, expect, it } from 'vitest'
import { getTestObj } from './testDataForCircularReferences'

let testObj = getTestObj()

beforeEach(() => {
  testObj = getTestObj()
})

afterEach(() => {
  //  Ensuring that the input object is not modified.
  //  THe tested function should return a copy of object with the required modifications.
  expect(testObj).toStrictEqual(getTestObj())
})

it('sorts keys of objects, while removing circular references.', async () => {
  const result = prepareObject(testObj, {
    keepCircularReferences: false,
  })
  expect(result).toStrictEqual({
    a: { c: 1 },
    b: 2,
    d: {
      a: { c: 1 },
      g: 'lorem ipsum',
      q: { a: undefined, m: 'm', n: 'n', p: 'p' },
    },
  })
})

it('serializes circular and sibling references be default.', async () => {
  const result = prepareObject(testObj)

  expect(result).toStrictEqual({
    __csNodeId__: 0,
    value: {
      a: { __csNodeId__: 1, value: { c: 1 } },
      b: 2,
      d: {
        __csNodeId__: 2,
        value: {
          a: { __csNodeRef__: 1 },
          g: 'lorem ipsum',
          q: {
            __csNodeId__: 3,
            value: { a: { __csNodeRef__: 2 }, m: 'm', n: 'n', p: 'p' },
          },
        },
      },
    },
  })
})

it('can remove sibling references while serializing circular references.', async () => {
  const result = prepareObject(testObj, {
    keepNonCircularReferences: false,
  })
  console.dir(result, { depth: 10 })
  expect(result).toStrictEqual({
    __csNodeId__: 0,
    value: {
      a: { __csNodeId__: 1, value: { c: 1 } },
      b: 2,
      d: {
        __csNodeId__: 2,
        value: {
          a: { c: 1 },
          g: 'lorem ipsum',
          q: {
            __csNodeId__: 3,
            value: { a: { __csNodeRef__: 2 }, m: 'm', n: 'n', p: 'p' },
          },
        },
      },
    },
  })
})

it('can throw on circular reference.', async () => {
  expect(() =>
    prepareObject(testObj, {
      throwOnCircularReference: true,
    })
  ).toThrow()
})

it('throws on circular reference, if configured to both throw and serialize.', async () => {
  expect(() =>
    prepareObject(testObj, {
      throwOnCircularReference: true,
      keepCircularReferences: true,
    })
  ).toThrow()
})

it('prepares arrays', () => {
  const input = [
    5,
    {
      a: '45',
      5: 'b',
      v: [
        // inside nested array
        'str',
        32,
        { 2: '2', key1: 'value1' },
        //
      ],
      b: 'b',
    },
    3,
    'df',
  ]
  const result = prepareObject(structuredClone(input), {
    keepCircularReferences: false,
  })

  expect(result).toStrictEqual([
    5,
    {
      '5': 'b',
      a: '45',
      b: 'b',
      v: ['str', 32, { '2': '2', key1: 'value1' }],
    },
    3,
    'df',
  ])
})

describe('assignToIndex utility function.', () => {
  it('assigns to objects by the index of their keys', () => {
    const original = {
      a: 3,
      v: {
        b: '2',
      },
      n: 's',
      c: 'random',
      b: 'b',
    }

    const newValue = 'new'
    const input = structuredClone(original)

    assignToIndex(input, 2, newValue)

    expect(input).toStrictEqual({
      ...original,
      n: newValue,
    })
  })

  it(`assigns to array indexes.`, () => {
    const original = [5, 6, 3, 'df', 'ha']
    const idx = 2
    const newValue = 'new'

    const input = structuredClone(original)

    assignToIndex(input, idx, newValue)

    expect(input).toStrictEqual([
      ...original.slice(0, idx),
      newValue,
      ...original.slice(idx + 1),
    ])
  })
})
