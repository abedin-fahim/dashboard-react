import graphqlDataProvider, {
  GraphQLClient,
  liveProvider as graphqlLiveProvider,
} from '@refinedev/nestjs-query';
import { fetchWrapper } from './fetch-wrapper';
import { createClient } from 'graphql-ws';

export const BASE_URL = 'https://api.crm.refine.dev';
export const API_URL = 'https://api.crm.refine.dev';
export const WS_URL = 'wss://api.crm.refine.dev/graphql';
/**
 * Creates a new instance of GraphQLClient with a custom fetch function.
 *
 * @param {string} API_URL - The URL of the GraphQL API.
 * @param {function} fetch - The custom fetch function to be used for making requests.
 * @returns {GraphQLClient} - The new instance of GraphQLClient.
 */
export const client = new GraphQLClient(API_URL, {
  fetch: (url: string, options: RequestInit) => {
    try {
      return fetchWrapper(url, options);
    } catch (error) {
      return Promise.reject(error as Error);
    }
  },
});
/**
 * Initializes a WebSocket client if the code is running in a browser environment.
 * The client is created with the specified WebSocket URL and connection parameters,
 * including the access token retrieved from the local storage.
 *
 * @returns {WebSocketClient | undefined} The WebSocket client if running in a browser environment, otherwise undefined.
 */
const wsClient =
  typeof window !== 'undefined'
    ? createClient({
        url: WS_URL,
        connectionParams: () => {
          const accessToken = localStorage.getItem('access_token');

          return {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };
        },
      })
    : undefined;

export const dataProvider = graphqlDataProvider(client);
// The liveProvider is only available in the browser environment. And We can subscribe to the live queries and mutations.
export const liveProvider = wsClient
  ? graphqlLiveProvider(wsClient)
  : undefined;
