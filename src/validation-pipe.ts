import { PipeTransform, BadRequestException } from '@nestjs/common';
import {  ZodError,  ZodSchema } from 'zod';


export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}
  
    transform(value: unknown) {
      try {
        const parsedValue = this.schema.parse(value);
        return parsedValue;
      } catch (error) {

        if(error instanceof ZodError){    

          throw new BadRequestException(this.formZod(error))

        }

        throw new BadRequestException('request validation failed');

      }
    }


     private formZod(errors : ZodError){

          return errors.issues.map((error) => {


            return {

              field : error.path,
              error : error.message
            }
              
          })  
     }
  }