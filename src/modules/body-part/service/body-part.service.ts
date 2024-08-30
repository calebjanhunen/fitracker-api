import { Injectable } from '@nestjs/common';
import { BodyPartModel } from '../models/body-part.model';
import { BodyPartRepository } from '../repository/body-part.repository';

@Injectable()
export class BodyPartService {
  constructor(private readonly bodyPartRepo: BodyPartRepository) {}

  public async findById(id: number): Promise<BodyPartModel | null> {
    return this.bodyPartRepo.findById(id);
  }
}
