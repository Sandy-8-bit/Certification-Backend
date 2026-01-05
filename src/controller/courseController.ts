import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/appError";
import { uploadFile } from "../services/blob.service";

/* CREATE COURSE */
export const createCourse = async (
  req: Request<{}, {}, CourseCreate>,
  res: Response
) => {
  const { course_name, total_hours, price, description } = req.body;
  const file = req.file;

  if (!course_name || !total_hours || !price || !description) {
    throw new AppError("All fields are required", 400);
  }

  let thumbnail_url = "";

  if (file) {
    const resultUrl = await uploadFile(file, {
      container: "images",
      folder: "thumbnails",
      isPublic: true,
    });

    thumbnail_url = resultUrl;
  }

  const course = await prisma.courses.create({
    data: {
      course_name,
      description,
      total_hours: Number(total_hours),
      price: Number(price),
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
    throw new AppError("Course not found", 404);
  }

  res.json(course);
};

/* UPDATE COURSE */
export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { course_name, total_hours, price, description } = req.body;
  const file = req.file;

  if (!course_name || !total_hours || !price || !description) {
    throw new AppError("All fields are required", 400);
  }

  let thumbnail_url = "";

  if (file) {
    const resultUrl = await uploadFile(file, {
      container: "images",
      folder: "thumbnails",
      isPublic: true,
    });

    thumbnail_url = resultUrl;
  }
  const course = await prisma.courses.update({
    where: { id },
    data: {
      course_name,
      description,
      total_hours: Number(total_hours),
      price: Number(price),
      thumbnail_url: thumbnail_url || "",
    },
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
