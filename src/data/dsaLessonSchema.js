export const dsaReference = "https://www.tutorialspoint.com/data_structures_algorithms/index.htm";
export const slugifyDsa = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function lesson(
  title,
  intro,
  reasoning,
  invariant,
  algorithm,
  input,
  time,
  space,
  mistake,
  exercise,
  answer,
) {
  return {
    title,
    intro,
    reasoning,
    invariant,
    algorithm,
    input,
    complexityTime: time,
    space,
    mistake,
    exercise,
    answer,
  };
}
export function course(name, group, prerequisites, sections) {
  return {
    name,
    group,
    prerequisites,
    sections: sections.map(([title, lessons]) => ({
      title,
      slug: slugifyDsa(title),
      lessons: lessons.map((item) => ({
        ...item,
        sectionSlug: slugifyDsa(title),
        slug: `${slugifyDsa(title)}--${slugifyDsa(item.title)}`,
        time: "15 min",
      })),
    })),
  };
}
