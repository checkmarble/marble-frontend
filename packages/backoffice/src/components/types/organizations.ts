export type OrganizationImportData = {
  org: {
    name: string;
    default_scenario_timezone: string;
    sanctions_threshold: number;
    sanctions_limit: number;
  };
  admins: {
    email: string;
    first_name: string;
    last_name: string;
  }[];
  data_model: {
    tables: {
      id: string;
      name: string;
      description: string;
      fields: Record<string, { id: string; data_type: string; description: string }>;
    }[];
    links: {
      id: string;
      parent_table_name: string;
      parent_table_id: string;
      parent_field_id: string;
      child_table_name: string;
      child_table_id: string;
      child_field_id: string;
    }[];
    pivots: {
      id: string;
      base_table_id: string;
      path_link_ids: string[];
    }[];
    navigation_options: Record<
      string,
      {
        source_field_id: string;
        target_table_id: string;
        target_field_id: string;
      }
    >;
  };
  scenarios: {
    scenario: {
      id: string;
      name: string;
      description: string;
      trigger_object_type: string;
    };
    iteration: {
      trigger_condition_ast_expression: {
        constant: boolean;
      };
      rules: {
        id: string;
        name: string;
        description: string;
      }[];
    }[];
  }[];
};
