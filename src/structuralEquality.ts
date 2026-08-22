import { canonicalSerialization } from '.'

/**
 * Performs deep structural equality comparison between objects.
 * @example
 * ```ts
 * import { canonicalSerialization, areStructurallyEqual } from "canonicalSerialization";
 *
 * const obj1 = {
 *  b: 2,
 *  a: {
 *    c: 1,
 *  },
 *  d: {
 *    g: "lorem ipsum",
 *    q: {
 *      m: "m",
 *      p: "p",
 *      n: "n",
 *      a: 5 as number | Record<string, unknown>,
 *    },
 *    a: 2 as number | Record<string, unknown>,
 *   },
 * };
 * obj1.d.a = obj1.a;
 * obj1.d.q.a = obj1.d;
 *
 * // This obj2 is structurally the same as obj1.
 * // But obj1 and obj2 do not share the same reference.
 * // The order of keys is also different.
 * const obj2 = structuralClone(obj1) as Partial<typeof obj1>;
 * obj2.delete a
 * obj2.a = structuralClone(obj1.a)
 *
 * console.log(Object.is(obj1, obj2)) // Outputs: false
 *
 * try {
 *  // Throws because of circular reference
 *  console.log(JSON.stringify(obj1) === JSON.stringify(obj2))
 * } catch (err) {
 *  //
 * }
 *
 * // Outputs: true
 * console.log(areStructurallyEqual(obj1,obj2))
 * ```
 */
export const areStructurallyEqual = (obj1: unknown, obj2: unknown): boolean => {
  return canonicalSerialization(obj1) === canonicalSerialization(obj2)
}
