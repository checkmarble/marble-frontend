import {
  type Connection,
  ControlButton,
  type Edge,
  getIncomers,
  getOutgoers,
  type Node,
  useNodesInitialized,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef } from 'react';
import { Icon } from 'ui-icons';

type LayoutElements<NodeType extends Node, EdgeType extends Edge> = (
  nodes: NodeType[],
  edges: EdgeType[],
) => {
  nodes: NodeType[];
  edges: EdgeType[];
};

export function useLayoutElements<NodeType extends Node, EdgeType extends Edge>({
  layoutElements,
}: {
  layoutElements: LayoutElements<NodeType, EdgeType>;
}) {
  const { fitView, getEdges, getNodes, setEdges, setNodes } = useReactFlow<NodeType, EdgeType>();
  const layoutElementsRef = useRef(layoutElements);
  return useCallback(
    (options: { fitView?: boolean }) => {
      const { nodes, edges } = layoutElementsRef.current(getNodes(), getEdges());
      setNodes(nodes);
      setEdges(edges);
      if (options.fitView) {
        window.requestAnimationFrame(() => {
          fitView();
        });
      }
    },
    [fitView, getEdges, getNodes, setEdges, setNodes],
  );
}

export function useLayoutInitializedNodes<NodeType extends Node, EdgeType extends Edge>({
  mode,
  layoutElements,
}: {
  mode: 'onMount' | 'onNodesInitialized';
  layoutElements: LayoutElements<NodeType, EdgeType>;
}) {
  const nodesInitialized = useNodesInitialized();
  const layoutElem = useLayoutElements({ layoutElements });

  const firstLayout = useRef(false);
  useEffect(() => {
    if (mode === 'onMount' && firstLayout.current) return;

    if (nodesInitialized) {
      firstLayout.current = true;
      layoutElem({ fitView: true });
    }
  }, [layoutElem, mode, nodesInitialized]);
}

export function AutoLayoutControlButton<NodeType extends Node, EdgeType extends Edge>({
  layoutElements,
}: {
  layoutElements: LayoutElements<NodeType, EdgeType>;
}) {
  const layoutElem = useLayoutElements({ layoutElements });
  return (
    <ControlButton
      title="Automatic layout"
      onClick={() => {
        layoutElem({ fitView: false });
      }}
    >
      <Icon icon="tree-schema" />
    </ControlButton>
  );
}

export function useIsValidConnection({
  singleOutgoer,
  singleIncomer,
  noCycle,
}: {
  singleOutgoer: boolean;
  singleIncomer: boolean;
  noCycle: boolean;
}) {
  const { getNodes, getEdges } = useReactFlow();
  return useCallback(
    (connection: Connection): boolean => {
      const nodes = getNodes();
      const edges = getEdges();

      const target = nodes.find((node) => node.id === connection.target);
      if (!target) return false;

      const source = nodes.find((node) => node.id === connection.source);
      if (!source) return false;

      if (singleOutgoer && getOutgoers(source, nodes, edges).length >= 1) return false;

      if (singleIncomer && getIncomers(target, nodes, edges).length >= 1) return false;

      if (noCycle) {
        if (target.id === connection.source) return false;
        const hasCycle = (node: Node, visited = new Set()) => {
          if (visited.has(node.id)) return false;

          visited.add(node.id);

          for (const outgoer of getOutgoers(node, nodes, edges)) {
            if (outgoer.id === connection.source) return true;
            if (hasCycle(outgoer, visited)) return true;
          }
        };
        return !hasCycle(target);
      }
      return true;
    },
    [getNodes, getEdges, singleOutgoer, singleIncomer, noCycle],
  );
}
