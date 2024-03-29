import React, { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

export const SocketContext = React.createContext({ socket: null });

export function SocketProvider({ children }) {
    // we use a ref to store the socket as it won't be updated frequently
    const URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5001';

    const socket = useRef(socketIOClient(URL));

    // When the Provider mounts, initialize it 👆
    // and register a few listeners 👇

    useEffect(() => {
        socket.current.on('connect', () => {
            console.log('SocketIO: Connected and authenticated');
        });

        socket.current.on('error', (msg) => {
            console.error('SocketIO: Error', msg);
        });

        // Remove all the listeners and
        // close the socket when it unmounts
        return () => {
            if (socket && socket.current) {
                socket.current.removeAllListeners();
                socket.current.close();
            }
        };
    }, []);

    return <SocketContext.Provider value={{ socket: socket.current }}>{children}</SocketContext.Provider>;
}
