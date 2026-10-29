import { BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isAxiosError, type AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

export async function fetchUpstream<T>(http: HttpService, url: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await firstValueFrom(http.get<T>(url, options));
    return response.data;
  } catch (err: unknown) {
    if (!isAxiosError(err)) {
      throw err;
    }

    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new GatewayTimeoutException('Upstream service timed out', { cause: err });
    }

    throw new BadGatewayException('Upstream service unavailable', { cause: err });
  }
}
