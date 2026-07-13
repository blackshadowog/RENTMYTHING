import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QrCode, Camera, Monitor, X, Check, AlertCircle, RefreshCw, Smartphone, Package, User, ArrowLeftRight } from 'lucide-react';
import { Booking } from '../types';

// ==========================================
// 1. QR Code Renderer using canvas
// ==========================================
interface QRCodeComponentProps {
  value: string;
  size?: number;
}

export const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ value, size = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#1e293b', // slate-800
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('Error generating QR', err);
        }
      );
    }
  }, [value, size]);

  return (
    <div className="relative inline-block overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 shadow-md">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  );
};

// ==========================================
// 2. QR Code Generator Modal for Renters
// ==========================================
interface QRGeneratorModalProps {
  booking: Booking;
  type: 'pickup' | 'return';
  onClose: () => void;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({ booking, type, onClose }) => {
  const codeValue = type === 'pickup' ? booking.pickupCode : `RETURN-${booking.pickupCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-gray-100 transition text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
          <QrCode className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          {type === 'pickup' ? 'Pick Up Confirmation QR' : 'Return Confirmation QR'}
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {type === 'pickup' 
            ? 'Present this QR code to the item lender to confirm receipt and verify quality hand-off.' 
            : 'Present this QR code to the item lender when returning the item to complete the booking.'
          }
        </p>

        {/* Item Summary Card inside modal */}
        <div className="my-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-left">
          {booking.productImage && (
            <img 
              src={booking.productImage} 
              alt={booking.productTitle} 
              className="h-10 w-10 rounded-xl object-cover border border-gray-200"
            />
          )}
          <div className="min-w-0 flex-1 text-xs">
            <h4 className="font-bold text-gray-900 truncate">{booking.productTitle}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Booking ID: {booking.id}</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="py-4">
          <QRCodeComponent value={codeValue} size={180} />
          <div className="mt-3">
            <span className="font-mono text-xs font-black text-slate-700 tracking-widest bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 inline-block">
              {codeValue}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 leading-normal mt-2">
          Upon scanning, possession tracking and standard security holding parameters are updated instantly.
        </p>

      </div>
    </div>
  );
};

// ==========================================
// 3. QR Code Scanner Modal for Lenders (with Simulator)
// ==========================================
interface QRScannerModalProps {
  activeOrders: Booking[];
  onScanSuccess: (bookingId: string, type: 'pickup' | 'return', code: string) => Promise<void>;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ activeOrders, onScanSuccess, onClose }) => {
  const [scanMode, setScanMode] = useState<'camera' | 'simulator'>('simulator');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Manual code entry
  const [manualCode, setManualCode] = useState('');

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError('Unable to access camera. Please make sure camera permissions are allowed or use the QR Simulator tab.');
      setScanMode('simulator');
    }
  };

  // Scan frame looping
  useEffect(() => {
    if (scanMode !== 'camera' || !cameraActive) {
      stopCamera();
      return;
    }

    let active = true;
    let frameId: number;

    const scanFrame = () => {
      if (!active || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleFoundCode(code.data);
          active = false;
          return;
        }
      }

      if (active) {
        frameId = requestAnimationFrame(scanFrame);
      }
    };

    frameId = requestAnimationFrame(scanFrame);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      stopCamera();
    };
  }, [scanMode, cameraActive]);

  // Handle scanned/selected code
  const handleFoundCode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Find matching booking
      let matchedBooking: Booking | undefined;
      let type: 'pickup' | 'return' = 'pickup';

      if (cleanCode.startsWith('RETURN-')) {
        type = 'return';
        const rawPickupCode = cleanCode.replace('RETURN-', '');
        matchedBooking = activeOrders.find(o => o.pickupCode === rawPickupCode);
      } else {
        type = 'pickup';
        matchedBooking = activeOrders.find(o => o.pickupCode === cleanCode);
      }

      if (!matchedBooking) {
        // Fallback: search by booking ID or raw code
        matchedBooking = activeOrders.find(o => o.id === cleanCode);
      }

      if (!matchedBooking) {
        throw new Error(`No active booking matches confirmation code "${cleanCode}". Please verify booking status.`);
      }

      // Execute onScanSuccess
      await onScanSuccess(matchedBooking.id, type, cleanCode);
      
      setSuccessMsg(
        type === 'pickup'
          ? `Successfully scanned Pickup Code for "${matchedBooking.productTitle}"! Possession transferred.`
          : `Successfully scanned Return Code for "${matchedBooking.productTitle}"! Booking marked as COMPLETED.`
      );
      
      // Close after 2.5 seconds
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Scanned code verification failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFoundCode(manualCode);
  };

  // Filter bookings that can be picked up or returned
  const pendingPickupListings = activeOrders.filter(o => o.status === 'APPROVED' && !o.isPickedUp);
  const pendingReturnListings = activeOrders.filter(o => o.status === 'APPROVED' && o.isPickedUp && !o.isReturned);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl bg-rose-500 p-2 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm text-gray-900">Marketplace QR Scanner</h3>
              <p className="text-[10px] text-gray-500">Confirm campus handoffs securely</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-full p-1.5 hover:bg-gray-200 transition text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setScanMode('simulator');
              stopCamera();
            }}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${scanMode === 'simulator' ? 'border-rose-500 text-rose-500 bg-rose-50/10' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'}`}
          >
            <span className="flex items-center justify-center space-x-1.5">
              <Monitor className="h-4 w-4" />
              <span>QR Code Simulator Deck</span>
            </span>
          </button>
          <button
            onClick={() => {
              setScanMode('camera');
              startCamera();
            }}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${scanMode === 'camera' ? 'border-rose-500 text-rose-500 bg-rose-50/10' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'}`}
          >
            <span className="flex items-center justify-center space-x-1.5">
              <Camera className="h-4 w-4" />
              <span>Use Real Camera Stream</span>
            </span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Status Indicators */}
          {successMsg && (
            <div className="flex items-start space-x-2.5 rounded-2xl bg-green-50 p-4 border border-green-100 text-xs text-green-700 animate-fade-in text-left">
              <Check className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Scan Verified Successfully!</p>
                <p className="text-[11px] mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start space-x-2.5 rounded-2xl bg-rose-50 p-4 border border-rose-100 text-xs text-rose-600 animate-fade-in text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 text-rose-500 flex-shrink-0" />
              <div>
                <p className="font-bold">Verification Error</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {processing && (
            <div className="flex items-center justify-center space-x-2.5 py-4 text-xs font-semibold text-rose-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Processing confirmation code...</span>
            </div>
          )}

          {/* MODE 1: SCANNER CAMERA VIEW */}
          {scanMode === 'camera' && (
            <div className="space-y-4 text-center">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-800 text-left">
                  <p className="font-bold">Camera Access Issue</p>
                  <p className="text-[11px] mt-1">{cameraError}</p>
                </div>
              ) : (
                <div className="relative aspect-video max-w-sm mx-auto overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 shadow-inner">
                  {/* Invisible canvas used for scanning */}
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Real-time Video Stream */}
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                  />

                  {/* Scanning Crosshairs Animation overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48 border-2 border-dashed border-rose-500/60 rounded-xl">
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-rose-500 animate-bounce"></div>
                    </div>
                  </div>

                  <span className="absolute bottom-3 inset-x-0 text-[10px] text-gray-300 bg-black/60 py-1 px-3 rounded-full mx-auto w-fit">
                    Hold QR code within crosshairs
                  </span>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: SIMULATOR VIEW (THE ACCESSIBILITY GEM) */}
          {scanMode === 'simulator' && (
            <div className="space-y-5 text-left">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-700">How to use the QR Simulator:</p>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  In sandbox and browser iframe preview environments, camera permissions can be disabled. Use this Simulator Deck to complete peer-to-peer verification cycles instantly. Simply select an active student order below to simulate a physical scan of its QR code!
                </p>
              </div>

              {/* Simulation sections */}
              <div className="space-y-4">
                
                {/* Section A: Pick up simulation */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-rose-500" />
                    <span>Simulate Pick Ups (Confirm Hand-off)</span>
                  </h4>

                  {pendingPickupListings.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic py-2">No active approved listings waiting for pick up.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {pendingPickupListings.map(o => (
                        <button
                          key={o.id}
                          disabled={processing || !!successMsg}
                          onClick={() => handleFoundCode(o.pickupCode)}
                          className="flex items-center justify-between text-left p-2.5 rounded-xl border border-rose-100 hover:bg-rose-50/50 transition bg-white"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-gray-900 truncate">{o.productTitle}</p>
                            <p className="text-[10px] text-gray-500">Renter: {o.renterName} | Code: <span className="font-mono font-bold text-rose-600">{o.pickupCode}</span></p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-bold text-rose-500 rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1">
                            Simulate Scan
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Return simulation */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
                    <span>Simulate Returns (Confirm Drop-off)</span>
                  </h4>

                  {pendingReturnListings.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic py-2">No active rented items waiting to be returned.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {pendingReturnListings.map(o => (
                        <button
                          key={o.id}
                          disabled={processing || !!successMsg}
                          onClick={() => handleFoundCode(`RETURN-${o.pickupCode}`)}
                          className="flex items-center justify-between text-left p-2.5 rounded-xl border border-blue-100 hover:bg-blue-50/50 transition bg-white"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-gray-900 truncate">{o.productTitle}</p>
                            <p className="text-[10px] text-gray-500">Renter: {o.renterName} | Code: <span className="font-mono font-bold text-blue-600">RETURN-{o.pickupCode}</span></p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-bold text-blue-600 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1">
                            Simulate Scan
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Manual Entry Fallback Form */}
          <div className="border-t border-gray-100 pt-4">
            <form onSubmit={handleManualSubmit} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Enter confirmation code manually..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={processing || !!successMsg}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={processing || !!successMsg || !manualCode.trim()}
                className="rounded-xl bg-gray-900 hover:bg-black px-4 py-2 text-xs font-bold text-white transition disabled:opacity-40"
              >
                Submit Code
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
