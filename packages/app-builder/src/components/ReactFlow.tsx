import {
  ControlButton,
  type Edge,
  type FitViewOptions,
  type Node,
  useNodesInitialized,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef } from 'react';
import { Icon } from 'ui-icons';
import { graphFitViewOptions } from './Graph/lib/graph-fit-view';

type LayoutElements<NodeType extends Node, EdgeType extends Edge> = (
  nodes: NodeType[],
  edges: EdgeType[],
) => {
  nodes: NodeType[];
  edges: EdgeType[];
};

function useLayoutElements<NodeType extends Node, EdgeType extends Edge>({
  layoutElements,
  fitViewOptions = graphFitViewOptions,
}: {
  layoutElements: LayoutElements<NodeType, EdgeType>;
  fitViewOptions?: FitViewOptions<NodeType>;
}) {
  const { fitView, getEdges, getNodes, setEdges, setNodes } = useReactFlow<NodeType, EdgeType>();
  const layoutElementsRef = useRef(layoutElements);
  layoutElementsRef.current = layoutElements;
  const fitViewOptionsRef = useRef(fitViewOptions);
  fitViewOptionsRef.current = fitViewOptions;
  return useCallback(
    (options: { fitView?: boolean }) => {
      const { nodes, edges } = layoutElementsRef.current(getNodes(), getEdges());
      setNodes(nodes);
      setEdges(edges);
      if (options.fitView) {
        window.requestAnimationFrame(() => {
          fitView(fitViewOptionsRef.current);
        });
      }
    },
    [fitView, getEdges, getNodes, setEdges, setNodes],
  );
}

export function useLayoutInitializedNodes<NodeType extends Node, EdgeType extends Edge>({
  mode,
  layoutElements,
  fitViewOptions,
}: {
  mode: 'onMount' | 'onNodesInitialized';
  layoutElements: LayoutElements<NodeType, EdgeType>;
  fitViewOptions?: FitViewOptions<NodeType>;
}) {
  const nodesInitialized = useNodesInitialized();
  const layoutElem = useLayoutElements({ layoutElements, fitViewOptions });

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
