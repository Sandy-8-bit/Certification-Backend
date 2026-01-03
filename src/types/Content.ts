type BaseContentInput = {
  tier: number;
  week: number;
  day: number;
  position?: number;
  tier_name?: string;
  module_type: "video" | "test";
};

type VideoContentInput = BaseContentInput & {
  module_type: "video";
  video: {
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
  };
};

type TestContentInput = BaseContentInput & {
  module_type: "test";
  test: {
    title: string;
    test_duration: number;
    quizzes: {
      question: string;
      choices: any;
      answer: any;
      isMultiChoice?: boolean;
    }[];
  };
};

type CreateContentInput = VideoContentInput | TestContentInput;
