import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMessageService } from './create.service';
import { CreateMessageRequestDTO } from './dtos/request.dto';
import { API_TAGS } from '@shared/constants';
import { MessageDTO } from '@shared/dtos/message.dto';

@ApiTags(API_TAGS.MESSAGE)
@Controller()
export class CreateMessageController {
  constructor(private readonly createMessageService: CreateMessageService) {}
  @Post()
  @ApiOperation({
    summary: 'Create a new message',
  })
  @ApiCreatedResponse({
    description: 'Message created successfully',
    type: MessageDTO,
  })
  async handle(@Body() body: CreateMessageRequestDTO): Promise<MessageDTO> {
    return this.createMessageService.execute(body);
  }
}
