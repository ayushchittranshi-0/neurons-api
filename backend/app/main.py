from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
from .core.config import settings
from sqlalchemy import create_engine, MetaData, Table, select, inspect, or_, and_  
from sqlalchemy.exc import SQLAlchemyError, ProgrammingError
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
import pandas as pd
import os
from app.models.trains import Train, Base
from typing import List

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_project_root():
    return Path(__file__).parent.parent

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
metadata = MetaData()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/healthcheck")
def healthcheck():
    return {"status": "ok"}

@app.get("/api/db/health")
def health_check():
    try:
        with Session(engine) as session:
            session.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "database_connected": True,
            "database_url": DATABASE_URL.replace(
                DATABASE_URL.split(":")[-1].split("@")[0],
                "***"
            )
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )

@app.get("/api/trains-data")
def get_trains_data(db: Session = Depends(get_db)):
    try:
        trains = db.query(Train).all()
        
        return {
            "status": "success",
            "data": [
                {
                    "id": train.id,
                    "train_no": train.train_no,
                    "train_name": train.train_name,
                    "starts": train.starts,
                    "ends": train.ends
                }
                for train in trains
            ],
            "count": len(trains)
        }
        
    except SQLAlchemyError as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Database error occurred",
                "code": "DATABASE_ERROR"
            }
        )



Base.metadata.create_all(bind=engine)

@app.post("/api/seed-data/")
def seed_data(db: Session = Depends(get_db)):
    try:
        inspector = inspect(engine)
        if not inspector.has_table("trains_data"):
            Base.metadata.create_all(bind=engine)
            print("Created trains_data table")

        csv_path = os.path.join(get_project_root(), "All_Indian_Trains.csv")
        df = pd.read_csv(csv_path)

        train_data = df.to_dict('records')

        for train in train_data:
            db_train = Train(
                train_no=str(train['Train no.']),  
                train_name=train['Train name'],
                starts=train['Starts'],
                ends=train['Ends']
            )
            db.add(db_train)

        db.commit()
        
        return {
            "status": "success",
            "message": f"Successfully seeded {len(train_data)} trains",
            "count": len(train_data)
        }

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "CSV file is empty",
                "code": "EMPTY_CSV"
            }
        )
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "message": "CSV file not found",
                "code": "FILE_NOT_FOUND"
            }
        )

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Database error occurred",
                "code": "DATABASE_ERROR"
            }
        )
    
    except Exception as e:
        db.rollback()
        print(f"Unexpected Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"An unexpected error occurred: {str(e)}",
                "code": "INTERNAL_ERROR"
            }
        )


def parse_station_query(text: str):
    """
    Parse the input text to extract 'from' and 'to' stations
    Only considers the first occurrence of 'from' and 'to'
    """
    words = text.lower().split()
    from_station = None
    to_station = None
    
    try:
        from_idx = words.index('from')
        if from_idx + 1 < len(words) and len(words[from_idx + 1]) >= 4:
            from_station = words[from_idx + 1]
    except ValueError:
        pass
    
    try:
        to_idx = words.index('to')
        if to_idx + 1 < len(words) and len(words[to_idx + 1]) >= 4:
            to_station = words[to_idx + 1]
    except ValueError:
        pass
    
    return from_station, to_station

def find_matching_words(text: str) -> List[str]:
    """Find all words with 4 or more characters, excluding 'from' and 'to'"""
    words = text.lower().split()
    return [word for word in words if len(word) >= 4 and word not in ['from', 'to']]

class ChatRequest(BaseModel):
    input_text: str

@app.post("/api/chatResponse")
def chat_response(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Process the input text and return matching trains based on the specified rules
    """
    try:
        from_station, to_station = parse_station_query(request.input_text)
        
        if from_station and to_station:
            trains = db.query(Train).filter(
                        and_(
                            Train.starts.ilike(f"%{from_station}%"),
                            Train.ends.ilike(f"%{to_station}%")
                        )
            ).limit(10).all()
            
            if trains:
                return {
                    "message": f"Found trains from {from_station} to {to_station}",
                    "trains": [format_train_response(train) for train in trains]
                }
        
        elif from_station:
            trains = db.query(Train).filter(
                Train.starts.ilike(f"%{from_station}%")
            ).limit(10).all()
            
            if trains:
                return {
                    "message": f"Found trains from {from_station}",
                    "trains": [format_train_response(train) for train in trains]
                }
        
        elif to_station:
            trains = db.query(Train).filter(
                Train.ends.ilike(f"%{to_station}%")
            ).limit(10).all()
            
            if trains:
                return {
                    "message": f"Found trains to {to_station}",
                    "trains": [format_train_response(train) for train in trains]
                }
        
        matching_words = find_matching_words(request.input_text)

        wholeQueries = []
        wholeQueries.append(Train.train_name.ilike(f"%{request.input_text}%"))
        wholeQueries.append(Train.starts.ilike(f"%{request.input_text}%"))
        wholeQueries.append(Train.ends.ilike(f"%{request.input_text}%"))
        wholeQueries.append(Train.train_no.ilike(f"%{request.input_text}%"))

        trainswhole = db.query(Train).filter(
            or_(*wholeQueries)
        ).distinct().limit(10).all()

        if trainswhole:
            return {
                "message": f"Found trains matching: {request.input_text}",  # Also improved the message
                "trains": [format_train_response(train) for train in trainswhole]  # Fixed variable name
            }

        if matching_words:
            queries = []
            for word in matching_words:
                queries.append(Train.train_name.ilike(f"%{word}%"))
                queries.append(Train.starts.ilike(f"%{word}%"))
                queries.append(Train.ends.ilike(f"%{word}%"))
                queries.append(Train.train_no.ilike(f"%{word}%"))
            
            trains = db.query(Train).filter(
                or_(*queries)
            ).distinct().limit(10).all()
            
            if trains:
                return {
                    "message": f"Found trains matching: {', '.join(matching_words)}",
                    "trains": [format_train_response(train) for train in trains]
                }
        
        return {
            "message": "No matching trains found",
            "trains": []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def format_train_response(train: Train):
    """Format a train object for API response"""
    return {
        "id": train.id,
        "train_number": train.train_no,
        "train_name": train.train_name,
        "source_station": train.starts,
        "destination_station": train.ends
    }
