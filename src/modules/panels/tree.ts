/**
 * @file Tree operations for panel-system (no registry or focus concerns).
 */
import type { GroupId, PanelTree, SplitDirection } from "./types";

export type PathSegment = "a" | "b";
export type NodePath = PathSegment[];

export const isGroup = (node: PanelTree): node is Extract<PanelTree, { type: "group" }> => {
  return (node as { type: string }).type === "group";
};

export const collectGroupsInOrder = (node: PanelTree, acc: GroupId[] = []): GroupId[] => {
  if (isGroup(node)) {
    return [...acc, node.groupId];
  }
  const a = collectGroupsInOrder(node.a, acc);
  return collectGroupsInOrder(node.b, a);
};

export const getAtPath = (root: PanelTree, path: NodePath): PanelTree => {
  return path.reduce<PanelTree>((node, key) => (isGroup(node) ? node : node[key]), root);
};

export const setAtPath = (root: PanelTree, path: NodePath, value: PanelTree): PanelTree => {
  if (path.length === 0) {
    return value;
  }
  const [head, ...rest] = path;
  if (isGroup(root)) {
    // Invalid set; return original root
    return root;
  }
  const next = head === "a" ? { ...root, a: setAtPath(root.a, rest, value) } : { ...root, b: setAtPath(root.b, rest, value) };
  return next;
};

/**
 * Find split parent of a given group leaf. This function explicitly returns the path to the split node
 * and which side ("a" | "b") the target group occupies under that split. If there is no split parent
 * (i.e., the root is the leaf group), splitPath and side are null.
 */
export const findLeafParent = (
  node: PanelTree,
  groupId: GroupId,
  path: NodePath = [],
): { splitPath: NodePath | null; side: PathSegment | null } | null => {
  if (isGroup(node)) {
    if (node.groupId === groupId) {
      return { splitPath: null, side: null };
    }
    return null;
  }
  // Search child A; if it is the group leaf, current node is parent and side is 'a'
  if (isGroup(node.a) && node.a.groupId === groupId) {
    return { splitPath: path, side: "a" };
  }
  // Search child B
  if (isGroup(node.b) && node.b.groupId === groupId) {
    return { splitPath: path, side: "b" };
  }
  // Recurse deeper
  const inA = findLeafParent(node.a, groupId, [...path, "a"]);
  if (inA) {
    return inA;
  }
  return findLeafParent(node.b, groupId, [...path, "b"]);
};

/**
 * Split the leaf group referenced by groupId into a split node, keeping the original group on side 'a'
 * and inserting a new group on side 'b'. Returns the new tree and the new group's id.
 * This function does not touch registries; only pure tree transformation.
 */
export const splitLeaf = (
  root: PanelTree,
  groupId: GroupId,
  direction: SplitDirection,
  createGroupId: () => GroupId,
): { tree: PanelTree; newGroupId: GroupId } => {
  const newGroupId = createGroupId();
  const entry = findLeafParent(root, groupId);
  const replacement: PanelTree = {
    type: "split",
    direction,
    ratio: 0.5,
    a: { type: "group", groupId },
    b: { type: "group", groupId: newGroupId },
  } as const;

  if (!entry || entry.splitPath === null) {
    // Root is the leaf
    return { tree: replacement, newGroupId };
  }
  const parentPath = entry.splitPath;
  const parent = getAtPath(root, parentPath);
  if (isGroup(parent)) {
    // Should not happen; guard for safety
    return { tree: replacement, newGroupId };
  }
  const newParent = entry.side === "a" ? { ...parent, a: replacement } : { ...parent, b: replacement };
  const newTree = setAtPath(root, parentPath, newParent);
  return { tree: newTree, newGroupId };
};

/**
 * Remove the leaf group by collapsing it with its sibling. Returns the new tree and the survivor group id
 * (if any). If there is no split parent (single group), returns the original tree.
 */
export const closeLeaf = (root: PanelTree, groupId: GroupId): { tree: PanelTree; survivorGroupId: GroupId | null } => {
  const entry = findLeafParent(root, groupId);
  if (!entry || entry.splitPath === null) {
    // Single-group root
    return { tree: root, survivorGroupId: groupId };
  }
  const parentPath = entry.splitPath;
  const parent = getAtPath(root, parentPath);
  if (isGroup(parent)) {
    return { tree: root, survivorGroupId: groupId };
  }
  const survivor = entry.side === "a" ? parent.b : parent.a;
  const newTree = setAtPath(root, parentPath, survivor);
  const survivorId = isGroup(survivor) ? survivor.groupId : collectGroupsInOrder(survivor)[0] ?? null;
  return { tree: newTree, survivorGroupId: survivorId };
};

