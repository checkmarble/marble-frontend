import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { type Edge, type Node } from '@xyflow/react';

export type PersonRfData = {
  label: string;
  subEntity: FtmEntityPersonOption;
  isStart: boolean;
  objectType: string;
  objectId: string;
};

export type PivotRfData = {
  label: string;
  rawType: string;
};

export type PersonRfNode = Node<PersonRfData, 'person'>;
export type PivotRfNode = Node<PivotRfData, 'pivot'>;
export type GraphRfNode = PersonRfNode | PivotRfNode;

export type GraphRfEdge = Edge<{ kind?: string }, 'link' | 'match'>;
