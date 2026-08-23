import type { canonicalSerialization } from './canonicalSerialization'
import type { deserialize } from './deserialize'
import type { DeepReadonly, NodeWithId, RefNode } from './types'

/**
 * Modifies objects for {@link canonicalSerialization}.
 *
 * Accepts an object and recursively sorts its keys in alphabetical order.
 * Order of elements of arrays are preserved.
 *
 * Replaces circular references with serializable references in order to restore them during deserialization.
 * @param compareFn - Function used to determine the order of the elements.
 *    It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise.
 *    If omitted, the elements are sorted in ascending, UTF-16 code unit order.
 * @example
 * ```ts
 * const obj1 = {
 *  b: 2,
 *  d: {
 *    // inside nested object
 *    g: 'lorem ipsum',
 *    a: 2,
 *  },
 *  c: 1,
 * }
 *
 * console.log(sortObjectByKeys(obj1))
 * // Outputs:
 * // ({
 * //   "b": 2,
 * //   "c": 1,
 * //   "d": {
 * //     "a": 2,
 * //     "g": "lorem ipsum"
 * //   }
 * // })
 * ```
 */
export function prepareObject<T = unknown>(
  unordered: T,
  options?: DeepReadonly<{
    compareFn?: Parameters<Array<string>['sort']>[0]
    /** If true, throws when it detects any circular reference */
    throwOnCircularReference?: boolean
    /**
     * If true, circular references are serialized. They can be restored by {@link deserialize}
     * Defaults to true, if this field is not set.
     */
    keepCircularReferences?: boolean
    /**
     * If true, sibling references are restored.
     * Defaults to false. But if keepCircularReferences is true, this also defaults to true.
     * If false, sibling references are resolved and replaced with a deep copy of the referenced object.
     */
    keepNonCircularReferences?: boolean
  }>
) {
  const getNewNodeId = (() => {
    let id = 0
    return () => {
      return id++
    }
  })()
  const configOptions = { ...options }
  if (!('keepCircularReferences' in configOptions))
    configOptions.keepCircularReferences = true
  if (
    configOptions?.keepCircularReferences &&
    !('keepNonCircularReferences' in configOptions)
  )
    configOptions.keepNonCircularReferences = true

  /** Whether the circular references are to be ignored. */
  const removeCircularReferences =
    configOptions?.throwOnCircularReference ||
    !configOptions?.keepCircularReferences

  /** Sorts the root keys of the input object. Doesn't sort keys of nested objects. */
  const sortByRootKeys = <T>(input: T): T => {
    if (!input || typeof input !== 'object') return input
    if (Array.isArray(input)) return [...input] as T
    const obj: Record<string, unknown> = input as Record<string, unknown>
    return Object.keys(obj)
      .sort(configOptions?.compareFn)
      .reduce<Partial<typeof obj>>(
        (acc: Partial<typeof obj>, key: keyof typeof obj) => {
          acc[key] = obj[key]
          return acc
        },
        {} as Partial<typeof obj>
      ) as T
  }

  if (!unordered || typeof unordered !== 'object') return unordered

  /**
   * Reference to the object to return;
   */
  const orderedRef: {
    ordered: NodeWithId
  } = {
    ordered: {
      __csNodeId__: getNewNodeId(),
      value: sortByRootKeys(unordered) as
        Record<string, unknown> | Array<unknown>,
    },
  }

  /** DFS stack. */
  const dfsStack: Array<{
    /** The index of the child currently being iterated. */
    childIndex: number
    /** The transformed node to be stored in the output object. */
    currentNode: NodeWithId
  }> = [
    {
      childIndex: -1,
      currentNode: orderedRef.ordered,
    },
  ]

  /**
   * The visited nodes. Used to detect circular references.
   * Maps nodes in input to their corresponding nodes in output.
   */
  const visited: WeakMap<WeakKey, NodeWithId> = new WeakMap([
    [unordered, orderedRef.ordered],
  ])

  // DFS Traversal
  while (dfsStack.length) {
    /** The currently iterated element in {@link dfsStack} */
    const curr = dfsStack.at(-1)
    if (!curr) throw new Error('Unexpected Error: Invalid DFS pointer state.')

    //  Update the children iteration index to next child. (will be used in the next iteration).
    curr.childIndex += 1

    /** The value pointed to by the current node. */
    const currValue = curr.currentNode.value

    /** The number of children in the current node */
    const childCount: number = Array.isArray(currValue)
      ? currValue.length
      : Object.keys(currValue).length

    if (curr.childIndex >= childCount) {
      //  Pop the current node from dfs stack, if the node has no child left to iterate.
      dfsStack.pop()
      continue
    }

    /** The next child to iter. */
    const nextChild = Array.isArray(currValue)
      ? currValue[curr.childIndex]
      : currValue[
          Object.keys(currValue)[curr.childIndex] as keyof typeof currValue
        ]

    if (isLeafNode(nextChild)) {
      //  If the next child is neither an object nor an array, skip it.
      //  For example, string and number nodes are leaf nodes.
      continue
    }

    if (visited.has(nextChild)) {
      //  If the next child is already visited, it is a circular or a sibling reference.

      /** The already visited node pointed to by the current node. */
      const visitedNode = visited.get(nextChild)
      if (!visitedNode) throw new Error('Unexpected Error.')

      if (
        removeCircularReferences ||
        !configOptions?.keepNonCircularReferences
      ) {
        let referenceType: 'circular' | 'sibling' = 'sibling'

        for (const curr of dfsStack) {
          if (curr!.currentNode.__csNodeId__ === visitedNode.__csNodeId__) {
            //  it is a circular reference
            referenceType = 'circular'
            break
          }
        }

        /** Whether the reference node has been processed. If true, {@link RefNode} will not be assigned. */
        let handled = true
        if (referenceType === 'circular') {
          if (configOptions?.throwOnCircularReference)
            throw new Error('Circular Reference')
          //  Replacing circular reference with undefined
          else if (!configOptions?.keepCircularReferences) {
            assignToIndex(currValue, curr.childIndex)
          } else handled = false
        } else {
          assignToIndex(currValue, curr.childIndex, visitedNode.value)
        }
        if (handled) continue
      }

      /** The ref node pointing to an already visited node. (Circular Reference) */
      const nextNode: RefNode = {
        __csNodeRef__: visitedNode.__csNodeId__,
      }
      assignToIndex(currValue, curr.childIndex, nextNode)
      continue
    }

    /** Sorted value of the next child. */
    const orderedNextChildValue: typeof nextChild = sortByRootKeys(nextChild)

    /** The next node to visit */
    const nextNode: NodeWithId = {
      __csNodeId__: getNewNodeId(),
      value: orderedNextChildValue as Record<string, unknown> | Array<unknown>,
    }

    // Assign the next node to the output
    assignToIndex(
      currValue,
      curr.childIndex,
      removeCircularReferences ? nextNode.value : nextNode
    )

    //  Push the next node to the dfsStack
    dfsStack.push({
      childIndex: -1,
      currentNode: nextNode,
    })
    visited.set(nextChild, nextNode)
  }

  return removeCircularReferences
    ? orderedRef.ordered.value
    : orderedRef.ordered
}

/**
 * Assigns the value to the index of the array or the key of the object.
 */
export const assignToIndex = (
  parent: Record<string, unknown> | unknown[],
  idx: string | number,
  value?: unknown
) => {
  if (Array.isArray(parent)) parent[Number(idx)] = value
  else parent[Object.keys(parent)[Number(idx)] as keyof typeof parent] = value
}

type LeafNode =
  | undefined
  | null
  | number
  | string
  | boolean
  | Date
  | RegExp
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  | Function
  | typeof Map
  | typeof Set
  | URL

const isLeafNode = (node: unknown): node is LeafNode => {
  if (!node || typeof node !== 'object') return true
  return (
    node instanceof RegExp ||
    node instanceof Date ||
    node instanceof Map ||
    node instanceof Set ||
    node instanceof URL
  )
}
