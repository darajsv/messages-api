import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageService } from './create.service';
import { CreateMessageRequestDTO } from './dtos/request.dto';

@ApiTags('Test')
@Controller()
export class CreateMessageController {
  constructor(private readonly createMessageService: CreateMessageService) {}
  @Post()
  async handle(@Body() body: CreateMessageRequestDTO): Promise<void> {
    await this.createMessageService.execute(body);
  }
}
