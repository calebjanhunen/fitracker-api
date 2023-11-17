export class ListResponse<T> {
  public resources: T[];
  public totalRecords: number;
  public hasMore: boolean;
}
