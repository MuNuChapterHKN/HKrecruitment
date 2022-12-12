import { UsePipes } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { JoiValidationPipe } from './joi-validation.pipe';

export const JoiValidate = (arg: ObjectSchema) => UsePipes(new JoiValidationPipe(arg));
