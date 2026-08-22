import { nestedObject } from './testDataForNestedObj'

/**
 * Nested object for testing
 */
export const nestedObjectWithArrays = {
  unordered: {
    ce: 'value1',
    b: ['c', 'ab', nestedObject.unordered, '4', '34', 'db'],
    db: {
      c: 3,
      a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      2: 'sdf',
      4: 2,
      3: 2,
      d: ['a', 'b', '11', 'd', 'db', nestedObject.unordered, '123'],
    },
    d: 'value4',
    e: {
      c: 3,
      a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      2: 'sdf',
      4: {
        c: 3,
        a: ['a', nestedObject.unordered, '11', 'd', 'db', 'da', '123'],
        cb: 3,
      },
      3: 2,
      d: ['a', 'b', '11', 'd', 'db', 'da', '123'],
    },
    3: ['a', 'b', '11', 'd', 'db', 'da', '123'],
  } as const,
  ordered: {
    3: ['a', 'b', '11', 'd', 'db', 'da', '123'],
    b: ['c', 'ab', nestedObject.ordered, '4', '34', 'db'],
    ce: 'value1',
    d: 'value4',
    db: {
      2: 'sdf',
      3: 2,
      4: 2,
      a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      c: 3,
      d: ['a', 'b', '11', 'd', 'db', nestedObject.ordered, '123'],
    },
    e: {
      2: 'sdf',
      3: 2,
      4: {
        a: ['a', nestedObject.ordered, '11', 'd', 'db', 'da', '123'],
        c: 3,
        cb: 3,
      },
      a: ['a', 'b', '11', 'd', 'db', 'da', '123'],
      c: 3,
      d: ['a', 'b', '11', 'd', 'db', 'da', '123'],
    },
  } as const,
}

/**
 * Type checking of equality of the unordered and ordered objects.
 * It relies on the 'as const' assertion on the {@link nestedObject}.
 */
const b: (typeof nestedObject)['ordered'] = nestedObject.unordered
if (!b) {
  //
}
