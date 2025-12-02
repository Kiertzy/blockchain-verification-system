import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import { message } from "antd";

function QrcodeScanner() {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(true);
    const [cameraError, setCameraError] = useState(null);

    const handleScan = (data) => {
        if (data) {
            const scannedUrl = data.text;
            setScanResult(scannedUrl);
            setScanning(false);
            message.success("QR Code scanned successfully!");

            // Check if it's a URL and navigate
            try {
                const url = new URL(scannedUrl);
                
                // Check if it's an internal route (same domain)
                if (url.hostname === window.location.hostname) {
                    // Extract the path from the URL
                    const path = url.pathname + url.search + url.hash;
                    
                    // Navigate to the internal route after a short delay
                    setTimeout(() => {
                        navigate(path);
                    }, 1000);
                } else {
                    // External URL - open in new tab
                    setTimeout(() => {
                        window.open(scannedUrl, '_blank', 'noopener,noreferrer');
                        resetScanner(); // Reset scanner after opening external link
                    }, 1000);
                }
            } catch (error) {
                // Not a valid URL, just display it
                console.log("Scanned content is not a URL:", scannedUrl);
                message.info("Scanned content is not a URL");
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setCameraError("Failed to access camera. Please check permissions.");
        message.error("Camera access denied or unavailable");
    };

    const resetScanner = () => {
        setScanResult(null);
        setScanning(true);
        setCameraError(null);
    };

    const handleManualNavigate = () => {
        if (scanResult) {
            try {
                const url = new URL(scanResult);
                
                if (url.hostname === window.location.hostname) {
                    const path = url.pathname + url.search + url.hash;
                    navigate(path);
                } else {
                    window.open(scanResult, '_blank', 'noopener,noreferrer');
                    resetScanner();
                }
            } catch (error) {
                message.error("Invalid URL");
            }
        }
    };

    const previewStyle = {
        height: 400,
        width: "100%",
        maxWidth: 600,
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">QR Code Scanner</h1>

            <div className="flex flex-col items-center gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                {cameraError ? (
                    <div className="w-full max-w-xl rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-700 dark:bg-red-900/20">
                        <p className="text-red-800 dark:text-red-200">{cameraError}</p>
                        <button
                            onClick={resetScanner}
                            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : scanning ? (
                    <div className="flex flex-col items-center gap-4">
                        {/* QR-style corner frame */}
                        <div className="relative">
                            <div className="overflow-hidden rounded-lg">
                                <QrScanner
                                    delay={300}
                                    style={previewStyle}
                                    onError={handleError}
                                    onScan={handleScan}
                                    constraints={{
                                        video: { facingMode: "environment" }
                                    }}
                                />
                            </div>
                            
                            {/* Top-left corner */}
                            <div className="absolute left-0 top-0 h-16 w-16 border-l-4 border-t-4 border-blue-500"></div>
                            
                            {/* Top-right corner */}
                            <div className="absolute right-0 top-0 h-16 w-16 border-r-4 border-t-4 border-blue-500"></div>
                            
                            {/* Bottom-left corner */}
                            <div className="absolute bottom-0 left-0 h-16 w-16 border-b-4 border-l-4 border-blue-500"></div>
                            
                            {/* Bottom-right corner */}
                            <div className="absolute bottom-0 right-0 h-16 w-16 border-b-4 border-r-4 border-blue-500"></div>

                            {/* Scanning line animation */}
                            <div className="absolute left-0 right-0 top-0 h-1 bg-blue-500 animate-scan"></div>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400">
                            Position the QR code within the camera frame
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-xl rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-700 dark:bg-green-900/20">
                        <h2 className="mb-4 text-xl font-semibold text-green-800 dark:text-green-200">
                            Scan Result:
                        </h2>
                        <div className="break-words rounded bg-white p-4 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-white">
                            {scanResult}
                        </div>
                        <p className="mt-3 text-sm text-green-700 dark:text-green-300">
                            {scanResult && scanResult.startsWith('http') 
                                ? "Redirecting you to the certificate..." 
                                : "Scanned content displayed above"}
                        </p>
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={handleManualNavigate}
                                className="flex-1 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                Go to Link
                            </button>
                            <button
                                onClick={resetScanner}
                                className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Scan Another
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                    📱 Instructions:
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Allow camera access when prompted by your browser</li>
                    <li>Hold the QR code steady within the camera frame</li>
                    <li>Ensure adequate lighting for best results</li>
                    <li>The scanner will automatically detect and navigate to the URL</li>
                    <li>Internal links will open in the same tab, external links in a new tab</li>
                </ul>
            </div>

            {/* Add custom CSS for scanning animation */}
            <style jsx>{`
                @keyframes scan {
                    0% {
                        top: 0;
                    }
                    50% {
                        top: calc(100% - 4px);
                    }
                    100% {
                        top: 0;
                    }
                }
                .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default QrcodeScanner;

