import { IConfigRepository } from "../../ports/configrepository";

export class GetConfigUseCase {
  constructor(private repo: IConfigRepository) {}
  async execute(key: string) { return this.repo.get(key); }
}
