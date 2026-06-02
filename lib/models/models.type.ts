import mongoose, { Schema, Document } from "mongoose";

export interface JobApplication {
  //what we can export and import
  _id: string;
  company: string;
  position: string;
  location?: string;
  status: string;
  columnId: string;
  userId: string;
  order: number;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  tags?: string[];
  description?: string;
}

export interface Column {
  //what we can export and import
  _id: string;
  name: string;
  order: number;
  jobApplications: JobApplication[]; //list of ids for another collection
}

export interface Board {
  _id: string;
  name: string;
  columns: Column[];
}
