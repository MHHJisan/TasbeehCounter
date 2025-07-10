import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { Audio } from "expo-av";

const RecorderUploader = ({ onTranscription }) => {
  const [recording, setRecording] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const recordingRef = useRef(null);

  const startRecording = async () => {
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
      setRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  const stopRecording = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setRecording(null);
      await uploadAudio(uri);
    } catch (err) {
      console.error("Stop recording error:", err);
    }
  };

  const uploadAudio = async (uri) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice.wav",
        type: "audio/wav",
      });

      const response = await fetch("http://<YOUR-IP>:8000/transcribe", {
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
      {recording ? (
        <TouchableOpacity
          onPress={stopRecording}
          style={{ backgroundColor: "#dc2626", padding: 10, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            🛑 Stop & Transcribe
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={startRecording}
          style={{ backgroundColor: "#22c55e", padding: 10, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            🎤 Start Recording
          </Text>
        </TouchableOpacity>
      )}

      {isUploading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

export default RecorderUploader;
