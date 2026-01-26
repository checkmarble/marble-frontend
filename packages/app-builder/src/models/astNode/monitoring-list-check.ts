import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

/**
 * Screening categories that can be checked for hits.
 * These map to OpenSanctions topics.
 */
export type MonitoringListHitType = 'sanctions' | 'peps' | 'third-parties' | 'adverse-media';

/**
 * OpenSanctions topics for monitoring list checks.
 * See: https://www.opensanctions.org/docs/topics/
 */
export const MONITORING_LIST_TOPICS = [
  'sanction',
  'sanction.linked',
  'sanction.counter',
  'debarment',
  'role.pep',
  'role.rca',
  'poi',
  'reg.action',
  'reg.warn',
] as const;

export type MonitoringListTopic = (typeof MONITORING_LIST_TOPICS)[number];

/**
 * A segment in the object path, containing both the link name and target table name.
 * This provides full context for navigating between tables.
 */
export type ObjectPathSegment = {
  /** The name of the link to follow */
  linkName: string;
  /** The name of the table reached via this link */
  tableName: string;
};

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
  /** Path from main object to this linked table. Each segment contains link name and target table. */
  fieldPath: ObjectPathSegment[];
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
    /** Link path to the object (empty array = trigger object). Each segment contains link name and target table. */
    objectPath: ConstantAstNode<ObjectPathSegment[]>;
    /** Optional: specific continuous screening config IDs to filter by (empty = all) */
    screeningConfigIds: ConstantAstNode<string[]>;
    /** OpenSanctions topics to check for (sanction, role.pep, etc.) */
    topics: ConstantAstNode<MonitoringListTopic[]>;
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
  topics = [],
  linkedObjectChecks = [],
}: {
  objectTableName?: string;
  objectPath?: ObjectPathSegment[];
  screeningConfigIds?: string[];
  topics?: MonitoringListTopic[];
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
      topics: NewConstantAstNode({ constant: topics }),
      linkedObjectChecks: NewConstantAstNode({ constant: linkedObjectChecks }),
    },
  };
}
