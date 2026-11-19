import { lesson, section } from "../schema.js";

export default section("regex", "Regular Expressions", [
  lesson("Regular Expressions in Java: Pattern and Matcher", {
    intro:
      "A regular expression (regex) is a pattern that describes text, used to validate input, search, extract and replace. Java supports regexes through `String.matches`, `replaceAll` and `split`, and the more powerful `Pattern` and `Matcher` classes. This lesson covers regex syntax, compiling patterns, finding matches, capturing groups, flags and replacement.",
    topics: [
      [
        "Syntax essentials",
        "Character classes: `[abc]`, `[a-z]`, `[^0-9]`; predefined: `\\d` digit, `\\w` word character, `\\s` whitespace (and `\\D`, `\\W`, `\\S`), `.` any character. Quantifiers: `*` (0+), `+` (1+), `?` (0 or 1), `{n}`, `{n,m}`. Anchors: `^`, `$`, `\\b` word boundary. Alternation `a|b` and grouping `( )`. In Java strings, backslashes are doubled: `\"\\\\d+\"`.",
      ],
      [
        "Pattern and Matcher",
        "`Pattern p = Pattern.compile(regex)` compiles once (reuse it, it is thread-safe); `Matcher m = p.matcher(text)` is per input (not thread-safe). `m.matches()` checks the whole text, `m.lookingAt()` the beginning, and `m.find()` searches for the next occurrence; `m.group()`, `m.start()` and `m.end()` describe the match. `p.matcher(text).results()` (Java 9) streams all matches.",
      ],
      [
        "Capturing groups",
        "Parentheses capture: `(\\d{4})-(\\d{2})` makes `group(1)` the year and `group(2)` the month. Named groups `(?<year>\\d{4})` are read with `group(\"year\")`. `(?:...)` groups without capturing.",
      ],
      [
        "Flags",
        "`Pattern.CASE_INSENSITIVE` (or inline `(?i)`), `MULTILINE` (`^` and `$` match at each line), `DOTALL` (`.` matches newlines), `COMMENTS` (allow whitespace and comments in the pattern) and `UNICODE_CHARACTER_CLASS`.",
      ],
      [
        "Replacing and splitting",
        "`text.replaceAll(regex, replacement)` with `$1` back-references to groups; `Matcher.replaceAll(Function<MatchResult, String>)` (Java 9) computes replacements; `Pattern.quote` escapes literal text; `split(regex)` and `Pattern.splitAsStream` break text apart. Greedy quantifiers take as much as possible; add `?` for reluctant (`.*?`).",
      ],
    ],
    code: String.raw`import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

public class Main {
    private static final Pattern DATE = Pattern.compile("(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})");   // compile once

    public static void main(String[] args) {
        System.out.println("String.matches whole text: " + "2026-11-19".matches("\\d{4}-\\d{2}-\\d{2}")
                + ", partial text: " + "on 2026-11-19".matches("\\d{4}-\\d{2}-\\d{2}"));

        String log = "deploy 2026-11-19 ok; rollback 2026-12-01 failed; retry 2027-01-05 ok";
        Matcher m = DATE.matcher(log);
        while (m.find()) {
            System.out.println("  found " + m.group() + " at " + m.start() + "-" + m.end()
                    + ", year " + m.group("year") + ", month " + m.group(2));
        }
        System.out.println("results() stream: " + DATE.matcher(log).results().map(MatchResult::group).toList());

        System.out.println("case-insensitive: " + Pattern.compile("ok", Pattern.CASE_INSENSITIVE).matcher("OK done").find()
                + ", inline (?i): " + "JAVA".matches("(?i)java"));
        String multi = "first line\nsecond line\nthird";
        System.out.println("MULTILINE ^\\w+ finds: " + Pattern.compile("^\\w+", Pattern.MULTILINE).matcher(multi).results().map(MatchResult::group).toList());

        System.out.println("replaceAll with groups: " + "2026-11-19".replaceAll("(\\d{4})-(\\d{2})-(\\d{2})", "$3/$2/$1"));
        System.out.println("computed replacement: " + Pattern.compile("\\d+").matcher("3 apples and 12 pears").replaceAll(r -> String.valueOf(Integer.parseInt(r.group()) * 2)));
        System.out.println("split on commas and spaces: " + Arrays.toString("a, b,c ,  d".split("\\s*,\\s*")));
        System.out.println("Pattern.quote for literal dots: " + "1.2.3".split(Pattern.quote(".")).length + " parts");

        String html = "<b>bold</b> and <i>italic</i>";
        System.out.println("greedy <.*>: " + firstMatch("<.*>", html) + " | reluctant <.*?>: " + firstMatch("<.*?>", html));

        Map<String, Long> wordCounts = Pattern.compile("\\W+").splitAsStream("To be, or not to be: that is it.".toLowerCase())
                .filter(w -> !w.isEmpty()).collect(Collectors.groupingBy(w -> w, TreeMap::new, Collectors.counting()));
        System.out.println("word counts via regex split: " + wordCounts);
        try {
            Pattern.compile("(unclosed");
        } catch (PatternSyntaxException e) {
            System.out.println("invalid regex -> PatternSyntaxException: " + e.getDescription());
        }
    }

    static String firstMatch(String regex, String text) {
        Matcher m = Pattern.compile(regex).matcher(text);
        return m.find() ? m.group() : "none";
    }
}`,
    walk:
      "`String.matches` requires the whole text to match, so a date with a prefix fails. A precompiled `Pattern` with named groups finds all three dates in a log with `find()`, reporting each match's position and its year and month groups; `results()` streams the same matches.\n\nFlags make matching case-insensitive or let `^` match at each line. `replaceAll` reorders date parts with `$3/$2/$1`, and the function form doubles every number. `split` with a regex trims around commas, `Pattern.quote` treats dots literally, and the greedy `<.*>` swallows the whole HTML string while the reluctant `<.*?>` stops at the first tag. A regex split counts words, and an unbalanced pattern throws `PatternSyntaxException`.",
    anim: [
      "Finding matches with Matcher",
      [
        ["pat", "Pattern", "compiled once"],
        ["mat", "Matcher", "per input"],
        ["find1", "find() #1", "2026-11-19"],
        ["find2", "find() #2", "2026-12-01"],
        ["groups", "group(\"year\")", "captured"],
      ],
      [
        ["pat", "mat", "matcher(text)", "A compiled Pattern creates a Matcher for one input string."],
        ["mat", "find1", "find", "find() scans forward and stops at the first match."],
        ["find1", "groups", "groups", "Named groups expose the year, month and day of that match."],
        ["find1", "find2", "find again", "The next find() continues after the previous match."],
      ],
    ],
    mistakes: [
      "Forgetting to double backslashes in Java strings (`\"\\d\"` is not valid; write `\"\\\\d\"`).",
      "Using `matches` when you meant to search (`find`).",
      "Recompiling the same Pattern in a loop instead of storing it in a static final field.",
      "Writing patterns with nested quantifiers like `(a+)+` that can take exponential time on bad input.",
    ],
    qa: [
      ["What is the difference between matches(), lookingAt() and find()?", "matches requires the entire input to match, lookingAt requires a match at the start, find searches for the next match anywhere."],
      ["Is Pattern thread-safe?", "Pattern is immutable and thread-safe; Matcher is not, so create one per thread or per use."],
      ["What is the difference between greedy and reluctant quantifiers?", "Greedy (.*) matches as much as possible; reluctant (.*?) matches as little as possible."],
    ],
    ex: [
      "Extract all email addresses from a paragraph using Pattern and Matcher.",
      "Use a simple pattern like `[\\\\w.+-]+@[\\\\w-]+\\\\.[\\\\w.]+`, call `matcher(text).results().map(MatchResult::group).toList()`.",
    ],
  }),

  lesson("Validating Strings: Numeric, Alphabetic, Special Characters and Alphanumeric", {
    intro:
      "Form inputs and data files constantly need checks: does a string contain a digit, is it only digits, does it contain a letter, only letters, any special characters, only special characters, or is it alphanumeric? This lesson implements each check with a regular expression and with plain character loops, and explains the edge cases (empty strings, spaces, Unicode).",
    topics: [
      [
        "Contains numeric / only numeric",
        "Contains a digit: `Pattern.compile(\"\\\\d\").matcher(s).find()` or `s.matches(\".*\\\\d.*\")`. Only digits: `s.matches(\"\\\\d+\")` (`+` rejects the empty string). Without regex: `s.chars().anyMatch(Character::isDigit)` or `allMatch`. To accept negative numbers or decimals, use `-?\\\\d+(\\\\.\\\\d+)?` or try `Double.parseDouble`.",
      ],
      [
        "Contains at least one letter / only letters",
        "At least one letter: `find` with `[a-zA-Z]` (ASCII) or `\\\\p{L}` (any Unicode letter). Only letters: `s.matches(\"[a-zA-Z]+\")` or `\"\\\\p{L}+\"`. `Character.isLetter` handles Unicode too.",
      ],
      [
        "Contains special characters / only special characters",
        "A special character is anything that is not a letter, digit or (usually) whitespace: `[^a-zA-Z0-9\\\\s]` (or `[^\\\\p{L}\\\\p{N}\\\\s]` for Unicode). Contains: `find` with that class. Only special characters: `s.matches(\"[^a-zA-Z0-9\\\\s]+\")`.",
      ],
      [
        "Alphanumeric",
        "Only letters and digits: `s.matches(\"[a-zA-Z0-9]+\")` or `\"[\\\\p{L}\\\\p{N}]+\"`. Requiring at least one letter and at least one digit (as password rules do) needs lookaheads: `^(?=.*[A-Za-z])(?=.*\\\\d)[A-Za-z\\\\d]+$`.",
      ],
      [
        "Edge cases",
        "Decide what the empty string, spaces and non-ASCII characters mean for your rule. `\\\\d` matches only ASCII digits unless `UNICODE_CHARACTER_CLASS` is set, while `Character.isDigit` accepts other scripts' digits such as Devanagari numerals.",
      ],
    ],
    code: String.raw`import java.util.List;
import java.util.regex.Pattern;

public class Main {
    static final Pattern ANY_DIGIT = Pattern.compile("\\d");
    static final Pattern ANY_LETTER = Pattern.compile("[a-zA-Z]");
    static final Pattern ANY_SPECIAL = Pattern.compile("[^a-zA-Z0-9\\s]");

    static boolean containsNumeric(String s) { return ANY_DIGIT.matcher(s).find(); }
    static boolean onlyNumeric(String s) { return s.matches("\\d+"); }
    static boolean containsLetter(String s) { return ANY_LETTER.matcher(s).find(); }
    static boolean onlyLetters(String s) { return s.matches("[a-zA-Z]+"); }
    static boolean containsSpecial(String s) { return ANY_SPECIAL.matcher(s).find(); }
    static boolean onlySpecial(String s) { return s.matches("[^a-zA-Z0-9\\s]+"); }
    static boolean alphanumeric(String s) { return s.matches("[a-zA-Z0-9]+"); }
    static boolean lettersAndDigits(String s) { return s.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$"); }

    static boolean onlyNumericLoop(String s) {                 // without regex
        if (s.isEmpty()) return false;
        for (char c : s.toCharArray()) if (c < '0' || c > '9') return false;
        return true;
    }

    public static void main(String[] args) {
        List<String> inputs = List.of("12345", "abc", "abc123", "Hello World", "@#$%", "pass@123", "", "   ");
        System.out.printf("%-13s %-8s %-8s %-8s %-8s %-8s %-8s %-8s %-8s%n",
                "input", "hasNum", "onlyNum", "hasAlpha", "onlyAlp", "hasSpec", "onlySpec", "alnum", "alpha+num");
        for (String s : inputs) {
            System.out.printf("%-13s %-8b %-8b %-8b %-8b %-8b %-8b %-8b %-8b%n", "\"" + s + "\"",
                    containsNumeric(s), onlyNumeric(s), containsLetter(s), onlyLetters(s),
                    containsSpecial(s), onlySpecial(s), alphanumeric(s), lettersAndDigits(s));
        }

        System.out.println("loop version agrees for all inputs: " + inputs.stream().allMatch(s -> onlyNumeric(s) == onlyNumericLoop(s)));
        System.out.println("chars().allMatch(Character::isLetter) for \"Java\": " + "Java".chars().allMatch(Character::isLetter));

        String hindi = "\u0928\u092E\u0938\u094D\u0924\u0947";              // a Hindi word
        String devanagariDigits = "\u0967\u0968\u0969";                     // Devanagari numerals 1 2 3
        System.out.println("ASCII [a-zA-Z]+ on Hindi word: " + onlyLetters(hindi) + ", Unicode \\p{L}\\p{M}+: " + hindi.matches("[\\p{L}\\p{M}]+"));
        System.out.println("\\d+ on Devanagari digits: " + devanagariDigits.matches("\\d+")
                + ", Character.isDigit: " + devanagariDigits.chars().allMatch(Character::isDigit)
                + ", with UNICODE_CHARACTER_CLASS: " + Pattern.compile("\\d+", Pattern.UNICODE_CHARACTER_CLASS).matcher(devanagariDigits).matches());
        System.out.println("decimal number check \"-12.75\": " + "-12.75".matches("-?\\d+(\\.\\d+)?"));
    }
}`,
    walk:
      "Each check is a small method backed by a regex: `find` for \"contains\" questions and `matches` (whole string) for \"only\" questions. The table shows the results for typical inputs. \"pass@123\" contains digits, letters and a special character and is not alphanumeric; the empty string and spaces fail every \"only\" check because `+` requires at least one character and spaces are excluded from the special class.\n\nThe loop version of the numeric check agrees with the regex. The Unicode lines show the edge cases: `[a-zA-Z]` rejects a Hindi word while `\\p{L}\\p{M}` (letters plus combining marks) accepts it, and `\\d` accepts Devanagari digits only with `UNICODE_CHARACTER_CLASS`, whereas `Character.isDigit` accepts them by default.",
    anim: [
      "contains vs only",
      [
        ["input", "\"abc123\"", "input"],
        ["find", "find(\\d)", "contains?"],
        ["yes", "true", "found '1'"],
        ["match", "matches(\\d+)", "only?"],
        ["no", "false", "'a' fails"],
      ],
      [
        ["input", "find", "search", "find() looks for a digit anywhere in the string."],
        ["find", "yes", "hit", "It finds '1', so 'contains numeric' is true."],
        ["input", "match", "whole", "matches() requires the entire string to be digits."],
        ["match", "no", "fail", "The letter 'a' breaks the match, so 'only numeric' is false."],
      ],
    ],
    mistakes: [
      "Using `matches(\"\\\\d\")` to test for containment (it only matches a single-digit string).",
      "Using `*` instead of `+`, which accepts the empty string as \"only digits\".",
      "Ignoring Unicode letters and digits in international applications.",
    ],
    qa: [
      ["How do you check if a String contains only digits?", "s.matches(\"\\\\d+\") or s.chars().allMatch(Character::isDigit) with a non-empty check."],
      ["How do you check if a String contains a special character?", "Pattern.compile(\"[^a-zA-Z0-9\\\\s]\").matcher(s).find()."],
      ["How do you require both letters and digits?", "Use lookaheads: ^(?=.*[A-Za-z])(?=.*\\\\d)[A-Za-z\\\\d]+$."],
    ],
    ex: [
      "Write one regex for a password that is 8 to 20 characters long with at least one upper-case letter, one lower-case letter, one digit and one special character.",
      "`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)(?=.*[^a-zA-Z0-9]).{8,20}$`.",
    ],
  }),
]);
