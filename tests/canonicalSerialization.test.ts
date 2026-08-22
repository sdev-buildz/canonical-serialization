import { canonicalSerialization } from '@canonical-serialization'
import serializeJavascript from 'serialize-javascript'
import { describe, expect, it } from 'vitest'
import { nestedObject } from './testDataForNestedObj'
import { nestedObjectWithArrays } from './testDataForNestedObjWithArrays'

const serializeWithBrackets = (
  ...args: Parameters<typeof serializeJavascript>
) => '(' + serializeJavascript(...args) + ')'

describe('circular reference', () => {
  it('throws on circular references, if options.throwOnCircularReference is true.', () => {
    const obj1 = {
      b: 2,
      d: {
        g: 'lorem ipsum',
        a: 2 as number | Record<string, unknown>,
      },
    }

    obj1.d.a = obj1

    expect(() =>
      canonicalSerialization(obj1, { throwOnCircularReference: true })
    ).toThrow()
  })
  it('can serialize circular references.', () => {
    const obj1 = {
      b: 2,
      d: {
        g: 'lorem ipsum',
        a: 2 as number | Record<string, unknown>,
      },
    }

    obj1.d.a = obj1

    expect(canonicalSerialization(obj1)).toBe(
      serializeWithBrackets({
        __csNodeId__: 0,
        value: {
          b: 2,
          d: {
            __csNodeId__: 1,
            value: { a: { __csNodeRef__: 0 }, g: 'lorem ipsum' },
          },
        },
      })
    )
  })
})

it('passes parameter options to serializeJavascript.', () => {
  const params1 = [
    {
      b: 2,
      d: {
        // inside nested object
        g: 'lorem ipsum',
        a: 2,
      },
      c: 1,
    },
    { keepCircularReferences: false },
    { space: 2 },
  ] as const satisfies Parameters<typeof canonicalSerialization>

  expect(params1[2]?.space).toBeDefined()

  const result = canonicalSerialization(...params1)
  expect(result).toBe(`({
  "b": 2,
  "c": 1,
  "d": {
    "a": 2,
    "g": "lorem ipsum"
  }
})`)
})

