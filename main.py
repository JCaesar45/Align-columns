import asyncio
import json
import secrets
import hashlib
import time
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Luminary Terminal Backend", version="2.7.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections: dict[str, WebSocket] = {}
session_tokens: dict[str, dict] = {}


class ConnectionManager:
    @staticmethod
    async def connect(websocket: WebSocket) -> str:
        await websocket.accept()
        session_id = secrets.token_hex(16)
        active_connections[session_id] = websocket
        session_tokens[session_id] = {
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "message_count": 0,
            "ip": websocket.client.host if websocket.client else "unknown"
        }
        return session_id

    @staticmethod
    async def disconnect(session_id: str):
        active_connections.pop(session_id, None)
        session_tokens.pop(session_id, None)

    @staticmethod
    async def send_message(session_id: str, message: dict):
        websocket = active_connections.get(session_id)
        if websocket:
            await websocket.send_json(message)

    @staticmethod
    async def broadcast(message: dict):
        for connection in active_connections.values():
            await connection.send_json(message)


class CommandProcessor:
    COMMANDS = {
        "sysinfo": "system_information",
        "hash": "generate_hash",
        "uuid": "generate_uuid",
        "timestamp": "current_timestamp",
        "ping": "ping_response",
    }

    @staticmethod
    async def process(command: str, args: list[str], session_id: str) -> dict:
        session_tokens[session_id]["message_count"] += 1

        if command not in CommandProcessor.COMMANDS:
            return {"status": "error", "message": f"Unknown command: {command}"}

        handler_name = CommandProcessor.COMMANDS[command]
        handler = getattr(CommandProcessor, handler_name, None)

        if handler:
            return await handler(args)

        return {"status": "error", "message": "Command not implemented"}

    @staticmethod
    async def system_information(_) -> dict:
        return {
            "status": "ok",
            "data": {
                "server_time": datetime.now(timezone.utc).isoformat(),
                "python_version": "3.12",
                "active_sessions": len(active_connections)
            }
        }

    @staticmethod
    async def generate_hash(args: list[str]) -> dict:
        text = " ".join(args) if args else secrets.token_hex(32)
        hash_obj = hashlib.sha256(text.encode())
        return {
            "status": "ok",
            "data": {
                "input": text[:50] + ("..." if len(text) > 50 else ""),
                "algorithm": "SHA-256",
                "hash": hash_obj.hexdigest()
            }
        }

    @staticmethod
    async def generate_uuid(_) -> dict:
        return {
            "status": "ok",
            "data": {
                "uuid4": secrets.token_hex(16),
                "uuid_formatted": str(secrets.token_hex(4))
            }
        }

    @staticmethod
    async def current_timestamp(_) -> dict:
        now = time.time()
        return {
            "status": "ok",
            "data": {
                "unix": now,
                "iso8601": datetime.now(timezone.utc).isoformat(),
                "human": datetime.now(timezone.utc).strftime("%B %d, %Y %H:%M:%S UTC")
            }
        }

    @staticmethod
    async def ping_response(_) -> dict:
        return {"status": "ok", "message": "pong", "latency_ms": round(time.time() * 1000) % 50}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    session_id = await ConnectionManager.connect(websocket)

    await websocket.send_json({
        "type": "system",
        "message": "SECURE_CHANNEL_ESTABLISHED",
        "session_id": session_id[:8] + "...",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                payload = json.loads(raw_data)
                command = payload.get("command", "").lower()
                args = payload.get("args", [])
            except json.JSONDecodeError:
                await websocket.send_json({
                    "status": "error",
                    "message": "Invalid JSON payload"
                })
                continue

            result = await CommandProcessor.process(command, args, session_id)
            result["session_id"] = session_id[:8] + "..."
            await websocket.send_json(result)

    except WebSocketDisconnect:
        await ConnectionManager.disconnect(session_id)


@app.get("/health")
async def health_check():
    return {
        "status": "operational",
        "uptime": time.time(),
        "connections": len(active_connections)
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")
