import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Scan, AlertCircle } from 'lucide-react';

const Scanner = ({ onScan, onError }) => {
    const videoRef = useRef(null);
    const codeReader = useRef(null);
    const isScanning = useRef(false);
    const lastScanRef = useRef({ code: null, time: 0 }); // Debounce ref
    const [cameraError, setCameraError] = useState(null);

    // Strict EAN-13 Configuration
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

    useEffect(() => {
        if (!videoRef.current) return;

        codeReader.current = new BrowserMultiFormatReader(hints);
        isScanning.current = true;
        setCameraError(null);

        const startScanning = async () => {
            try {
                // Select back camera by default
                const videoInputDevices = await codeReader.current.listVideoInputDevices();
                const selectedDeviceId = videoInputDevices.find(device => device.label.toLowerCase().includes('back'))?.deviceId
                    || videoInputDevices[0]?.deviceId;

                await codeReader.current.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current,
                    (result, error) => {
                        if (!isScanning.current) return;

                        // 1. Success Case
                        if (result) {
                            const code = result.getText();
                            const now = Date.now();

                            // Strict Deduplication (3000ms cooldown for SAME code)
                            // Allows rescanning different items immediately
                            if (code === lastScanRef.current.code && (now - lastScanRef.current.time < 3000)) {
                                return;
                            }

                            lastScanRef.current = { code, time: now };
                            if (onScan) onScan(code);
                        }

                        // 2. Error Case
                        if (error && !(error instanceof NotFoundException)) {
                            // Ignore minor frame errors, report blocking ones
                            console.warn("Frame scan error:", error);
                        }
                    }
                );
            } catch (err) {
                console.error("Scanner initialization failed:", err);
                setCameraError("Camera access denied or not available. Please allow camera permissions.");
                if (onError) onError(err);
            }
        };

        startScanning();

        return () => {
            isScanning.current = false;
            if (codeReader.current) {
                codeReader.current.reset();
            }
        };
    }, [onScan, onError]);

    if (cameraError) {
        return (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center border-2 border-red-200 dark:border-red-900/30">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">Camera Error</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cameraError}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden rounded-3xl shadow-2xl bg-black relative aspect-[3/4] sm:aspect-square">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
            />

            {/* Darkened Overlay Area */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

            {/* Focus Box */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-44 pointer-events-none">
                {/* Active Scanning Animation */}
                <div className="absolute inset-0 border-2 border-emerald-400/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10"></div>

                {/* Scanner Laser Line */}
                <div className="absolute top-0 left-2 right-2 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan-laser opacity-80 z-20"></div>

                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg z-20"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg z-20"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg z-20"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg z-20"></div>

                {/* Guide Text */}
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide">
                        EAN-13 Barcode
                    </span>
                </div>
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <div className="flex items-center gap-2 text-white/80 text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Scan className="w-4 h-4 animate-pulse" />
                    <span>Align barcode within frame</span>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
