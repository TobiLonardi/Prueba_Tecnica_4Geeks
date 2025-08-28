from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    salt: Mapped[str] = mapped_column(String(200), nullable=False, default=1)
    todos: Mapped[List["ToDos"]] = relationship(back_populates="user")



    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    

class ToDos(db.Model):
    __tablename__ = "todos"
    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[int] = mapped_column(String(150))
    completed: Mapped[bool] = mapped_column(nullable=False, default=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="todos")

    def serialize(self):
        return{
            "id": self.id,
            "label": self.label,
            "completed":self.completed
        }


    
