/**
 * @returns readonly test object.
 */
export const getTestObj = (): Readonly<Record<string, unknown>> => {
  const obj1 = {
    b: 2,
    a: {
      c: 1,
    },
    d: {
      g: 'lorem ipsum',
      q: {
        m: 'm',
        p: 'p',
        n: 'n',
        a: 5 as number | Record<string, unknown>,
      },
      a: 2 as number | Record<string, unknown>,
    },
  }
  obj1.d.a = obj1.a
  obj1.d.q.a = obj1.d

  return obj1
}
