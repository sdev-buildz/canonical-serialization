import type { canonicalSerialization } from '@canonical-serialization'
import { isNodeWithId, isRefNode, type NodeIdType } from './types'

/**
 * Deserializes the strings produced by {@link canonicalSerialization}.
 */
export const deserialize = (input: string): unknown => {
  const obj = eval(input)
  if (!isNodeWithId(obj)) return obj

  /** Maps {@link NodeIdType} to the value pointed to by the corresponding nodes. */
  const idMap: Map<NodeIdType, unknown> = new Map([
    [obj.__csNodeId__, obj.value],
  ])

  const dfsQueue: Array<Record<string, unknown> | unknown[]> = [obj.value]

  while (dfsQueue.length) {
    const curr = dfsQueue.shift()
    if (!curr) throw new Error('Unexpected Error')

    for (const [key, child] of Object.entries(curr)) {
      //  Returning from leaf nodes
      if (!child || typeof child !== 'object') continue

      // Pushing next node to iter
      if (isNodeWithId(child)) {
        idMap.set(child.__csNodeId__, child.value)
        assignToKey(curr, key, child.value)
        dfsQueue.push(child.value)
        continue
      }
      //  Replacing ref nodes with the actual nodes.
      //    Restoring circular references
      if (isRefNode(child)) {
        assignToKey(curr, key, idMap.get(child.__csNodeRef__))
      }
    }
  }

  return obj.value
}

/**
 * Assigns to arrays by indexes.
 * Assigns to objects by keys.
 */
export const assignToKey = (
  parent: Record<string, unknown> | unknown[],
  idx: string | number,
  value: unknown
) => {
  if (Array.isArray(parent)) parent[Number(idx)] = value
  else parent[idx] = value
}
