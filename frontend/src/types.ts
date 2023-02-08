export type RepositoryId = string;

export interface RepositoryInfo {
    uri: String;
    id: RepositoryId;
    title: String;
    readable: boolean;
    writeable: boolean;
}