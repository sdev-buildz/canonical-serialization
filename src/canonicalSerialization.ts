import serializeJavascript from 'serialize-javascript'
import { prepareObject } from './prepareObject'
import type { DeepReadonly } from './types'

/**
 * Serializes objects (can contain circular references) into unique, deterministic and deserializable strings.
 *
 * It can perform a form of deep structural equality comparison between objects.
 *
 * To ensure consistency, it sorts keys of the objects recursively, so that even if the
 *  order of the keys are changed, the serialization will still emit the same string.
 *
 * Uses {@link serializeJavascript} internally, to serialize non-serializable values such as functions.
 * @example
 * ```ts
 * import { canonicalSerialization } from "canonicalSerialization";
 *
 * // keys of this object are unsorted
 * const obj1 = {
 *  b : 2,
 *  d : {
 *    // inside nested object
 *    g: () => {
 *      return 'lorem ipsum';
 *    },
 *    a: new Date()
 *  },
 *  c : 1,
 * }
 *
 * console.log(canonicalSerialization(obj1, {
 *  keepCircularReferences: false,
 * }))
 * // Outputs:
 * // ({
 * //  "b": 2,
 * //  "c": 1,
 * //  "d": {
 * //    "a": new Date("2026-07-30T18:01:32.236Z"),
 * //    "g": ()=>{return"lorem ipsum"}
 * //  }
 * // })
 * // keys are sorted. functions are also serialized.
 *
 * // To serialize circular references, set keepCircularReferences option to true
 * const serializedWithCircularReferences = canonicalSerialization(obj1);
 * ```
 */
export const canonicalSerialization = (
  obj: unknown,
  options?: Parameters<typeof prepareObject>[1],
  serializeJsOptions?: DeepReadonly<Parameters<typeof serializeJavascript>[1]>
): string => {
  return `(${serializeJavascript(prepareObject(obj, options), serializeJsOptions)})`
}
