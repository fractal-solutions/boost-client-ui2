const NETWORK_SECRET = 'test-secret-123';

export async function getBalance(address: string) {
  try {
    const response = await fetch('http://localhost:2224/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': NETWORK_SECRET
      },
      body: JSON.stringify({ address })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }

    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('Balance fetch error:', error);
    throw error;
  }
}