import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IRemoteVideoTrack,
  type IRemoteAudioTrack,
} from "agora-rtc-sdk-ng"

export interface AgoraConfig {
  appId: string
  token: string
  channelName: string
  uid: number
}

export class AgoraService {
  private client: IAgoraRTCClient
  private localVideoTrack: ICameraVideoTrack | null = null
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private remoteUsers: Map<number, { videoTrack?: IRemoteVideoTrack; audioTrack?: IRemoteAudioTrack }> = new Map()

  constructor() {
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType)

      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack!
        const remoteUser = this.remoteUsers.get(user.uid as number) || {}
        remoteUser.videoTrack = remoteVideoTrack
        this.remoteUsers.set(user.uid as number, remoteUser)

        // Play remote video
        const playerContainer = document.getElementById(`player-${user.uid}`)
        if (playerContainer) {
          remoteVideoTrack.play(playerContainer)
        }
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack!
        const remoteUser = this.remoteUsers.get(user.uid as number) || {}
        remoteUser.audioTrack = remoteAudioTrack
        this.remoteUsers.set(user.uid as number, remoteUser)

        // Play remote audio
        remoteAudioTrack.play()
      }
    })

    this.client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video") {
        const remoteUser = this.remoteUsers.get(user.uid as number)
        if (remoteUser?.videoTrack) {
          remoteUser.videoTrack.stop()
          delete remoteUser.videoTrack
        }
      }

      if (mediaType === "audio") {
        const remoteUser = this.remoteUsers.get(user.uid as number)
        if (remoteUser?.audioTrack) {
          remoteUser.audioTrack.stop()
          delete remoteUser.audioTrack
        }
      }
    })

    this.client.on("user-left", (user) => {
      const remoteUser = this.remoteUsers.get(user.uid as number)
      if (remoteUser) {
        remoteUser.videoTrack?.stop()
        remoteUser.audioTrack?.stop()
        this.remoteUsers.delete(user.uid as number)
      }
    })
  }

  async join(config: AgoraConfig): Promise<void> {
    try {
      await this.client.join(config.appId, config.channelName, config.token, config.uid)
    } catch (error) {
      console.error("Failed to join channel:", error)
      throw error
    }
  }

  async createLocalTracks(): Promise<void> {
    try {
      ;[this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
    } catch (error) {
      console.error("Failed to create local tracks:", error)
      throw error
    }
  }

  async publish(): Promise<void> {
    if (this.localAudioTrack && this.localVideoTrack) {
      await this.client.publish([this.localAudioTrack, this.localVideoTrack])
    }
  }

  playLocalVideo(elementId: string): void {
    if (this.localVideoTrack) {
      const container = document.getElementById(elementId)
      if (container) {
        this.localVideoTrack.play(container)
      }
    }
  }

  async toggleMicrophone(): Promise<boolean> {
    if (this.localAudioTrack) {
      const enabled = this.localAudioTrack.enabled
      await this.localAudioTrack.setEnabled(!enabled)
      return !enabled
    }
    return false
  }

  async toggleCamera(): Promise<boolean> {
    if (this.localVideoTrack) {
      const enabled = this.localVideoTrack.enabled
      await this.localVideoTrack.setEnabled(!enabled)
      return !enabled
    }
    return false
  }

  async startScreenShare(): Promise<void> {
    try {
      // Create screen track with proper configuration
      const screenTrack = await AgoraRTC.createScreenVideoTrack(
        {
          encoderConfig: '1080p_1',
        },
        'disable'
      )

      if (this.localVideoTrack) {
        await this.client.unpublish([this.localVideoTrack])
        this.localVideoTrack.close()
      }

      // Cast to ICameraVideoTrack since that's what the rest of the code expects
      this.localVideoTrack = screenTrack as unknown as ICameraVideoTrack
      await this.client.publish([this.localVideoTrack])
    } catch (error) {
      console.error("Failed to start screen share:", error)
      throw error
    }
  }

  async stopScreenShare(): Promise<void> {
    try {
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack)
        this.localVideoTrack.close()
      }

      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
      await this.client.publish(this.localVideoTrack)
    } catch (error) {
      console.error("Failed to stop screen share:", error)
      throw error
    }
  }

  async leave(): Promise<void> {
    // Clean up local tracks
    if (this.localAudioTrack) {
      this.localAudioTrack.close()
      this.localAudioTrack = null
    }

    if (this.localVideoTrack) {
      this.localVideoTrack.close()
      this.localVideoTrack = null
    }

    // Clean up remote users
    this.remoteUsers.clear()

    // Leave channel
    await this.client.leave()
  }

  getRemoteUsers(): number[] {
    return Array.from(this.remoteUsers.keys())
  }

  isLocalAudioEnabled(): boolean {
    return this.localAudioTrack?.enabled || false
  }

  isLocalVideoEnabled(): boolean {
    return this.localVideoTrack?.enabled || false
  }
}

// Singleton instance
let agoraService: AgoraService | null = null

export const getAgoraService = (): AgoraService => {
  if (!agoraService) {
    agoraService = new AgoraService()
  }
  return agoraService
}
