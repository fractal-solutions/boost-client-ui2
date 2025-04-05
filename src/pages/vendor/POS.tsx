import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

export default function VendorPOS() {
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');

  const generateQR = () => {
    // In production, this would call your API to generate a payment QR code
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment:${amount}`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle className="text-lg font-medium pb-8">Quick POS</CardTitle>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={generateQR}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR
            </Button>
          </div>
          {qrCode && (
            <div className="flex justify-center p-4">
              <img src={qrCode} alt="Payment QR Code" className="border p-2" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}