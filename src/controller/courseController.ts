import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/* CREATE COURSE */
export const createCourse = async (
  req: Request<{}, {}, Course>,
  res: Response
) => {
  const { course_name, total_hours, price, course_description, thumbnail_url } =
    req.body;

  if (!course_name || !total_hours || !price || !course_description) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const course = await prisma.course.create({
    data: {
      course_name,
      total_hours,
      price,
      course_description,
      thumbnail_url,
    },
  });

  res.status(201).json(course);
};

/* GET ALL COURSES */
export const getAllCourses = async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(courses);
};

/* GET COURSE BY ID */
export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
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

  const course = await prisma.course.update({
    where: { id },
    data: req.body,
  });

  res.json(course);
};

/* DELETE COURSE */
export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.course.delete({
    where: { id },
  });

  res.json({ message: "Course deleted successfully" });
};
