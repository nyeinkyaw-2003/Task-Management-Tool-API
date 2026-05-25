import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception-filter';

describe('HttpExceptionFilter', () => {
  it('returns the standardized error response shape', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { url: '/user' };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    const filter = new HttpExceptionFilter();
    const exception = new BadRequestException({
      message: 'Email already exists',
      error: 'EMAIL_ALREADY_EXISTS',
    });

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Email already exists',
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          details: expect.objectContaining({
            message: 'Email already exists',
            error: 'EMAIL_ALREADY_EXISTS',
          }),
        },
        path: '/user',
        timestamp: expect.any(String),
      }),
    );
  });
});
