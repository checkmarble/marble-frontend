import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

/**
 * Screening categories that can be checked for hits.
 * These map to OpenSanctions topics.
 */
export type MonitoringListHitType = 'sanctions' | 'peps' | 'third-parties' | 'adverse-media';

/**
 * Navigation index configuration for "down" traversal (to child entities).
 * Required when extending checks to child tables (e.g., company → users).
 */
export type NavigationIndex = {
  /** Field name to order by (e.g., 'created_at', 'updated_at') */
  fieldName: string;
  /** Sort order */
  order: 'asc' | 'desc';
};

/**
 * Configuration for checking linked objects in addition to the main object.
 * Used in Step 3 (Advanced setups) to cascade checks to related entities.
 */
export type LinkedObjectCheck = {
  /** Target table to extend the check to */
  tableName: string;
  /** Path from main object to this linked table (via link names) */
  fieldPath: string[];
  /** Relationship direction: 'up' = parent table, 'down' = child table */
  direction: 'up' | 'down';
  /** Whether this linked check is enabled */
  enabled: boolean;
  /** Navigation index config - required for 'down' direction */
  navigationIndex?: NavigationIndex;
  /** Whether the configuration has been validated (for 'down' direction) */
  validated?: boolean;
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
    /** Optional: specific continuous screening config IDs to filter by (empty = all) */
    screeningConfigIds: ConstantAstNode<string[]>;
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
  screeningConfigIds = [],
  hitTypes = [],
  linkedObjectChecks = [],
}: {
  objectTableName?: string;
  objectPath?: string[];
  screeningConfigIds?: string[];
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
      screeningConfigIds: NewConstantAstNode({ constant: screeningConfigIds }),
      hitTypes: NewConstantAstNode({ constant: hitTypes }),
      linkedObjectChecks: NewConstantAstNode({ constant: linkedObjectChecks }),
    },
  };
}
