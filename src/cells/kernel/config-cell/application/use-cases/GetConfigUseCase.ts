// @ts-nocheck
import { IConfigRepository } from "../../ports/ConfigRepository";

export class GetConfigUseCase {
  constructor(private repo: IConfigRepository) {}
  async execute(key: string) { return this.repo.get(key); }
}
