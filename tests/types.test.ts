import {
  isNodeWithId,
  isRefNode,
  type NodeWithId,
  type RefNode,
} from '@src/types'
import { expect, it } from 'vitest'

const nodeWithId: NodeWithId = {
  __csNodeId__: 1,
  value: {
    key1: 'value1',
    key2: 2,
  },
}
const refNode: RefNode = {
  __csNodeRef__: 1,
}
const neither = {
  __random__: 1,
  value: {
    key1: 'value1',
    key2: 2,
  },
}

const neither2 = {
  b: 1,
  nestd: {
    a: 'random',
  },
}

it('detects nodes with id.', () => {
  expect(isNodeWithId(nodeWithId)).toBe(true)
  expect(isNodeWithId(refNode)).toBe(false)
  expect(isNodeWithId(neither)).toBe(false)
  expect(isNodeWithId(neither2)).toBe(false)
})

it('detects ref nodes.', () => {
  expect(isRefNode(refNode)).toBe(true)
  expect(isRefNode(nodeWithId)).toBe(false)
  expect(isRefNode(neither)).toBe(false)
  expect(isRefNode(neither2)).toBe(false)
})
