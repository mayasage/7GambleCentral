import { Request, Response, NextFunction } from 'express';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import responseService from '../service/response.service';
import { error } from 'ajv/dist/vocabularies/jtd/properties';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Add support for additional formats like 'date-time', 'email', etc.
addErrors(ajv); // Add support for detailed error messages

interface SchemaValidationError {
  keyword: string;
  message: string;
}

export function validateSchema(schema: object) {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    if (!validate(req.body)) {
      const errors: SchemaValidationError[] = validate.errors!.map(
        (error: ErrorObject) => ({
          keyword: error.keyword!,
          message: error.message!,
        }),
      );

      return res.status(400).send(
        responseService.createErrorResponse({
          data: errors,
        }),
      );
    }
    next();
  };
}
