import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Test } from '../enitites';

@Injectable()
export class TestRepository {
  private repository: Repository<Test>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Test);
  }

  getById(id: string): Promise<Test | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  create(test: Partial<Test>): Promise<Test> {
    return this.repository.save(this.repository.create(test));
  }
}
