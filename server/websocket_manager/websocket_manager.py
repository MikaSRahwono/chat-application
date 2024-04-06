from fastapi import WebSocket, APIRouter, WebSocketDisconnect
from utils.utils import broadcast_to_room, remove_room
import json

router = APIRouter()

room_list = []

@router.websocket('/ws/{client_id}')
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    try:
        await websocket.accept()
        client = {
            "client_id": client_id,
            "socket": websocket
        }
        room_list.append(client)
        print("Connection established")
        while True:
            data = await websocket.receive_text()
            await broadcast_to_room(data, websocket, room_list)
    except WebSocketDisconnect as e:
        remove_room(websocket, room_list)
