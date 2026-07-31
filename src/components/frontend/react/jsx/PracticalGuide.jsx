import "../css/PracticalGuide.css";
export default function ReactPracticalGuide() {
  return (
    <div className="reactPractical">
      <section id="overview">
        <p className="lead">
          Build a searchable course catalogue to practice state, composition, events, and derived
          data.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Break the screen into responsibilities</h2>
        <ol>
          <li>
            <b>CourseSearch</b> owns the query input.
          </li>
          <li>
            <b>CourseGrid</b> renders filtered results.
          </li>
          <li>
            <b>CourseCard</b> presents one course.
          </li>
        </ol>
      </section>
      <section id="example">
        <h2>2. Derive visible courses</h2>
        <pre>
          <code>{`const visibleCourses = courses.filter(course =>\n  course.title.toLowerCase().includes(query.toLowerCase())\n);`}</code>
        </pre>
        <div className="buildSteps">
          <span>1. Static UI</span>
          <span>2. Local state</span>
          <span>3. Filter data</span>
          <span>4. Test behavior</span>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Keep it honest</h2>
        <p>
          Do not store filtered results in state. They are derived from the source list and query
          and should be recalculated during render.
        </p>
      </section>
      <section id="check">
        <h2>4. Stretch goal</h2>
        <div className="quiz">
          <p>
            Add keyboard navigation and persist the last query without coupling storage to the input
            component.
          </p>
        </div>
      </section>
    </div>
  );
}
