import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, RefreshCw, Loader2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { analyzeImageText } from '../services/gemini';

export const Scan: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Tidak dapat mengakses kamera. Pastikan izin diberikan.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageDataUrl);
                stopCamera();
                analyzeImage(imageDataUrl);
            }
        }
    };

    const analyzeImage = async (base64Image: string) => {
        setIsAnalyzing(true);
        setResult(null);
        try {
            const text = await analyzeImageText(base64Image);
            setResult(text);
        } catch (err) {
            setError("Gagal menganalisis gambar.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const retake = () => {
        setCapturedImage(null);
        setResult(null);
        setError(null);
        startCamera();
    };

    return (
        <div className="flex-1 flex flex-col bg-black relative overflow-hidden pb-16">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="text-white p-2 mr-2 bg-black/30 rounded-full hover:bg-black/50">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-white font-extrabold text-lg flex items-center">
                        <Camera className="w-5 h-5 mr-2" /> Scan Teks
                    </h1>
                </div>
                {capturedImage && (
                    <button onClick={retake} className="text-white p-2 bg-black/50 rounded-full hover:bg-black/70">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Camera View or Captured Image */}
            <div className="flex-1 relative flex items-center justify-center bg-gray-900">
                {!capturedImage ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        {/* Viewfinder overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls & Results */}
            <div className="bg-white rounded-t-[2.5rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 min-h-[220px] flex flex-col">
                {error ? (
                    <div className="text-center flex-1 flex flex-col justify-center">
                        <p className="text-danger font-extrabold mb-4">{error}</p>
                        <Button onClick={retake} variant="outline">Coba Lagi</Button>
                    </div>
                ) : !capturedImage ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-gray-500 text-sm font-bold mb-6 text-center">Arahkan kamera ke teks bahasa Aceh atau Indonesia</p>
                        <button 
                            onClick={captureImage}
                            className="w-20 h-20 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                        >
                            <div className="w-16 h-16 bg-primary rounded-full"></div>
                        </button>
                    </div>
                ) : isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-gray-600 font-extrabold">AI sedang membaca teks...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center mb-4 text-primary">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            <h3 className="font-extrabold uppercase tracking-wider text-sm">Hasil Terjemahan</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-1 overflow-y-auto">
                            <p className="text-gray-800 font-bold whitespace-pre-wrap">{result}</p>
                        </div>
                        <Button onClick={retake} variant="secondary" className="mt-4" fullWidth>
                            <RefreshCw className="w-5 h-5 mr-2" /> Scan Lagi
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
