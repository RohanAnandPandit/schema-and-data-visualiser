export type RepositoryId = string;

export type URI = string;

export interface RepositoryInfo {
  uri: String;
  id: RepositoryId;
  title: String;
  readable: boolean;
  writeable: boolean;
}

export type Triplet = [string, string, string];

export type Row = string[];

export type QueryResults = {
  header: string[];
  data: Row[];
};

export type RDFGraph = {
  header: ["Subject", "Predicate", "Object"];
  data: Triplet[];
};

export type QueryRecord = {
  id: number;
  title: string;
  sparql: string;
  repositoryId: string;
  date: string;
};

export type QueryId = string;
export type QueryInfo = { title: string; sparql: string };

export type Metadata = {
  label: string;
  comment: string;
  domain: string;
  range: string;
};

export enum PropertyType {
  DatatypeProperty,
  ObjectProperty,
  FunctionalProperty,
  TransitiveProperty,
  SymmetricProperty,
}

export enum ChartType {
  BAR = "Bar",
  STACKED_BAR = "Stacked Bar",
  GROUPED_BAR = "Grouped Bar",
  SCATTER = "Scatter",
  WORD_CLOUD = "Word Cloud",
  CALENDAR = "Calendar",
  BUBBLE = "Bubble",
  CHOROPLETH_MAP = "Choropleth Map",
  PIE = "Pie",
  LINE = "Line",
  TREE_MAP = "Tree Map",
  SANKEY = "Sankey",
  CHORD_DIAGRAM = "Chord Diagram",
  CIRCLE_PACKING = "Circle Packing",
  HIERARCHY_TREE = "Hierarchy Tree",
  SUNBURST = "Sunburst",
  HEAT_MAP = "Heat Map",
  SPIDER = "Spider",
  NETWORK = "Network",
}

export enum CategoryType {
  KEY = "key",
  SCALAR = "scalar",
  TEMPORAL = "temporal",
  DATE = "date",
  GEOGRAPHICAL = "geographical",
  LEXICAL = "lexical",
  NUMERIC = "numeric",
}

export type VariableCategories = {
  key: string[];
  scalar: string[];
  temporal: string[];
  geographical: string[];
  lexical: string[];
  date: string[];
  numeric: string[];
};

export type QueryAnalysis = {
  pattern: string | null;
  variables: VariableCategories;
  visualisations: ChartType[];
};

export enum RelationType {
  ONE_TO_ONE = "One-to-one",
  ONE_TO_MANY = "One-to-many",
  MANY_TO_ONE = "Many-to-one",
  MANY_TO_MANY = "Many-to-many",
}
