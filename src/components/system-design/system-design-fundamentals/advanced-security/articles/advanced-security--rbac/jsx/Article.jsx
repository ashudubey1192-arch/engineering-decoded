import "../css/Article.css";

export default function AdvancedSecurityRbacArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Role-Based Access Control (RBAC) grants permissions to <i>roles</i> rather than to
          individual users directly, then assigns users to roles — making access control
          manageable at scale instead of tracking permissions per person.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Without RBAC, granting or revoking access means editing permissions for one specific
          user at a time — tedious and error-prone across hundreds of employees and dozens of
          systems. With RBAC, permissions are defined once per role (like "editor" or "admin"),
          and a user's access comes entirely from whichever roles they're assigned. Changing what
          an "editor" can do updates every editor at once; onboarding a new employee is just
          assigning them the right role, not manually recreating a custom permission set.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Define roles.</b> "Viewer" can read documents; "Editor" can read and write;
            "Admin" can read, write, and manage users.</li>
          <li><b>Assign users to roles.</b> Alice is an Editor; Bob is a Viewer; Carol is an
            Admin.</li>
          <li><b>Alice gets promoted</b> to a role needing admin access — she's reassigned from
            Editor to Admin. Her new permissions take effect immediately, with no per-permission
            editing required.</li>
          <li><b>Policy changes org-wide.</b> "Editors should no longer be able to delete
            documents" — one change to the Editor role's permissions updates every Editor
            simultaneously.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of users assigned to roles, with each role holding a defined set of permissions, so changing a role's permissions updates every user assigned to it at once." >
          {["Alice", "Bob", "Carol"].map((u, i) => (<rect key={u} className="box" x="20" y={20 + i * 34} width="80" height="26" rx="4" />))}
          {["Alice", "Bob", "Carol"].map((u, i) => (<text key={u} x="60" y={38 + i * 34} className="boxText" textAnchor="middle">{u}</text>))}
          <line className="flow" x1="100" y1="33" x2="170" y2="60" /><line className="flow" x1="100" y1="67" x2="170" y2="90" /><line className="flow" x1="100" y1="101" x2="170" y2="35" />
          {["Editor", "Viewer", "Admin"].map((r, i) => (<rect key={r} className="boxAccent" x="180" y={20 + i * 34} width="90" height="26" rx="4" />))}
          {["Editor", "Viewer", "Admin"].map((r, i) => (<text key={r} x="225" y={38 + i * 34} className="boxText" textAnchor="middle">{r}</text>))}
          <text x="340" y="65" className="figHint">roles hold the actual permissions</text>
        </svg>
        <figcaption>Permissions attach to roles, not individuals — changing a role updates everyone assigned to it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          "Role explosion" — creating an ever-growing number of hyper-specific roles for every
          slight permission variation — eventually recreates the same unmanageable complexity RBAC
          was meant to solve. Granting roles more broadly than needed "to avoid friction" also
          violates the principle of least privilege, expanding what a compromised account could
          do.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does updating one role's permissions in RBAC avoid the need to individually update every user who holds that role?</p>
        </div>
      </section>
      <p className="takeaway">
        RBAC makes access control manageable at organizational scale by attaching permissions to
        roles rather than individuals — the trick is keeping the role set itself small and
        meaningful.
      </p>
    </div>
  );
}
