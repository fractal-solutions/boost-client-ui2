

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