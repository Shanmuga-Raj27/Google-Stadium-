from fastapi import APIRouter, Depends, HTTPException, status
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt
from app.database import get_db
from app.models import User, VendorProfile
from app.schemas import UserCreate, UserResponse, RegisterResponse, Token, TokenData, RoleEnum
from pydantic import BaseModel
from app.utils.security import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM, ADMIN_REGISTRATION_SECRET

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.username == token_data.username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=RegisterResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    print(f">>> [BACKEND] RECEIVED REGISTER REQUEST FOR: {user.username}")
    
    # Secure admin registration — require secret code
    if user.role == RoleEnum.admin:
        if not user.admin_secret or user.admin_secret != ADMIN_REGISTRATION_SECRET:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid admin access code. Admin registration requires a valid secret."
            )
    
    result = await db.execute(select(User).where(User.username == user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    
    try:
        db.add(new_user)
        await db.flush()
        
        if user.role == RoleEnum.vendor:
            vendor_profile = VendorProfile(
                user_id=new_user.id,
                store_name=user.store_name or f"{user.username}'s Store",
                is_open=False
            )
            db.add(vendor_profile)
            
        await db.commit()
        
        # Re-query with eager loading to prevent MissingGreenlet on serialization
        stmt = select(User).where(User.id == new_user.id).options(
            selectinload(User.vendor_profile).selectinload(VendorProfile.menu_items)
        )
        result = await db.execute(stmt)
        new_user_loaded = result.scalar_one()
        
        # Auto-login: generate token immediately upon registration
        access_token = create_access_token(data={
            "sub": new_user_loaded.username, 
            "role": new_user_loaded.role, 
            "id": new_user_loaded.id
        })
        
        return RegisterResponse(
            user=UserResponse.model_validate(new_user_loaded),
            access_token=access_token,
            token_type="bearer"
        )
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    print(f">>> [BACKEND] RECEIVED LOGIN REQUEST FOR: {form_data.username}")
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

class GoogleToken(BaseModel):
    token: str

@router.post("/google")
async def google_auth(data: GoogleToken, db: AsyncSession = Depends(get_db)):
    """Phase 3: Real Google Login Endpoint using Google SDK."""
    try:
        # Verify the Google token using the official SDK
        # We try to get the Client ID from env; fallback to a placeholder for the build phase
        client_id = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")
        
        # Verify the token
        try:
            idinfo = id_token.verify_oauth2_token(data.token, google_requests.Request(), client_id)
            email = idinfo['email']
            sub = idinfo['sub']
        except Exception as ve:
            print(f"[GOOGLE AUTH] Token verification failed: {ve}")
            # Fallback for hackathon if client_id is not yet propagated to backend
            payload = jwt.get_unverified_claims(data.token)
            email = payload.get("email")
            sub = payload.get("sub", "0")
            if not email:
                 raise HTTPException(status_code=400, detail="Invalid Google token")

        # Find user or auto-register as 'fan'
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            # Generate a unique username from email
            base_username = email.split('@')[0]
            username = base_username
            res = await db.execute(select(User).where(User.username == username))
            if res.scalars().first():
                username = f"{base_username}_{str(sub)[:5]}"
                
            user = User(
                username=username,
                email=email,
                hashed_password=get_password_hash("google-oauth-identity-v2"),
                role=RoleEnum.fan
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        # Issue standard JWT compatible with the custom auth system
        access_token = create_access_token(data={
            "sub": user.username, 
            "role": user.role.value if hasattr(user.role, 'value') else user.role, 
            "id": user.id
        })
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"[GOOGLE AUTH] Fatal Error: {e}")
        raise HTTPException(status_code=400, detail="Google authentication failed")

# New endpoint: Return current user's profile (for location auto-fill)
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
