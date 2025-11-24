import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';
import { parseReceiptImage } from '../services/gemini';
import { FinalLogo } from './FinalLogo';

export const CapturePhase: React.FC = () => {
    const { setReceipt, setPhase } = useAppStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const data = await parseReceiptImage(file);

            // Validate data
            if (!data.items || data.items.length === 0) {
                throw new Error("No items found in receipt. Please try again.");
            }

            // Check if we have at least some valid prices
            const validItems = data.items.filter(item => typeof item.price === 'number' && !isNaN(item.price));
            if (validItems.length === 0) {
                throw new Error("Could not extract prices. Please try a clearer photo.");
            }

            setReceipt(data);
            setPhase('assignment');
        } catch (err: any) {
            setError(err.message || "Failed to process receipt");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Hero Section with Logo and Tagline */}
            <div className="pt-16 pb-8 px-6 text-center flex flex-col items-center">
                <FinalLogo size={120} className="mb-6" />
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                    Scan. Beam. Done.
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                    The fastest way to split the bill.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col px-6 pb-8 max-w-md mx-auto w-full">

                {/* Camera Viewfinder Button */}
                <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex-1 w-full relative group overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-50 transition-all duration-300 active:scale-[0.99] hover:bg-gray-100"
                >
                    {/* Corner Accents (Viewfinder look) */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-gray-300 rounded-tl-xl group-hover:border-gray-400 transition-colors" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-gray-300 rounded-tr-xl group-hover:border-gray-400 transition-colors" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-gray-300 rounded-bl-xl group-hover:border-gray-400 transition-colors" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-gray-300 rounded-br-xl group-hover:border-gray-400 transition-colors" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
                                <p className="text-sm font-medium text-gray-500 animate-pulse">Reading receipt...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 transition-transform duration-300 group-hover:scale-105">
                                <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-gray-900" strokeWidth={1.5} />
                                </div>
                                <div className="text-center space-y-1">
                                    <h2 className="text-xl font-semibold text-gray-900">Scan Receipt</h2>
                                    <p className="text-sm text-gray-500">Tap to open camera</p>
                                </div>
                            </div>
                        )}
                    </div>
                </button>

                {/* Secondary Action */}
                <div className="mt-6 space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="bg-white px-4 text-gray-400">or</span>
                        </div>
                    </div>

                    <button
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-full py-4 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <ImageIcon className="w-4 h-4" />
                        Import from Photos
                    </button>
                </div>

                {/* Hidden Inputs */}
                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    capture="environment"
                />
                <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Error Toast */}
            {error && (
                <div className="absolute bottom-8 left-6 right-6 mx-auto max-w-md">
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-sm border border-red-100 animate-in slide-in-from-bottom-2">
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
};
