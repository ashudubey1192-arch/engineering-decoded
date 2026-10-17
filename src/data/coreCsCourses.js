import roadmaps from "./coreCsRoadmaps.json" with { type: "json" };
import { osRoadmapContent } from "./osRoadmapContent.js";
import { networkRoadmapContent } from "./networkRoadmapContent.js";

export const coreCsRoadmaps = roadmaps;
const content = {
  "core-cs/operating-systems": osRoadmapContent,
  "core-cs/computer-networks": networkRoadmapContent,
};
const references = {
  "core-cs/operating-systems": ["OSTEP: operating-system mechanisms and exercises", "https://pages.cs.wisc.edu/~remzi/OSTEP/"],
  "core-cs/computer-networks": ["IETF protocol specifications", "https://www.rfc-editor.org/"],
};
const specificReferences = {
  "fair-scheduling-cfs-to-eevdf": ["Linux EEVDF scheduler documentation", "https://docs.kernel.org/scheduler/sched-eevdf.html"],
  "io-uring": ["Linux io_uring manual", "https://man7.org/linux/man-pages/man7/io_uring.7.html"],
  "tcp-three-way-handshake": ["TCP specification: RFC 9293", "https://www.rfc-editor.org/rfc/rfc9293.html"],
  "tcp-connection-termination": ["TCP specification: RFC 9293", "https://www.rfc-editor.org/rfc/rfc9293.html"],
  "http-3-and-quic": ["QUIC specification: RFC 9000", "https://www.rfc-editor.org/rfc/rfc9000.html"],
  "http-caching": ["HTTP caching: RFC 9111", "https://www.rfc-editor.org/rfc/rfc9111.html"],
  "tls-handshake": ["TLS 1.3: RFC 8446", "https://www.rfc-editor.org/rfc/rfc8446.html"],
};

function welcome(key, chapter, roadmap) {
  const os = key.endsWith("operating-systems");
  if (chapter.id === "join-community") return {
    concept: "Use peer discussion to test reasoning rather than memorize an answer. Share a minimal reproducible example, state the platform and assumptions, and separate observed behavior from hypotheses. Ask a partner to change one constraint and explain whether your conclusion still holds. This local course does not operate or enroll you in the reference site's community.",
    scenario: os ? "Practice explaining why a process uses little CPU while requests wait on disk. Have a partner challenge your proposed fix with evidence from a different workload." : "Practice explaining why a timeout does not prove a payment failed. Have a partner introduce a lost response after the server commits the operation.",
    trace: "Prepare|State one reproducible scenario|List assumptions;Discuss|Partner changes a constraint|Defend or revise reasoning;Record|Write corrected explanation|Keep evidence and open questions",
    mistake: "Do not publish credentials, customer data, or private captures in a discussion. Use a small sanitized example and verify technical claims against documentation.",
    question: "What makes an interview practice discussion useful?",
    answer: "Both participants should explain mechanisms, challenge assumptions, trace a failure case, and identify what evidence would change the answer. A confident slogan without a worked case is insufficient.",
    links: [{ title: "Reference site's community entry (external)", href: chapter.source }],
  };
  const count = roadmap.sections.reduce((n, s) => n + s.chapters.length, 0);
  return {
    concept: `This learning path covers all ${count} chapter entries in the public roadmap checked on ${roadmap.checked}. Work through foundations before mechanisms, then use debugging and interview reviews to connect concepts. Each technical chapter supplies an original scenario, a visual state trace, a failure case, and an explained follow-up. Existing practical workshops remain available after the roadmap sections.`,
    scenario: os ? "Follow one request through process execution, scheduling, memory translation, file access, storage persistence, and observation. At each boundary, identify ownership and the guarantee provided." : "Follow one request from local-link delivery through routing, transport, DNS, TLS, HTTP, application retries, and observation. At each boundary, identify what can fail independently.",
    trace: "Learn|Read one mechanism and scenario|State the assumptions;Predict|Trace before revealing next state|Explain each transition;Apply|Answer follow-up and section review|Test a changed constraint",
    mistake: "Chapter coverage is a checklist of subjects, not a claim that a short lesson replaces platform documentation or hands-on practice. The reference's paid chapter text is not reproduced.",
    question: "How should you use this roadmap for interview preparation?",
    answer: "For each chapter, explain the mechanism without notes, work the example, name a failure mode, and answer the follow-up. Use each section review to find gaps, then practice implementing or measuring the mechanism in a suitable environment.",
    links: roadmap.sections.slice(1).map(s => ({ title: `${s.title} · ${s.chapters.length} chapters`, href: `/learn/${key}/roadmap--${s.chapters[0].id}` })),
  };
}

function review(key, section) {
  const topics = section.chapters.filter(c => content[key][c.id]);
  const first = content[key][topics[0].id];
  return {
    ...first,
    concept: `This review connects ${section.title.toLowerCase()} through ${topics.length} topic-specific interview questions. Begin with the worked scenario below, then answer every question before opening its explanation. State the mechanism, assumptions, observable result, and a failure case. Compare related topics rather than relying on a definition alone.`,
    scenario: `Section interview exercise: ${first.scenario}`,
    question: `How would you justify and test your answer to this ${section.title.toLowerCase()} scenario?`,
    answer: `${first.answer} Then explain how one of the other mechanisms in this section changes the outcome. Use the question bank below to check each topic individually.`,
    questions: topics.map(c => ({ topic: c.title, question: content[key][c.id].question, answer: content[key][c.id].answer, href: `/learn/${key}/roadmap--${c.id}` })),
  };
}

function makeArticle(key, section, chapter, data) {
  if (!data) throw new Error(`Missing original roadmap content: ${key}/${chapter.id}`);
  const states = data.trace.split(";").map((row, i) => {
    const values = row.split("|");
    if (values.length !== 3 || values.some(v => !v.trim())) throw new Error(`Invalid trace: ${key}/${chapter.id}`);
    return [`Step ${i + 1}: ${values[0]}`, ...values];
  });
  return {
    slug: `roadmap--${chapter.id}`, sectionSlug: section.slug, title: chapter.title,
    time: data.questions ? "15 min" : "8 min", updated: "Oct 2026",
    roadmap: { id: chapter.id, source: chapter.source, section: section.title },
    lab: {
      ...data, states, visual: true, codeLabel: "Worked reasoning trace",
      code: ["Illustrative trace — not executable code", `Scenario: ${data.scenario}`, "", ...states.map(([label, actor, state, evidence]) => `${label}\n  Actor / stage: ${actor}\n  State / action: ${state}\n  Observation: ${evidence}`)].join("\n"),
      challenge: `Recreate the example for “${chapter.title}” on paper or in a disposable test environment. Record the state after each transition, then change one assumption and predict the result before observing it. Explain this follow-up in your own words: ${data.question}`,
      reference: specificReferences[chapter.id] || references[key],
    },
  };
}

export const coreCsRoadmapSections = Object.fromEntries(Object.entries(roadmaps).map(([key, roadmap]) => [key,
  roadmap.sections.map(section => ({
    slug: section.slug, title: section.title,
    lessons: section.chapters.map(chapter => makeArticle(key, section, chapter,
      section.slug === "roadmap-0" ? welcome(key, chapter, roadmap)
        : chapter.id.endsWith("interview-questions") ? review(key, section)
          : content[key][chapter.id])),
  })),
]));

export const coreCsRoadmapLessons = Object.fromEntries(Object.entries(coreCsRoadmapSections).map(([key, sections]) => [key, sections.flatMap(s => s.lessons)]));
