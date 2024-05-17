import * as React from 'react';
import {
  ControlButton,
  type Edge,
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
      const { nodes, edges } = layoutElementsRef.current(
        getNodes(),
        getEdges(),
      );
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
