import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

/**
 * Screening categories that can be checked for hits.
 * These map to OpenSanctions topics.
 */
export type MonitoringListHitType = 'sanctions' | 'peps' | 'third-parties' | 'adverse-media';

/**
 * Configuration for checking linked objects in addition to the main object.
 */
export type LinkedObjectCheck = {
  fromTable: string;
  fromField: string;
  toTable: string;
};

export const monitoringListCheckAstNodeName = 'MonitoringListCheck';

/**
 * AST node for checking if an entity has hits on monitoring lists
 * (sanctions, PEP, adverse media, etc.) from continuous screening.
 *
 * This is an EditableAstNode that requires a modal for configuration.
 */
export interface MonitoringListCheckAstNode {
  id: string;
  name: typeof monitoringListCheckAstNodeName;
  constant?: undefined;
  children: [];
  namedChildren: {
    /** The table name of the object to check */
    objectTableName: ConstantAstNode<string>;
    /** Link path to the object (empty array = trigger object) */
    objectPath: ConstantAstNode<string[]>;
    /** Optional: specific continuous screening config ID to filter by */
    screeningConfigId: ConstantAstNode<string | null>;
    /** Hit types to check for (sanctions, PEP, etc.) */
    hitTypes: ConstantAstNode<MonitoringListHitType[]>;
    /** Advanced: additional linked objects to also check */
    linkedObjectChecks: ConstantAstNode<LinkedObjectCheck[]>;
  };
}

/**
 * Type guard to check if a node is a MonitoringListCheckAstNode.
 */
export function isMonitoringListCheckAstNode(
  node: IdLessAstNode | AstNode,
): node is CheckNodeId<MonitoringListCheckAstNode, typeof node> {
  return node.name === monitoringListCheckAstNodeName;
}

/**
 * Factory function to create a new MonitoringListCheckAstNode with default values.
 */
export function NewMonitoringListCheckAstNode({
  objectTableName = '',
  objectPath = [],
  screeningConfigId = null,
  hitTypes = [],
  linkedObjectChecks = [],
}: {
  objectTableName?: string;
  objectPath?: string[];
  screeningConfigId?: string | null;
  hitTypes?: MonitoringListHitType[];
  linkedObjectChecks?: LinkedObjectCheck[];
} = {}): MonitoringListCheckAstNode {
  return {
    id: uuidv7(),
    name: monitoringListCheckAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      objectTableName: NewConstantAstNode({ constant: objectTableName }),
      objectPath: NewConstantAstNode({ constant: objectPath }),
      screeningConfigId: NewConstantAstNode({ constant: screeningConfigId }),
      hitTypes: NewConstantAstNode({ constant: hitTypes }),
      linkedObjectChecks: NewConstantAstNode({ constant: linkedObjectChecks }),
    },
  };
}
