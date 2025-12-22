interface Course {
  course_name: string;
  total_hours: number;
  price: number;
  description: string;
  thumbnail_url: string;
}

interface CourseCreate extends Omit<Course, "id"> {}
