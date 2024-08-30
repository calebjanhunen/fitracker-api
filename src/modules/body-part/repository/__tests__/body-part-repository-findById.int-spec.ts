import { BodyPartModel } from '../../models/body-part.model';
import { BodyPartRepository } from '../body-part.repository';

describe('UserRepository: findById()', () => {
  let bodyPartRepo: BodyPartRepository;

  beforeAll(async () => {
    bodyPartRepo = new BodyPartRepository(global.dbService);
  });

  it('should successfully return a body part', async () => {
    const model = await bodyPartRepo.findById(1);
    expect(model).toBeInstanceOf(BodyPartModel);
    expect(model?.id).toBe(1);
    expect(model?.name).toBe('biceps');
  });
  it('should return null', async () => {
    const model = await bodyPartRepo.findById(99999);
    expect(model).toBeNull();
  });
});
