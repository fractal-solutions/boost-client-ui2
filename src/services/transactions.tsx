const NETWORK_SECRET = 'test-secret-123';
// Helper function to format public key
function formatPublicKey(key: string) {
    if (!key.includes('-----BEGIN PUBLIC KEY-----')) {
        return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
    }
    return key;
}

// Helper function to strip public key formatting
export function stripPublicKey(key: string) {
    return key
        .replace('-----BEGIN PUBLIC KEY-----\n', '')
        .replace('\n-----END PUBLIC KEY-----', '')
        .trim();
}

export async function makeDeposit(to: string, amount: number, token: string) {
    try {
        const formattedKey = formatPublicKey(to);
        const response = await fetch('http://localhost:2222/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-auth-token': NETWORK_SECRET
            },
            body: JSON.stringify({ 
                to: formattedKey,
                amount 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Deposit failed');
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Deposit error:', error);
        throw error;
    }
}

export async function makeWithdrawal(
  publicKey: string, 
  privateKey: string,
  amount: number, 
  token: string
) {
    try {
        //console.log('private key', privateKey);
        const response = await fetch('http://localhost:2222/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-auth-token': NETWORK_SECRET
            },
            body: JSON.stringify({ 
                amount,
                from: {
                    publicKey: formatPublicKey(publicKey),
                    privateKey: privateKey
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Withdrawal failed');
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Withdrawal error:', error);
        throw error;
    }
}

// export async function sendTransaction(
//     senderPublicKey: string,
//     senderPrivateKey: string,
//     recipientPublicKey: string,
//     amount: number,
//     token: string
// ) {
//     try {
//         // Format the public key if needed
//         const formattedRecipientKey = formatPublicKey(recipientPublicKey);
        
//         const response = await fetch('http://localhost:2222/txn', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//                 'x-auth-token': NETWORK_SECRET || ''
//             },
//             body: JSON.stringify({
//                 from: {
//                     publicKey: senderPublicKey,
//                     privateKey: senderPrivateKey
//                 },
//                 to: formattedRecipientKey,  // Send just the formatted key
//                 amount: Number(amount),
//                 type: "TRANSFER",
//                 timestamp: Date.now()
//             })
//         });

//         const data = await response.json();
        
//         if (!response.ok) {
//             console.error('Transaction error:', data);
//             throw new Error(data.error || 'Transaction failed');
//         }

//         // Wait for transaction to be processed
//         await new Promise(resolve => setTimeout(resolve, 2000));
        
//         return data.message || 'Transaction successful';
//     } catch (error) {
//         console.error('Send transaction error:', error);
//         throw error;
//     }
// }

export async function sendTransaction(
    publicKey: string,
    privateKey: string,
    to: string,
    amount: number,
    token: string
  ) {
    const response = await fetch('http://localhost:2222/txn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': NETWORK_SECRET
      },
      body: JSON.stringify({
        from: {
            publicKey: formatPublicKey(publicKey),
            privateKey: privateKey
        },
        to: formatPublicKey(to),
        amount: amount,
        type: 'TRANSFER'
      })
    });
  
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error || 'Transaction failed');
    }
  
    return data.result;
  }