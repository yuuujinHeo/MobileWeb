import { TreeNode } from "primereact/treenode";

export interface Category{
    id: number;
    name: string;
    type: string;
    parent_id: number;
    key: string;
    children?: TreeNode[];
}
export interface Category_Node{
    id: number;
    name: string;
    type: string;
    parent_id: number;
    key: string;
}


export function findNodeByKey(tree:TreeNode[], key:string): TreeNode | null {
    for (const node of tree) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
