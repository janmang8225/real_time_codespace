import React, { useEffect, useRef, useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const Editor = ({ roomId, username, color }) => {
    const [editorRef, setEditorRef] = useState(null);
    const providerRef = useRef(null);
    const docRef = useRef(null);
    const bindingRef = useRef(null);

    useEffect(() => {
        // Cleanup function
        return () => {
            if (providerRef.current) {
                providerRef.current.destroy();
            }
            if (docRef.current) {
                docRef.current.destroy();
            }
            if (bindingRef.current) {
                bindingRef.current.destroy();
            }
        };
    }, []);

    const handleEditorDidMount = (editor, monaco) => {
        setEditorRef(editor);
        const doc = new Y.Doc();
        docRef.current = doc;

        // Connect to websocket server
        const provider = new WebsocketProvider(
            'ws://localhost:4000', // Server URL
            roomId, // Room ID
            doc
        );
        providerRef.current = provider;

        const type = doc.getText('monaco'); // Sync text type

        // Bind Yjs to Monaco
        const binding = new MonacoBinding(
            type,
            editor.getModel(),
            new Set([editor]),
            provider.awareness
        );
        bindingRef.current = binding;

        // Set user awareness (color/name)
        provider.awareness.setLocalStateField('user', {
            name: username,
            color: color,
        });
    };

    useEffect(() => {
        // Update awareness if props change
        if (providerRef.current && username && color) {
            providerRef.current.awareness.setLocalStateField('user', {
                name: username,
                color: color
            });
        }
    }, [username, color]);

    return (
        <div className="h-full w-full">
            <MonacoEditor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    );
};

export default Editor;
