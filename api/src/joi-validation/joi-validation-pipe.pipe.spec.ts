import { BadRequestException } from '@nestjs/common';
import { JoiValidationPipe } from './joi-validation.pipe';
import * as Joi from 'joi';

describe('JoiValidationPipe', () => {
  it('should be defined', () => {
    expect(new JoiValidationPipe({})).toBeDefined();
  });

  it('should work with empty schema', () => {
    const pipe = new JoiValidationPipe({});

    expect(() => pipe.transform({}, { type: 'body' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      pipe.transform({}, { type: 'query', data: 'anything' }),
    ).toThrow(BadRequestException);
    expect(() => pipe.transform({}, { type: 'param' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      pipe.transform({ internal: 'stuff' }, { type: 'custom' }),
    ).not.toThrow();
  });

  it('should work with query schema', () => {
    const pipe = new JoiValidationPipe({
      query: {
        id: Joi.number(),
      },
    });

    expect(() =>
      pipe.transform('Not a number', { type: 'query', data: 'id' }),
    ).toThrow(/Validation of query.id failed: /);
    expect(() =>
      pipe.transform("Doesn't matter", { type: 'query', data: 'notId' }),
    ).toThrow(/Validation of query.notId failed: no schema defined/);

    expect(pipe.transform(1, { type: 'query', data: 'id' })).toBe(1);

    expect(() => pipe.transform({}, { type: 'query' })).toThrow(
      /Validation of query\..+ failed/,
    );
    expect(() => pipe.transform({}, { type: 'param' })).toThrow(
      /Validation of param failed: no schema defined/,
    );
    expect(() => pipe.transform({ key: 'val' }, { type: 'body' })).toThrow(
      /Validation of body failed: no schema defined/,
    );
    expect(() =>
      pipe.transform({ internal: 'stuff' }, { type: 'custom' }),
    ).not.toThrow();
  });

  it('should work with body schema', () => {
    const pipe = new JoiValidationPipe({
      body: Joi.object({
        id: Joi.number(),
      }),
    });

    expect(() => pipe.transform('Not an object', { type: 'body' })).toThrow(
      /Validation of body failed: /,
    );
    expect(() => pipe.transform({ key: 'val' }, { type: 'body' })).toThrow(
      /Validation of body failed: /,
    );
    expect(() =>
      pipe.transform({ id: 'Not a number' }, { type: 'body' }),
    ).toThrow(/Validation of body failed: /);
    expect(pipe.transform({ id: 1 }, { type: 'body' })).toEqual({ id: 1 });

    expect(() => pipe.transform({}, { type: 'query', data: 'thing' })).toThrow(
      /Validation of query.thing failed: no schema defined/,
    );
    expect(() => pipe.transform({}, { type: 'param' })).toThrow(
      /Validation of param failed: no schema defined/,
    );
    expect(() =>
      pipe.transform({ internal: 'stuff' }, { type: 'custom' }),
    ).not.toThrow();
  });
});