describe('serialization', () => {
  const testFunction = () => {
    return 'sample function'
  }

  it(`handles both serializable and non-serializable values.`, () => {
    class A {
      private b = 1
      constructor() {
        this.b = 2
      }

      get bVal() {
        return this.b
      }
    }
    const aInstance = new A()

    const unordered = {
      c: 3,
      a: () => {
        return 'sdfsf'
      },
      y: testFunction,
      x: aInstance,
      2: 'sdf',
      3: 'sdfdsf',
      d: 2,
      str: 'string',
      num: 0,
      obj: { foo: 'foo' },
      arr: [1, 2, 3],
      bool: true,
      nil: null,
      undef: undefined,
      inf: Infinity,
      date: new Date('Thu, 30 July 2026 22:40:17 GMT'),
      map: new Map([['hello', 'world']]),
      set: new Set([123, 456]),
      re: /([^\s]+)/g,
      big: BigInt(10),
      url: new URL('https://example.com/'),
    } as const

    const ordered: typeof unordered = {
      '2': 'sdf',
      '3': 'sdfdsf',
      a: () => {
        return 'sdfsf'
      },
      arr: [1, 2, 3],
      big: 10n,
      bool: true,
      c: 3,
      d: 2,
      date: new Date('Thu, 30 July 2026 22:40:17 GMT'),
      inf: Infinity,
      map: new Map([['hello', 'world']]),
      nil: null,
      num: 0,
      obj: { foo: 'foo' },
      re: /([^\s]+)/g,
      set: new Set([123, 456]),
      str: 'string',
      undef: undefined,
      url: new URL('https://example.com/'),
      x: aInstance,
      y: testFunction,
    }
    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('serializes functions into distinct and consistent strings. Done under the hood by serialize-javascript library.', () => {
    const fun1 = () => {
      return 'value one'
    }
    const fun2 = () => {
      return 'value two'
    }
    expect(canonicalSerialization(fun1)).toBe(canonicalSerialization(fun1))
    expect(canonicalSerialization(fun2)).toBe(canonicalSerialization(fun2))
    expect(canonicalSerialization(fun1)).not.toBe(canonicalSerialization(fun2))
  })

  it('Serializes class instances into distinct and consistent strings. Done under the hood by serialize-javascript library.', () => {
    class A {
      private b = 1
      constructor() {
        this.b = 2
      }
      get bValue() {
        return this.b
      }
    }
    class B {
      private c = 1
      constructor() {
        this.c = 2
      }
      get bValue() {
        return this.c
      }
    }
    const a = new A()
    const b = new B()

    expect(canonicalSerialization(a)).toBe(canonicalSerialization(a))
    expect(canonicalSerialization(b)).toBe(canonicalSerialization(b))
    expect(canonicalSerialization(a)).not.toBe(canonicalSerialization(b))
  })
})

describe('sorting', () => {
  const testFunction = () => {
    return 'sample function'
  }

  it('accepts compareFn for sorting. It can sort in descending order.', () => {
    const params1 = [
      {
        b: 2,
        d: {
          // inside nested object
          g: 'lorem ipsum',
          a: 2,
        },
        c: 1,
      },
      { compareFn: (a, b) => (a > b ? -1 : 1), keepCircularReferences: false },

      { space: 2 },
    ] as const satisfies Parameters<typeof canonicalSerialization>

    expect(params1[2]?.space).toBeDefined()

    const result = canonicalSerialization(...params1)
    expect(result).toBe(`({
  "d": {
    "g": "lorem ipsum",
    "a": 2
  },
  "c": 1,
  "b": 2
})`)
  })

  it(`handles objects with single character string keys.`, () => {
    const unordered = {
      c: 3,
      a: () => {
        return 'sdfsf'
      },
      x: 'aInstance',
      2: 'sdf',
      3: 'sdfdsf',
      d: 2,
    } as const

    const ordered: typeof unordered = {
      2: 'sdf',
      3: 'sdfdsf',
      a: () => {
        return 'sdfsf'
      },
      c: 3,
      d: 2,
      x: 'aInstance',
    }
    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('handles multi-character string keys ', () => {
    const unordered = {
      c: 3,
      ab: 1,
      23: 'sdf',
      4: 2,
      34: 2,
      db: 2,
    } as const

    const ordered: typeof unordered = {
      23: 'sdf',
      34: 2,
      4: 2,
      ab: 1,
      c: 3,
      db: 2,
    }
    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('handles nested objects with single character keys', () => {
    const unordered = {
      b: {
        c: 3,
        a: 1,
        2: 'sdf',
        4: 2,
        3: 2,
        d: 2,
      },
      a: 2,
      c: {
        c: 5,
        b: {
          c: 2,
          b: 3,
        },
        a: 5,
        d: 3,
      },
      d: 3,
    } as const

    const ordered: typeof unordered = {
      a: 2,
      b: {
        2: 'sdf',
        3: 2,
        4: 2,
        a: 1,
        c: 3,
        d: 2,
      },
      c: {
        a: 5,
        b: {
          b: 3,
          c: 2,
        },
        c: 5,
        d: 3,
      },
      d: 3,
    }

    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('handles nested objects with multi character keys', () => {
    const unordered = nestedObject.unordered

    const ordered: typeof unordered = nestedObject.ordered

    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('preserves order of array elements while sorting nested objects.', () => {
    const unordered = [
      'c',
      'ab',
      nestedObject.unordered,
      '4',
      testFunction,
      nestedObject.unordered,
      'db',
      '4',
      'aa',
      'a',
    ] as const

    const ordered: typeof unordered = [
      'c',
      'ab',
      nestedObject.ordered,
      '4',
      testFunction,
      nestedObject.ordered,
      'db',
      '4',
      'aa',
      'a',
    ]

    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('preserves order of elements of arrays nested inside objects.', () => {
    const unordered = {
      ce: 'value1',
      b: ['c', 'ab', '23', '4', '34', 'db'],
      db: {
        c: 3,
        a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
        2: 'sdf',
        4: 2,
        3: 2,
        d: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      },
      d: 'value4',
      e: {
        c: testFunction,
        a: ['a', 'b', '11', 'd', testFunction, 'da', '123'],
        2: 'sdf',
        4: {
          c: 3,
          a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
          cb: 3,
        },
        3: 2,
        d: ['a', 'b', '11', 'd', 'db', 'da', testFunction],
      },
      3: ['a', 'b', '11', 'd', 'db', 'da', '123'],
    } as const

    const ordered: typeof unordered = {
      3: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      b: ['c', 'ab', '23', '4', '34', 'db'],
      ce: 'value1',
      d: 'value4',
      db: {
        2: 'sdf',
        3: 2,
        4: 2,
        a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
        c: 3,
        d: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      },
      e: {
        2: 'sdf',
        3: 2,
        4: {
          a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
          c: 3,
          cb: 3,
        },
        a: ['a', 'b', '11', 'd', testFunction, 'da', '123'],
        c: testFunction,
        d: ['a', 'b', '11', 'd', 'db', 'da', testFunction],
      },
    }

    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('handles complex object structures with nested objects and nested arrays', () => {
    const unordered = nestedObjectWithArrays.unordered
    const ordered: typeof unordered = nestedObjectWithArrays.ordered

    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })

  it('handles complex object structures nested inside root arrays', () => {
    const unordered = [
      'a',
      'b',
      nestedObjectWithArrays.unordered,
      'd',
      nestedObjectWithArrays.unordered,
      testFunction,
      '123',
    ] as const

    const ordered: typeof unordered = [
      'a',
      'b',
      nestedObjectWithArrays.ordered,
      'd',
      nestedObjectWithArrays.ordered,
      testFunction,
      '123',
    ]

    expect(
      canonicalSerialization(unordered, { keepCircularReferences: false })
    ).toEqual(serializeWithBrackets(ordered))
  })
})
