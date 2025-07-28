import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { API_TAGS } from '@shared/constants';
import { LoginService } from './login.service';
import { LoginRequestDTO } from './dtos/request.dto';
import { LoginResponseDTO } from './dtos/response.dto';
import { ErrorDTO } from '@shared/dtos/error.dto';
import { Public } from '@modules/auth/decorators/public.decorator';

@Public()
@ApiTags(API_TAGS.AUTH)
@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @Post()
  @ApiOperation({
    summary: 'Auth0 Login',
  })
  @ApiCreatedResponse({ type: LoginResponseDTO })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or network error', type: ErrorDTO })
  async handle(@Body() body: LoginRequestDTO): Promise<LoginResponseDTO> {
    return this.loginService.execute(body);
  }
}
