const defaultBaseUrl = "https://bertinis-5e-api.onrender.com";

export type FiveToolsClient = {
  baseUrl: string;
  get(path: string): Promise<unknown>;
};

export function createFiveToolsClient(baseUrl = process.env.BERTINIS_5E_API_URL ?? defaultBaseUrl): FiveToolsClient {
  return {
    baseUrl,
    async get(path: string) {
      const url = new URL(path, baseUrl);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`5etools request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
  };
}
