import { lesson as L, mdn } from "./webLessonSchema.js";
const css = (path) => mdn(`Web/CSS/${path}`);
export const cssLessons = {
  "foundations--selectors": L(
    "Selectors identify which elements a declaration block can style.",
    [
      "Type selectors match element names, classes match reusable roles, and attribute selectors match attributes or their values. Combinators express relationships such as descendants and direct children.",
      "Pseudo-classes describe states or structural conditions; pseudo-elements target generated or partial content. Keep selectors focused on component responsibilities instead of deeply coupling them to incidental nesting.",
    ],
    `/* Markup: <article class="card"><h2>Grid</h2><a href="/grid">Read</a></article> */\n.card { padding: 1rem; }\n.card > h2 { margin-block-start: 0; }\n.card a:hover { text-decoration-thickness: 3px; }\n.card a:focus-visible { outline: 2px solid currentColor; }`,
    [
      [
        "Match",
        "The card class selects the article regardless of where it sits on the page.",
        ["article.card", ".card matches", "Padding applies"],
      ],
      [
        "Relate",
        "The child combinator matches h2 only when it is a direct child of the card.",
        [".card", "Direct child h2", "Top margin removed"],
      ],
      [
        "Respond",
        "Hover and keyboard focus select different interaction states on the link.",
        ["Link state", ":hover / :focus-visible", "State styling"],
      ],
    ],
    "Do not style every div or button globally when only one feature needs the rule. Deep descendant selectors are fragile when markup changes.",
    "Wrap h2 in a header. Does .card > h2 still match, and how would you adjust the rule?",
    "It no longer matches because h2 is not a direct child. Give the heading a dedicated class or intentionally select .card > header > h2.",
    css("CSS_selectors"),
  ),
  "foundations--cascade-and-specificity": L(
    "The cascade chooses a winning declaration; specificity is only one part of that decision.",
    [
      "First consider whether a rule applies and its origin, importance, and cascade layer. Within the relevant precedence group, compare specificity, then scoping proximity where applicable, then source order.",
      "Specificity compares IDs, classes/attributes/pseudo-classes, and type selectors. A larger number of type selectors does not outweigh a higher class column. Avoid solving every conflict with !important.",
    ],
    `/* Markup: <p class="note">Read the cascade.</p> */\np { color: navy; }\n.note { color: teal; }\np.note { color: maroon; }\n.note { color: purple; }`,
    [
      [
        "Gather",
        "All four normal unlayered author rules match the same paragraph.",
        ["p: navy", ".note: teal / purple", "p.note: maroon"],
      ],
      [
        "Compare",
        "p.note has one class and one type, beating a class alone within this equal precedence group.",
        ["p → 0,0,1", ".note → 0,1,0", "p.note → 0,1,1"],
      ],
      [
        "Choose",
        "Maroon wins even though the purple declaration appears later, because specificity differs.",
        ["Winner: p.note", "Computed color: maroon", "Source order not reached"],
      ],
    ],
    "The statement last rule wins is only true after higher-priority comparisons tie. Layers and important declarations can outrank more specific selectors.",
    "Add another p.note rule at the end with color: green. Which declaration wins?",
    "Green wins because the matching declarations now tie on origin, importance, layer, and specificity; the later declaration breaks the tie.",
    css("Guides/Cascade/Introduction"),
  ),
  "foundations--inheritance": L(
    "Inheritance supplies some unspecified property values from an element’s parent.",
    [
      "Text properties such as color and font-family commonly inherit; layout properties such as margin and border generally do not. Inheritance is distinct from the cascade choosing a directly specified value.",
      "inherit explicitly takes the parent value, initial uses the property initial value, and unset behaves as inherit for inherited properties and initial for others. Use these deliberately rather than resetting everything blindly.",
    ],
    `.article { color: #23344d; font-family: system-ui, sans-serif; border: 1px solid; }\n.article p { margin-block: 1rem; }\n.article button { font: inherit; color: inherit; }`,
    [
      [
        "Set parent",
        "The article establishes text defaults and its own border.",
        ["Article color", "Article font", "Article border"],
      ],
      [
        "Inherit text",
        "A paragraph without its own color or font uses the inherited text values, but does not gain the article border.",
        ["p color inherited", "p font inherited", "p border not inherited"],
      ],
      [
        "Normalize control",
        "Explicit inherit makes the button follow the surrounding typography and text color.",
        ["Native button defaults", "font: inherit", "Consistent text"],
      ],
    ],
    "A parent color does not beat a child’s directly specified color. Do not expect width, margin, or borders to cascade down as inherited values.",
    "If the paragraph receives color: red, does changing the article color affect that paragraph?",
    "No. Its own specified color wins over inheritance. Remove the local declaration or set color: inherit to follow the parent again.",
    css("CSS_cascade/Inheritance"),
  ),
  "foundations--units-and-values": L(
    "Choose units according to what a size should respond to: text, container, viewport, or a fixed measurement.",
    [
      "rem relates to the root font size; em commonly relates to the element font size, with font-size itself using the parent size. Percentages depend on the property and its reference dimension.",
      "Viewport units relate to viewport dimensions. min, max, and clamp combine constraints so sizes can be fluid without becoming unusably small or large. Pixels are CSS pixels, not necessarily hardware pixels.",
    ],
    `.page { width: min(100% - 2rem, 70rem); margin-inline: auto; }\nh1 { font-size: clamp(2rem, 1rem + 3vw, 4rem); }\n.button { padding: .6em 1em; }`,
    [
      [
        "Reference",
        "At a 16-pixel root size, 2rem is 32 CSS pixels and 70rem is 1120 CSS pixels.",
        ["Root: 16px", "2rem: 32px", "70rem: 1120px"],
      ],
      [
        "Constrain",
        "The page width uses available width minus gutters until the maximum readable width is reached.",
        ["Available width", "Minus 2rem", "Cap at 70rem"],
      ],
      [
        "Scale",
        "The heading grows with viewport width but remains between its minimum and maximum.",
        ["Minimum: 2rem", "Fluid: 1rem + 3vw", "Maximum: 4rem"],
      ],
    ],
    "Do not assume every percentage uses viewport width. Avoid viewport-only text sizing that ignores user font preferences.",
    "What happens to .button padding when its font size doubles?",
    "The em-based padding doubles too because it follows the button font size. The rem-based page gutter still follows the root font size.",
    css("CSS_Values_and_Units"),
  ),
  "foundations--custom-properties": L(
    "Custom properties store reusable values that participate in the cascade and usually inherit.",
    [
      "Declare a --name property and read it through var(). Theme values can be set on a root or component boundary and overridden farther down the tree.",
      "A var fallback handles missing or invalid custom-property references, not every invalid final property value. Unregistered custom properties are token streams; the consuming property decides whether the substituted value is valid.",
    ],
    `:root { --accent: #2456c4; --space: 1rem; }\n.card { border: 2px solid var(--accent); padding: var(--space); }\n.card--compact { --space: .5rem; }\n.card a { color: var(--accent, navy); }`,
    [
      [
        "Define",
        "The root establishes reusable accent and spacing values for descendants.",
        ["--accent: blue", "--space: 1rem", "Inherited defaults"],
      ],
      [
        "Consume",
        "The card border and padding substitute the current custom-property values.",
        ["var(--accent)", "var(--space)", "Styled card"],
      ],
      [
        "Override",
        "A compact card replaces only the spacing token, leaving the accent unchanged.",
        ["--space: .5rem", "Local override", "Smaller padding"],
      ],
    ],
    "Setting --space: red does not make var(--space, 1rem) choose 1rem; red exists but is invalid for padding after substitution.",
    "How would you change one card’s accent without changing every card?",
    "Override --accent on that card or an intentional wrapper. Descendants using the token follow the local value through inheritance.",
    css("Using_CSS_custom_properties"),
  ),
  "box-model--content-padding-border-margin": L(
    "Every normal CSS box separates its content, inner spacing, border, and outside spacing.",
    [
      "With content-box, declared width measures content only. Padding and borders add to the rendered border-box width; margins add outside spacing and are never part of width.",
      "With border-box, declared width includes padding and border, leaving less room for content. Vertical margins can collapse in certain block-flow relationships, unlike padding.",
    ],
    `.card {\n  box-sizing: content-box;\n  width: 200px;\n  padding: 20px;\n  border: 4px solid #2563eb;\n  margin: 16px;\n}\n/* Border-box width: 200 + 40 + 8 = 248px */\n/* Horizontal footprint including margins: 280px */`,
    [
      [
        "Content",
        "The declared width reserves 200 pixels for the content area.",
        ["Content width", "200px", "No padding yet"],
      ],
      [
        "Expand",
        "Twenty pixels of padding and four pixels of border on each side add 48 pixels.",
        ["200px content", "+ 40px padding", "+ 8px border = 248px"],
      ],
      [
        "Separate",
        "Sixteen-pixel margins on both sides produce a 280-pixel horizontal footprint.",
        ["248px border box", "+ 32px margin", "280px footprint"],
      ],
    ],
    "Do not include margin in border-box width calculations. Setting width:100% with content-box plus padding can overflow a parent.",
    "Switch to border-box while keeping width:200px. How wide is the content?",
    "The content becomes 152 pixels: 200 minus 40 padding minus 8 border. The border box stays 200 pixels and horizontal margins add another 32.",
    css("CSS_box_model/Introduction_to_the_CSS_box_model"),
  ),
  "box-model--sizing-strategies": L(
    "Resilient sizing combines intrinsic content needs with explicit minimum and maximum constraints.",
    [
      "Prefer fluid widths with max-width for content containers. min-width and min-height define floors; max-width and max-height define ceilings. Fixed heights can clip translated or zoomed text.",
      "Flex and grid items have automatic minimum sizes that can preserve long content. min-width:0 or min-inline-size:0 can allow shrinking when overflow handling is intentional.",
    ],
    `* { box-sizing: border-box; }\n.page { width: min(100% - 2rem, 65rem); margin-inline: auto; }\n.card { min-inline-size: 0; padding: 1rem; }\n.card__title { overflow-wrap: anywhere; }\nimg { max-inline-size: 100%; block-size: auto; }`,
    [
      [
        "Fit container",
        "The page follows available width while retaining side gutters.",
        ["Viewport width", "Subtract gutters", "Fluid page"],
      ],
      [
        "Cap reading width",
        "At larger viewports the page stops growing at 65rem and centers itself.",
        ["Wide viewport", "65rem maximum", "Automatic side margins"],
      ],
      [
        "Handle content",
        "Long titles can wrap and images shrink without forcing the card beyond its allocated width.",
        ["Long title / image", "Shrink + wrap rules", "Contained content"],
      ],
    ],
    "Avoid fixed heights on text-heavy cards unless overflow is intentionally managed. A max-width on the parent alone may not solve an unbreakable child.",
    "A grid card overflows because of a long URL. Which two rules could help?",
    "Allow the item to shrink with min-inline-size:0 and permit wrapping with overflow-wrap:anywhere. Verify that the full content remains available.",
    css("width"),
  ),
  "box-model--overflow": L(
    "Overflow determines what happens when content exceeds the space assigned to its box.",
    [
      "visible permits painting outside the box, hidden clips with scrolling still possible programmatically, clip clips without establishing a scroll container, and auto supplies scrolling when needed.",
      "Use overflow deliberately for code blocks or data tables, and preserve keyboard access. Hiding overflow can conceal focused controls, shadows, or meaningful content.",
    ],
    `.code-sample {\n  max-width: 100%;\n  overflow-x: auto;\n  white-space: pre;\n}\n/* Markup: <pre class="code-sample" tabindex="0"><code>long line...</code></pre> */`,
    [
      [
        "Constrain",
        "The code sample cannot grow wider than its containing block.",
        ["Parent width", "max-width: 100%", "Limited viewport"],
      ],
      [
        "Overflow",
        "A long unwrapped line extends beyond the available inline space.",
        ["Long code line", "Content width > box", "Horizontal overflow"],
      ],
      [
        "Scroll",
        "overflow-x:auto exposes the remaining text through scrolling when needed.",
        ["Scroll container", "Keyboard-focusable pre", "Full line reachable"],
      ],
    ],
    "overflow:hidden may make a screenshot look tidy while making real content unreachable. Check focus rings and zoom before clipping.",
    "Would overflow:clip be appropriate for a code example readers must inspect fully?",
    "Usually not. It removes the scrolling path to clipped content. Use an accessible scrolling area or intentional line wrapping.",
    css("overflow"),
  ),
  "box-model--display-modes": L(
    "display determines an element’s outer participation in layout and the layout used for its children.",
    [
      "Block boxes normally start on a new line, inline boxes flow with text, and inline-block boxes remain inline while accepting box dimensions. Flex and grid establish specialized child layout.",
      "display:none removes an element from layout and generally from the accessibility tree. visibility:hidden retains layout space but hides the element. Choose based on the desired interaction and content behavior.",
    ],
    `.badge { display: inline-block; padding: .2rem .5rem; }\n.toolbar { display: flex; gap: .5rem; }\n.course-list { display: grid; gap: 1rem; }\n.is-hidden { display: none; }`,
    [
      [
        "Outer flow",
        "A badge can sit within a text line while keeping its padding and box dimensions.",
        ["Text", "inline-block badge", "More text"],
      ],
      [
        "Child layout",
        "The toolbar lays out direct children using Flexbox instead of ordinary block flow.",
        ["toolbar: flex", "Child A", "Child B"],
      ],
      [
        "Remove",
        "An element with display:none no longer reserves a slot in layout.",
        ["Visible sibling A", "Hidden item removed", "Sibling B moves up"],
      ],
    ],
    "Do not hide essential instructions with display:none while expecting screen readers to read them. Visual hiding and semantic hiding are different requirements.",
    "Which property preserves a hidden item’s space: display:none or visibility:hidden?",
    "visibility:hidden retains the box’s space. display:none removes the box from layout.",
    css("display"),
  ),
  "box-model--stacking-contexts": L(
    "A stacking context groups descendants so their stacking order is compared as a unit against other contexts.",
    [
      "Positioned elements with a non-auto z-index, transforms, opacity below one, and other features can create stacking contexts. A child cannot escape its ancestor’s stacking context by choosing a huge z-index.",
      "Compare sibling contexts first, then descendants within the winning context. Native top-layer elements such as modal dialogs follow special painting behavior beyond ordinary z-index stacking.",
    ],
    `.panel { position: relative; z-index: 1; }\n.panel__tooltip { position: absolute; z-index: 9999; }\n.sidebar { position: relative; z-index: 2; }`,
    [
      [
        "Group",
        "The panel creates a context containing its tooltip.",
        ["Panel context: 1", "Tooltip: 9999", "Child stays inside"],
      ],
      [
        "Compare siblings",
        "The sidebar context has a higher stack level than the entire panel context.",
        ["Panel: 1", "Sidebar: 2", "Sidebar above panel"],
      ],
      [
        "Resolve child",
        "The tooltip’s large value only orders it within the panel context, so it can still be behind the sidebar.",
        ["Tooltip local priority", "Parent context lower", "Sidebar still above"],
      ],
    ],
    "Do not keep escalating z-index without inspecting ancestors. A transform added for animation can unexpectedly create a context.",
    "How could you make the tooltip appear above the sidebar?",
    "Reconsider the parent context ordering or render the overlay outside that lower context. Use an appropriate top-layer primitive when the interaction calls for one.",
    css("CSS_positioned_layout/Stacking_context"),
  ),
  "layout--normal-flow": L(
    "Normal flow is the browser’s default arrangement of block and inline content before specialized positioning.",
    [
      "Block elements stack in the block direction, and inline content wraps into line boxes. Writing mode determines the physical directions, so logical properties often express intent better than left and right.",
      "Document order forms the baseline reading and keyboard order. Good layouts usually begin with useful normal flow and add Flexbox or Grid only where relationships need it.",
    ],
    `article { max-inline-size: 65ch; margin-inline: auto; }\np { margin-block: 1rem; }\n/* HTML: <article><h1>Flow</h1><p>Words wrap naturally.</p><p>Next paragraph.</p></article> */`,
    [
      [
        "Stack",
        "The heading and paragraphs form successive block boxes.",
        ["h1 block", "p block", "p block"],
      ],
      [
        "Wrap",
        "Text within each paragraph forms lines that wrap to the available inline size.",
        ["Words", "Line box fills", "Next line"],
      ],
      [
        "Resize",
        "Narrowing the container increases line count and pushes later blocks down naturally.",
        ["Narrower width", "More text lines", "Greater article height"],
      ],
    ],
    "Absolute positioning every text block removes useful flow behavior and makes variable content difficult to support.",
    "What happens when the first paragraph doubles in length?",
    "Its block grows and later content moves down without manual coordinates. This is a core advantage of leaving ordinary content in flow.",
    css("CSS_display/Block_and_inline_layout_in_normal_flow"),
  ),
  "layout--flexbox": L(
    "Flexbox distributes and aligns items along a main axis, with a separate cross axis.",
    [
      "flex-direction chooses the main axis. justify-content distributes along it; align-items aligns on the cross axis. gap separates items without adding outside margins.",
      "flex-grow distributes free space, flex-shrink handles shortage, and flex-basis supplies a starting size. Wrapping creates separate flex lines rather than a shared two-dimensional grid.",
    ],
    `.toolbar { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }\n.toolbar__search { flex: 1 1 15rem; min-inline-size: 0; }\n.toolbar__button { flex: 0 0 auto; }`,
    [
      [
        "Establish axes",
        "The default row direction places items along the inline axis and aligns their cross-axis centers.",
        ["Main axis: row", "Search + button", "Cross alignment: center"],
      ],
      [
        "Distribute",
        "The search field can grow into spare space while the button keeps its natural size.",
        ["Available free space", "Search grows", "Button stays intrinsic"],
      ],
      [
        "Wrap",
        "At a narrow width, wrapping lets the controls move onto another line instead of crushing them indefinitely.",
        ["Width decreases", "Line break allowed", "Controls remain usable"],
      ],
    ],
    "justify-content is not always horizontal: axes change with flex-direction and writing mode. Avoid visual reordering that conflicts with keyboard order.",
    "Change flex-direction to column. Which axis does justify-content control now?",
    "It controls the vertical main axis in a horizontal writing mode. align-items now controls horizontal cross-axis alignment.",
    css("CSS_flexible_box_layout/Basic_concepts_of_flexbox"),
  ),
  "layout--css-grid": L(
    "Grid defines rows and columns together, making it useful for aligned two-dimensional layouts.",
    [
      "Tracks can use fixed lengths, flexible fr units, or minmax constraints. gap separates tracks. Grid lines define placement boundaries; grid items are direct children.",
      "repeat with auto-fit can create as many columns as fit and collapse empty tracks. Use minimums that respect small containers rather than forcing a fixed-width column wider than the viewport.",
    ],
    `.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));\n  gap: 1rem;\n}\n.card { min-inline-size: 0; }`,
    [
      [
        "Create tracks",
        "Grid evaluates how many roughly 15rem minimum columns fit in the available width.",
        ["Container width", "Minimum track size", "Column count"],
      ],
      [
        "Distribute",
        "Each 1fr maximum shares remaining space among occupied tracks.",
        ["Remaining space", "Equal flexible tracks", "Aligned columns"],
      ],
      [
        "Adapt",
        "When fewer columns fit, items move into additional rows while respecting the container width.",
        ["Narrow container", "Fewer columns", "More rows"],
      ],
    ],
    "Grid placement can visually reorder content without changing DOM reading order. Keep the source order meaningful and avoid huge fixed minimums.",
    "How would you make the first card span two columns only on wide screens?",
    "Inside an appropriate media or container query, apply grid-column:span 2 to that card. Keep its normal single-track placement below that threshold.",
    css("CSS_grid_layout/Basic_concepts_of_grid_layout"),
  ),
  "layout--positioning": L(
    "Positioning changes how a box is offset and which containing block its offsets reference.",
    [
      "relative keeps the original layout space while allowing offsets and often establishes a containing block for absolute children. absolute removes the box from normal flow.",
      "fixed usually references the viewport, though certain ancestors can establish its containing block. sticky remains in flow and sticks within its scrolling and containing constraints when an inset is set.",
    ],
    `.card { position: relative; padding: 2rem 1rem 1rem; }\n.card__badge { position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; }\n.section-heading { position: sticky; top: 0; background: white; }`,
    [
      [
        "Anchor",
        "The relatively positioned card establishes a local reference for its absolute badge.",
        ["Card: relative", "Containing block", "Badge offsets"],
      ],
      [
        "Overlay",
        "The badge leaves normal flow, so padding reserves room to avoid covering the card text.",
        ["Badge: absolute", "Top/end offsets", "Text needs space"],
      ],
      [
        "Stick",
        "A sticky heading follows normal flow until its threshold is reached within the relevant scroll area.",
        ["Scroll moves", "top:0 threshold", "Heading sticks within bounds"],
      ],
    ],
    "An overflow ancestor can change the scroll container relevant to sticky positioning. Check container height and inset values before increasing z-index.",
    "Why might an absolutely positioned badge appear at the page corner?",
    "Its intended parent may not establish the expected containing block. Add position:relative to the appropriate wrapper and inspect ancestors.",
    css("position"),
  ),
  "layout--multi-column-layout": L(
    "Multi-column layout flows continuous content through columns, similar to a newspaper.",
    [
      "columns can specify a preferred count or width. The browser fragments the content between columns, so it is better for flowing prose than independent cards with strict row alignment.",
      "column-gap controls spacing and column-rule draws a separator. break-inside:avoid discourages splitting a grouped element, though fragmentation constraints can still force breaks.",
    ],
    `.article-body { columns: 18rem 2; column-gap: 2rem; column-rule: 1px solid #bbb; }\n.article-body h2 { column-span: all; }\n.article-body figure { break-inside: avoid; }`,
    [
      [
        "Flow",
        "The browser pours continuous article content into available columns.",
        ["Paragraph stream", "Column one", "Column two"],
      ],
      [
        "Constrain",
        "The preferred 18rem width limits how narrow columns become; fewer columns fit on small screens.",
        ["Available width", "Preferred 18rem", "Adaptive column count"],
      ],
      [
        "Group",
        "A figure is kept together where possible while the heading spans the column set.",
        ["Heading spans all", "Figure avoids split", "Prose fragments"],
      ],
    ],
    "Do not use columns as a substitute for row-aligned Grid cards. Readers may need to scroll down and back up to follow long columns.",
    "Which layout better suits a pricing comparison with aligned feature rows?",
    "Grid or a semantic data table fits that relationship better. Multi-column layout is intended for a continuous content stream.",
    css("CSS_multicol_layout"),
  ),
  "responsive--media-queries": L(
    "Media queries apply styles when the viewing environment meets a condition.",
    [
      "Width queries describe viewport conditions, while other features describe preferences or capabilities. Start with a usable baseline and add a breakpoint when the content needs a different layout.",
      "Breakpoints are design decisions, not universal device categories. Test around the threshold and with zoom, long text, and different input methods.",
    ],
    `.layout { display: grid; gap: 1rem; }\n@media (min-width: 48rem) {\n  .layout { grid-template-columns: 16rem minmax(0, 1fr); }\n}\n@media print { nav { display: none; } }`,
    [
      [
        "Baseline",
        "Below the threshold, normal grid auto-placement gives a single-column layout.",
        ["Narrow viewport", "One column", "Sidebar before content"],
      ],
      [
        "Match",
        "At 48rem and above, the query adds a sidebar track and a flexible content track.",
        ["Width ≥ 48rem", "16rem sidebar", "Remaining main track"],
      ],
      [
        "Change medium",
        "Print rules remove navigation that is not useful on paper.",
        ["Print medium", "nav hidden", "Content retained"],
      ],
    ],
    "Do not assume a wide screen has a mouse or a narrow screen is a phone. Use pointer and hover features when interaction capability is the concern.",
    "Why test at widths just below and above 48rem?",
    "Those widths expose abrupt overflow or awkward transitions caused by the layout switch. The breakpoint should follow content fit, not a device label.",
    css("CSS_media_queries/Using_media_queries"),
  ),
  "responsive--container-queries": L(
    "Container queries let a component respond to the space its parent provides rather than the whole viewport.",
    [
      "Establish a query container with container-type or the container shorthand. Descendant styles can then use @container to respond to that container’s size.",
      "The query container needs an externally determined size. A component cannot use a size query to directly style itself based on its own queried dimensions; put the boundary on a wrapper.",
    ],
    `.card-slot { container: lesson / inline-size; }\n.card { display: grid; gap: 1rem; }\n@container lesson (min-width: 30rem) {\n  .card { grid-template-columns: 10rem minmax(0, 1fr); }\n}`,
    [
      [
        "Establish boundary",
        "The slot becomes the named inline-size query container.",
        [".card-slot", "container: lesson", "Measurable inline size"],
      ],
      [
        "Read local space",
        "A card in a narrow sidebar uses its baseline layout even on a wide viewport.",
        ["Wide page", "Narrow slot", "Stacked card"],
      ],
      [
        "Adapt locally",
        "The same card in a wide main region gains two tracks.",
        ["Slot ≥ 30rem", "Query matches", "Image + text columns"],
      ],
    ],
    "Do not put the query container only on the element you intend to restyle. Size queries target descendants of the matching container.",
    "Why can two identical cards use different layouts on the same screen?",
    "Their parent containers can have different widths. Container queries respond to each local context independently of viewport width.",
    css("CSS_containment/Container_queries"),
  ),
  "responsive--fluid-typography": L(
    "Fluid typography scales smoothly within readable limits instead of jumping at many breakpoints.",
    [
      "clamp(minimum, preferred, maximum) constrains a responsive expression. Combining rem with viewport units retains a relationship to text settings while adapting to space.",
      "Readability also depends on line length, line height, and contrast. Test zoom and enlarged text; a mathematically fluid heading can still be too large for a long translated title.",
    ],
    `h1 { font-size: clamp(2rem, 1rem + 3vw, 4rem); line-height: 1.1; }\n.article { max-inline-size: 65ch; font-size: 1.125rem; line-height: 1.65; }`,
    [
      [
        "Minimum",
        "At a 16px root and a 320px viewport, the preferred expression is 25.6px, so the 32px minimum wins.",
        ["1rem + 3vw = 25.6px", "Minimum = 32px", "Used size = 32px"],
      ],
      [
        "Fluid middle",
        "At an 800px viewport, the preferred value is 40px, between the limits.",
        ["16 + 24 = 40px", "32 < 40 < 64", "Used size = 40px"],
      ],
      [
        "Maximum",
        "At a 2000px viewport the preferred value is 76px, so the 64px cap wins.",
        ["Preferred = 76px", "Maximum = 64px", "Used size = 64px"],
      ],
    ],
    "Avoid setting all text in vw alone. Do not give headings fixed heights that clip when text wraps or users enlarge fonts.",
    "At a 1000px viewport and 16px root, what size does this heading use?",
    "The preferred size is 16 + 30 = 46px. It is within the 32–64px range, so 46px is used.",
    css("clamp"),
  ),
  "responsive--responsive-images": L(
    "Responsive image styling controls the rendered box while HTML chooses the downloaded image source.",
    [
      "max-inline-size:100% prevents an image from exceeding its container. block-size:auto preserves intrinsic proportions. HTML width and height can reserve the correct aspect ratio.",
      "object-fit controls how replaced content fits a fixed box. cover fills while cropping; contain preserves the entire image with possible empty space. Neither reduces download size by itself.",
    ],
    `.article-image { max-inline-size: 100%; block-size: auto; }\n.thumbnail { inline-size: 100%; aspect-ratio: 16 / 9; object-fit: cover; }\n/* Use srcset/sizes in HTML when offering different source resolutions. */`,
    [
      [
        "Natural ratio",
        "An article image shrinks to fit its parent while preserving its proportions.",
        ["Intrinsic image", "Max width: container", "Automatic height"],
      ],
      [
        "Fixed frame",
        "A thumbnail establishes a 16:9 frame independent of the source ratio.",
        ["Container width", "16:9 aspect ratio", "Reserved frame"],
      ],
      [
        "Fit content",
        "cover scales until the frame is filled, cropping any excess.",
        ["Source ratio differs", "Scale to cover", "Edges may crop"],
      ],
    ],
    "Do not use cover for diagrams when cropping could hide important labels. CSS shrinking alone still downloads the original file.",
    "Which fit mode should a product diagram use if every edge must remain visible?",
    "Use contain inside the constrained box or preserve the natural ratio with auto height. Accept empty space rather than cutting off information.",
    css("object-fit"),
  ),
  "responsive--mobile-first-design": L(
    "Mobile-first CSS establishes a compact baseline and adds layout complexity only when space supports it.",
    [
      "A narrow layout naturally prioritizes content order and avoids assumptions about fixed widths. Larger layouts can enhance that baseline with columns and wider spacing.",
      "Mobile-first describes a styling strategy, not a claim that all users on small screens use touch. Preserve keyboard access, generous targets, and meaningful content at every size.",
    ],
    `.course { display: grid; gap: 1rem; padding: 1rem; }\n@media (min-width: 50rem) {\n  .course { grid-template-columns: 14rem minmax(0, 1fr); padding: 2rem; }\n}`,
    [
      [
        "Prioritize",
        "The compact version presents content in a useful single-column document order.",
        ["Course outline", "Lesson content", "Natural sequence"],
      ],
      [
        "Add space",
        "At the threshold, the same content gains a dedicated outline column.",
        ["Width ≥ 50rem", "Outline: 14rem", "Flexible lesson"],
      ],
      [
        "Stress test",
        "Long headings and enlarged text should still fit without hiding actions.",
        ["Long content", "Zoom / font changes", "No clipped controls"],
      ],
    ],
    "Do not hide important content simply because the screen is narrow. Avoid fixed desktop widths that require horizontal page scrolling.",
    "How would you choose the 50rem breakpoint in a real design?",
    "Resize the actual content until the two-column arrangement is comfortably readable. Set the breakpoint around that need and test nearby widths.",
    mdn("Learn_web_development/Core/CSS_layout/Responsive_Design"),
  ),
  "visual--colors": L(
    "Color communicates hierarchy and state, but the meaning must survive without color perception alone.",
    [
      "CSS supports named, hexadecimal, RGB, HSL, and other color forms. Alpha blends a color with what lies beneath, so final contrast depends on the actual background.",
      "Define semantic color roles such as text, surface, and danger. Pair errors and selections with text, icons, borders, or other cues, and verify contrast in every theme.",
    ],
    `:root { --surface: #fff; --text: #172033; --danger: #b42318; }\n.card { background: var(--surface); color: var(--text); }\n.error { color: var(--danger); border-inline-start: 3px solid currentColor; padding-inline-start: .75rem; }\n/* HTML: <p class="error">Error: enter a valid email address.</p> */`,
    [
      [
        "Assign roles",
        "Surface and text tokens form a pair intended to be read together.",
        ["Surface: white", "Text: dark", "Readable pair"],
      ],
      [
        "Signal",
        "The error uses a semantic danger color and a visible border.",
        ["Danger token", "Border cue", "Error emphasis"],
      ],
      [
        "Explain",
        "The explicit error text preserves meaning even when color differences are not perceived.",
        ["Color unavailable", "Text says Error", "Correction remains clear"],
      ],
    ],
    "Do not convey required fields or status only by red and green. Translucent colors need checking against every background they can overlap.",
    "What should a dark theme change besides the page background?",
    "Update text, surface, borders, focus indicators, and semantic colors as coordinated pairs. Recheck contrast rather than reusing every light-theme value.",
    css("CSS_colors"),
  ),
  "visual--typography": L(
    "Typography balances readable text, predictable wrapping, and a clear hierarchy.",
    [
      "Use a font stack with fallbacks, a comfortable line height, and a bounded line length. Unitless line-height scales with the element’s font size and inherits predictably.",
      "Font loading can change metrics and shift layout. Limit unnecessary weights, use appropriate fallback fonts, and keep text available while custom fonts load.",
    ],
    `body { font-family: system-ui, sans-serif; line-height: 1.6; }\n.prose { max-inline-size: 65ch; font-size: 1.125rem; }\n.prose h2 { line-height: 1.2; margin-block: 2rem 1rem; }\n.prose a { text-underline-offset: .15em; }`,
    [
      [
        "Choose face",
        "The system stack provides a locally available readable default.",
        ["system-ui", "sans-serif fallback", "Text can render"],
      ],
      [
        "Set rhythm",
        "Unitless line-height gives each line room relative to its own font size.",
        ["Font: 18px", "Line-height: 1.6", "Line box: 28.8px"],
      ],
      [
        "Bound measure",
        "A 65ch maximum keeps prose from stretching across a very wide screen.",
        ["Wide viewport", "Bounded line length", "Easier line tracking"],
      ],
    ],
    "Do not use fixed-height text containers or tiny line heights to force a composition. Test actual long copy and enlarged user fonts.",
    "If a paragraph font becomes 20px, what is its line box with line-height:1.6?",
    "It is 32px. The unitless value scales with the element’s computed font size rather than retaining a fixed pixel height.",
    css("line-height"),
  ),
  "visual--backgrounds": L(
    "Backgrounds decorate an element’s box without becoming semantic document content.",
    [
      "Layers are listed front to back, with the first image painted on top. background-size, position, and repeat control how each layer fills its painting area.",
      "Use an actual img when the image conveys information requiring alternative text. A background is suitable for decorative texture or atmosphere, and a fallback color should keep text readable if images fail.",
    ],
    `.hero {\n  color: white;\n  background-color: #16263f;\n  background-image: linear-gradient(#0009, #0009), url('/study-room.jpg');\n  background-size: cover;\n  background-position: center;\n  padding: 3rem 1rem;\n}`,
    [
      [
        "Fallback",
        "The solid color provides a usable surface before the image loads or if it fails.",
        ["Background color", "Text color", "Readable baseline"],
      ],
      [
        "Image",
        "The photograph covers the box and may be cropped to match its proportions.",
        ["Photo source", "cover sizing", "Centered crop"],
      ],
      [
        "Overlay",
        "The first listed gradient paints over the photograph, helping stabilize text contrast.",
        ["Gradient top layer", "Photo below", "Text above both"],
      ],
    ],
    "An overlay does not guarantee sufficient contrast for every image region. Do not put essential diagrams only in CSS backgrounds.",
    "What happens to the heading if study-room.jpg is unavailable?",
    "The fallback background color remains, as does the gradient. The heading should still be legible and contain all essential information.",
    css("background"),
  ),
  "visual--borders-and-shadows": L(
    "Borders define box edges; shadows add painted depth without changing layout dimensions.",
    [
      "Borders occupy box-model space unless accounted for by border-box sizing. Border radius rounds corners but does not by itself clip all descendant content.",
      "box-shadow can use offsets, blur, spread, and inset. A shadow affects painting rather than normal layout, and excessive blur or many large shadows can be costly.",
    ],
    `.card {\n  box-sizing: border-box;\n  border: 1px solid #cbd5e1;\n  border-radius: .75rem;\n  box-shadow: 0 4px 12px #0002;\n  padding: 1rem;\n}\n.card:focus-within { outline: 2px solid #2456c4; outline-offset: 3px; }`,
    [
      [
        "Edge",
        "The one-pixel border occupies space inside the declared border-box dimensions.",
        ["Content + padding", "1px border", "Measured box"],
      ],
      [
        "Depth",
        "The shadow paints below the box without pushing neighboring elements away.",
        ["Vertical offset: 4px", "Blur: 12px", "No layout expansion"],
      ],
      [
        "Focus",
        "An outline distinguishes keyboard interaction without changing the card’s measured size.",
        ["Descendant focused", "Outline appears", "Layout stays stable"],
      ],
    ],
    "Do not rely on faint shadows as the only boundary in high-contrast or forced-color environments. Preserve a meaningful border or outline where needed.",
    "Will a larger shadow increase the card’s width calculation?",
    "No. It can visually overlap or be clipped, but it does not add to the border-box width like padding or border does.",
    css("box-shadow"),
  ),
  "visual--filters-and-blend-modes": L(
    "Filters alter rendered pixels; blend modes combine colors with a backdrop or other background layers.",
    [
      "filter affects an element’s rendered result, including descendants. backdrop-filter affects the area behind an element and needs an appropriate transparent surface to be visible.",
      "mix-blend-mode combines an element with its backdrop, while background-blend-mode combines background layers. isolate can establish a blending boundary so effects do not leak into unrelated content.",
    ],
    `.gallery { isolation: isolate; }\n.thumbnail { filter: grayscale(1); transition: filter .2s; }\n.thumbnail:hover { filter: grayscale(0); }\n@media (prefers-reduced-motion: reduce) { .thumbnail { transition: none; } }`,
    [
      [
        "Render source",
        "The image first has its normal colored pixels.",
        ["Source image", "Rendered pixels", "Original colors"],
      ],
      [
        "Filter",
        "grayscale(1) removes color from the displayed result without changing the downloaded file.",
        ["grayscale: 1", "Pixel transformation", "Gray output"],
      ],
      [
        "Change state",
        "Hover changes the filter to zero; reduced-motion users receive the state change without interpolation.",
        ["Hover", "grayscale: 0", "Color restored"],
      ],
    ],
    "Do not use filtered appearance as the only indication of disabled state. Large animated filters can be expensive and should be measured.",
    "Does grayscale reduce the image download size?",
    "No. It changes rendering after the file is loaded. Optimize the actual image format and dimensions separately.",
    css("filter"),
  ),
  "motion--transitions": L(
    "A transition interpolates between old and new property values when a state changes.",
    [
      "Specify the property, duration, and timing function. The state change can come from hover, focus, a class, or script. Transitions do not create the state change themselves.",
      "Prefer a small set of meaningful properties and respect reduced motion. transform and opacity often avoid layout work, but actual rendering cost depends on the page.",
    ],
    `.button { transition: transform .15s ease, background-color .15s ease; }\n.button:hover { transform: translateY(-2px); background-color: #dbeafe; }\n.button:focus-visible { outline: 3px solid #2456c4; }\n@media (prefers-reduced-motion: reduce) { .button { transition: none; } }`,
    [
      [
        "Before",
        "The button begins at its ordinary position.",
        ["transform: none", "Resting color", "No movement"],
      ],
      [
        "Interpolate",
        "Hover supplies a new transform and color, and the transition fills intermediate values.",
        ["Hover state", "150ms interval", "Intermediate frames"],
      ],
      [
        "Settle",
        "The final transform is two pixels upward; leaving hover transitions back.",
        ["translateY(-2px)", "Final color", "Reverse on exit"],
      ],
    ],
    "transition:all can animate unexpected future properties. Do not make essential feedback depend on waiting for an animation to finish.",
    "What changes for a user who requests reduced motion?",
    "The same hover state appears immediately because the transition is removed. The interaction remains available without animated movement.",
    css("CSS_transitions/Using_CSS_transitions"),
  ),
  "motion--transforms": L(
    "Transforms move, rotate, scale, or skew a box’s visual rendering without rearranging normal flow.",
    [
      "translate changes visual position, scale changes apparent size, and rotate changes orientation. transform-origin determines the point around which scaling and rotation occur.",
      "Transform order matters because the operations are composed. Transforms can create stacking contexts and containing blocks, so decorative changes may also affect overlay behavior.",
    ],
    `.tile { transform-origin: center; }\n.tile--active { transform: translateX(20px) rotate(5deg) scale(1.05); }`,
    [
      [
        "Keep layout slot",
        "The tile retains its original space in normal flow.",
        ["Original box", "Layout slot unchanged", "Neighbors stay put"],
      ],
      [
        "Transform pixels",
        "The composed transform changes the rendered geometry around the chosen origin.",
        ["Scale + rotate", "Translate", "New visual position"],
      ],
      [
        "Inspect overlap",
        "Because neighbors did not move, the transformed tile may overlap them.",
        ["Visual box expands", "Neighbor slot fixed", "Potential overlap"],
      ],
    ],
    "Do not use transforms to reserve space in a layout. Avoid assuming two differently ordered transform lists are equivalent.",
    "Will translateX(20px) push the next sibling twenty pixels to the right?",
    "No. It changes visual positioning, not the normal flow slot. Use layout properties when siblings must reflow.",
    css("transform"),
  ),
  "motion--keyframe-animations": L(
    "Keyframes define a timeline of property values that can run without a separate hover or class transition.",
    [
      "An animation references a named @keyframes rule plus timing, duration, iteration, and direction settings. Define only the properties that need to change.",
      "Motion should support a task and avoid distracting indefinite loops. Reduced-motion handling and a way to pause persistent nonessential motion are important design considerations.",
    ],
    `@keyframes arrive {\n  from { opacity: 0; transform: translateY(8px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n.notice { animation: arrive .25s ease-out; }\n@media (prefers-reduced-motion: reduce) { .notice { animation: none; } }`,
    [
      [
        "Start",
        "The notice begins slightly lower and transparent during the animation.",
        ["0%", "opacity: 0", "translateY(8px)"],
      ],
      [
        "Progress",
        "Intermediate frames move and fade the notice toward its final state.",
        ["Timeline advances", "Opacity increases", "Offset decreases"],
      ],
      [
        "Finish",
        "The final state matches ordinary visible layout so no fill-mode dependency is needed here.",
        ["100%", "opacity: 1", "translateY(0)"],
      ],
    ],
    "Do not animate layout-heavy properties across many elements without measuring. Avoid leaving content invisible when an animation is disabled.",
    "Why is it useful that the normal notice style is already visible?",
    "If animation is unsupported, disabled, or reduced, the content remains available immediately. Motion enhances the presentation instead of enabling it.",
    css("CSS_animations/Using_CSS_animations"),
  ),
  "motion--reduced-motion": L(
    "Reduced-motion support offers the same information and actions with less unnecessary movement.",
    [
      "prefers-reduced-motion reflects a user preference. Design a calm baseline or override specific motion effects while preserving meaningful state changes.",
      "Some effects can become fades, while others should be removed entirely. Do not globally break functionality that depends on animation events; application logic should not require a decorative animation to complete.",
    ],
    `.panel { opacity: 1; }\n@media (prefers-reduced-motion: no-preference) {\n  .panel { animation: reveal .3s ease-out; }\n  @keyframes reveal {\n    from { opacity: 0; transform: translateY(12px); }\n    to { opacity: 1; transform: translateY(0); }\n  }\n}`,
    [
      [
        "Baseline",
        "The panel is fully visible without motion styles.",
        ["Panel exists", "opacity: 1", "Content available"],
      ],
      [
        "Check preference",
        "Only users with no reduced-motion preference receive the optional reveal animation.",
        ["Media query", "no-preference matches?", "Apply or skip motion"],
      ],
      [
        "Preserve meaning",
        "Both branches show the same panel and controls; only the transition experience differs.",
        ["Animated reveal", "Immediate reveal", "Same final content"],
      ],
    ],
    "Do not hide content in the base style and reveal it only through animation. A reduced-motion override would then leave it inaccessible.",
    "How should you test this without changing your entire operating-system setup?",
    "Use browser developer tools to emulate the media feature, then test both branches and verify that all content and actions remain available.",
    css("@media/prefers-reduced-motion"),
  ),
  "motion--view-transitions": L(
    "View transitions coordinate a visual change between old and new document states.",
    [
      "For same-document updates, startViewTransition wraps the DOM update so the browser can capture and animate states. Check capability before calling it.",
      "Keep the update function usable without animation and respect reduced motion. Named shared elements need unique transition names among participating rendered elements; duplicate names can prevent the intended transition.",
    ],
    `// JavaScript; updateView contains the real DOM update\nfunction showView(updateView) {\n  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;\n  if (!document.startViewTransition || reduce) {\n    updateView();\n    return;\n  }\n  document.startViewTransition(updateView);\n}\n// CSS: .course-title { view-transition-name: course-title; }`,
    [
      [
        "Capture old",
        "When supported and allowed by preference, the browser captures the old visual state.",
        ["Current DOM", "Old snapshot", "Transition begins"],
      ],
      [
        "Update",
        "The callback performs the actual content change, which must also work on its own.",
        ["updateView()", "New DOM", "New snapshot"],
      ],
      [
        "Animate or fall back",
        "The browser animates between states; the fallback simply performs the same update immediately.",
        ["Supported: transition", "Fallback: direct update", "Same destination"],
      ],
    ],
    "Do not make navigation success depend on animation support. Check current browser support for the exact same-document or cross-document feature you use.",
    "What should happen when startViewTransition is unavailable?",
    "Call the update function directly. The page should reach the same correct state, just without the visual transition.",
    mdn("Web/API/View_Transition_API"),
  ),
  "architecture--bem": L(
    "BEM names classes around independent blocks, their elements, and explicit variants.",
    [
      "A block is a reusable component such as card. An element belongs to it, such as card__title. A modifier such as card--featured changes a defined variant.",
      "The naming convention makes relationships visible without requiring deep descendant selectors. It is an organizational choice, not a browser feature or an automatic encapsulation mechanism.",
    ],
    `.card { padding: 1rem; border: 1px solid #bbb; }\n.card__title { margin-block-start: 0; }\n.card--featured { border-width: 3px; }\n/* <article class="card card--featured"><h2 class="card__title">Grid</h2></article> */`,
    [
      [
        "Define block",
        "The base card class holds the common structure and appearance.",
        ["card", "Shared padding", "Shared border"],
      ],
      [
        "Name element",
        "The title class describes its responsibility within the card instead of its exact DOM path.",
        ["card__title", "Title responsibility", "Independent selector"],
      ],
      [
        "Apply variant",
        "The featured modifier is combined with the base class rather than replacing it.",
        ["card + modifier", "Shared rules retained", "Thicker border"],
      ],
    ],
    "Do not encode every nested DOM level into class names. A modifier generally assumes the base block class is also present.",
    "How would you add a compact card without duplicating all card styles?",
    "Add card--compact with only the changed spacing and use it alongside card. Keep shared declarations in the base block.",
    "https://getbem.com/naming/",
  ),
  "architecture--css-modules": L(
    "CSS Modules scope class names through build tooling to reduce accidental global collisions.",
    [
      "Importing a module stylesheet returns a mapping from local names to generated class names. The exact syntax depends on the bundler and framework.",
      "The cascade and inheritance still apply. Local naming prevents collisions but does not isolate browser behavior like Shadow DOM; global styles and inherited values can still affect the component.",
    ],
    `/* Card.module.css */\n.card { padding: 1rem; border: 1px solid currentColor; }\n.title { margin-top: 0; }\n\n/* React example in a bundler with CSS Modules support:\nimport styles from './Card.module.css';\nexport function Card() {\n  return <article className={styles.card}><h2 className={styles.title}>Grid</h2></article>;\n}\n*/`,
    [
      [
        "Author locally",
        "The stylesheet uses short local class names without a global naming prefix.",
        [".card", ".title", "Module file"],
      ],
      [
        "Transform",
        "The build maps local names to generated identifiers and exports that mapping.",
        ["styles.card", "Generated class name", "Bundled CSS"],
      ],
      [
        "Render",
        "The component uses the generated class so another module’s card class does not collide by name.",
        ["Rendered class", "Matching scoped rule", "Local styling"],
      ],
    ],
    'Do not write className="card" when the stylesheet expects styles.card. Modules also do not prevent inherited global font or color rules.',
    "Can two module files both define .title safely?",
    "Yes, their generated names are distinct under the module tooling. Global selectors and intentional global escapes still need careful management.",
    "https://github.com/css-modules/css-modules",
  ),
  "architecture--utility-classes": L(
    "Utility classes expose small reusable styling decisions that can be composed in markup.",
    [
      "A utility usually represents one purpose such as display, spacing, or alignment. A controlled vocabulary can reduce repeated declarations and keep values consistent.",
      "Utilities trade shorter stylesheet rules for more classes in markup. Repeated semantic structures may still deserve a component abstraction, especially when behavior and accessibility must stay consistent.",
    ],
    `.flex { display: flex; }\n.items-center { align-items: center; }\n.gap-2 { gap: .5rem; }\n.p-4 { padding: 1rem; }\n/* <div class="flex items-center gap-2 p-4">...</div> */`,
    [
      [
        "Choose layout",
        "The flex utility establishes a flex formatting context.",
        ["class: flex", "display:flex", "Children in row"],
      ],
      [
        "Compose",
        "Alignment and gap utilities add independent decisions to the same element.",
        ["items-center", "gap-2", "Aligned separated items"],
      ],
      [
        "Standardize",
        "The padding utility selects a known spacing value rather than a one-off number.",
        ["p-4", "1rem token scale", "Consistent spacing"],
      ],
    ],
    "The order of classes in HTML does not determine conflicting declaration precedence. Stylesheet cascade order still decides the winner.",
    "If two utilities both set padding, does the last class in the attribute always win?",
    "No. The CSS cascade decides based on the declarations, not the class attribute order. Avoid ambiguous conflicting utilities.",
    css("CSS_cascade/Cascade"),
  ),
  "architecture--design-tokens": L(
    "Design tokens name shared design decisions so components can follow a coherent system.",
    [
      "Primitive tokens describe raw values; semantic tokens describe intent such as surface or action. Components should usually depend on intent so themes can change values without rewriting component rules.",
      "Tokens can cover color, spacing, typography, radii, and motion. Keep the set understandable and avoid creating a token for every incidental one-off measurement.",
    ],
    `:root {\n  --space-2: .5rem; --space-4: 1rem;\n  --surface: #fff; --text: #172033; --radius-card: .5rem;\n}\n[data-theme="dark"] { --surface: #172033; --text: #f1f5f9; }\n.card { padding: var(--space-4); border-radius: var(--radius-card); background: var(--surface); color: var(--text); }`,
    [
      [
        "Define decisions",
        "Shared spacing and semantic color roles form a vocabulary for components.",
        ["Spacing scale", "Surface + text roles", "Card radius"],
      ],
      [
        "Consume",
        "The card references those roles instead of embedding every literal value.",
        ["Card rules", "var() references", "Consistent result"],
      ],
      [
        "Theme",
        "A theme boundary replaces semantic color values while the card stylesheet stays the same.",
        ["data-theme=dark", "New role values", "Same component rules"],
      ],
    ],
    "Changing only a background token can make text unreadable. Treat foreground and background as coordinated decisions.",
    "Why prefer --surface to --white in a component rule?",
    "Surface expresses the role, which can map to a light or dark value. A literal color name assumes one theme and becomes misleading after a change.",
    css("Using_CSS_custom_properties"),
  ),
  "architecture--component-styling": L(
    "Component styling works best when ownership, variants, and parent layout responsibilities are explicit.",
    [
      "A component can own its internal spacing and appearance while its parent owns placement in the page. This reduces rules that depend on distant ancestors.",
      "Expose a small set of variants or custom properties for intentional customization. Avoid requiring callers to override deeply nested selectors or internal markup to make common adjustments.",
    ],
    `.lesson-card { padding: var(--card-padding, 1rem); border: 1px solid #bbb; }\n.lesson-card__title { margin: 0 0 .5rem; }\n.lesson-grid { display: grid; gap: 1.5rem; }\n.compact-area { --card-padding: .5rem; }`,
    [
      [
        "Own internals",
        "The card controls spacing between its own content elements.",
        ["Card padding", "Title spacing", "Internal contract"],
      ],
      [
        "Place externally",
        "The grid controls the distance and arrangement between cards.",
        ["Parent grid", "gap:1.5rem", "External layout"],
      ],
      [
        "Customize intentionally",
        "A documented custom property changes density without coupling to the title’s DOM path.",
        ["--card-padding", "Local context", "Compact card"],
      ],
    ],
    "A component with hard-coded page coordinates is difficult to reuse. Avoid parent selectors that reach through several component boundaries.",
    "Should the card or the grid decide the gap between neighboring cards?",
    "The grid should own that relationship. The card should remain usable in another layout without carrying an inappropriate outside margin.",
    css("CSS_cascade/Specificity"),
  ),
  "production--browser-compatibility": L(
    "Compatibility work starts with a usable baseline and adds features according to real support requirements.",
    [
      "Define supported browsers from your audience and product constraints, then check the specific CSS features used. A feature query detects parsing support, not every behavioral bug.",
      "Use @supports for progressive styling and keep the fallback understandable. Test representative browsers and devices; prefixes alone do not guarantee correctness.",
    ],
    `.cards { display: block; }\n.cards > * + * { margin-block-start: 1rem; }\n@supports (display: grid) {\n  .cards { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .cards > * + * { margin-block-start: 0; }\n}`,
    [
      [
        "Fallback",
        "The baseline stacks cards with margins so content remains usable.",
        ["Block layout", "Stacked cards", "Visible spacing"],
      ],
      [
        "Detect",
        "The feature query asks whether the browser understands the grid declaration.",
        ["@supports", "display:grid accepted?", "Conditional rules"],
      ],
      [
        "Enhance",
        "Supporting browsers get two tracks and grid gap instead of sibling margins.",
        ["Grid enabled", "Margins reset", "Two-column layout"],
      ],
    ],
    "Do not assume @supports verifies every edge case. Fallback and enhanced states both need actual content testing.",
    "Why reset the sibling margins inside the feature query?",
    "Otherwise both the fallback margins and grid gap would apply, producing unintended extra spacing.",
    css("@supports"),
  ),
  "production--performance": L(
    "CSS performance depends on the rendering work a change triggers and how much content it affects.",
    [
      "Rendering may involve style calculation, layout, painting, and compositing. Changing geometry can trigger layout; changing color usually requires paint; some transform and opacity changes can be composited.",
      "Measure with browser tools before optimizing. Large DOM trees, expensive effects, and frequent script-driven style changes often matter more than minor selector folklore.",
    ],
    `.drawer { transform: translateX(-100%); transition: transform .2s ease; }\n.drawer.is-open { transform: translateX(0); }\n@media (prefers-reduced-motion: reduce) { .drawer { transition: none; } }\n/* Pair visual state with correct focus and hidden/inert behavior in the application. */`,
    [
      [
        "Change state",
        "A class changes the target transform instead of continuously rewriting left coordinates.",
        ["is-open added", "New transform", "Style recalculated"],
      ],
      [
        "Render",
        "The browser may handle the transform on a composited layer, depending on the actual page.",
        ["Layer decision", "Composite opportunity", "Measure trace"],
      ],
      [
        "Validate",
        "Check frame timing and interaction behavior on representative hardware.",
        ["Performance recording", "Frame work", "User-visible responsiveness"],
      ],
    ],
    "Do not apply will-change to everything; extra layers consume memory. An offscreen transform alone does not remove controls from keyboard navigation.",
    "Why should a sliding drawer also manage focusability?",
    "Visually moving it offscreen does not necessarily remove its controls from Tab order or accessibility APIs. State behavior must accompany animation.",
    mdn("Web/Performance/Guides/Animation_performance_and_frame_rate"),
  ),
  "production--debugging": L(
    "CSS debugging is a sequence of questions about matching, winning values, box geometry, and layout context.",
    [
      "Inspect the actual element and verify that the selector matches. Then inspect crossed-out declarations and computed values to understand the cascade.",
      "If the value is correct but the result is wrong, inspect containing blocks, intrinsic sizes, overflow, and parent layout. Browser grid and flex overlays reveal relationships that are hard to infer from source alone.",
    ],
    `/* Intended: a child that can shrink inside a flex row */\n.row { display: flex; }\n.content { flex: 1; min-width: 0; }\n.content p { overflow-wrap: anywhere; }`,
    [
      [
        "Match",
        "Confirm the overflowing element actually has the content class and is the intended flex item.",
        ["DOM element", ".content selector", "Rule matches"],
      ],
      [
        "Compute",
        "Inspect the used flex and minimum-size behavior instead of only the authored width.",
        ["flex:1", "Automatic minimum?", "min-width:0 override"],
      ],
      [
        "Verify",
        "After allowing shrinkage and wrapping, check that long content remains readable.",
        ["Item shrinks", "Text wraps", "Overflow resolved"],
      ],
    ],
    "Do not pile on random overrides before identifying which layer is wrong. A child’s layout problem may originate in its parent.",
    "A declaration is not crossed out but appears ineffective. What should you inspect next?",
    "Check whether the property applies to that display context, then inspect containing blocks, constraints, and intrinsic content sizes.",
    mdn("Learn_web_development/Core/Styling_basics/Debugging_CSS"),
  ),
  "production--accessibility": L(
    "Accessible CSS preserves content, focus, and meaning across input methods and user preferences.",
    [
      "Maintain contrast, visible keyboard focus, readable text, and content reflow. Visual order should agree with DOM order when sequence matters.",
      "Support reduced motion and forced-color environments where relevant. Hiding, clipping, and positioning rules can affect whether users can find and operate controls even when the HTML is semantic.",
    ],
    `.action { min-block-size: 2.75rem; padding: .6rem 1rem; }\n.action:focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }\n.error { border-inline-start: 3px solid currentColor; padding-inline-start: .75rem; }\n@media (forced-colors: active) { .action { border: 1px solid ButtonText; } }`,
    [
      [
        "Reach",
        "A usable target size and native control make activation easier across input methods.",
        ["Action target", "Adequate size", "Pointer or keyboard"],
      ],
      [
        "Locate focus",
        "The outline shows which element receives keyboard input without relying on hover.",
        ["Tab reaches action", ":focus-visible", "Clear focus indicator"],
      ],
      [
        "Adapt",
        "Forced-color styling preserves an edge when decorative backgrounds or shadows are overridden.",
        ["User color mode", "System color border", "Control remains distinct"],
      ],
    ],
    "Do not remove focus outlines or encode errors only in color. CSS order changes do not automatically change reading or keyboard order.",
    "What should happen when a user zooms to a narrow effective viewport?",
    "Text should reflow and controls remain reachable without clipped labels or unnecessary two-direction scrolling. Test the actual interface at zoom.",
    mdn("Learn_web_development/Core/Accessibility/CSS_and_JavaScript"),
  ),
  "production--modern-css-strategy": L(
    "A maintainable CSS strategy combines semantic structure, local layout, shared tokens, and deliberate fallbacks.",
    [
      "Start with normal flow and native elements, use Flexbox or Grid for relationships, and use custom properties for shared decisions. Introduce container queries where components need local responsiveness.",
      "Organize cascade ownership and keep specificity low enough for intentional overrides. Modern features should solve an observed need, and their fallbacks should preserve the core experience.",
    ],
    `@layer reset, base, components, utilities;\n@layer base {\n  :root { --space: 1rem; }\n  body { font-family: system-ui, sans-serif; }\n}\n@layer components {\n  .cards { display: grid; gap: var(--space); }\n}\n@layer utilities { .compact { --space: .5rem; } }`,
    [
      [
        "Order layers",
        "The declared layer order makes normal declaration precedence explicit across categories.",
        ["reset → base", "components", "utilities"],
      ],
      [
        "Build components",
        "A grid consumes a semantic spacing decision without a high-specificity selector.",
        [".cards", "gap token", "Predictable layout"],
      ],
      [
        "Adjust locally",
        "The compact utility changes the token for that region without rewriting component internals.",
        ["compact context", "--space:.5rem", "Smaller gap"],
      ],
    ],
    "Unlayered normal author rules outrank layered normal rules, and important layer ordering reverses. Avoid mixing strategies without understanding these rules.",
    "Build a responsive course-card page. What should the final review include?",
    "Check narrow and wide layouts, long content, keyboard focus, reduced motion, theme contrast, and representative browser support. Inspect cascade ownership before adding overrides.",
    css("CSS_cascade/Cascade"),
  ),
};
