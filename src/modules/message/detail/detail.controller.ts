import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { API_TAGS } from '@shared/constants';
import { DetailMessageService } from './detail.service';
import { MessageDTO } from '@shared/dtos/message.dto';
import { ErrorDTO } from '@shared/dtos/error.dto';

@ApiTags(API_TAGS.MESSAGE)
@Controller()
export class DetailMessageController {
  constructor(private readonly detailMessageService: DetailMessageService) {}
  @Get(':id')
  @ApiOperation({
    summary: 'Get message by ID',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
    type: ErrorDTO,
  })
  @ApiOkResponse({
    description: 'Message details',
    type: MessageDTO,
  })
  @ApiBearerAuth()
  async handle(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<MessageDTO> {
    return this.detailMessageService.execute(id);
  }
}
