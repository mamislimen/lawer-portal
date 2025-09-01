import { ZegoExpressEngine } from 'zego-express-engine-webrtc'

export interface ZegoConfig {
  appId: number
  token: string
  roomId: string
  userId: string
  userName: string
}

export class ZegoCloudService {
  private zg: ZegoExpressEngine | null = null
  private localStream: MediaStream | null = null
  private remoteStreams: Map<string, MediaStream> = new Map()
  private isConnected = false
  private streamId: string
  private isInitialized = false
  private connectionAttempts = 0
  private maxConnectionAttempts = 3
  private lastConnectionTime = 0
  private minConnectionInterval = 5000 // 5 seconds between attempts

  constructor() {
    this.streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async initialize(appId: number, server?: string): Promise<void> {
    // Check rate limiting
    const now = Date.now()
    if (now - this.lastConnectionTime < this.minConnectionInterval) {
      throw new Error(`Please wait ${Math.ceil((this.minConnectionInterval - (now - this.lastConnectionTime)) / 1000)} seconds before reconnecting`)
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      throw new Error('Maximum connection attempts reached. Please refresh the page.')
    }

    if (this.isInitialized && this.zg) {
      console.log('ZegoCloud already initialized')
      return
    }

    try {
      // Properly destroy any existing instance
      await this.destroy()
      
      // Wait before creating new instance
      await new Promise(resolve => setTimeout(resolve, 1000))

      this.zg = new ZegoExpressEngine(appId, server || 'wss://webliveroom-api.zego.im/ws')
      this.setupEventListeners()
      this.isInitialized = true
      this.lastConnectionTime = now
      this.connectionAttempts++
      
      console.log('ZegoCloud initialized successfully')
    } catch (error) {
      console.error('Failed to initialize ZegoCloud:', error)
      this.connectionAttempts++
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!this.zg) return

    this.zg.on('roomStreamUpdate', (roomID: string, updateType: string, streamList: any[]) => {
      console.log('Room stream update:', { roomID, updateType, streamList })
      
      if (updateType === 'ADD') {
        streamList.forEach(stream => {
          this.playRemoteStream(stream.streamID)
        })
      } else if (updateType === 'DELETE') {
        streamList.forEach(stream => {
          this.remoteStreams.delete(stream.streamID)
        })
      }
    })

    this.zg.on('roomStateUpdate', (roomID: string, state: string, errorCode: number) => {
      console.log('Room state update:', { roomID, state, errorCode })
      this.isConnected = state === 'CONNECTED'
      
      if (errorCode !== 0) {
        console.error('Room connection error:', errorCode)
      }
    })

    // Add error handling
    this.zg.on('roomStateChanged', (roomID: string, state: string, errorCode: number, extendedData: any) => {
      console.log('Room state changed:', { roomID, state, errorCode, extendedData })
    })
  }

  async joinRoom(config: ZegoConfig): Promise<void> {
    if (!this.zg) {
      throw new Error('ZegoCloud not initialized')
    }

    try {
      console.log('Attempting to join room with config:', {
        roomId: config.roomId,
        userId: config.userId,
        userName: config.userName,
        hasToken: !!config.token
      })
      console.log(config.roomId)
      console.log(config.token)
      console.log(config.userId)
      console.log(config.userName)
      await this.zg.loginRoom(
        config.roomId,
        config.token,
        { userID: config.userId, userName: config.userName },
        { userUpdate: true }
      )
      
      // Wait a bit for room connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create and publish local stream
      const stream = await this.zg.createStream({
        camera: { audio: true, video: true }
      })
      this.localStream = stream
      await this.zg.startPublishingStream(this.streamId, stream)
      
      console.log('Successfully joined room and started publishing:', config.roomId)
    } catch (error) {
      console.error('Failed to join room:', error)
      throw error
    }
  }

  private async playRemoteStream(streamId: string): Promise<void> {
    if (!this.zg) return

    try {
      const remoteStream = await this.zg.startPlayingStream(streamId)
      this.remoteStreams.set(streamId, remoteStream)
      console.log('Playing remote stream:', streamId)
      
      // Auto-play remote video if element exists
      setTimeout(() => {
        const remoteVideo = document.getElementById(`remote-video-${streamId}`) as HTMLVideoElement
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream
        }
      }, 100)
    } catch (error) {
      console.error('Failed to play remote stream:', error)
    }
  }

  playLocalVideo(elementId: string): void {
    const videoElement = document.getElementById(elementId) as HTMLVideoElement
    if (videoElement && this.localStream) {
      videoElement.srcObject = this.localStream
    }
  }

  async toggleMicrophone(): Promise<boolean> {
    if (!this.localStream) return false

    try {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
      return false
    } catch (error) {
      console.error('Failed to toggle microphone:', error)
      return false
    }
  }

  async toggleCamera(): Promise<boolean> {
    if (!this.localStream) return false

    try {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
      return false
    } catch (error) {
      console.error('Failed to toggle camera:', error)
      return false
    }
  }

  async startScreenShare(): Promise<void> {
    if (!this.zg) {
      throw new Error('ZegoCloud not initialized')
    }

    try {
      const screenStream = await this.zg.createStream({
        screen: { audio: true }
      })
      
      await this.zg.startPublishingStream(`${this.streamId}_screen`, screenStream)
      console.log('Screen sharing started')
    } catch (error) {
      console.error('Failed to start screen share:', error)
      throw error
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.zg) return

    try {
      await this.zg.stopPublishingStream(`${this.streamId}_screen`)
      console.log('Screen sharing stopped')
    } catch (error) {
      console.error('Failed to stop screen share:', error)
    }
  }

  getRemoteUsers(): string[] {
    return Array.from(this.remoteStreams.keys())
  }

  async leave(): Promise<void> {
    if (!this.zg) return

    try {
      if (this.localStream) {
        await this.zg.stopPublishingStream(this.streamId)
        this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = null
      }

      this.remoteStreams.forEach((stream, streamId) => {
        this.zg?.stopPlayingStream(streamId)
      })
      this.remoteStreams.clear()

      await this.zg.logoutRoom()
      this.isConnected = false
      console.log('Left room successfully')
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  async destroy(): Promise<void> {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = null
      }

      this.remoteStreams.forEach((stream) => {
        stream.getTracks().forEach(track => track.stop())
      })
      this.remoteStreams.clear()

      if (this.zg) {
        try {
          if (this.isConnected) {
            await this.zg.logoutRoom()
          }
        } catch (error) {
          console.warn('Error during logout:', error)
        }
        
        // Wait before destroying to prevent rapid reconnections
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.zg.destroyEngine()
        this.zg = null
      }

      this.isConnected = false
      this.isInitialized = false
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }
}

// Singleton instance with proper cleanup
let zegoService: ZegoCloudService | null = null

export function getZegoService(): ZegoCloudService {
  if (!zegoService) {
    zegoService = new ZegoCloudService()
  }
  return zegoService
}

export function resetZegoService(): void {
  if (zegoService) {
    zegoService.destroy()
    zegoService = null
  }
}
