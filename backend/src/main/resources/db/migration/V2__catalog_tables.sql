CREATE TABLE learning_modules (
    slug VARCHAR(120) PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE learning_courses (
    id BIGSERIAL PRIMARY KEY,
    module_slug VARCHAR(120) NOT NULL REFERENCES learning_modules(slug) ON DELETE CASCADE,
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(module_slug, slug)
);
CREATE TABLE learning_sections (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    slug VARCHAR(180) NOT NULL,
    title VARCHAR(180) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE(course_id, slug)
);
CREATE TABLE learning_articles (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES learning_sections(id) ON DELETE CASCADE,
    slug VARCHAR(240) NOT NULL,
    title VARCHAR(240) NOT NULL,
    content TEXT,
    estimated_minutes INTEGER NOT NULL DEFAULT 10 CHECK (estimated_minutes > 0),
    position INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, slug)
);
CREATE INDEX courses_module_position_idx ON learning_courses(module_slug, position);
CREATE INDEX sections_course_position_idx ON learning_sections(course_id, position);
CREATE INDEX articles_section_position_idx ON learning_articles(section_id, position);
