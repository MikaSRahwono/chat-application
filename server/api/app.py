from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import jwt
import uvicorn

from websocket_manager.websocket_manager import router as websocket_router
from utils.utils import router as utils_router
from models.models import User

app = FastAPI()

app.include_router(utils_router)
app.include_router(websocket_router)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "fakehashedsecret",
        "disabled": False,
    },
    "mika": {
        "username": "mika",
        "full_name": "Mika Suryofakhri",
        "email": "mika@example.com",
        "hashed_password": "fakehashedsecret",
        "disabled": False,
    }
}

SECRET_KEY = "secret_key"

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user or user['hashed_password'] != password:
        return False
    return user

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = jwt.encode({"sub": user['username']}, SECRET_KEY)
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_data = fake_users_db.get(username)
        if user_data is None:
            raise HTTPException(status_code=401, detail="User not found")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_data

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
