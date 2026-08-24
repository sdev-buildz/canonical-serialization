/**
 * Reference nodes in the serialized string,
 * Points to already serialized node in circular reference.
 */
export type RefNode = { __csNodeRef__: NodeIdType }

/**
 * In the serialized string, nodes are assigned id to uniquely identify
 *  and detect circular references.
 */
export type NodeWithId<
  T extends Record<string, unknown> | Array<unknown> =
    Record<string, unknown> | Array<unknown>,
> = { __csNodeId__: NodeIdType; value: T }

/**
 * Id of the node
 */
export type NodeIdType = number

/**
 * Type Guard for {@link RefNode}
 */
export const isRefNode = (node: unknown): node is RefNode => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false
  return ('__csNodeRef__' satisfies keyof RefNode) in node
}

/**
 * Type Guard for {@link NodeWithId}
 */
export const isNodeWithId = (node: unknown): node is NodeWithId => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false
  return ('__csNodeId__' satisfies keyof NodeWithId) in node
}

/**
 * Recursively adds readonly modifer to the keys of the object.
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}
