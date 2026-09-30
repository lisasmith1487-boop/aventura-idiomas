V36 - Micrófono Safari robusto para la lección RED.

Cambio principal: al tocar “Repetir RED”, primero se solicita/activa el permiso de micrófono mediante una interacción directa del usuario, se cierra inmediatamente el stream y después se crea un SpeechRecognition nuevo. Esto evita dejar getUserMedia y SpeechRecognition abiertos a la vez y evita reutilizar un recognizer después de TTS.
