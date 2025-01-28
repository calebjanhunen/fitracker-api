import { Injectable } from '@nestjs/common';
import { LookupItem } from '../models';
import { CableAttachmentRepository } from '../repository/cable-attachment.repository';

@Injectable()
export class CableAttachmentService {
  constructor(
    private readonly cableAttachmentRepo: CableAttachmentRepository,
  ) {}

  public async getAllAttachments(): Promise<LookupItem[]> {
    return this.cableAttachmentRepo.getAllAttachments();
  }

  public async getAttachmentById(id: number): Promise<LookupItem | null> {
    return this.cableAttachmentRepo.getAttachmentById(id);
  }
}
