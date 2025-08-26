'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getSocket, isConnected, getSocketId, disconnectSocket } from '@/lib/socket-client';

export default function TestWebSocket() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: string; timestamp: string }>>([]);
  const [room, setRoom] = useState('');
  const [socket, setSocket] = useState<ReturnType<typeof getSocket> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [socketId, setSocketId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    try {
      const socketInstance = getSocket();
      setSocket(socketInstance);
      setConnectionStatus('connecting');

      // Connection status handlers
      const onConnect = () => {
        console.log('Connected to WebSocket server');
        setConnectionStatus('connected');
        setSocketId(socketInstance.id || null);
      };

      const onDisconnect = () => {
        console.log('Disconnected from WebSocket server');
        setConnectionStatus('disconnected');
        setSocketId(null);
      };

      const onConnectError = (error: Error) => {
        console.error('Connection error:', error);
        setConnectionStatus('disconnected');
      };

      // Message handler
      const onMessage = (data: { text: string; sender: string; timestamp: string }) => {
        console.log('Message received:', data);
        setMessages(prev => [...prev, data]);
      };

      // Set up event listeners
      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('connect_error', onConnectError);
      socketInstance.on('message', onMessage);

      // Initial connection check
      if (socketInstance.connected) {
        onConnect();
      }

      // Clean up
      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('connect_error', onConnectError);
        socketInstance.off('message', onMessage);
        disconnectSocket();
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      setConnectionStatus('disconnected');
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      const messageData = {
        text: message,
        sender: 'You',
        timestamp: new Date().toISOString(),
        room: room || 'default'
      };
      
      // Emit the message to the server
      socket.emit('send_message', messageData);
      
      // Add the message to the local state
      setMessages(prev => [...prev, messageData]);
      setMessage('');
    }
  };

  const handleJoinRoom = () => {
    if (room.trim() && socket) {
      socket.emit('join_room', { room: room.trim() });
      setMessages(prev => [...prev, {
        text: `Joined room: ${room}`,
        sender: 'System',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleDisconnect = () => {
    if (socket) {
      disconnectSocket();
      setSocket(null);
      setConnectionStatus('disconnected');
      setSocketId(null);
    }
  };

  const handleReconnect = () => {
    if (!socket || !isConnected()) {
      const newSocket = getSocket();
      setSocket(newSocket);
      setConnectionStatus('connecting');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">WebSocket Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Socket ID:</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {socketId || 'Not connected'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room">Join a Room</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="room"
                      placeholder="Enter room name"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      disabled={connectionStatus !== 'connected'}
                    />
                    <Button 
                      onClick={handleJoinRoom} 
                      disabled={connectionStatus !== 'connected' || !room.trim()}
                    >
                      Join
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDisconnect}
                    disabled={connectionStatus === 'disconnected'}
                  >
                    Disconnect
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReconnect}
                    disabled={connectionStatus === 'connected'}
                  >
                    Reconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
              <CardDescription>
                {connectionStatus === 'connected' ? 'Connected to the server' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected from server'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {connectionStatus === 'connected' 
                      ? 'No messages yet. Send a message to get started!' 
                      : 'Connect to the server to send and receive messages.'}
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        msg.sender === 'You' 
                          ? 'bg-primary/10 ml-8' 
                          : msg.sender === 'System'
                            ? 'bg-muted/30'
                            : 'bg-muted/50 mr-8'
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-medium">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <div className="flex w-full space-x-2">
                <Input
                  placeholder={connectionStatus === 'connected' ? 'Type a message...' : 'Connect to send messages'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={connectionStatus !== 'connected'}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={connectionStatus !== 'connected' || !message.trim()}
                >
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
