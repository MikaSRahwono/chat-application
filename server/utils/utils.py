from fastapi import APIRouter
import json
import copy

router = APIRouter()

@router.get('/api')
async def test_index():
    return {"detail": "Server is Working"}

async def broadcast_to_room(message: str, except_user, room_list):
    res = list(filter(lambda i: i['socket'] == except_user, room_list))
    for room in room_list:
        if except_user != room['socket']:
            await room['socket'].send_text(json.dumps({'msg': message, 'userId': res[0]['client_id']}))

def remove_room(except_room, room_list):
    new_room_list = copy(room_list)
    room_list.clear()
    for room in new_room_list:
        if except_room != room['socket']:
            room_list.append(room)
    print("room_list append - ", room_list)
