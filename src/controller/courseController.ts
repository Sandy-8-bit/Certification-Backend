import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/* CREATE COURSE */
export const createCourse = async (
  req: Request<{}, {}, CourseCreate>,
  res: Response
) => {
  const { course_name, total_hours, price, description, thumbnail_url } =
    req.body;

  if (!course_name || !total_hours || !price || !description) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const course = await prisma.courses.create({
    data: {
      course_name,
      description,
      total_hours,
      price,
      thumbnail_url,
    },
  });

  res.status(201).json(course);
};

/* GET ALL COURSES */
export const getAllCourses = async (_req: Request, res: Response) => {
  const courses = await prisma.courses.findMany();

  res.json(courses);
};

/* GET COURSE BY ID */
export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const course = await prisma.courses.findUnique({
    where: { id },
  });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.json(course);
};

/* UPDATE COURSE */
export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;

  const course = await prisma.courses.update({
    where: { id },
    data: req.body,
  });

  res.json(course);
};

/* DELETE COURSE */
export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.courses.delete({
    where: { id },
  });

  res.json({ message: "Course deleted successfully" });
};
