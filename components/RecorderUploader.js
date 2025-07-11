import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Vibration } from "react-native";
import { Audio } from "expo-av";

const RecorderUploader = ({ onTranscription }) => {
  const [isUploading, setIsUploading] = useState(false);
  const recordingRef = useRef(null);

  useEffect(() => {
    const start = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        await rec.startAsync();
        recordingRef.current = rec;
      } catch (err) {
        console.error("Recording failed:", err);
      }
    };

    start();

    return () => {
      const stop = async () => {
        try {
          const rec = recordingRef.current;
          if (!rec) return;

          await rec.stopAndUnloadAsync();
          const uri = rec.getURI();
          await uploadAudio(uri);
        } catch (err) {
          console.error("Stop recording error:", err);
        }
      };

      stop();
    };
  }, []);

  const uploadAudio = async (uri) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice.wav",
        type: "audio/wav",
      });

      const response = await fetch("http://192.168.0.103:8000/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Backend Transcription:", data.transcription);
      if (onTranscription) onTranscription(data.transcription);
      Vibration.vibrate(50);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ marginTop: 20, alignItems: "center" }}>
      {isUploading && <ActivityIndicator />}
    </View>
  );
};

export default RecorderUploader;
