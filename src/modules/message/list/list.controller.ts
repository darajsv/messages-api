import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { API_TAGS } from '@shared/constants';
import { ListMessageService } from './list.service';
import { ListMessageRequestDTO } from './dtos/request.dto';
import { ListMessageResponseDTO } from './dtos/response.dto';
import { CheckEmptyListInterceptor } from '@shared/interceptors';

@ApiTags(API_TAGS.MESSAGE)
@Controller()
export class ListMessageController {
  constructor(private readonly listMessageService: ListMessageService) {}
  @Get()
  @ApiOperation({
    summary: 'List messages',
  })
  @ApiNoContentResponse({ description: 'No content' })
  @ApiOkResponse({
    description: 'Message List',
    type: ListMessageResponseDTO,
  })
  @ApiBearerAuth()
  @UseInterceptors(CheckEmptyListInterceptor)
  async handle(@Query() query: ListMessageRequestDTO): Promise<ListMessageResponseDTO> {
    return this.listMessageService.execute(query);
  }
}
