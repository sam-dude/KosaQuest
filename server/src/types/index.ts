import express from "express";

export interface Request extends express.Request {
  user?: {
    id?: string;
  };
}
