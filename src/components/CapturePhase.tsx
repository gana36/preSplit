import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';
import { parseReceiptImage } from '../services/gemini';

export const CapturePhase: React.FC = () => {
    const { setReceipt, setPhase } = useAppStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const data = await parseReceiptImage(file);
            setReceipt(data);
            setPhase('assignment');
        } catch (err: any) {
            setError(err.message || "Failed to process receipt");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Scan Receipt</h2>
                <p className="text-gray-500">Take a photo or upload to start splitting</p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                <Camera className="w-8 h-8 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-600 group-hover:text-blue-600">
                                Tap to Capture
                            </span>
                        </>
                    )}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-50 px-2 text-gray-500">Or upload file</span>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    capture="environment"
                />

                {/* Fallback upload button if camera capture isn't preferred */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <Upload className="w-4 h-4 inline-block mr-2" />
                    Upload from Gallery
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center animate-in slide-in-from-bottom-2">
                    {error}
                </div>
            )}

            {isProcessing && (
                <p className="text-sm text-gray-500 animate-pulse">
                    Analyzing receipt with AI...
                </p>
            )}
        </div>
    );
};
