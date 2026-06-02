"use server";

import { error } from "console";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../models";
import { revalidatePath } from "next/cache";

interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description?: string;
}

export async function createJobApplication(data: JobApplicationData) {
  const session = await getSession();
  if (!session.user) {
    return { error: "Unauthorized" };
  }
  await connectDB();

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { error: "Missing required fields" };
  }

  //Verify board ownership

  const board = await Board.findOne({
    _id: boardId,
    userId: session?.user.id,
  });
  if (!board) {
    return { error: "Board not found" };
  }

  //Verify column belongs to the board
  const column = await Column.findOne({
    _id: columnId,
    boardId: boardId,
  });
  if (!board) {
    return { error: "Column not found" };
  }
  // sort the app by the order of descending (finds the last one, cause it has the highest order value)

  const maxOrder = (await JobApplication.findOne({ columnId })
    .sort({ order: -1 })
    .select("order")
    .lean()) as { order: number } | null;

  const jobApplication = await JobApplication.create({
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    userId: session.user.id,
    tags: tags || [],
    description,
    status: "applied",
    order: maxOrder ? maxOrder.order + 1 : 0,
  });

  await Column.findByIdAndUpdate(columnId, {
    $push: { jobApplications: jobApplication._id },
  });

  revalidatePath("/dashboard"); //revalidates cache(forces to fetch new data and to display it)

  return { data: JSON.parse(JSON.stringify(jobApplication)) };
}
