import { GraphQLFormattedError } from 'graphql';

type Error = {
  message: string;
  statusCode: string;
};

/**
 * Sends a custom fetch request to the specified URL with the given options.
 *
 * @param {string} url - The URL to send the request to.
 * @param {RequestInit} options - The options for the fetch request.
 * @returns {Promise<any>} - A promise that resolves to the JSON response from the server.
 * @throws {Error} - If the response is not OK, an error with the response text is thrown.
 */

const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem('accessToken');
  const headers = options.headers as Record<string, string>;

  return await fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Apollo-Require-Preflight': 'true',
    },
  });
};

/**
 * Retrieves GraphQL errors from the response body.
 *
 * @param body - The response body containing the GraphQL errors.
 * @returns An Error object if there are GraphQL errors in the body, otherwise null.
 */
const getGraphQLErrors = (
  body: Record<'errors', GraphQLFormattedError[] | undefined>
): Error | null => {
  if (!body) {
    return {
      message: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_ERROR',
    };
  }

  if ('errors' in body) {
    const errors = body?.errors;
    const messages = errors?.map((error) => error?.message)?.join('');
    const code = errors?.[0]?.extensions?.code;

    return {
      message: messages || JSON.stringify(errors),
      statusCode: code || 500,
    };
  }

  return null;
};

/**
 * Wrapper function for making HTTP requests using customFetch.
 *
 * @param {string} url - The URL to make the request to.
 * @param {RequestInit} options - The options for the request.
 * @returns {Promise<any>} - A promise that resolves to the response body.
 * @throws {Error} - If there is an error in the GraphQL response.
 */
export const fetchWrapper = async (url: string, options: RequestInit) => {
  const response = await customFetch(url, options);

  const responseClone = await response.clone(); // Clone the response to read it twice if needed
  const body = await response.json();

  const error = getGraphQLErrors(body);
  if (error) {
    throw new Error(error.message);
  }

  return response;
};
