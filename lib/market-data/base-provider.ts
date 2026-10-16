import type {
  CompanyProfile,
  ETFHolding,
  HistoricalPrice,
  MarketDataError,
  ProviderName,
  Quote,
  SECFiling,
} from "./types";

export abstract class BaseMarketDataProvider {
  protected abstract readonly provider: ProviderName;
  protected abstract readonly baseURL: string;

  protected async fetchWithRetry(
    url: string,
    options: RequestInit & { maxRetries?: number; retryDelay?: number } = {}
  ): Promise<Response> {
    const { maxRetries = 3, retryDelay = 1000, ...fetchOptions } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          signal: controller.signal,
          ...fetchOptions,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429 && attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * (attempt + 1))
            );
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (err) {
        lastError = err as Error;
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  protected createError(
    message: string,
    code: string,
    retryable = false
  ): MarketDataError {
    return {
      code,
      message,
      provider: this.provider,
      retryable,
    };
  }

  abstract getQuote(symbol: string): Promise<Quote>;
  abstract getHistory(symbol: string, range: string): Promise<HistoricalPrice[]>;
  abstract getCompany(symbol: string): Promise<CompanyProfile>;
  abstract getETF(symbol: string): Promise<CompanyProfile>;
  abstract getETHoldings(symbol: string): Promise<ETFHolding[]>;
  abstract getSECFilings(symbol: string): Promise<SECFiling[]>;
}