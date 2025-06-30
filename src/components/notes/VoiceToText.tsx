import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { transcribeAudio } from '../../lib/elevenlabs';

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceToText({ onTranscript, className = '' }: VoiceToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Check if ElevenLabs API key is configured
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey || apiKey.trim() === '' || apiKey === 'your_elevenlabs_api_key_here') {
        throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        try {
          await processAudio();
        } catch (error) {
          console.error('Error processing audio:', error);
          setError(error instanceof Error ? error.message : 'Failed to process audio');
        } finally {
          setIsProcessing(false);
        }
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(error instanceof Error ? error.message : 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async () => {
    if (chunksRef.current.length === 0) {
      throw new Error('No audio data recorded');
    }

    // Check API key again before processing
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_elevenlabs_api_key_here') {
      throw new Error('ElevenLabs API key not configured');
    }

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    
    try {
      const transcript = await transcribeAudio(audioBlob);
      if (transcript && transcript.trim()) {
        onTranscript(transcript);
      } else {
        throw new Error('No speech detected in the recording');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <Button
        onClick={toggleRecording}
        disabled={isProcessing}
        variant={isRecording ? 'destructive' : 'default'}
        size="sm"
        className="flex items-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : isRecording ? (
          <>
            <Square className="w-4 h-4" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>Start Recording</span>
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md max-w-xs text-center">
          {error}
        </div>
      )}
      
      {isRecording && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording...</span>
        </div>
      )}
    </div>
  );
}