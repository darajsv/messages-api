import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { API_TAGS } from '@shared/constants';
import { MessageDTO } from '@shared/dtos/message.dto';
import { ErrorDTO } from '@shared/dtos/error.dto';
import { PatchMessageStatusService } from './patch.service';
import { PatchMessageStatusRequestDTO } from './dtos/request.dto';

@ApiTags(API_TAGS.MESSAGE)
@Controller()
export class PatchMessageStatusController {
  constructor(private readonly patchMessageService: PatchMessageStatusService) {}
  @Patch(':id')
  @ApiOperation({
    summary: 'Patch Message Status',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
    type: ErrorDTO,
  })
  @ApiOkResponse({
    description: 'Message status updated',
    type: MessageDTO,
  })
  @ApiBearerAuth()
  async handle(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() { status }: PatchMessageStatusRequestDTO,
  ): Promise<MessageDTO> {
    return this.patchMessageService.execute(id, status);
  }
}
