import connectDB from "./db";
import { Board, Column } from "./models";
import jobApplication from "./models/job-application";

const DEFAULT_COLUMNS = [
  {
    name: "Wish List",
    order: 0,
  },
  {
    name: "Applied",
    order: 1,
  },
  {
    name: "Interviewing",
    order: 2,
  },
  {
    name: "Offer",
    order: 3,
  },
  {
    name: "Rejected",
    order: 4,
  },
];

export async function initializeUserBoard(userId: string) {
  try {
    await connectDB();

    //Check if board already exists
    const existingBoard = await Board.findOne({ userId, name: "Job Hunt" });

    if (existingBoard) {
      return existingBoard;
    }

    //Create the board
    const board = await Board.create({
      name: "Job Hunt",
      userId,
      columns: [],
    });

    // Create default columns
    const columns = await Promise.all(
      DEFAULT_COLUMNS.map((col) =>
        Column.create({
          name: col.name,
          order: col.order,
          boardId: board._id, //in Mongo DB _id syntax is always used
          jobApplication: [],
        }),
      ),
    ); // create all the columns at once, run multiple independent operations at once and wait for all of them to finish.

    board.columns = columns.map((col) => col._id);
    await board.save();
  } catch (err) {
    throw err;
  }
}
