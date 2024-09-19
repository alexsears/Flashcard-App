import { auth } from '../firebase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};