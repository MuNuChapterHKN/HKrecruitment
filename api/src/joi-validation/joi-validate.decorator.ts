import { UsePipes } from '@nestjs/common';
import { JoiValidationPipe, ValidationSchema } from './joi-validation.pipe';

export const JoiValidate = (arg: ValidationSchema) =>
  UsePipes(new JoiValidationPipe(arg));
