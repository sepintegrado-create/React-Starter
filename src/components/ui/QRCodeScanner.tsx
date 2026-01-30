import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
    title?: string;
    description?: string;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
    onScan,
    onClose,
    title = 'Escanear QR Code',
    description = 'Posicione o QR Code dentro da área de captura',
}) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string>('');
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setHasPermission(true);
                setScanning(true);

                // Start scanning after video is ready
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    scanQRCode();
                };
            }
        } catch (err: any) {
            console.error('Error accessing camera:', err);
            setHasPermission(false);
            setError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const scanQRCode = () => {
        if (!scanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(scanQRCode);
            return;
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Try to decode QR code using jsQR library
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
                // QR Code found!
                setScanning(false);
                stopCamera();
                onScan(code.data);
                return;
            }
        } catch (err) {
            console.error('QR scanning error:', err);
        }

        // Continue scanning
        if (scanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

    const handleManualInput = () => {
        const code = prompt('Digite o código manualmente:');
        if (code) {
            stopCamera();
            onScan(code);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full max-w-2xl max-h-screen flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{title}</h2>
                            <p className="text-sm opacity-90">{description}</p>
                        </div>
                        <button
                            onClick={() => {
                                stopCamera();
                                onClose();
                            }}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Camera View */}
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    {hasPermission === null && (
                        <div className="text-white text-center">
                            <Camera size={48} className="mx-auto mb-4 animate-pulse" />
                            <p>Solicitando permissão da câmera...</p>
                        </div>
                    )}

                    {hasPermission === false && (
                        <div className="text-white text-center p-6">
                            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                            <p className="mb-4">{error}</p>
                            <button
                                onClick={startCamera}
                                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    )}

                    {hasPermission && (
                        <>
                            <video
                                ref={videoRef}
                                className="w-full h-full object-contain"
                                playsInline
                                muted
                            />

                            {/* Scanning overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative w-64 h-64">
                                    {/* Corner markers */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>

                                    {/* Scanning line animation */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="absolute bottom-20 left-0 right-0 text-center text-white">
                                <p className="text-lg font-semibold mb-2">
                                    {scanning ? 'Procurando QR Code...' : 'Câmera pronta'}
                                </p>
                                <p className="text-sm opacity-75">
                                    Mantenha o QR Code dentro da área marcada
                                </p>
                            </div>
                        </>
                    )}

                    {/* Hidden canvas for QR processing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-900 p-4 flex gap-3">
                    <button
                        onClick={handleManualInput}
                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Digitar Código
                    </button>
                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default QRCodeScanner;
