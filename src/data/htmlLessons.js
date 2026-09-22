import { lesson as L, mdn } from "./webLessonSchema.js";
const html = (path) => mdn(`Web/HTML/${path}`);
export const htmlLessons = {
  "getting-started--how-the-web-uses-html": L(
    "HTML gives a web page meaning before CSS styles it or JavaScript adds behavior.",
    [
      "A browser requests a URL and receives a response. For an HTML document, the browser parses markup into a document object model (DOM), a tree that other browser systems use.",
      "Elements describe responsibilities such as headings, paragraphs, and links. CSS changes presentation; JavaScript can read and update the DOM. A useful page should expose its essential content without requiring decorative effects.",
    ],
    `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Study notes</title></head>\n<body>\n  <h1>Study notes</h1>\n  <p>Learn one concept each day.</p>\n  <a href="lessons.html">Browse lessons</a>\n</body>\n</html>`,
    [
      [
        "Request",
        "Opening a URL asks the server for a representation; the response body contains the document source.",
        ["Browser: GET /", "Server: 200 OK", "Body: HTML source"],
      ],
      [
        "Parse",
        "The parser creates elements and text nodes. The DOM is a tree, not a screenshot of the source.",
        ["Document", "html → head + body", "body → h1 + p + a"],
      ],
      [
        "Render",
        "The browser displays the heading, paragraph, and link using default styles even before custom CSS arrives.",
        ["Heading: Study notes", "Paragraph: daily goal", "Link: lessons.html"],
      ],
    ],
    "Do not use HTML solely as empty containers for scripts. Missing semantics make navigation, indexing, and resilient loading harder.",
    "Save this as index.html, open it, and disable JavaScript. Which content and actions remain?",
    "The heading, paragraph, and normal link remain available. The destination needs its own lessons.html file or server route; a link does not create that page.",
    html("Reference/Elements"),
  ),
  "getting-started--document-structure": L(
    "A predictable document skeleton separates page metadata from visible content.",
    [
      "The doctype selects standards mode. The html element carries the document language, head contains metadata, and body contains content presented to the user.",
      "Declare the character encoding early. The title identifies the browser tab, while a viewport declaration lets mobile layouts use the device width. These are different from a visible h1.",
    ],
    `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>HTML notes | Study desk</title>\n</head>\n<body>\n  <main><h1>HTML notes</h1><p>Start with structure.</p></main>\n</body>\n</html>`,
    [
      [
        "Declare",
        "The doctype tells the browser to use standards-mode layout instead of historical quirks.",
        ["Source begins", "<!doctype html>", "Standards mode"],
      ],
      [
        "Describe",
        "The head sets encoding, viewport behavior, and tab identity without adding those strings to the page body.",
        ["head", "UTF-8 + viewport", "Tab: HTML notes"],
      ],
      [
        "Present",
        "The main element identifies the primary content region and contains the visible heading and paragraph.",
        ["body", "main landmark", "h1 → p"],
      ],
    ],
    "Do not put visible article content in head or confuse title with h1. Avoid disabling pinch zoom in the viewport declaration.",
    "Change the title and h1 to different strings. Where does each appear?",
    "The title appears in the browser tab and may be used by search results. The h1 appears in the page and its heading navigation structure.",
    html("Reference/Elements/html"),
  ),
  "getting-started--elements-and-attributes": L(
    "Elements identify a kind of content; attributes configure that element or add metadata.",
    [
      "Most elements have opening and closing tags around content. Void elements such as img and input have no closing tag. Nest elements according to their permitted content models.",
      'Attributes appear in the opening tag. Boolean attributes are true when present, so disabled="false" still disables a control. Quote values and use unique IDs for document targets.',
    ],
    `<label for="topic">Topic</label>\n<input id="topic" name="topic" type="text" required>\n<button type="button" disabled>Coming soon</button>\n<a href="/lessons" class="navigation-link">Lessons</a>`,
    [
      [
        "Identify",
        "The parser identifies a label, an input, a button, and a link, each with different native behavior.",
        ["label", "input + button", "a"],
      ],
      [
        "Configure",
        "for connects the label to the matching ID; name supplies the form data key and required adds a constraint.",
        ['for="topic"', 'id="topic"', 'name="topic"'],
      ],
      [
        "Interact",
        "The disabled attribute prevents normal button activation. The anchor navigates because it has an href.",
        ["disabled present", "Button unavailable", "Anchor navigates"],
      ],
    ],
    "Do not repeat IDs or nest interactive controls, such as a button inside a link. Removing a boolean attribute is different from setting its text to false.",
    "Make the button available, then click the Topic label. What changes?",
    "Remove disabled entirely to enable the button. Clicking the label focuses the input because its for value matches the input ID.",
    html("Reference/Attributes"),
  ),
  "getting-started--text-and-headings": L(
    "Text elements communicate structure and emphasis independently of font size.",
    [
      "Use h1 through h6 to describe nested sections. Choose the heading level from its position in the document, then style its appearance with CSS.",
      "Paragraphs group prose. strong expresses importance, em expresses stress emphasis, and code identifies code. A line break is not a substitute for a new paragraph or layout spacing.",
    ],
    `<h1>Frontend learning plan</h1>\n<p>Build a <strong>working page</strong> each week.</p>\n<h2>Week one</h2>\n<h3>HTML structure</h3>\n<p>Use <code>&lt;main&gt;</code> for the primary content.</p>\n<h3>Practice</h3>\n<p>Read the page <em>without its styles</em>.</p>`,
    [
      [
        "Outline",
        "The page has one main subject and a second-level week section.",
        ["h1: Learning plan", "h2: Week one", "Section hierarchy"],
      ],
      [
        "Nest",
        "The two h3 headings are siblings within Week one; neither is a separate top-level topic.",
        ["Week one", "h3: Structure", "h3: Practice"],
      ],
      [
        "Emphasize",
        "Inline semantics identify important words, stressed words, and code without changing the section hierarchy.",
        ["strong: important", "em: stressed", "code: syntax"],
      ],
    ],
    "Do not choose h4 merely because it looks smaller or use repeated br elements for spacing. These choices distort structure.",
    "Add Week two and a CSS layout subsection. Which heading levels fit?",
    "Week two is another h2 alongside Week one. CSS layout is an h3 within Week two. CSS should handle the visual spacing and font sizes.",
    html("Reference/Elements/Heading_Elements"),
  ),
  "getting-started--comments-and-entities": L(
    "Comments document source intent; character references display characters that would otherwise be markup.",
    [
      "HTML comments are visible in downloaded source even though they are not rendered as page text. Use them for helpful context, never credentials or private information.",
      "Character references such as &lt; and &amp; represent literal characters. UTF-8 permits ordinary Unicode text directly; reserve references for syntax-sensitive characters and deliberate spacing behavior.",
    ],
    `<!-- The example below displays markup as text. -->\n<p>Use <code>&lt;h1&gt;</code> for the main heading.</p>\n<p>Research &amp; development</p>\n<p>Price: 20&nbsp;USD</p>`,
    [
      [
        "Read source",
        "The comment explains intent to maintainers but remains available to anyone who inspects the document.",
        ["<!-- note -->", "Source retained", "No visible paragraph"],
      ],
      [
        "Decode",
        "The parser turns the references into literal characters inside text nodes.",
        ["&lt;h1&gt;", "Text node: <h1>", "No new heading"],
      ],
      [
        "Wrap",
        "The nonbreaking space keeps the price and unit together, unlike an ordinary wrapping opportunity.",
        ["20", "Nonbreaking space", "USD stays adjacent"],
      ],
    ],
    "Do not put secrets in comments or insert many nonbreaking spaces to align columns. Use CSS layout for alignment.",
    "Display the literal text A < B & C in a paragraph without creating markup.",
    "Write A &lt; B &amp; C between the paragraph tags. The browser displays the symbols while keeping the content a single text node.",
    mdn("Glossary/Character_reference"),
  ),
  "content--semantic-html": L(
    "Semantic elements describe the role of content so readers and tools can understand the page.",
    [
      "main holds the primary content, nav groups major navigation, and article represents a self-contained composition. section groups a thematic region, usually with a heading.",
      "Choose elements by meaning rather than default appearance. A div is appropriate when a wrapper has no additional meaning. Semantic HTML improves the foundation but does not automatically make every interaction accessible.",
    ],
    `<header><a href="/">Study desk</a></header>\n<nav aria-label="Primary"><a href="/lessons">Lessons</a></nav>\n<main>\n  <article>\n    <h1>Understanding the DOM</h1>\n    <section><h2>Elements</h2><p>Elements form a tree.</p></section>\n  </article>\n</main>\n<footer><p>Written for curious developers.</p></footer>`,
    [
      [
        "Map regions",
        "Separate site-wide chrome from the page-specific content before choosing visual styling.",
        ["Header + navigation", "Main content", "Footer"],
      ],
      [
        "Choose meaning",
        "The standalone lesson is an article; its thematic subsection has a heading.",
        ["main", "article: DOM lesson", "section: Elements"],
      ],
      [
        "Navigate",
        "Assistive technology can use landmarks and headings instead of reading every item sequentially.",
        ["Landmark navigation", "Main region", "Heading: Elements"],
      ],
    ],
    "Replacing every div with section adds noise if the wrappers are only for layout. Avoid multiple visible main regions.",
    "Would a reusable product card always need an article element?",
    "Only when it is a meaningful self-contained composition. A layout wrapper can remain a div; the content responsibility should determine the element.",
    html("Reference/Elements"),
  ),
  "content--links-and-navigation": L(
    "A real hyperlink gives users navigation, context menus, keyboard support, and a shareable destination.",
    [
      "Use a with href for navigation and button for actions. Relative URLs resolve from the document location; fragment URLs target an element ID in the document.",
      "Link text should explain the destination out of context. Mark the current page with aria-current and label distinct navigation regions. Avoid surprising new-window behavior unless the task justifies it.",
    ],
    `<nav aria-label="Course">\n  <a href="/lessons" aria-current="page">All lessons</a>\n  <a href="/practice">Practice projects</a>\n</nav>\n<a href="#resources">Jump to resources</a>\n<section id="resources"><h2>Resources</h2></section>`,
    [
      [
        "Resolve",
        "The leading slash makes /practice relative to the current origin rather than the current directory.",
        ["Current origin", "/practice", "Destination URL"],
      ],
      [
        "Activate",
        "Keyboard Enter or a normal click follows the anchor while preserving native browser navigation behavior.",
        ["Focused link", "Activate", "Navigate"],
      ],
      [
        "Locate",
        "A fragment points to a unique ID so the browser can bring that region into view.",
        ["#resources", 'id="resources"', "Resources section"],
      ],
    ],
    'Do not replace links with clickable divs or use href="#" for actions. Generic text such as click here hides the destination.',
    "Add a link from a lesson to its exercise section. What must match?",
    'Use href="#exercise" and assign id="exercise" to the target section. The ID must be unique and exactly match the fragment.',
    html("Reference/Elements/a"),
  ),
  "content--images-and-figures": L(
    "Images need an appropriate text alternative and predictable space in the document.",
    [
      "alt describes the purpose of an informative image in its current context. Decorative images usually use an empty alt. A linked image needs an accessible name describing the link purpose.",
      "width and height establish an aspect ratio before loading. figure groups an independent illustration with an optional figcaption; the caption supplements the image rather than automatically replacing its alternative text.",
    ],
    `<figure>\n  <img src="dom-tree.png" width="640" height="360"\n       alt="The html node branches into head and body; body contains a heading.">\n  <figcaption>A small document represented as a tree.</figcaption>\n</figure>`,
    [
      [
        "Reserve space",
        "The browser can reserve a 16:9 region before dom-tree.png finishes loading.",
        ["width: 640", "height: 360", "Aspect ratio: 16:9"],
      ],
      [
        "Explain purpose",
        "The alternative describes the important relationship when the image is unavailable or not perceived visually.",
        ["Image unavailable", "Alternative text", "Tree relationship retained"],
      ],
      [
        "Add context",
        "The caption identifies the illustration in the surrounding article.",
        ["figure", "img + figcaption", "One illustration group"],
      ],
    ],
    "Avoid file names as alt text and do not omit alt on meaningful images. Long diagrams may also need a nearby extended description.",
    "How would the markup differ for a purely decorative flourish?",
    'Use alt="" so it does not add noise to the reading order. Keep dimensions when useful for layout, and do not give it a misleading descriptive caption.',
    html("Reference/Elements/img"),
  ),
  "content--lists": L(
    "Lists express related items, ordered procedures, or term-and-description relationships.",
    [
      "Use ul when order is not meaningful and ol when sequence matters. Each item is an li. Nested lists belong inside the parent item they elaborate.",
      "A description list uses dt for a term and dd for its description. Choose it for glossaries or name-value explanations, not merely to create a two-column layout.",
    ],
    `<ol>\n  <li>Create an HTML file.</li>\n  <li>Add content.\n    <ul><li>Heading</li><li>Paragraph</li></ul>\n  </li>\n  <li>Open it in a browser.</li>\n</ol>\n<dl><dt>DOM</dt><dd>The browser's document tree.</dd></dl>`,
    [
      [
        "Sequence",
        "The outer ordered list communicates a procedure that should be followed in order.",
        ["1. Create", "2. Add", "3. Open"],
      ],
      [
        "Nest",
        "Heading and Paragraph are unordered subitems belonging to the second step.",
        ["Step 2", "Nested ul", "Heading + paragraph"],
      ],
      [
        "Define",
        "The description list associates a term with its explanation.",
        ["dt: DOM", "Association", "dd: document tree"],
      ],
    ],
    "Do not simulate lists with bullet characters and br elements. Do not place a nested ul directly beside li elements when it belongs within an item.",
    "Create a packing checklist and a three-step installation procedure. Which list types fit?",
    "Use ul for independent checklist items and ol for installation steps. The choice reflects whether changing the order changes the meaning.",
    html("Reference/Elements/ol"),
  ),
  "content--tables": L(
    "Tables describe data whose meaning depends on relationships between rows and columns.",
    [
      'Use caption to identify the table, th for headers, and td for data. scope="col" or scope="row" connects simple headers to the cells they describe.',
      "thead and tbody organize row groups. Keep complex spanning structures rare and provide explicit associations when needed. Use CSS Grid or Flexbox for page layout instead of tables.",
    ],
    `<table>\n  <caption>Weekly study time</caption>\n  <thead><tr><th scope="col">Topic</th><th scope="col">Minutes</th></tr></thead>\n  <tbody>\n    <tr><th scope="row">HTML</th><td>30</td></tr>\n    <tr><th scope="row">CSS</th><td>45</td></tr>\n  </tbody>\n</table>`,
    [
      [
        "Name",
        "The caption gives the whole data set a useful identity.",
        ["table", "caption", "Weekly study time"],
      ],
      [
        "Associate",
        "Column and row headers explain what each numeric value measures.",
        ["Column: Minutes", "Row: HTML", "Cell: 30"],
      ],
      [
        "Compare",
        "The second row can be interpreted with the same column header.",
        ["Column: Minutes", "Row: CSS", "Cell: 45"],
      ],
    ],
    "A visually bold td is not a header. Do not remove table semantics with presentation roles just to solve a styling issue.",
    "Add a JavaScript row with 60 minutes. Which cell should be a row header?",
    'JavaScript belongs in th scope="row"; 60 belongs in td. The column header Minutes continues to identify the measurement.',
    html("Reference/Elements/table"),
  ),
  "forms--form-structure": L(
    "A form groups controls into a submission with an explicit destination and method.",
    [
      "action specifies the receiving URL and method determines submission behavior. GET is appropriate for read-only searches; POST sends a request body for operations such as creating records.",
      "Successful named controls contribute values. id connects labels, but name supplies the submitted key. An explicit submit button also supports keyboard submission. A server must implement the receiving route.",
    ],
    `<form action="/search" method="get">\n  <label for="query">Search lessons</label>\n  <input id="query" name="q" type="search" required>\n  <button type="submit">Search</button>\n</form>`,
    [
      [
        "Collect",
        "Typing grid updates the input value but has not sent a request yet.",
        ["Input name: q", "Value: grid", "Local form state"],
      ],
      [
        "Validate",
        "The browser checks the required constraint when normal submission is attempted.",
        ["Submit", "Required satisfied", "Build form data"],
      ],
      [
        "Submit",
        "A GET submission encodes the name-value pair in the destination query string.",
        ["q=grid", "GET /search?q=grid", "Server returns results"],
      ],
    ],
    "An input without name is not included as a normal named field. GET query strings are visible in URLs and should not carry sensitive values.",
    'Remove name="q" and submit. Why does the server no longer receive the search term?',
    "The ID still labels the control, but the serialization key is missing. Restore name to include the term in the request.",
    html("Reference/Elements/form"),
  ),
  "forms--input-types": L(
    "Choose an input type that matches the data and the interaction users need.",
    [
      "email, date, number, and other types provide browser-specific controls and validation semantics. inputmode suggests a keyboard but does not validate the value.",
      "Radio buttons with a shared name create one choice; checkboxes represent independent choices. Use text for identifiers such as postal codes when arithmetic and number spinners do not make sense.",
    ],
    `<form>\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" autocomplete="email">\n  <label for="code">Postal code</label>\n  <input id="code" name="postalCode" type="text" inputmode="numeric">\n  <label><input type="checkbox" name="updates" value="yes"> Send updates</label>\n  <button>Continue</button>\n</form>`,
    [
      [
        "Match data",
        "An email address benefits from email semantics; a postal code remains a string so leading zeros survive.",
        ["email → email input", "postalCode → text", "updates → checkbox"],
      ],
      [
        "Guide entry",
        "inputmode can suggest numeric keys without converting the postal code into a number.",
        ["Keyboard hint", "Text value: 00123", "Leading zeros retained"],
      ],
      [
        "Serialize",
        "The checkbox contributes updates=yes only when checked in a normal form submission.",
        ["Unchecked: omitted", "Checked: yes", "Server interprets choice"],
      ],
    ],
    "A number input is not a universal numeric keyboard. Phone numbers and account identifiers are usually strings, not quantities.",
    "Design a quantity field and a telephone field. Which types fit?",
    "Use number with suitable min and step for quantity, and tel for telephone. Validate business rules on the server regardless of browser controls.",
    html("Reference/Elements/input"),
  ),
  "forms--labels-and-fieldsets": L(
    "Labels identify individual controls; fieldsets and legends explain a related group.",
    [
      "A visible label gives persistent context and a larger click target. Connect for to a unique input ID, or wrap an input directly within a label.",
      "Use fieldset and legend when multiple controls answer one question, especially radio groups. Individual option labels identify choices while the legend states the group question.",
    ],
    `<fieldset>\n  <legend>Preferred study time</legend>\n  <label><input type="radio" name="time" value="morning"> Morning</label>\n  <label><input type="radio" name="time" value="evening"> Evening</label>\n</fieldset>`,
    [
      [
        "Group",
        "The fieldset gathers controls that jointly answer a single question.",
        ["fieldset", "Preferred study time", "Two choices"],
      ],
      [
        "Name choices",
        "Each wrapping label names its radio button and activates it when clicked.",
        ["Label: Morning", "Radio: morning", "Shared name: time"],
      ],
      [
        "Select",
        "Because both radios share a name, choosing Evening clears Morning.",
        ["Morning: false", "Evening: true", "time=evening"],
      ],
    ],
    "Placeholder text disappears and is not a replacement for a label. Different names would make these radios independent groups.",
    "Add an Afternoon option. Which attribute must match the others?",
    "Its name must remain time so only one option is selected. Give it a distinct value and visible label identifying Afternoon.",
    html("Reference/Elements/fieldset"),
  ),
  "forms--native-validation": L(
    "Native constraints catch common input mistakes before a normal form submission.",
    [
      "required, minlength, maxlength, min, max, and pattern describe different constraints. Choose constraints matching the input type and explain requirements before the user submits.",
      "The Constraint Validation API lets scripts inspect validity or set a custom message. Client validation is a usability layer; direct requests can bypass it, so the server must validate too.",
    ],
    `<form>\n  <label for="handle">Handle: 3–12 letters</label>\n  <input id="handle" name="handle" required pattern="[A-Za-z]{3,12}">\n  <label for="sessions">Sessions per week</label>\n  <input id="sessions" name="sessions" type="number" min="1" max="7" required>\n  <button>Save plan</button>\n</form>`,
    [
      [
        "Empty",
        "Required controls are invalid while empty, so normal submission is blocked.",
        ["handle: empty", "valueMissing: true", "Submission blocked"],
      ],
      [
        "Constrain",
        "A value such as ab does not match the required handle pattern.",
        ["handle: ab", "patternMismatch: true", "Correct the input"],
      ],
      [
        "Accept",
        "A matching handle and number within range satisfy the client constraints.",
        ["handle: learner", "sessions: 3", "Client checks pass"],
      ],
    ],
    "A previously set custom validity message must be cleared when the value becomes valid. Do not assume browser validation proves a request is safe.",
    "Try a sessions value of 9, then 3. What changes?",
    "Nine exceeds max and triggers rangeOverflow. Three is within range, though all other controls must also be valid before submission succeeds.",
    html("Guides/Constraint_validation"),
  ),
  "forms--accessible-forms": L(
    "An accessible form connects instructions, errors, and recovery to the affected control.",
    [
      "Keep visible labels, explain required formats, and preserve entered values after failure. Associate supporting text with aria-describedby so it can be read with the input.",
      "Set aria-invalid when validation identifies a problem. Announce new errors appropriately, and for long forms consider a focused error summary with links to invalid controls. Avoid announcing every keystroke.",
    ],
    `<!-- State after validation found an invalid address -->\n<label for="email">Email</label>\n<input id="email" name="email" type="email" value="learner"\n       aria-invalid="true" aria-describedby="email-help email-error">\n<p id="email-help">We send your study reminders here.</p>\n<p id="email-error">Enter an address such as name@example.com.</p>`,
    [
      [
        "Identify",
        "The label names the field and help text explains why the information is needed.",
        ["Email label", "email input", "Help text"],
      ],
      [
        "Report",
        "Validation marks the control invalid and links a concrete correction to it.",
        ["aria-invalid: true", "email-error", "Expected address format"],
      ],
      [
        "Recover",
        "After correction, update validity and remove the stale error while keeping the entered address.",
        ["User corrects address", "Revalidate", "Clear invalid state"],
      ],
    ],
    "Red borders alone do not explain a failure. Do not erase all user input after a failed submission or leave aria-invalid true after correction.",
    "What should happen to the error text when the address is fixed?",
    "Remove or update the error, clear aria-invalid, and keep only existing description IDs. Confirm the result with keyboard and screen-reader testing.",
    mdn("Learn_web_development/Extensions/Forms"),
  ),
  "media--audio-and-video": L(
    "Native media elements provide playback controls, while alternatives make their information available more widely.",
    [
      "Use audio or video with controls and supported source formats. A preload value is a hint, not a guarantee. Avoid autoplay that surprises users or competes with assistive technology.",
      "Captions synchronize spoken words and relevant sounds with video. Transcripts provide a text alternative, and visual-only information may require description. Supply the actual media and track files referenced by the example.",
    ],
    `<video controls width="640" height="360" preload="metadata">\n  <source src="lesson.mp4" type="video/mp4">\n  <track kind="captions" src="lesson-en.vtt" srclang="en" label="English" default>\n  <p>Your browser cannot play this video.</p>\n</video>\n<p><a href="lesson-transcript.html">Read the lesson transcript</a></p>`,
    [
      [
        "Discover",
        "The browser chooses a supported source and may load metadata such as duration.",
        ["source: lesson.mp4", "Metadata", "Native controls"],
      ],
      [
        "Play",
        "The user starts playback and can enable the caption track.",
        ["User activates play", "Audio + video", "Synchronized captions"],
      ],
      [
        "Use alternative",
        "The transcript link provides an independent reading path to the lesson content.",
        ["Transcript link", "Text document", "Same information"],
      ],
    ],
    "A track element does not create captions; the WebVTT file must exist and be accurate. Fallback text alone is not a full transcript.",
    "How would you support learners who cannot hear the audio?",
    "Provide accurate synchronized captions and a transcript. Include meaningful non-speech sounds, not only dialogue.",
    html("Reference/Elements/video"),
  ),
  "media--responsive-images": L(
    "Responsive image markup lets the browser select an appropriate source for the display context.",
    [
      "srcset with width descriptors lists intrinsic image widths. sizes describes the rendered slot width; the browser combines that with pixel density and other factors to choose a source.",
      "picture supports art direction or format alternatives, while its img remains the fallback and holds the alt text. CSS sizing still controls layout; source selection does not replace it.",
    ],
    `<img src="diagram-800.png"\n     srcset="diagram-400.png 400w, diagram-800.png 800w, diagram-1200.png 1200w"\n     sizes="(max-width: 600px) 100vw, 600px"\n     width="1200" height="675"\n     style="max-width:100%;height:auto"\n     alt="Three stages of the browser rendering pipeline">`,
    [
      [
        "Measure slot",
        "On a 500 CSS-pixel viewport, sizes describes a slot about 500 CSS pixels wide.",
        ["Viewport: 500px", "100vw slot", "Target: 500 CSS px"],
      ],
      [
        "Consider density",
        "A density of two device pixels per CSS pixel suggests a source around 1000 pixels wide.",
        ["Slot: 500", "Density: 2", "Target: about 1000"],
      ],
      [
        "Choose source",
        "The browser chooses among available candidates; exact selection remains a browser decision.",
        ["400w / 800w / 1200w", "Candidate evaluation", "One source loaded"],
      ],
    ],
    "Do not label a 400-pixel file as 800w or make sizes disagree with the actual layout. These mistakes can waste bandwidth or blur images.",
    "When is picture preferable to merely adding more srcset widths?",
    "Use picture when the composition should change, such as a close crop on narrow screens, or when offering alternate formats with fallback.",
    html("Guides/Responsive_images"),
  ),
  "media--iframes": L(
    "An iframe embeds a separate browsing context with its own document and security boundary.",
    [
      "Give the frame a title explaining its purpose. Reserve space to reduce layout shifts and use lazy loading for noncritical offscreen embeds.",
      "sandbox removes capabilities unless explicitly allowed. Cross-origin frames cannot be freely inspected by the parent. Communication through postMessage requires validating origin and message shape.",
    ],
    `<iframe src="/embed/lesson-summary.html"\n  title="Lesson summary preview"\n  width="640" height="360" loading="lazy"\n  sandbox referrerpolicy="no-referrer">\n</iframe>`,
    [
      [
        "Create context",
        "The browser creates a separate document inside the reserved rectangle.",
        ["Parent document", "iframe boundary", "Embedded document"],
      ],
      [
        "Restrict",
        "An empty sandbox applies restrictions, including blocking scripts and form submissions.",
        ["sandbox present", "Restricted capabilities", "Static preview works"],
      ],
      [
        "Load deliberately",
        "Lazy loading can defer the request until the frame approaches the viewport.",
        ["Offscreen frame", "Browser loading policy", "Fetch when needed"],
      ],
    ],
    "Do not grant every sandbox capability without a reason. Combining allow-scripts and allow-same-origin for same-origin content can undermine the sandbox.",
    "Why might an interactive widget stop working in this frame?",
    "The empty sandbox blocks scripting and other capabilities. Add only the specific permissions the trusted widget needs after reviewing its behavior.",
    html("Reference/Elements/iframe"),
  ),
  "media--svg-basics": L(
    "SVG describes shapes in a scalable coordinate system and keeps those shapes as document elements.",
    [
      "viewBox defines the internal coordinates mapped into the rendered viewport. Basic shapes include rect, circle, line, and path. Vector geometry scales without raster pixelation.",
      "Give informative SVG an accessible name and, when useful, a description. Decorative icons can be hidden from accessibility APIs when an adjacent label already supplies meaning.",
    ],
    `<svg viewBox="0 0 200 80" width="400" role="img" aria-labelledby="flow-title">\n  <title id="flow-title">Input flows to output</title>\n  <rect x="10" y="20" width="60" height="40" fill="#dbeafe"/>\n  <line x1="70" y1="40" x2="130" y2="40" stroke="currentColor"/>\n  <rect x="130" y="20" width="60" height="40" fill="#dcfce7"/>\n  <text x="20" y="45">Input</text><text x="135" y="45">Output</text>\n</svg>`,
    [
      [
        "Coordinates",
        "The drawing uses 200 by 80 internal units regardless of its final CSS size.",
        ["viewBox: 200 × 80", "Internal geometry", "Stable proportions"],
      ],
      [
        "Compose",
        "Two rectangles and a line form a simple relationship diagram, with text naming the endpoints.",
        ["Input box", "Connector line", "Output box"],
      ],
      [
        "Scale",
        "A 400-pixel width scales the internal drawing while retaining shape boundaries.",
        ["200 internal units", "400 rendered pixels", "Scale factor: 2"],
      ],
    ],
    "A shape is not automatically a button. If SVG is interactive, implement keyboard access and clear names, or use native controls around it.",
    "What happens when the rendered width is reduced to 200?",
    "The diagram becomes smaller while preserving its coordinate relationships. The viewBox remains unchanged and maps into the new viewport.",
    mdn("Web/SVG/Tutorials/SVG_from_scratch"),
  ),
  "media--canvas-basics": L(
    "Canvas is a drawing surface whose pixels are controlled by script rather than individual shape elements.",
    [
      "Set width and height attributes for the drawing buffer. CSS dimensions control display size and can stretch that buffer. High-density displays may require scaling the buffer and drawing coordinates.",
      "Canvas drawings do not expose each shape as semantic HTML. Keep important data and interactions in accessible DOM content, and provide a text alternative for the visual.",
    ],
    `<canvas id="progress" width="300" height="80" role="img"\n  aria-label="Study progress: 60 percent">Study progress: 60 percent.</canvas>\n<script>\n  const canvas = document.querySelector('#progress');\n  const ctx = canvas.getContext('2d');\n  if (ctx) {\n    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, 20, 300, 40);\n    ctx.fillStyle = '#2563eb'; ctx.fillRect(0, 20, 180, 40);\n  }\n</script>`,
    [
      [
        "Allocate",
        "The width and height attributes create a 300 by 80 pixel drawing buffer.",
        ["canvas element", "300 × 80 buffer", "2D context"],
      ],
      [
        "Draw track",
        "The first rectangle paints the full 300-pixel progress track.",
        ["x=0, y=20", "width=300", "Track painted"],
      ],
      [
        "Draw value",
        "The second rectangle covers 180 pixels, representing 60 percent of the track.",
        ["180 ÷ 300", "60%", "Foreground painted"],
      ],
    ],
    "Changing CSS size alone can blur the drawing. Do not assume pixels provide accessible names or keyboard targets for chart data.",
    "How many pixels should the foreground use for 75 percent progress?",
    "Use 225 of the 300 pixels and update the accessible text to 75 percent. Visual and textual representations should remain consistent.",
    mdn("Web/API/Canvas_API/Tutorial"),
  ),
  "accessibility--landmarks": L(
    "Landmarks help users jump between major page regions without traversing every link and paragraph.",
    [
      "Native main, nav, and appropriate top-level header and footer elements expose useful regions. Landmark behavior depends on context; a header inside an article is not the site banner.",
      "Give repeated landmarks distinct accessible names, such as Primary and Course navigation. Keep the number of landmarks meaningful rather than wrapping every small component in a named region.",
    ],
    `<header><a href="/">Study desk</a></header>\n<nav aria-label="Primary"><a href="/courses">Courses</a></nav>\n<main id="main"><h1>HTML course</h1><p>Start learning.</p></main>\n<nav aria-label="Lesson pages"><a href="/next">Next lesson</a></nav>\n<footer><a href="/help">Help</a></footer>`,
    [
      [
        "Identify",
        "Site chrome, primary content, and supporting navigation form distinct responsibilities.",
        ["Banner", "Main", "Content information"],
      ],
      [
        "Disambiguate",
        "The two navigation regions have different names so users can choose the correct one.",
        ["Navigation: Primary", "Navigation: Lesson pages", "Distinct names"],
      ],
      [
        "Jump",
        "Landmark navigation can move directly to main and bypass repeated site links.",
        ["Landmark chooser", "Main selected", "Course content"],
      ],
    ],
    "Multiple unnamed navigation regions are difficult to distinguish. Do not add redundant role attributes when native semantics already provide the intended role.",
    'Should every paragraph receive role="region"?',
    "No. Landmarks should represent major regions. Excessive regions make navigation noisy and less useful.",
    mdn("Web/Accessibility/ARIA/Reference/Roles/landmark_role"),
  ),
  "accessibility--heading-hierarchy": L(
    "A heading hierarchy acts as a readable outline for both visual readers and assistive technology.",
    [
      "Use one clear page heading and nested levels for subsections. Heading text should describe the section that follows, not merely provide a decorative label.",
      "A subsection under h2 normally uses h3; a new peer section returns to h2. CSS controls visual size, so a lower-level heading need not look smaller in every design.",
    ],
    `<h1>CSS course</h1>\n<h2>Layout</h2>\n<h3>Flexbox</h3><p>One-dimensional alignment.</p>\n<h3>Grid</h3><p>Rows and columns.</p>\n<h2>Responsive design</h2>\n<h3>Media queries</h3><p>Adapt to the viewport.</p>`,
    [
      [
        "Root",
        "The h1 defines the overall subject of the page.",
        ["h1", "CSS course", "Page subject"],
      ],
      [
        "Branch",
        "Layout and Responsive design are peer sections under that subject.",
        ["CSS course", "h2: Layout", "h2: Responsive design"],
      ],
      [
        "Nest",
        "Flexbox and Grid are peers within Layout, while Media queries belongs to Responsive design.",
        ["Layout", "h3: Flexbox", "h3: Grid"],
      ],
    ],
    "Do not use a bold paragraph as a heading or skip levels to get a particular font size. Inspect the heading list independently of appearance.",
    "Add a subsection called Grid placement inside Grid. Which level should it use?",
    "Use h4 because Grid is h3. A later peer topic under Layout should return to h3.",
    html("Reference/Elements/Heading_Elements"),
  ),
  "accessibility--keyboard-navigation": L(
    "Keyboard users need a logical focus order, visible focus, and controls that operate without a pointer.",
    [
      "Native links and buttons participate in keyboard navigation automatically. DOM order normally determines Tab order, so keep it aligned with visual and reading order.",
      'tabindex="0" adds an element to sequential focus; -1 permits programmatic focus without adding a Tab stop. Positive tabindex values create a separate ordering scheme that is difficult to maintain.',
    ],
    `<a href="#main">Skip to main content</a>\n<nav aria-label="Primary"><a href="/courses">Courses</a></nav>\n<main id="main" tabindex="-1">\n  <h1>Practice</h1>\n  <button type="button">Check answer</button>\n</main>\n<style>:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }</style>`,
    [
      [
        "Enter",
        "Tab first reaches the skip link, giving a route past repeated navigation.",
        ["Tab", "Skip link", "Visible focus"],
      ],
      [
        "Move",
        "Subsequent Tab presses follow the normal document order of interactive elements.",
        ["Course link", "Check answer button", "Next control"],
      ],
      [
        "Activate",
        "Enter activates links; native buttons also support Space. No custom keyboard emulation is needed.",
        ["Focused native control", "Enter / Space", "Expected action"],
      ],
    ],
    "Do not remove outlines without a replacement or use tabindex to compensate for a scrambled DOM. Custom widgets require explicit keyboard behavior.",
    "Test the page using only Tab, Shift+Tab, Enter, and Space. What should you record?",
    "Check that every action is reachable, focus remains visible, the order makes sense, and no component traps focus unexpectedly.",
    mdn("Web/HTML/Reference/Global_attributes/tabindex"),
  ),
  "accessibility--aria-fundamentals": L(
    "ARIA describes roles, names, and states when native HTML alone does not express the interaction.",
    [
      "Prefer native controls first. ARIA changes accessibility information; it does not add keyboard behavior, validation, focus management, or styling by itself.",
      "Accessible names identify controls, states describe current conditions, and relationships connect elements. Keep aria-expanded, aria-selected, and similar states synchronized with visible behavior.",
    ],
    `<button type="button" id="toggle" aria-expanded="false" aria-controls="details">\n  Show lesson details\n</button>\n<div id="details" hidden>Practice for fifteen minutes.</div>\n<script>\n  const button = document.querySelector('#toggle');\n  const panel = document.querySelector('#details');\n  button.addEventListener('click', () => {\n    panel.hidden = !panel.hidden;\n    button.setAttribute('aria-expanded', String(!panel.hidden));\n  });\n</script>`,
    [
      [
        "Closed",
        "The panel is hidden and the control accurately reports a collapsed state.",
        ["hidden: true", "aria-expanded: false", "Details unavailable"],
      ],
      [
        "Activate",
        "A native button click toggles the panel and updates the corresponding ARIA state.",
        ["Button click", "Toggle hidden", "Update expanded"],
      ],
      [
        "Open",
        "The visible panel and accessibility state now agree.",
        ["hidden: false", "aria-expanded: true", "Details available"],
      ],
    ],
    'Adding role="button" to a div does not supply button behavior. An incorrect ARIA state can be more misleading than no enhancement.',
    "What breaks if the script updates hidden but never aria-expanded?",
    "Visual users see the panel change while assistive technology receives a stale state. Update both from the same source of truth.",
    mdn("Web/Accessibility/ARIA"),
  ),
  "accessibility--accessibility-testing": L(
    "Accessibility testing combines automated checks with manual interaction and content review.",
    [
      "Automation can detect missing labels, some contrast problems, and invalid relationships. It cannot reliably decide whether alt text is meaningful or a complex workflow is understandable.",
      "Test keyboard operation, zoom and reflow, screen-reader names and announcements, and error recovery. Record the failing user action and expected outcome so fixes can be verified.",
    ],
    `<!-- A small test fixture -->\n<label for="topic">Topic</label>\n<input id="topic" name="topic">\n<button type="button">Save topic</button>\n\n<!-- Manual checks:\n1. Tab reaches input, then button.\n2. Label is announced with the input.\n3. Zoom does not hide the button or its text.\n4. Save feedback is perceivable. -->`,
    [
      [
        "Scan",
        "Run an automated audit and inspect specific findings instead of treating a score as proof.",
        ["Audit", "Possible violations", "Review findings"],
      ],
      [
        "Interact",
        "Use only the keyboard and test at a narrow viewport or high zoom.",
        ["Tab order", "Visible focus", "Content reflow"],
      ],
      [
        "Listen",
        "Check names, roles, state changes, and recovery with assistive technology.",
        ["Input: Topic", "Button: Save topic", "Result announced"],
      ],
    ],
    "A passing automated audit is not an accessibility guarantee. Do not test only the initial page while ignoring dialogs, errors, and loading states.",
    "Write a reproducible report for a save button that cannot be reached by keyboard.",
    "Include the route, initial state, Tab sequence, observed focus behavior, and expected reachable control. Retest the same sequence after the fix.",
    mdn("Learn_web_development/Core/Accessibility/Tooling"),
  ),
  "browser--metadata": L(
    "Metadata describes the document to browsers and other consumers without becoming its main visible content.",
    [
      "title identifies the page, description summarizes it, and charset defines decoding. The viewport declaration supports mobile layout. These fields serve different purposes and should match the actual page.",
      "Metadata is not a substitute for useful visible content. Keep page titles specific and descriptions concise; external consumers may choose their own presentation rather than using your text verbatim.",
    ],
    `<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>HTML forms | Study desk</title>\n  <meta name="description" content="Build labeled, validated HTML forms with practical examples.">\n</head>`,
    [
      [
        "Decode",
        "The character encoding makes text interpretation predictable.",
        ["Response bytes", "UTF-8 declaration", "Readable text"],
      ],
      [
        "Identify",
        "The page-specific title helps distinguish this tab from other lessons.",
        ["HTML forms", "Study desk", "Distinct tab title"],
      ],
      [
        "Summarize",
        "The description states what the page teaches without replacing its visible heading and content.",
        ["Description metadata", "Consumer reads it", "Possible preview text"],
      ],
    ],
    "Duplicating one generic title across all pages weakens orientation. Do not promise content in metadata that the page does not provide.",
    "Write a distinct title and description for a CSS Grid lesson.",
    "Use a title such as CSS Grid layout | Study desk and a description naming rows, columns, and placement examples. Keep both aligned with the actual lesson.",
    html("Reference/Elements/meta"),
  ),
  "browser--favicons-and-manifests": L(
    "Icons identify a site in browser surfaces; a web app manifest describes selected app-like presentation details.",
    [
      'A rel="icon" link points to an available icon resource. A manifest link points to JSON containing information such as name, icons, start_url, and display preference.',
      "Manifest files do not automatically create offline support or guarantee installability. Serve valid resources with appropriate types and test behavior in the browsers you support.",
    ],
    `<!-- In head; create the linked files -->\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\n<link rel="manifest" href="/app.webmanifest">\n\n<!-- app.webmanifest contents:\n{\n  "name": "Study desk",\n  "short_name": "Study",\n  "start_url": "/",\n  "display": "standalone",\n  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]\n}\n-->`,
    [
      [
        "Link",
        "The document points the browser to separate identity resources.",
        ["HTML head", "icon.svg", "app.webmanifest"],
      ],
      [
        "Read",
        "The browser parses manifest metadata and fetches suitable icon resources.",
        ["Name: Study desk", "Start URL: /", "Icon: 192px"],
      ],
      [
        "Present",
        "Supporting browser surfaces may use this metadata for an installed or saved application.",
        ["Browser capability", "Manifest preferences", "App presentation"],
      ],
    ],
    "Do not label a manifest as an offline cache. A service worker and an explicit caching strategy are separate concerns.",
    "What must change when hosting the application under /academy/?",
    "Review start_url, scope if supplied, and icon paths so they resolve to the intended deployment. Root-relative paths still begin at the origin root.",
    mdn("Web/Progressive_web_apps/Manifest"),
  ),
  "browser--data-attributes": L(
    "data-* attributes attach small application-specific values to existing elements.",
    [
      "The dataset API exposes data-lesson-id as dataset.lessonId. Attribute values are strings; parse numbers or structured data explicitly when needed.",
      "Use data attributes for behavior hooks or lightweight metadata. They do not replace visible text, semantic attributes, or an accessible name, and their contents are visible in the DOM.",
    ],
    `<button type="button" data-lesson-id="7">Open lesson seven</button>\n<script>\n  const button = document.querySelector('[data-lesson-id]');\n  button.addEventListener('click', () => {\n    const id = Number(button.dataset.lessonId);\n    console.log(id); // 7\n  });\n</script>`,
    [
      [
        "Attach",
        "The element keeps its native button semantics while receiving an application-specific identifier.",
        ["button", 'data-lesson-id="7"', "Visible label"],
      ],
      [
        "Read",
        "dataset translates the dashed attribute name into a camel-cased property.",
        ["data-lesson-id", "dataset.lessonId", 'String: "7"'],
      ],
      [
        "Convert",
        "Number converts the string for numeric operations; production code should validate the result if untrusted.",
        ['"7"', "Number conversion", "7"],
      ],
    ],
    "Do not store credentials in data attributes or assume dataset values are already numbers. Styling hooks should not become accidental authorization rules.",
    "What property reads data-course-name, and what type does it return?",
    "dataset.courseName returns a string when the attribute exists. A missing attribute yields undefined, so handle that case before using it.",
    html("How_to/Use_data_attributes"),
  ),
  "browser--loading-scripts": L(
    "Script loading strategy affects when parsing pauses and when code can safely use document elements.",
    [
      "A normal classic script executes when encountered and can block parsing. External classic scripts with defer execute after parsing in document order; async executes when ready without that ordering guarantee.",
      "Module scripts are deferred by default and use module scope. Use modules for import/export graphs, and choose async only when independent execution order is acceptable.",
    ],
    `<head>\n  <script src="analytics.js" async></script>\n  <script src="form-setup.js" defer></script>\n  <script type="module" src="app.js"></script>\n</head>\n<body><main id="app">Loading course content…</main></body>`,
    [
      [
        "Discover",
        "The parser discovers external scripts and the browser can download them while continuing to parse.",
        ["HTML parser", "Script downloads", "Parsing continues"],
      ],
      [
        "Schedule",
        "The async classic script runs when ready; the deferred script waits until parsing is complete.",
        ["async: readiness", "defer: after parse", "Different guarantees"],
      ],
      [
        "Initialize",
        "The deferred setup and module entry can access markup that has been parsed.",
        ["DOM constructed", "Application initialization", "Interactions attached"],
      ],
    ],
    "Do not assume async scripts execute in source order. Avoid placing dependencies in separate async scripts that expect each other to exist.",
    "Two classic scripts depend on source order and need the DOM. Which attribute fits?",
    "Use defer on both external scripts and keep their dependency order in the document. Alternatively, express dependencies with module imports.",
    html("Reference/Elements/script"),
  ),
  "browser--seo-fundamentals": L(
    "Search-friendly HTML makes the page understandable, discoverable, and consistent with its URL.",
    [
      "Use descriptive titles, visible headings, meaningful content, and crawlable links. The page should answer its topic rather than rely on metadata keywords or hidden text.",
      "A canonical link can identify a preferred URL among duplicates, but it is a signal rather than a guaranteed command. Correct status codes and server behavior matter alongside markup.",
    ],
    `<head>\n  <title>Build accessible HTML forms | Study desk</title>\n  <meta name="description" content="Learn labels, fieldsets, and helpful form validation.">\n  <link rel="canonical" href="https://example.com/lessons/html-forms">\n</head>\n<body>\n  <h1>Build accessible HTML forms</h1>\n  <p>Start with a visible label for every field.</p>\n  <a href="/lessons/form-validation">Next: form validation</a>\n</body>`,
    [
      [
        "Discover",
        "A real anchor exposes the next lesson URL without requiring a click handler to reveal it.",
        ["Crawlable link", "/lessons/form-validation", "Another document"],
      ],
      [
        "Understand",
        "The title, heading, and visible paragraph describe the same subject.",
        ["Title: accessible forms", "h1: accessible forms", "Relevant content"],
      ],
      [
        "Consolidate",
        "The canonical URL identifies the preferred version when equivalent pages exist.",
        ["Duplicate representations", "Canonical signal", "Preferred URL"],
      ],
    ],
    "Do not invent a canonical URL that points to a different topic. Replace example.com with the actual public origin before publishing.",
    "Why is an empty page with an excellent description still a poor result?",
    "Metadata cannot replace useful, accessible content. Users and crawlers need the actual explanation and navigable relationships between pages.",
    "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
  ),
  "patterns--article-page": L(
    "An article page needs a clear topic, reading structure, and meaningful supporting metadata.",
    [
      "Use article for the independent piece, a visible heading for its title, and sections for substantial subtopics. Keep publication details separate from the main prose.",
      "time can expose a machine-readable datetime while presenting a human-readable date. Figures, lists, and code should retain their own semantics inside the article.",
    ],
    `<main><article>\n  <header>\n    <h1>How browsers read HTML</h1>\n    <p>Published <time datetime="2026-09-22">22 September 2026</time></p>\n  </header>\n  <p>The browser turns markup into a document tree.</p>\n  <section><h2>Parsing</h2><p>Elements become nodes.</p></section>\n  <footer><a href="/authors/editor">About the author</a></footer>\n</article></main>`,
    [
      [
        "Orient",
        "The title and publication date help readers identify the piece before entering the body.",
        ["Article header", "Title", "Publication date"],
      ],
      [
        "Read",
        "The introduction leads into a named subsection with a logical heading level.",
        ["Introduction", "h2: Parsing", "Explanation"],
      ],
      [
        "Continue",
        "The article footer offers context related to the piece, distinct from a site-wide footer.",
        ["Article end", "Author link", "Related context"],
      ],
    ],
    "Do not promote every paragraph into a section or use headings only for visual emphasis. Keep the reading order meaningful without CSS.",
    "Add a References section and a code example. Which elements would you use?",
    "Use a section with h2 for References and a list of links. Use pre containing code for a multiline code example, escaping markup characters.",
    html("Reference/Elements/article"),
  ),
  "patterns--application-shell": L(
    "An application shell separates persistent navigation from the changing page content.",
    [
      "A shell often contains a site header, primary navigation, main region, and optional supporting sidebar. Keep one main content target so skip links and route changes have a predictable destination.",
      "Client routing changes visible content without a full navigation, so scripts must also update the document title and manage focus or announcements appropriately. Markup supplies the structure, not the routing behavior.",
    ],
    `<a href="#main">Skip to content</a>\n<header><a href="/">Study desk</a></header>\n<nav aria-label="Primary"><a href="/courses">Courses</a></nav>\n<div class="app-layout">\n  <aside aria-label="Course outline">Lesson navigation</aside>\n  <main id="main" tabindex="-1"><h1>Current lesson</h1></main>\n</div>`,
    [
      [
        "Persist",
        "The header and primary navigation remain familiar while the selected lesson changes.",
        ["Header", "Primary navigation", "Stable shell"],
      ],
      [
        "Replace content",
        "The main region is the destination for the current route or server-rendered page.",
        ["Selected lesson", "main region", "Current heading"],
      ],
      [
        "Orient again",
        "A client router should synchronize title and focus so a navigation change is perceivable.",
        ["Route changes", "Update title", "Focus or announce"],
      ],
    ],
    "A new route should not leave keyboard focus in a removed element. Do not duplicate main every time a view is mounted.",
    "Where should a skip link lead after navigating to another lesson?",
    "It should still target the single main region, whose content now represents the new lesson. Keep the target ID stable across routes.",
    html("Reference/Elements/main"),
  ),
  "patterns--navigation-menu": L(
    "Most website navigation is a list of links, optionally revealed by a disclosure button.",
    [
      "A nav with a list provides a clear group of destinations. A mobile disclosure button needs an expanded state and a relationship to the controlled list.",
      "Ordinary site navigation usually does not need ARIA menu roles, which imply additional application-style keyboard behavior. Preserve a useful baseline when scripts fail.",
    ],
    `<nav aria-label="Primary">\n  <button id="nav-toggle" type="button" hidden aria-expanded="true" aria-controls="nav-links">Sections</button>\n  <ul id="nav-links"><li><a href="/courses">Courses</a></li><li><a href="/practice">Practice</a></li></ul>\n</nav>\n<script>\n  const toggle = document.querySelector('#nav-toggle');\n  const links = document.querySelector('#nav-links');\n  toggle.hidden = false; links.hidden = true;\n  toggle.setAttribute('aria-expanded', 'false');\n  toggle.addEventListener('click', () => {\n    links.hidden = !links.hidden;\n    toggle.setAttribute('aria-expanded', String(!links.hidden));\n  });\n</script>`,
    [
      [
        "Baseline",
        "Without JavaScript, the links remain visible and the nonfunctional toggle stays hidden.",
        ["Links visible", "Toggle hidden", "Navigation works"],
      ],
      [
        "Enhance",
        "After setup succeeds, the script shows the toggle and starts with the links collapsed.",
        ["Script ready", "Toggle visible", "Links collapsed"],
      ],
      [
        "Disclose",
        "Activating the button reveals the list and synchronizes expanded state.",
        ["Button activation", "List visible", "aria-expanded: true"],
      ],
    ],
    'Do not hide all navigation in baseline HTML and rely on a script that may never load. Avoid role="menu" unless implementing its full interaction contract.',
    "What should happen when JavaScript is disabled?",
    "The links should remain directly usable. The example deliberately enhances a working list instead of making navigation depend on the toggle script.",
    html("Reference/Elements/nav"),
  ),
  "patterns--dialog-markup": L(
    "The native dialog element provides a foundation for modal interactions with browser-managed behavior.",
    [
      "showModal places a dialog in the top layer and makes the rest of the page inert. A dialog opened merely with the open attribute is nonmodal and has different behavior.",
      "Give the dialog a meaningful name and a clear close action. Choose initial focus deliberately, test Escape and focus restoration, and avoid opening dialogs for content that can live inline.",
    ],
    `<button id="open" type="button">View study tip</button>\n<dialog id="tip" aria-labelledby="tip-title">\n  <h2 id="tip-title">Study tip</h2>\n  <p>Practice one small example before moving on.</p>\n  <form method="dialog"><button autofocus>Close</button></form>\n</dialog>\n<script>\n  document.querySelector('#open').addEventListener('click', () => {\n    document.querySelector('#tip').showModal();\n  });\n</script>`,
    [
      [
        "Closed",
        "The dialog is not shown initially, while the opening button participates in normal focus order.",
        ["Open button", "Dialog closed", "Page usable"],
      ],
      [
        "Modal",
        "showModal opens the top-layer dialog; autofocus places focus on the close control in this small example.",
        ["Top layer", "Background inert", "Close button focused"],
      ],
      [
        "Return",
        "The dialog form closes the dialog. Verify focus returns to a sensible location such as the opener.",
        ["Close or Escape", "Dialog closes", "Resume page"],
      ],
    ],
    "Do not simulate modality with only a high z-index. A custom overlay must also handle focus, keyboard dismissal, and background interaction.",
    "Why is setting the open attribute not equivalent to showModal()?",
    "The open attribute displays a nonmodal dialog. showModal additionally establishes modal top-layer behavior and background inertness.",
    html("Reference/Elements/dialog"),
  ),
  "patterns--reusable-templates": L(
    "The template element stores inert markup that scripts can clone into the live document.",
    [
      "Template content is represented by a DocumentFragment and is not rendered until inserted. Cloning copies structure, so each instance can receive different text and attributes.",
      "Use textContent for untrusted strings rather than building HTML strings. Repeated instances need unique IDs when labels or relationships rely on IDs.",
    ],
    `<template id="lesson-template"><li><h2></h2><p></p></li></template>\n<ul id="lessons"></ul>\n<script>\n  const template = document.querySelector('#lesson-template');\n  const item = template.content.cloneNode(true);\n  item.querySelector('h2').textContent = 'HTML basics';\n  item.querySelector('p').textContent = 'Learn document structure.';\n  document.querySelector('#lessons').append(item);\n</script>`,
    [
      [
        "Store",
        "The template defines a reusable list item but does not itself add a visible lesson.",
        ["template", "Inert fragment", "No rendered row"],
      ],
      [
        "Clone",
        "A deep clone creates new nodes that can be populated independently.",
        ["cloneNode(true)", "New h2 + p", "Set safe text"],
      ],
      [
        "Insert",
        "Appending the fragment moves its children into the live list, making the lesson visible.",
        ["Fragment children", "ul#lessons", "Rendered lesson"],
      ],
    ],
    "Appending the original template content consumes its children. Clone it for repeated use, and avoid duplicated IDs across instances.",
    "How would you render three lessons without emptying the template?",
    "Clone template.content separately for each lesson, populate that clone, then append it. The original fragment remains available for the next iteration.",
    html("Reference/Elements/template"),
  ),
  "production--validation-and-debugging": L(
    "HTML debugging starts by comparing intended structure, source markup, and the DOM the browser actually created.",
    [
      "Browsers recover from malformed markup, sometimes moving or closing elements automatically. A page that looks acceptable can still contain a different tree from the one you intended.",
      "Use an HTML conformance checker for structural issues, then browser tools for the parsed DOM and accessibility tree. Fix the earliest structural error before chasing many downstream symptoms.",
    ],
    `<!-- Invalid pattern: a div cannot remain inside a paragraph -->\n<!-- <p>Introduction<div>Details</div></p> -->\n\n<!-- Correct structure -->\n<p>Introduction</p>\n<div>Details</div>`,
    [
      [
        "Inspect source",
        "The invalid example tries to put a flow container inside a paragraph.",
        ["p opens", "div appears", "Content model conflict"],
      ],
      [
        "Observe repair",
        "The HTML parser closes the paragraph before the div, so the DOM differs from the source nesting.",
        ["Parser recovery", "p becomes sibling", "div outside p"],
      ],
      [
        "Correct",
        "Explicitly separating the paragraph and container makes the intended DOM unambiguous.",
        ["Valid p", "Sibling div", "Predictable structure"],
      ],
    ],
    "Do not assume View Source and the Elements panel show identical structures. DOM mutations and parser recovery can explain differences.",
    "A CSS selector p > div never matches the invalid example. Why?",
    "The browser has repaired the markup so the div is no longer a child of the paragraph. Correct the HTML rather than increasing CSS specificity.",
    "https://validator.w3.org/nu/",
  ),
  "production--performance": L(
    "Efficient HTML helps the browser discover important resources early and avoid unnecessary layout shifts.",
    [
      "Give images dimensions, defer noncritical offscreen media, and avoid blocking scripts when they do not need to block. Important above-the-fold content should not wait behind optional embeds.",
      "Resource hints and fetch priority should reflect measured importance. Do not preload every asset or lazy-load the image most likely to be the main contentful image.",
    ],
    `<img src="course-cover.webp" width="960" height="540"\n     fetchpriority="high" alt="HTML course overview">\n<section><h2>Examples</h2>\n  <img src="example.webp" width="640" height="360"\n       loading="lazy" alt="Example document tree">\n</section>\n<script src="practice.js" defer></script>`,
    [
      [
        "Reserve",
        "Image dimensions establish space before image bytes arrive, reducing movement of surrounding text.",
        ["Known dimensions", "Reserved aspect ratio", "Stable layout"],
      ],
      [
        "Prioritize",
        "The likely important cover loads eagerly, with a priority hint the browser may use.",
        ["Cover image", "Eager request", "Important content"],
      ],
      [
        "Defer",
        "The offscreen example and deferred script avoid competing with parsing in the same way as blocking resources.",
        ["Below-fold image", "Lazy policy", "Later work"],
      ],
    ],
    "High priority on every resource removes the intended distinction. Measure a real page under constrained network and CPU conditions.",
    "Which image should you avoid lazy-loading when it dominates the first screen?",
    "The main above-the-fold content image should normally load eagerly. Confirm the effect using network and performance tools rather than relying on the attribute alone.",
    mdn("Web/Performance/Guides/Lazy_loading"),
  ),
  "production--security-considerations": L(
    "HTML security depends on keeping untrusted content from becoming executable markup or unsafe navigation.",
    [
      "Text insertion and HTML insertion are different operations. Use textContent for plain text; rich HTML needs a carefully maintained sanitization policy and context-aware handling.",
      "Embedded content, URL schemes, and script policies require separate controls. Content Security Policy is defense in depth, usually delivered as an HTTP header, and does not replace safe data handling.",
    ],
    `<p id="comment"></p>\n<script>\n  const userComment = '<img src=x onerror=alert(1)>';\n  document.querySelector('#comment').textContent = userComment;\n</script>\n<!-- The string appears as text; it is not parsed as an image element. -->`,
    [
      [
        "Receive",
        "Treat the comment as an untrusted string even if it came from your own database.",
        ["External input", "Untrusted string", "No trust assumption"],
      ],
      [
        "Insert safely",
        "textContent creates text instead of parsing tags and event handlers.",
        ["textContent assignment", "Text node", "No img created"],
      ],
      [
        "Render",
        "The browser displays literal characters. The embedded handler has no executable element to attach to.",
        ["Literal markup text", "No handler execution", "Comment remains data"],
      ],
    ],
    "Do not switch to innerHTML merely to preserve formatting. Never assume client-side validation prevents direct malicious requests.",
    "What additional work is needed if comments intentionally support rich HTML?",
    "Define allowed markup and URL schemes, sanitize with a maintained solution, and apply server-side validation and an appropriate CSP. Avoid homemade string replacements.",
    mdn("Web/Security/Attacks/XSS"),
  ),
  "production--progressive-enhancement": L(
    "Progressive enhancement starts with useful native behavior and adds convenience when capabilities are available.",
    [
      "A normal link or server-handled form can work before JavaScript loads. Enhancements should preserve that baseline and only take over when their required APIs are available.",
      "Feature detection checks capabilities directly. An enhancement failure should leave a recoverable experience rather than permanently hide content or disable the only way to complete the task.",
    ],
    `<form action="/search" method="get">\n  <label for="q">Search lessons</label>\n  <input id="q" name="q" type="search" required>\n  <button>Search</button>\n</form>\n<details><summary>Search tips</summary><p>Try a topic such as layout.</p></details>`,
    [
      [
        "Baseline",
        "The form submits to a real server route without needing a client framework.",
        ["User enters query", "Native GET form", "Server results"],
      ],
      [
        "Native enhancement",
        "The details element provides a disclosure using built-in browser behavior.",
        ["summary control", "Native toggle", "Tips revealed"],
      ],
      [
        "Optional script",
        "A later live-search feature can enhance this form while retaining a reliable submission path.",
        ["Detect capability", "Attach enhancement", "Keep fallback"],
      ],
    ],
    "The /search endpoint must exist; markup alone does not implement search. Do not preventDefault before establishing a working alternative.",
    "How would you verify the baseline before adding live suggestions?",
    "Disable JavaScript and submit a query. Confirm results are returned by the server, then enable the enhancement and test failures as well as success.",
    mdn("Glossary/Progressive_Enhancement"),
  ),
  "production--html-best-practices": L(
    "Production HTML should remain understandable, operable, and maintainable beyond its initial visual design.",
    [
      "Use meaningful native elements, unique IDs, explicit form labels, logical headings, and useful alternatives for media. These choices support readers, browser behavior, and future changes together.",
      "Review the actual rendered document, not only reusable source templates. Test invalid inputs, missing assets, narrow layouts, keyboard operation, and script failures as part of the page contract.",
    ],
    `<main id="main">\n  <h1>Weekly study plan</h1>\n  <section aria-labelledby="goal-title">\n    <h2 id="goal-title">Your goal</h2>\n    <p>Complete three lessons.</p>\n    <a href="/lessons">Choose a lesson</a>\n  </section>\n</main>`,
    [
      [
        "Structure",
        "A single primary region and meaningful headings establish the page outline.",
        ["main", "h1: Study plan", "h2: Your goal"],
      ],
      [
        "Operate",
        "The native link supports keyboard activation and browser navigation features.",
        ["Descriptive link", "Keyboard access", "Lesson destination"],
      ],
      [
        "Verify",
        "Inspect the generated DOM and test the experience without relying on its ideal loading state.",
        ["Rendered DOM", "Failure states", "Usable baseline"],
      ],
    ],
    "Avoid treating validation, accessibility, and performance as cosmetic cleanup. They influence markup choices from the start.",
    "Build a capstone article page with a table, image, and search form. What should your review cover?",
    "Check heading order, table headers, image alternatives and dimensions, labels and names, real link destinations, keyboard use, and the server form endpoint. Validate and inspect the rendered DOM.",
    html("Reference/Elements"),
  ),
};
