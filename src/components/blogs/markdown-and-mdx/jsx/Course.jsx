import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsMarkdownAndMdxCourse({ navigate }) {
  const module = getModule("blogs");
  return (
    <div className="course-blogs-markdown-and-mdx">
      <CoursePage
        module={module}
        track={getTrack(module, "markdown-and-mdx")}
        navigate={navigate}
      />
    </div>
  );
}
