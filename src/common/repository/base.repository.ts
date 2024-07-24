import { Repository } from 'typeorm';

interface HasId {
  id: string;
}

export abstract class BaseRepository<T extends HasId> {
  constructor(private _repo: Repository<T>) {}

  async save(entity: T): Promise<T> {
    return await this._repo.save(entity);
  }
}
