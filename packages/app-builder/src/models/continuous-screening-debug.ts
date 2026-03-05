export type DebugUpdateJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type DebugUpdateJob = {
  id: string;
  datasetUpdateId: string;
  configId: string;
  orgId: string;
  status: DebugUpdateJobStatus;
  datasetName: string;
  datasetVersion: string;
  totalItems: number;
  itemsProcessed: number;
  createdAt: string;
  updatedAt: string;
};

export type DebugDeltaTrackOperation = 'add' | 'update' | 'delete';

export type DatasetFile = {
  id: string;
  fileType: 'full' | 'delta';
  version: string;
  createdAt: string;
};

export type DebugDeltaTrack = {
  id: string;
  orgId: string;
  objectType: string;
  objectId: string;
  objectInternalId: string | null;
  entityId: string;
  operation: DebugDeltaTrackOperation;
  processed: boolean;
  datasetFile: DatasetFile | null;
  createdAt: string;
  updatedAt: string;
};

export function adaptDebugUpdateJob(dto: {
  id: string;
  dataset_update_id: string;
  config_id: string;
  org_id: string;
  status: DebugUpdateJobStatus;
  dataset_name: string;
  dataset_version: string;
  total_items: number;
  items_processed: number;
  created_at: string;
  updated_at: string;
}): DebugUpdateJob {
  return {
    id: dto.id,
    datasetUpdateId: dto.dataset_update_id,
    configId: dto.config_id,
    orgId: dto.org_id,
    status: dto.status,
    datasetName: dto.dataset_name,
    datasetVersion: dto.dataset_version,
    totalItems: dto.total_items,
    itemsProcessed: dto.items_processed,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function adaptDebugDeltaTrack(dto: {
  id: string;
  org_id: string;
  object_type: string;
  object_id: string;
  object_internal_id?: string | null;
  entity_id: string;
  operation: DebugDeltaTrackOperation;
  processed: boolean;
  dataset_file?: { id: string; file_type: 'full' | 'delta'; version: string; created_at: string } | null;
  created_at: string;
  updated_at: string;
}): DebugDeltaTrack {
  return {
    id: dto.id,
    orgId: dto.org_id,
    objectType: dto.object_type,
    objectId: dto.object_id,
    objectInternalId: dto.object_internal_id ?? null,
    entityId: dto.entity_id,
    operation: dto.operation,
    processed: dto.processed,
    datasetFile: dto.dataset_file
      ? {
          id: dto.dataset_file.id,
          fileType: dto.dataset_file.file_type,
          version: dto.dataset_file.version,
          createdAt: dto.dataset_file.created_at,
        }
      : null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
