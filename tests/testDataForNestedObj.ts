const fun1 = () => {
  return 'sample log'
}
const unordered = {
  64: {
    36: {
      3: 3,
      a: 1,
      24: fun1,
      ba: 1,
      ca: 'a random string',
    },
    5: 1,
    1: 1,
    6: ' a string',
    24: 2,
  },
  b: {
    c: 3,
    b: 2,
    d: 4,
  },
  1: {
    ba: 1,
    ca: {
      ac: fun1,
      b: 'sample',
      4: 5,
    },
    3: 3,
    a: 1,
    24: 2,
  },
  a: fun1,
  av: {
    ba: 1,
    ca: 1,
    3: 3,
    b: 5,
    a: 'sample',
    24: 2,
  },
  7: 3,
  ba: 'random',
  c: 3,
} as const

const ordered: typeof unordered = {
  1: {
    3: 3,
    a: 1,
    24: 2,
    ba: 1,
    ca: {
      4: 5,
      ac: fun1,
      b: 'sample',
    },
  },
  64: {
    1: 1,
    24: 2,
    36: {
      3: 3,
      a: 1,
      24: fun1,
      ba: 1,
      ca: 'a random string',
    },
    5: 1,
    6: ' a string',
  },
  7: 3,
  a: fun1,
  av: {
    24: 2,
    3: 3,
    a: 'sample',
    b: 5,
    ba: 1,
    ca: 1,
  },
  b: {
    b: 2,
    c: 3,
    d: 4,
  },
  ba: 'random',
  c: 3,
} as const

/**
 * Nested object for testing
 */
export const nestedObject = {
  unordered,
  ordered,
} as const

/**
 * Type checking of equality of the unordered and ordered objects.
 * It relies on the 'as const' assertion on the {@link nestedObject}.
 */
const b: (typeof nestedObject)['ordered'] = nestedObject.unordered
if (!b) {
  //
}
