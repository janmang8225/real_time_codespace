import express from 'express';
import { Server } from '@hocuspocus/server';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Setup Hocuspocus
const server = Server.configure({
    port: PORT, // Hocuspocus can listen directly, or we can attach.
    // We want to combine with Express to serve API endpoints if needed.
    // But Hocuspocus listens on a port.
    // If we want express routes, we can't easily share the SAME port unless we attach upgrade handler manually.
    // Hocuspocus has an option `onRequest` or we can just use `handleUpgrade`.

    async onStoreDocument(data) {
        // This hook is called when the document changes and needs to be saved.
        // data.document is the Y.Doc
        // data.documentName is the room name/id
        // data.state is the binary Buffer of the document
        console.log(`Saving ${data.documentName}`);
        try {
            await prisma.room.upsert({
                where: { id: data.documentName },
                update: {
                    content: data.state,
                    updatedAt: new Date()
                },
                create: {
                    id: data.documentName,
                    content: data.state,
                    language: 'javascript' // Default, or handle metadata differently
                }
            });
        } catch (e) {
            console.error('Failed to save document:', e);
        }
    },

    async onLoadDocument(data) {
        // Called when a document is opened.
        // Return the Y.Doc or the binary state.
        const room = await prisma.room.findUnique({
            where: { id: data.documentName }
        });

        if (room && room.content) {
            // room.content is Bytes
            // Hocuspocus expects Y.Doc or binary.
            // If we return binary, Hocuspocus loads it.
            return room.content;
        }
        // If not found, return undefined -> new document.
        return undefined;
    }
});

// Express API (Optional - for room creation metadata if we want strict roles later)
app.get('/', (req, res) => {
    res.send('Collaboration Server Running');
});

app.post('/rooms', async (req, res) => {
    // Create a room explicitly?
    // Current Hocuspocus setup creates on demand (onLoadDocument).
    // But we might want to reserve a UUID.
    const id = crypto.randomUUID();
    // We don't necessarily need to create in DB yet, 
    // but if we want to enforce existence, we can.
    res.json({ id });
});

// Start the server
// Note: Hocuspocus .listen() starts its own http server.
// If we want express + hocuspocus on same port, we need to bind.
// Standard Node/Express/WS pattern:

const expressServer = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

expressServer.on('upgrade', (request, socket, head) => {
    server.handleUpgrade(request, socket, head);
});
