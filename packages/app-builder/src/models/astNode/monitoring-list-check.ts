import { type DataModel } from '@app-builder/models';
import { v7 as uuidv7 } from 'uuid';

import { type AstNode, type CheckNodeId, type IdLessAstNode } from './ast-node';
import { type ConstantAstNode, NewConstantAstNode } from './constant';

// ============================================================================
// API Format Types (for serialization to backend)
// ============================================================================

/**
 * Reference to a navigation option for "down" direction linked table checks.
 * Contains the essential fields needed to identify the navigation relationship.
 */
export type NavigationOptionRef = {
  /** The child table name (e.g., "transaction") */
  targetTableName: string;
  /** The field in the child table that references the parent (e.g., "company_id") */
  targetFieldName: string;
  /** The parent table name (e.g., "company") */
  sourceTableName: string;
  /** The field in the parent table being referenced (e.g., "id") */
  sourceFieldName: string;
};

/**
 * API format for a linked table check.
 * - "Up" direction (parent): uses `linkToSingleName`
 * - "Down" direction (child): uses `navigationOption`
 */
export type LinkedTableCheck =
  | { tableName: string; linkToSingleName: string }
  | { tableName: string; navigationOption: NavigationOptionRef };

/**
 * Helper type guard to check if a LinkedTableCheck is an "up" direction check.
 */
export function isUpDirectionCheck(check: LinkedTableCheck): check is { tableName: string; linkToSingleName: string } {
  return 'linkToSingleName' in check;
}

/**
 * Helper type guard to check if a LinkedTableCheck is a "down" direction check.
 */
export function isDownDirectionCheck(
  check: LinkedTableCheck,
): check is { tableName: string; navigationOption: NavigationOptionRef } {
  return 'navigationOption' in check;
}

/**
 * The configuration constant for MonitoringListCheck AST node.
 * This is the API format sent to the backend.
 */
export type MonitoringListCheckConfig = {
  /** The table name of the object to check */
  targetTableName: string;
  /** Link names path to the target object (empty array = trigger object) */
  pathToTarget: string[];
  /** OpenSanctions topics to filter by (empty = all). Contains individual topic strings from SCREENING_TOPICS_MAP. */
  topicFilters: string[];
  /** Additional linked tables to also check */
  linkedTableChecks: LinkedTableCheck[];
};

// ============================================================================
// UI State Types (for wizard/modal internal state)
// ============================================================================

/**
 * A segment in the object path, containing both the link name and target table name.
 * Used internally by the UI for richer navigation context.
 */
export type ObjectPathSegment = {
  /** The name of the link to follow */
  linkName: string;
  /** The name of the table reached via this link */
  tableName: string;
};

/**
 * Navigation index configuration for "down" traversal (to child entities).
 * Used internally by the UI for step 3 configuration.
 */
export type NavigationIndex = {
  /** Field name to order by (e.g., 'created_at', 'updated_at') */
  fieldName: string;
  /** Sort order */
  order: 'asc' | 'desc';
};

/**
 * UI state for a linked object check in the wizard.
 * Contains additional fields for UI interaction (direction, enabled, validated).
 */
export type LinkedObjectCheck = {
  /** Target table to extend the check to */
  tableName: string;
  /** Path from main object to this linked table */
  fieldPath: ObjectPathSegment[];
  /** Relationship direction: 'up' = parent table, 'down' = child table */
  direction: 'up' | 'down';
  /** Whether this linked check is enabled */
  enabled: boolean;
  /** Navigation index config - required for 'down' direction */
  navigationIndex?: NavigationIndex;
  /** Whether the configuration has been validated (for 'down' direction) */
  validated?: boolean;
  /** For "down" direction: the full navigation option reference */
  navigationOptionRef?: NavigationOptionRef;
};

// ============================================================================
// AST Node Definition
// ============================================================================

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
    /** Configuration for the monitoring list check */
    config: ConstantAstNode<MonitoringListCheckConfig>;
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
  targetTableName = '',
  pathToTarget = [],
  topicFilters = [],
  linkedTableChecks = [],
}: {
  targetTableName?: string;
  pathToTarget?: string[];
  topicFilters?: string[];
  linkedTableChecks?: LinkedTableCheck[];
} = {}): MonitoringListCheckAstNode {
  return {
    id: uuidv7(),
    name: monitoringListCheckAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      config: NewConstantAstNode({
        constant: {
          targetTableName,
          pathToTarget,
          topicFilters,
          linkedTableChecks,
        },
      }),
    },
  };
}

// ============================================================================
// Conversion Functions (UI State <-> API Config)
// ============================================================================

/**
 * Convert UI state to API config format.
 * Called when saving the wizard/modal.
 */
export function toMonitoringListCheckConfig(
  targetTableName: string,
  pathToTarget: ObjectPathSegment[],
  topicFilters: string[],
  linkedObjectChecks: LinkedObjectCheck[],
): MonitoringListCheckConfig {
  const enabledChecks = linkedObjectChecks.filter((check) => check.enabled && check.validated !== false);

  const linkedTableChecks: LinkedTableCheck[] = enabledChecks.map((check) => {
    if (check.direction === 'up') {
      // For "up" direction, use the first link name in the path
      const linkName = check.fieldPath[0]?.linkName ?? '';
      return { tableName: check.tableName, linkToSingleName: linkName };
    } else {
      // For "down" direction, use the navigation option reference
      if (!check.navigationOptionRef) {
        throw new Error(`Down direction check for ${check.tableName} missing navigationOptionRef`);
      }
      return { tableName: check.tableName, navigationOption: check.navigationOptionRef };
    }
  });

  return {
    targetTableName,
    pathToTarget: pathToTarget.map((segment) => segment.linkName),
    topicFilters,
    linkedTableChecks,
  };
}

/**
 * Extract display information from a MonitoringListCheckConfig.
 * Used by getAstNodeDisplayName.
 */
export function getMonitoringListCheckDisplayInfo(config: MonitoringListCheckConfig): {
  targetTableName: string;
  topicFilters: string[];
} {
  return {
    targetTableName: config.targetTableName,
    topicFilters: config.topicFilters,
  };
}

/**
 * Convert API pathToTarget (string[]) to UI ObjectPathSegment[].
 * Resolves table names from link names using the dataModel.
 */
export function fromPathToTarget(
  pathToTarget: string[],
  dataModel: DataModel,
  triggerTableName: string,
): ObjectPathSegment[] {
  const segments: ObjectPathSegment[] = [];
  let currentTableName = triggerTableName;

  for (const linkName of pathToTarget) {
    const currentTable = dataModel.find((t) => t.name === currentTableName);
    const link = currentTable?.linksToSingle.find((l) => l.name === linkName);
    if (!link) break;

    segments.push({ linkName, tableName: link.parentTableName });
    currentTableName = link.parentTableName;
  }

  return segments;
}

/**
 * Convert API LinkedTableCheck[] to UI LinkedObjectCheck[].
 */
export function fromLinkedTableChecks(linkedTableChecks: LinkedTableCheck[]): LinkedObjectCheck[] {
  return linkedTableChecks.map((check) =>
    isUpDirectionCheck(check)
      ? {
          tableName: check.tableName,
          fieldPath: [{ linkName: check.linkToSingleName, tableName: check.tableName }],
          direction: 'up' as const,
          enabled: true,
          validated: true,
        }
      : {
          tableName: check.tableName,
          fieldPath: [],
          direction: 'down' as const,
          enabled: true,
          validated: true,
          navigationOptionRef: check.navigationOption,
        },
  );
}
