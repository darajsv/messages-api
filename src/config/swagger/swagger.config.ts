import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  static documentation = new DocumentBuilder()
    .setTitle('Messages API')
    .setVersion('1.0')
    .setContact('Dara Vieira', 'https://github.com/darajsv', 'darajsv@gmail.com')
    .addBearerAuth()
    .build();

  setupSwagger(path: string, app: INestApplication<any>) {
    const document = this.createDocument(app);
    SwaggerModule.setup(path, app, document);
  }

  private createDocument(app: INestApplication<any>) {
    return SwaggerModule.createDocument(app, SwaggerConfig.documentation);
  }
}
