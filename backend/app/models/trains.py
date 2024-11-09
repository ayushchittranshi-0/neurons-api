from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Train(Base):
    __tablename__ = "trains_data"

    id = Column(Integer, primary_key=True, index=True)
    train_no = Column(String, unique=True, index=True)
    train_name = Column(String)
    starts = Column(String)
    ends = Column(String)

    class Config:
        orm_mode = True
