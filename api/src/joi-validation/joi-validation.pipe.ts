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
  query?: any;
  param?: Schema;
}

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ValidationSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom') {
      return value; // skip validation for custom types, they are injected by guards and not user input
    }

    if (
      Object.keys(this.schema).includes(metadata.type) &&
      (metadata.type !== 'query' ||
        Object.keys(this.schema.query).includes(metadata.data))
    ) {
      const schema =
        metadata.type === 'query'
          ? this.schema.query[metadata.data]
          : this.schema[metadata.type];
      const { error } = schema.validate(value);
      if (!!error) {
        this.fail(
          metadata.type === 'query' ? `query.${metadata.data}` : metadata.type,
          error.message,
        );
      }
      return value;
    }

    this.fail(
      metadata.type === 'query' ? `query.${metadata.data}` : metadata.type,
      'no schema defined',
    );
  }

  private fail(what: string, errorMessage: string) {
    throw new BadRequestException(
      `Validation of ${what} failed: ${errorMessage}`,
    );
  }
}
