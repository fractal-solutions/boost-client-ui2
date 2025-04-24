export async function lookupUserByUsername(username: string) {
  const response = await fetch('http://localhost:2225/user/by-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error('User not found');
  }

  return data.data;
}

export async function lookupUserByPhone(phoneNumber: string) {
  const response = await fetch('http://localhost:2225/user/by-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error('User not found');
  }

  return data.data;
}

export async function getFullUserDetails(phoneNumber: string) {
  try {
    // First get the user by phone number
    const phoneResponse = await fetch('http://localhost:2225/user/by-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });

    const phoneData = await phoneResponse.json();
    if (!phoneData.success) {
      throw new Error('User not found');
    }

    // Then get additional details using the public key
    const publicKeyResponse = await fetch('http://localhost:2225/user/by-public-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: phoneData.data.publicKey })
    });

    const publicKeyData = await publicKeyResponse.json();
    if (!publicKeyData.success) {
      throw new Error('Failed to fetch user details');
    }

    // Combine the data
    return {
      ...phoneData.data,
      username: publicKeyData.data.username
    };
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}