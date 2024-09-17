import { Injectable } from '@nestjs/common';
import { BodyPartModel } from '../models/body-part.model';
import { BodyPartRepository } from '../repository/body-part.repository';

@Injectable()
export class BodyPartService {
  constructor(private readonly bodyPartRepo: BodyPartRepository) {}

  public async findById(id: number): Promise<BodyPartModel | null> {
    return this.bodyPartRepo.findById(id);
  }

  public async findAll(): Promise<BodyPartModel[]> {
    const bodyParts = await this.bodyPartRepo.findAll();

    // Capitalize first letter of name
    return bodyParts.map((bodyPart) => ({
      ...bodyPart,
      name: bodyPart.name.charAt(0).toUpperCase() + bodyPart.name.slice(1),
    }));
  }
}
