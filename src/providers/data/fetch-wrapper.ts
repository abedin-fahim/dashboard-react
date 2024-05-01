export const fetchWrapper = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem('accessToken');
  const headers = options.headers as Record<string, string>;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
};
