from fastapi import FastAPI
from websocket_manager.websocket_manager import router as websocket_router
from utils.utils import router as utils_router

app = FastAPI()

app.include_router(utils_router)
app.include_router(websocket_router)
