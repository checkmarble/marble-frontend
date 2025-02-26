import * as React from 'react';
import {
  type Connection,
  ControlButton,
  type Edge,
  getIncomers,
  getOutgoers,
  type Node,
  useNodesInitialized,
  useReactFlow,
} from 'reactflow';
import { Icon } from 'ui-icons';

type LayoutElements<NodeData, EdgeData> = (
  nodes: Node<NodeData>[],
  edges: Edge<EdgeData>[],
) => {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
};

export function useLayoutElements<NodeData, EdgeData>({
  layoutElements,
}: {
  layoutElements: LayoutElements<NodeData, EdgeData>;
}) {
  const { fitView, getEdges, getNodes, setEdges, setNodes } = useReactFlow();
  const layoutElementsRef = React.useRef(layoutElements);
  return React.useCallback(
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

export function useLayoutInitializedNodes<NodeData, EdgeData>({
  mode,
  layoutElements,
}: {
  mode: 'onMount' | 'onNodesInitialized';
  layoutElements: LayoutElements<NodeData, EdgeData>;
}) {
  const nodesInitialized = useNodesInitialized();
  const layoutElem = useLayoutElements({ layoutElements });

  const firstLayout = React.useRef(false);
  React.useEffect(() => {
    if (mode === 'onMount' && firstLayout.current) return;

    if (nodesInitialized) {
      firstLayout.current = true;
      layoutElem({ fitView: true });
    }
  }, [layoutElem, mode, nodesInitialized]);
}

export function AutoLayoutControlButton<NodeData, EdgeData>({
  layoutElements,
}: {
  layoutElements: LayoutElements<NodeData, EdgeData>;
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
  return React.useCallback(
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
