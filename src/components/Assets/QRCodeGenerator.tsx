import React from 'react';
import { XMarkIcon, PrinterIcon, ShareIcon } from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  plant_room?: { name: string; location: string };
}

interface QRCodeGeneratorProps {
  asset: Asset;
  onClose: () => void;
}

export default function QRCodeGenerator({ asset, onClose }: QRCodeGeneratorProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${window.location.origin}/assets/${asset.id}`
  )}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${asset.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { max-width: 400px; margin: 0 auto; }
              img { max-width: 100%; height: auto; }
              h2 { margin-bottom: 10px; }
              p { color: #666; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>${asset.name}</h2>
              <p>${asset.asset_type}</p>
              <p>${asset.plant_room?.name || ''}</p>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <p>Asset ID: ${asset.id.slice(-8).toUpperCase()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${asset.name}`,
          text: `QR Code for ${asset.name} (${asset.asset_type})`,
          url: qrCodeUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(qrCodeUrl);
      alert('QR code URL copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900">{asset.name}</h4>
            <p className="text-sm text-gray-600">{asset.asset_type}</p>
            {asset.plant_room && (
              <p className="text-sm text-gray-500">{asset.plant_room.name}</p>
            )}
          </div>

          <div className="mb-6">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="mx-auto border border-gray-300 rounded"
            />
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p>Asset ID: {asset.id.slice(-8).toUpperCase()}</p>
            <p className="mt-1">Scan to access asset details</p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}