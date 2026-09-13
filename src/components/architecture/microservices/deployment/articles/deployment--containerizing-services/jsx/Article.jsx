import "../css/Article.css";

export default function DeploymentContainerizingServicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A container packages a service with its exact runtime, dependencies, and configuration
          into one portable image &mdash; so "it works on my machine" stops being a meaningful
          excuse, because the same image is what actually runs everywhere.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          An image is built in layers &mdash; a base OS and runtime, then installed dependencies,
          then application code &mdash; and each layer is cached and reused across builds. A running
          instance of that image is a <b>container</b>: isolated from other containers on the same
          host, but sharing the host's kernel, which makes it far lighter than a full virtual
          machine.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A minimal Dockerfile for <code>OrderService</code>:
        </p>
        <span className="codeLabel">DOCKERFILE</span>
        <div className="codeBlock">
          <pre>{`FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "server.js"]`}</pre>
        </div>
        <p>
          Building this once produces an image that runs identically on a developer's laptop, in
          CI, and in production &mdash; the same image, not just the same code deployed three
          separate ways.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 300 150" role="img" aria-label="Diagram of a container image built as three stacked layers: a base runtime layer at the bottom, an installed dependencies layer in the middle, and an application code layer on top, with lower layers cached and reused across builds.">
          <rect className="box" x="60" y="95" width="180" height="35" rx="4" />
          <text x="150" y="117" className="boxText" style={{fontSize:"6.5px"}}>Base: node:20-alpine</text>
          <rect className="box" x="60" y="55" width="180" height="35" rx="4" />
          <text x="150" y="77" className="boxText" style={{fontSize:"6.5px"}}>Dependencies (npm ci)</text>
          <rect className="boxAccent" x="60" y="15" width="180" height="35" rx="4" />
          <text x="150" y="37" className="boxText" style={{fontSize:"6.5px"}}>Application code</text>
        </svg>
        <figcaption>Lower layers change rarely and are cached across builds &mdash; only the top application-code layer typically rebuilds on each change.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Leaving build tools and dev dependencies in the final image bloats it and needlessly
          expands the attack surface &mdash; a multi-stage build that copies only the compiled
          output into a slim final image avoids carrying that extra weight into production. Baking
          environment-specific settings, like a particular database hostname, directly into the
          image defeats the entire point of building one portable image: that same setting needs to
          live outside the image and be injected at runtime instead.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does baking a specific database hostname directly into a container image undermine the goal of building one portable image that runs unchanged across every environment?</p>
        </div>
      </section>
      <p className="takeaway">
        A container image bundles everything a service needs to run into one portable, layered
        artifact &mdash; the same image in dev, CI, and production is what actually eliminates
        "works on my machine."
      </p>
    </div>
  );
}
