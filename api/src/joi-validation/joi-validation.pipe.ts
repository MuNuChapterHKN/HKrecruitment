import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Paramtype,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema, Schema } from 'joi';

export interface ValidationSchema {
  body?: ObjectSchema;
  query?: ObjectSchema;
  param?: Schema;
}

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ValidationSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom') {
      return value; // skip validation for custom types, they are injected by guards and not user input
    }

    if (Object.keys(this.schema).includes(metadata.type)) {
      const { error } = this.schema[metadata.type].validate(value);
      if (!!error) {
        this.fail(metadata.type, error.message);
      }
      return value;
    }

    this.fail(metadata.type, 'no schema defined');
  }

  private fail(metadataType: Paramtype, errorMessage: string) {
    throw new BadRequestException(
      `Validation of ${metadataType} failed: ${errorMessage}`,
    );
  }
}
