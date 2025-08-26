"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  IAgoraRTCRemoteUser
} from "agora-rtc-sdk-ng";

interface AgoraContextType {
  client: IAgoraRTCClient | null;
  localVideoTrack: ICameraVideoTrack | null;
  localAudioTrack: IMicrophoneAudioTrack | null;
  joinState: boolean;
  remoteUsers: IAgoraRTCRemoteUser[];
  tracks: [IMicrophoneAudioTrack | null, ICameraVideoTrack | null] | null;
  ready: boolean;
  join: (appId: string, channel: string, token?: string) => Promise<void>;
  leave: () => Promise<void>;
  muteLocalAudio: () => Promise<void>;
  unmuteLocalAudio: () => Promise<void>;
  muteLocalVideo: () => Promise<void>;
  unmuteLocalVideo: () => Promise<void>;
}

const AgoraContext = createContext<AgoraContextType | null>(null);

export function AgoraProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [joinState, setJoinState] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = async () => {
    if (typeof window === "undefined") return null; // SSR guard
    if (client) return client;

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(agoraClient);
      return agoraClient;
    } catch (err) {
      console.error("Failed to initialize Agora client:", err);
      setError("Failed to initialize video call service.");
      return null;
    }
  };

  useEffect(() => {
    return () => {
      if (client) client.leave().catch(console.error);
    };
  }, [client]);

  useEffect(() => {
    if (!client) return;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") setRemoteUsers(prev => [...prev, user]);
      if (mediaType === "audio" && user.audioTrack) user.audioTrack.play();
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (mediaType === "video") setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
    };
  }, [client]);

  const join = async (appId: string, channel: string, token?: string) => {
    try {
      const agoraClient = client || (await initializeClient());
      if (!agoraClient) throw new Error("Failed to initialize Agora client.");

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      const [microphoneTrack, cameraTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
      ]);

      setLocalAudioTrack(microphoneTrack);
      setLocalVideoTrack(cameraTrack);

      await agoraClient.join(appId, channel, token || null);
      await agoraClient.publish([microphoneTrack, cameraTrack]);
      setJoinState(true);
    } catch (err) {
      console.error("Failed to join channel:", err);
      throw err;
    }
  };

  const leave = async () => {
    if (!client) return;
    try {
      if (localAudioTrack) { localAudioTrack.close(); setLocalAudioTrack(null); }
      if (localVideoTrack) { localVideoTrack.close(); setLocalVideoTrack(null); }
      await client.leave();
      setRemoteUsers([]);
      setJoinState(false);
    } catch (err) {
      console.error("Error leaving channel:", err);
    }
  };

  const muteLocalAudio = async () => localAudioTrack?.setEnabled(false);
  const unmuteLocalAudio = async () => localAudioTrack?.setEnabled(true);
  const muteLocalVideo = async () => localVideoTrack?.setEnabled(false);
  const unmuteLocalVideo = async () => localVideoTrack?.setEnabled(true);

  const contextValue: AgoraContextType = {
    client,
    localVideoTrack,
    localAudioTrack,
    joinState,
    remoteUsers,
    tracks: [localAudioTrack, localVideoTrack],
    ready: !!client,
    join,
    leave,
    muteLocalAudio,
    unmuteLocalAudio,
    muteLocalVideo,
    unmuteLocalVideo
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return <AgoraContext.Provider value={contextValue}>{children}</AgoraContext.Provider>;
}

export const useAgoraContext = (): AgoraContextType => {
  const context = useContext(AgoraContext);
  if (!context) throw new Error("useAgoraContext must be used within an AgoraProvider");
  return context;
};

export default AgoraContext;
