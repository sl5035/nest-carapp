import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { UserDto } from '../users/dtos/user.dto';

interface ClassConstructor {
  // For any classes
  new (...args: any[]): unknown;
}

export function Serialize(
  dto: ClassConstructor,
): MethodDecorator & ClassDecorator {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // Run before a request is handled by the request handler
    return next.handle().pipe(
      map((data: any) => {
        // Run before the response is sent out
        return plainToInstance(UserDto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
