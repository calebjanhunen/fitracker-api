export class CollectionModel<T> {
  public listObjects: T[];
  public totalCount: number;
  public offset: number;
  public limit: number;

  /**
   * Returns true if there are more records available and false if not
   *
   * @returns {boolean}
   */
  public hasMore(): boolean {
    return this.limit + this.offset < this.totalCount ? true : false;
  }
}
