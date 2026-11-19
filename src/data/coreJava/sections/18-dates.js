import { lesson, section } from "../schema.js";

export default section("dates", "Dates and Time", [
  lesson("Date, Calendar and GregorianCalendar: Creating Dates and Reading Fields", {
    intro:
      "Before Java 8, dates were handled by `java.util.Date`, `Calendar` and `GregorianCalendar`. Huge amounts of existing code still use them, so you need to know how they work, including their quirks. This lesson creates dates with all three classes, reads year, month, day, hour, minute and second, and converts between Calendar and Date.",
    topics: [
      [
        "java.util.Date",
        "A `Date` is just an instant: milliseconds since 1970-01-01T00:00:00Z (the epoch). `new Date()` is now; `new Date(millis)` a specific instant; `getTime()` returns the millis. Its `toString()` prints in the JVM's default time zone, which misleads people into thinking a Date has a zone. Most of its other methods (`getYear`, `getMonth`) are deprecated. It is mutable.",
      ],
      [
        "Calendar and GregorianCalendar",
        "`Calendar` is an abstract class that converts an instant to calendar fields in a time zone; `Calendar.getInstance()` returns a `GregorianCalendar` for most locales. Read fields with `get(Calendar.YEAR)`, `MONTH`, `DAY_OF_MONTH`, `HOUR_OF_DAY`, `MINUTE`, `SECOND`, `DAY_OF_WEEK`. It is mutable and not thread-safe.",
      ],
      [
        "The zero-based month trap",
        "`Calendar.MONTH` is zero-based: January is 0 and December is 11, so add 1 for display. Use the constants `Calendar.JANUARY` and so on. `DAY_OF_WEEK` runs from `SUNDAY` (1) to `SATURDAY` (7).",
      ],
      [
        "Converting between Calendar and Date",
        "Calendar to Date: `calendar.getTime()`. Date to Calendar: `calendar.setTime(date)`. Millis: `calendar.getTimeInMillis()` and `setTimeInMillis`. To and from the modern API: `date.toInstant()`, `Date.from(instant)` and `gregorianCalendar.toZonedDateTime()`.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        TimeZone ist = TimeZone.getTimeZone("Asia/Kolkata");
        TimeZone.setDefault(ist);                                  // make toString predictable

        Date epoch = new Date(0);
        Date launch = new Date(1_700_000_000_000L);                // a fixed instant
        System.out.println("Date(0) millis " + epoch.getTime() + ", printed in default zone: " + epoch);
        System.out.println("launch instant: " + launch + " (" + launch.getTime() + " ms since epoch)");

        Calendar cal = Calendar.getInstance(ist);
        cal.setTime(launch);                                       // Date -> Calendar
        System.out.println("Calendar.getInstance() is a " + cal.getClass().getSimpleName());
        System.out.println("year " + cal.get(Calendar.YEAR)
                + ", month (0-based!) " + cal.get(Calendar.MONTH) + " -> display " + (cal.get(Calendar.MONTH) + 1)
                + ", day " + cal.get(Calendar.DAY_OF_MONTH));
        System.out.println("hour " + cal.get(Calendar.HOUR_OF_DAY) + ", minute " + cal.get(Calendar.MINUTE)
                + ", second " + cal.get(Calendar.SECOND) + ", day of week " + cal.get(Calendar.DAY_OF_WEEK) + " (1 = Sunday)");

        GregorianCalendar greg = new GregorianCalendar(ist);
        greg.setTimeInMillis(launch.getTime());
        System.out.println("GregorianCalendar leap year 2024: " + greg.isLeapYear(2024) + ", 2023: " + greg.isLeapYear(2023));

        Date back = greg.getTime();                                // Calendar -> Date
        System.out.println("Calendar -> Date round trip equal: " + back.equals(launch));

        System.out.println("Date -> Instant: " + launch.toInstant() + " (always UTC)");
        System.out.println("GregorianCalendar -> ZonedDateTime: " + greg.toZonedDateTime());

        launch.setTime(0);                                         // Date is mutable
        System.out.println("Date is mutable, launch is now: " + launch.getTime());
    }
}`,
    walk:
      "The default time zone is set to Asia/Kolkata so the output is reproducible. `new Date(0)` is the epoch; printed in IST it shows 05:30 on 1 January 1970, because `toString` converts the instant to the default zone. A fixed instant, 1,700,000,000,000 ms, becomes the launch date.\n\nA `Calendar` set to that instant reports its fields; the month comes back as 10, which means November because months are zero-based. `GregorianCalendar` adds helpers such as `isLeapYear`. `getTime()` converts back to an equal `Date`, and the bridges to the modern API give an `Instant` in UTC and a `ZonedDateTime`. Finally `setTime` mutates the Date in place.",
    anim: [
      "One instant, many views",
      [
        ["millis", "1700000000000", "ms since epoch"],
        ["date", "Date", "just the instant"],
        ["zone", "Asia/Kolkata", "time zone"],
        ["cal", "Calendar", "year, month..."],
        ["fields", "2023-11-15", "10 = November"],
      ],
      [
        ["millis", "date", "wrap", "A Date stores nothing but the milliseconds since the epoch."],
        ["date", "cal", "setTime", "A Calendar takes that instant..."],
        ["zone", "cal", "zone", "...and a time zone, because fields depend on where you are."],
        ["cal", "fields", "get()", "get() returns fields; MONTH is zero-based, so 10 means November."],
      ],
    ],
    mistakes: [
      "Forgetting that `Calendar.MONTH` is zero-based.",
      "Believing a `Date` has a time zone because of how `toString` prints it.",
      "Sharing mutable Date or Calendar objects between threads or returning them from getters.",
    ],
    qa: [
      ["What does java.util.Date represent?", "An instant in time as milliseconds since the Unix epoch; it has no time zone of its own."],
      ["What is the value of Calendar.JANUARY?", "0. Months in Calendar are zero-based."],
      ["How do you convert between Calendar and Date?", "calendar.getTime() returns a Date; calendar.setTime(date) sets the Calendar from a Date."],
      ["Why was java.time introduced?", "Date and Calendar are mutable, not thread-safe, have zero-based months, confusing APIs and poor time zone handling."],
    ],
    ex: [
      "Using Calendar, print the name of the weekday for the launch instant.",
      "`cal.getDisplayName(Calendar.DAY_OF_WEEK, Calendar.LONG, Locale.ENGLISH)` returns \"Wednesday\" (day of week 4).",
    ],
  }),

  lesson("Forming Dates Manually: Date Constructors, GregorianCalendar and set()", {
    intro:
      "Often you need a specific date such as 15 August 1947 or the first day of next month. With the legacy API you build it with a `GregorianCalendar` constructor or with `Calendar.set`, and convert to a `Date`. This lesson covers each way, the lenient overflow behaviour of `set`, and how to clear the time part.",
    topics: [
      [
        "Date constructors",
        "`new Date(millis)` is the only non-deprecated way. The old `new Date(year - 1900, month, day)` constructor is deprecated: the year is offset by 1900 and the month is zero-based, a classic source of bugs.",
      ],
      [
        "GregorianCalendar constructors",
        "`new GregorianCalendar(year, month, day)` or `(year, month, day, hour, minute, second)` builds a date in the default zone; pass the month with constants (`Calendar.AUGUST`). Construct with a `TimeZone` first if you need another zone, then use set.",
      ],
      [
        "Calendar.set()",
        "`cal.set(Calendar.YEAR, 2026)` sets one field; `cal.set(year, month, day)` and `set(year, month, day, hour, minute, second)` set several. Call `cal.clear()` first (or set `MILLISECOND` to 0) so leftover time fields from \"now\" do not leak in.",
      ],
      [
        "Leniency",
        "Calendars are lenient by default: `set(2026, Calendar.JANUARY, 32)` silently becomes 1 February. This is occasionally handy for arithmetic but usually hides bugs. `setLenient(false)` makes invalid values throw `IllegalArgumentException` when fields are next computed.",
      ],
    ],
    code: String.raw`import java.text.SimpleDateFormat;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        @SuppressWarnings("deprecation")
        Date oldStyle = new Date(47, 7, 15);                          // year - 1900 and 0-based month
        System.out.println("deprecated new Date(47, 7, 15): " + fmt.format(oldStyle));

        Calendar independence = new GregorianCalendar(1947, Calendar.AUGUST, 15);
        System.out.println("GregorianCalendar(1947, AUGUST, 15): " + fmt.format(independence.getTime()));

        Calendar meeting = new GregorianCalendar(2026, Calendar.NOVEMBER, 19, 14, 30, 0);
        System.out.println("with time: " + fmt.format(meeting.getTime()));

        Calendar built = Calendar.getInstance();
        built.clear();                                                 // remove "now" values
        built.set(2026, Calendar.MARCH, 1);
        built.set(Calendar.HOUR_OF_DAY, 9);
        System.out.println("clear() + set(): " + fmt.format(built.getTime()) + ", millis field " + built.get(Calendar.MILLISECOND));

        Calendar firstOfNextMonth = new GregorianCalendar(2026, Calendar.DECEMBER, 25);
        firstOfNextMonth.set(Calendar.DAY_OF_MONTH, 1);
        firstOfNextMonth.add(Calendar.MONTH, 1);
        System.out.println("first day of the month after December 2026: " + new SimpleDateFormat("yyyy-MM-dd").format(firstOfNextMonth.getTime()));

        Calendar lenient = new GregorianCalendar(2026, Calendar.JANUARY, 32);
        System.out.println("lenient January 32 becomes: " + new SimpleDateFormat("yyyy-MM-dd").format(lenient.getTime()));

        Calendar strict = new GregorianCalendar();
        strict.setLenient(false);
        strict.clear();
        strict.set(2026, Calendar.FEBRUARY, 30);
        try {
            strict.getTime();
        } catch (IllegalArgumentException e) {
            System.out.println("non-lenient February 30 -> IllegalArgumentException: " + e.getMessage());
        }
    }
}`,
    walk:
      "The deprecated constructor needs year 47 (1947 minus 1900) and month 7 for August, which shows why it was abandoned. The `GregorianCalendar` constructor with `Calendar.AUGUST` reads far better, and a second constructor adds hours, minutes and seconds.\n\n`clear()` followed by `set` builds a date without leftover fields from the current moment, so the milliseconds are 0. Setting the day to 1 and adding a month gives the first of the next month, rolling over into 2027. Leniency turns January 32 into 1 February, while a non-lenient calendar rejects February 30 with `IllegalArgumentException` naming the bad field.",
    anim: [
      "Building a date with Calendar",
      [
        ["inst", "getInstance()", "now"],
        ["clear", "clear()", "all fields unset"],
        ["set", "set(y, m, d)", "2026, MARCH, 1"],
        ["hour", "set(HOUR, 9)", "time field"],
        ["date", "getTime()", "Date"],
      ],
      [
        ["inst", "clear", "reset", "A new Calendar holds the current time; clear() removes every field."],
        ["clear", "set", "fill", "set(year, month, day) fills in the date with a zero-based month constant."],
        ["set", "hour", "fill", "Individual fields such as HOUR_OF_DAY are set separately."],
        ["hour", "date", "compute", "getTime() computes the instant from the fields and returns a Date."],
      ],
    ],
    mistakes: [
      "Using the deprecated Date(year, month, day) constructor.",
      "Writing months as numbers (8 for August) instead of constants.",
      "Forgetting `clear()` and getting leftover milliseconds that break equality checks.",
    ],
    qa: [
      ["How do you create a specific date with the legacy API?", "new GregorianCalendar(year, Calendar.MONTH_CONSTANT, day) and getTime(), or Calendar.set after clear()."],
      ["What does lenient mean for Calendar?", "Out-of-range values roll over (January 32 becomes February 1); setLenient(false) makes them errors."],
      ["Why is new Date(2026, 1, 1) wrong?", "The deprecated constructor adds 1900 to the year (giving 3926) and uses a zero-based month, so 1 means February."],
    ],
    ex: [
      "Build the last day of February 2028 with Calendar without hard-coding 28 or 29.",
      "Set the date to 1 March 2028 and `add(Calendar.DAY_OF_MONTH, -1)`, or use `cal.getActualMaximum(Calendar.DAY_OF_MONTH)` for February 2028, which is 29 (a leap year).",
    ],
  }),

  lesson("SimpleDateFormat: Converting Between String and Date", {
    intro:
      "`SimpleDateFormat` converts dates to text and parses text into dates using patterns such as `dd-MM-yyyy`. It is central to legacy code, and it has two famous pitfalls: lenient parsing and thread safety. This lesson covers the pattern letters, formatting, parsing with `setLenient(false)`, time zones and locales, and the modern replacement.",
    topics: [
      [
        "Pattern letters",
        "`yyyy` year, `MM` month number, `MMM` short month name, `MMMM` full name, `dd` day, `EEE` weekday, `HH` hour 0 to 23, `hh` hour 1 to 12 with `a` for AM/PM, `mm` minutes, `ss` seconds, `SSS` milliseconds, `z`/`Z`/`XXX` time zone. Case matters: `MM` is month but `mm` is minutes; `YYYY` is the week-based year, not the calendar year.",
      ],
      [
        "Date to String",
        "`new SimpleDateFormat(\"dd-MM-yyyy\").format(date)` or with time `\"dd-MM-yyyy HH:mm:ss\"`. Set the zone with `setTimeZone`, and pass a `Locale` to the constructor for month and weekday names.",
      ],
      [
        "String to Date and strict parsing",
        "`format.parse(text)` returns a Date and throws `ParseException` if the text does not match. By default parsing is lenient: \"32-13-2026\" silently becomes a valid but wrong date. Call `setLenient(false)` to reject impossible values.",
      ],
      [
        "Thread safety",
        "SimpleDateFormat keeps mutable state while formatting and parsing, so sharing one instance between threads produces wrong results or exceptions. Create one per use, use a `ThreadLocal`, or use the immutable, thread-safe `java.time.format.DateTimeFormatter` instead.",
      ],
    ],
    code: String.raw`import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        TimeZone utc = TimeZone.getTimeZone("UTC");
        Date date = new Date(1_763_558_400_000L);                     // 2025-11-19T13:20:00Z

        SimpleDateFormat dayFirst = new SimpleDateFormat("dd-MM-yyyy");
        dayFirst.setTimeZone(utc);
        SimpleDateFormat withTime = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        withTime.setTimeZone(utc);
        SimpleDateFormat friendly = new SimpleDateFormat("EEEE, d MMMM yyyy 'at' hh:mm a z", Locale.ENGLISH);
        friendly.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
        System.out.println("dd-MM-yyyy:          " + dayFirst.format(date));
        System.out.println("dd-MM-yyyy HH:mm:ss: " + withTime.format(date));
        System.out.println("friendly in IST:     " + friendly.format(date));

        SimpleDateFormat minutesTrap = new SimpleDateFormat("dd-mm-yyyy");     // mm = minutes!
        minutesTrap.setTimeZone(utc);
        System.out.println("pattern dd-mm-yyyy (wrong) gives: " + minutesTrap.format(date));

        Date parsed = withTime.parse("25-12-2026 09:15:00");
        System.out.println("parsed back and reformatted: " + withTime.format(parsed));

        Date lenientResult = dayFirst.parse("32-13-2026");               // lenient by default
        System.out.println("lenient parse of 32-13-2026: " + dayFirst.format(lenientResult));

        dayFirst.setLenient(false);
        try {
            dayFirst.parse("32-13-2026");
        } catch (ParseException e) {
            System.out.println("strict parse -> ParseException: " + e.getMessage());
        }
        try {
            dayFirst.parse("2026/12/25");
        } catch (ParseException e) {
            System.out.println("wrong format -> ParseException at offset " + e.getErrorOffset());
        }

        java.time.format.DateTimeFormatter modern = java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy");
        System.out.println("modern DateTimeFormatter (immutable, thread-safe): " + java.time.LocalDate.parse("25-12-2026", modern));
    }
}`,
    walk:
      "One fixed instant is formatted three ways: day-first date, date with 24-hour time in UTC, and a friendly English form in IST with the weekday, month name, 12-hour clock, AM/PM marker and zone. Using `mm` instead of `MM` prints the minutes (20) where the month should be.\n\nParsing turns text back into a Date. In lenient mode \"32-13-2026\" quietly becomes 1 February 2027; after `setLenient(false)` it throws `ParseException`, and text in the wrong format fails with an error offset. The last line shows the modern `DateTimeFormatter`, which is immutable and safe to share.",
    anim: [
      "Parsing text into a Date",
      [
        ["text", "\"32-13-2026\"", "input"],
        ["pattern", "dd-MM-yyyy", "pattern"],
        ["lenient", "lenient: on", "default"],
        ["rolled", "01-02-2027", "silently wrong"],
        ["strict", "lenient: off", "ParseException"],
      ],
      [
        ["text", "pattern", "match", "The parser matches day 32, month 13 and year 2026 to the pattern."],
        ["pattern", "lenient", "default", "By default it is lenient and accepts out-of-range values."],
        ["lenient", "rolled", "roll over", "Day 32 and month 13 roll over into 1 February 2027."],
        ["pattern", "strict", "setLenient(false)", "With leniency off, the same text is rejected with ParseException."],
      ],
    ],
    mistakes: [
      "Using `mm` (minutes) for months or `YYYY` (week year) for years.",
      "Leaving parsing lenient for user input.",
      "Sharing one SimpleDateFormat in a static field across threads.",
    ],
    qa: [
      ["How do you convert a String to a Date?", "new SimpleDateFormat(pattern).parse(text), preferably with setLenient(false); or LocalDate.parse with a DateTimeFormatter."],
      ["Is SimpleDateFormat thread-safe?", "No. Use one per thread (ThreadLocal) or DateTimeFormatter, which is immutable and thread-safe."],
      ["What is the difference between MM and mm in date patterns?", "MM is the month; mm is the minute."],
    ],
    ex: [
      "Write a pattern that formats a date as \"Thu 19 Nov 2026, 14:05\".",
      "`new SimpleDateFormat(\"EEE d MMM yyyy, HH:mm\", Locale.ENGLISH)`.",
    ],
  }),

  lesson("Comparing Dates: before(), after(), equals() and compareTo()", {
    intro:
      "Checking whether a deadline has passed, sorting events or finding the earliest booking all require comparing dates. `Date` and `Calendar` provide `before`, `after`, `equals` and `compareTo`, and the modern types provide `isBefore`, `isAfter` and `isEqual`. This lesson compares dates with each and shows the precision pitfalls.",
    topics: [
      [
        "before() and after()",
        "`d1.before(d2)` is true if d1 is strictly earlier; `d1.after(d2)` if strictly later. Both are false when the instants are equal.",
      ],
      [
        "equals()",
        "Two Dates are equal only if their millisecond values are identical. Dates that differ by one millisecond, or by the time of day, are not equal, so compare only the parts you care about (for example truncate to the day first).",
      ],
      [
        "compareTo()",
        "`Date` implements `Comparable<Date>`: `compareTo` returns a negative number, zero or a positive number. That makes `Collections.sort(dates)`, `Collections.max` and `TreeSet<Date>` work. `Calendar` also has `before`, `after` and `compareTo`, comparing the instants.",
      ],
      [
        "Comparing only the date part",
        "To ask \"same day?\", compare calendar fields (year and day of year) in the right time zone, or convert to `LocalDate` and use `isEqual`. Comparing full timestamps for day-level questions is a common bug, and the answer depends on the time zone.",
      ],
    ],
    code: String.raw`import java.time.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Date morning = new Date(1_763_528_400_000L);       // 2025-11-19 05:00 UTC
        Date evening = new Date(1_763_571_600_000L);       // 2025-11-19 17:00 UTC
        Date morningCopy = new Date(morning.getTime());
        Date oneMsLater = new Date(morning.getTime() + 1);

        System.out.println("morning.before(evening): " + morning.before(evening) + ", morning.after(evening): " + morning.after(evening));
        System.out.println("before/after with equal instants: " + morning.before(morningCopy) + " / " + morning.after(morningCopy));
        System.out.println("equals same millis: " + morning.equals(morningCopy) + ", equals 1 ms later: " + morning.equals(oneMsLater));
        System.out.println("compareTo: " + morning.compareTo(evening) + ", " + evening.compareTo(morning) + ", " + morning.compareTo(morningCopy));

        List<Date> deadlines = new ArrayList<>(List.of(evening, oneMsLater, morning));
        Collections.sort(deadlines);
        System.out.println("sorted ascending millis: " + deadlines.stream().map(Date::getTime).toList());
        System.out.println("latest: " + Collections.max(deadlines).getTime());

        Calendar c1 = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        c1.setTime(morning);
        Calendar c2 = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        c2.setTime(evening);
        boolean sameDay = c1.get(Calendar.YEAR) == c2.get(Calendar.YEAR) && c1.get(Calendar.DAY_OF_YEAR) == c2.get(Calendar.DAY_OF_YEAR);
        System.out.println("Calendar.before: " + c1.before(c2) + ", same calendar day in UTC: " + sameDay + ", but equals: " + morning.equals(evening));

        ZoneId tokyo = ZoneId.of("Asia/Tokyo");
        LocalDate morningTokyo = morning.toInstant().atZone(tokyo).toLocalDate();
        LocalDate eveningTokyo = evening.toInstant().atZone(tokyo).toLocalDate();
        System.out.println("same day in Tokyo? " + morningTokyo.isEqual(eveningTokyo) + " (" + morningTokyo + " vs " + eveningTokyo + ")");
        System.out.println("modern isBefore/isAfter: " + morningTokyo.isBefore(eveningTokyo) + " / " + eveningTokyo.isAfter(morningTokyo));
    }
}`,
    walk:
      "`before` and `after` are strict, so both are false for two Dates with the same millisecond value, and `equals` is true only for identical millis, not for one millisecond later. `compareTo` returns -1, 1 and 0, which lets `Collections.sort` and `max` order a list of deadlines.\n\nComparing calendar fields shows the morning and evening fall on the same day in UTC even though the Dates are not equal. In Tokyo (UTC+9) the evening instant is already the next day, so converting to `LocalDate` in that zone gives different dates: whether two instants are \"the same day\" depends on the time zone.",
    anim: [
      "Same instant, same day?",
      [
        ["m", "05:00 UTC", "morning"],
        ["e", "17:00 UTC", "evening"],
        ["utc", "UTC dates", "19 and 19"],
        ["tokyo", "Tokyo dates", "19 and 20"],
        ["rule", "zone matters", "for day checks"],
      ],
      [
        ["m", "utc", "UTC", "In UTC the morning instant falls on 19 November."],
        ["e", "utc", "UTC", "The evening instant also falls on 19 November in UTC: same day."],
        ["e", "tokyo", "+9 h", "In Tokyo, 17:00 UTC is 02:00 the next day, so the dates differ."],
        ["tokyo", "rule", "lesson", "Day-level comparisons are only meaningful in a chosen time zone."],
      ],
    ],
    mistakes: [
      "Using `equals` to check whether two timestamps are on the same day.",
      "Comparing dates with `==`.",
      "Ignoring time zones when comparing by calendar day.",
    ],
    qa: [
      ["How do you compare two dates?", "before(), after(), equals() and compareTo() on Date or Calendar; isBefore(), isAfter() and isEqual() on java.time types."],
      ["What does date1.compareTo(date2) return?", "A negative value if date1 is earlier, 0 if equal, positive if later."],
      ["How do you check if two Dates are on the same day?", "Convert both to LocalDate in the relevant zone and compare, or compare the year and day-of-year Calendar fields."],
    ],
    ex: [
      "Given a list of `Date` bookings, find all bookings after a cutoff Date.",
      "`bookings.stream().filter(d -> d.after(cutoff)).toList()`; or sort them and use binary search when the list is large.",
    ],
  }),

  lesson("Adding and Subtracting Days, Months, Years, Hours, Minutes and Seconds", {
    intro:
      "Date arithmetic is harder than adding numbers: months have different lengths, leap years exist, and daylight-saving changes make some days 23 or 25 hours long. `Calendar.add` (and `GregorianCalendar`) handle these rules. This lesson adds and subtracts every unit, compares `add` with `roll`, and shows the modern `plus` methods.",
    topics: [
      [
        "Calendar.add()",
        "`cal.add(Calendar.DAY_OF_MONTH, 10)`, `add(Calendar.MONTH, -3)`, `add(Calendar.YEAR, 1)`, `add(Calendar.HOUR_OF_DAY, 5)`, `add(Calendar.MINUTE, 90)`, `add(Calendar.SECOND, -30)`. Negative amounts subtract. Larger fields are adjusted automatically (adding 40 days crosses into the next month).",
      ],
      [
        "Month-end and leap-year rules",
        "Adding one month to 31 January gives 28 or 29 February (the day is clamped to the last valid day). Adding one year to 29 February 2024 gives 28 February 2025.",
      ],
      [
        "add vs roll",
        "`roll(field, amount)` changes a field without changing larger fields: rolling the month forward from December gives January of the same year, whereas `add` moves to the next year.",
      ],
      [
        "Why not add milliseconds",
        "Adding `24 * 60 * 60 * 1000` ms is not always \"one day later\" in local time: on a daylight-saving transition day you get a different clock time. `add(Calendar.DAY_OF_MONTH, 1)` keeps the same local time.",
      ],
      [
        "Modern API",
        "`LocalDate.plusDays`, `plusMonths`, `minusYears`, `LocalDateTime.plusHours`, `plusMinutes`, and `plus(Period.ofMonths(2))` or `plus(Duration.ofMinutes(90))`. They return new immutable objects.",
      ],
    ],
    code: String.raw`import java.text.SimpleDateFormat;
import java.time.*;
import java.util.*;

public class Main {
    static SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    static String after(Calendar base, int field, int amount) {
        Calendar c = (Calendar) base.clone();
        c.add(field, amount);
        return fmt.format(c.getTime());
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        Calendar base = new GregorianCalendar(2026, Calendar.JANUARY, 31, 22, 45, 30);
        System.out.println("base:            " + fmt.format(base.getTime()));
        System.out.println("+10 days:        " + after(base, Calendar.DAY_OF_MONTH, 10));
        System.out.println("-40 days:        " + after(base, Calendar.DAY_OF_MONTH, -40));
        System.out.println("+1 month:        " + after(base, Calendar.MONTH, 1) + "  (31 Jan -> last day of Feb)");
        System.out.println("-3 months:       " + after(base, Calendar.MONTH, -3));
        System.out.println("+2 years:        " + after(base, Calendar.YEAR, 2));
        System.out.println("+5 hours:        " + after(base, Calendar.HOUR_OF_DAY, 5));
        System.out.println("+90 minutes:     " + after(base, Calendar.MINUTE, 90));
        System.out.println("-45 seconds:     " + after(base, Calendar.SECOND, -45));

        Calendar leap = new GregorianCalendar(2024, Calendar.FEBRUARY, 29);
        leap.add(Calendar.YEAR, 1);
        System.out.println("29 Feb 2024 + 1 year: " + new SimpleDateFormat("yyyy-MM-dd").format(leap.getTime()));

        Calendar december = new GregorianCalendar(2026, Calendar.DECEMBER, 10);
        Calendar added = (Calendar) december.clone();
        added.add(Calendar.MONTH, 1);
        december.roll(Calendar.MONTH, 1);
        System.out.println("add month to Dec 2026: " + new SimpleDateFormat("yyyy-MM").format(added.getTime())
                + ", roll month: " + new SimpleDateFormat("yyyy-MM").format(december.getTime()));

        TimeZone ny = TimeZone.getTimeZone("America/New_York");
        Calendar beforeDst = new GregorianCalendar(ny);
        beforeDst.clear();
        beforeDst.set(2026, Calendar.MARCH, 7, 12, 0, 0);              // DST starts on 8 March 2026
        SimpleDateFormat nyFmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        nyFmt.setTimeZone(ny);
        Calendar viaAdd = (Calendar) beforeDst.clone();
        viaAdd.add(Calendar.DAY_OF_MONTH, 1);
        Date viaMillis = new Date(beforeDst.getTimeInMillis() + 24L * 60 * 60 * 1000);
        System.out.println("New York, +1 day across DST: add() " + nyFmt.format(viaAdd.getTime()) + ", +24h millis " + nyFmt.format(viaMillis));

        LocalDateTime modern = LocalDateTime.of(2026, 1, 31, 22, 45, 30);
        System.out.println("modern: plusMonths(1) " + modern.plusMonths(1) + ", plusMinutes(90) " + modern.plusMinutes(90)
                + ", minus Period.ofYears(1) " + modern.minus(Period.ofYears(1)));
    }
}`,
    walk:
      "Starting from 31 January 2026 at 22:45:30, adding 10 days crosses into February, subtracting 40 days lands in December 2025, adding 90 minutes moves past midnight into February, and so on: larger fields adjust automatically. Adding one month to 31 January clamps to 28 February, and adding a year to 29 February 2024 gives 28 February 2025.\n\n`add` moves December 2026 into January 2027, while `roll` changes only the month and stays in 2026. In New York, where daylight-saving time starts on 8 March 2026, `add(DAY_OF_MONTH, 1)` keeps 12:00, but adding 24 hours of milliseconds gives 13:00. The modern `LocalDateTime` methods follow the same calendar rules.",
    anim: [
      "Adding one month to 31 January",
      [
        ["start", "2026-01-31", "base"],
        ["add", "add(MONTH, 1)", "request"],
        ["invalid", "2026-02-31", "does not exist"],
        ["clamp", "clamp day", "last valid day"],
        ["result", "2026-02-28", "result"],
      ],
      [
        ["start", "add", "add", "The month field is increased from January to February."],
        ["add", "invalid", "naive", "Keeping day 31 would give 31 February, which does not exist."],
        ["invalid", "clamp", "adjust", "Calendar clamps the day to the last valid day of the new month."],
        ["clamp", "result", "result", "The result is 28 February 2026 (29 in a leap year)."],
      ],
    ],
    mistakes: [
      "Adding milliseconds for calendar days and getting wrong times across daylight-saving changes.",
      "Mutating a shared Calendar instead of cloning it.",
      "Using roll when you meant add.",
    ],
    qa: [
      ["How do you add days to a Date?", "Use Calendar: setTime(date), add(Calendar.DAY_OF_MONTH, n), getTime(); or LocalDate.plusDays(n)."],
      ["What is the difference between Calendar.add and roll?", "add adjusts larger fields when a field overflows; roll changes only the given field and wraps around without touching larger fields."],
      ["What is 31 January plus one month?", "28 February (or 29 in a leap year); the day is clamped."],
    ],
    ex: [
      "Compute the date 100 days after 15 August 2026 with LocalDate.",
      "`LocalDate.of(2026, 8, 15).plusDays(100)` gives 2026-11-23.",
    ],
  }),

  lesson("Difference Between Two Dates and Checking Date Ranges", {
    intro:
      "How many days until a deadline? How long did a job run? Is this date inside a booking period? This lesson computes the difference between two dates in days, hours, minutes, seconds and milliseconds, checks whether a date lies between two others, and shows two approaches to checking whether the difference between two dates exceeds N days.",
    topics: [
      [
        "Difference in milliseconds and other units",
        "With legacy Dates, subtract `getTime()` values and convert: `TimeUnit.MILLISECONDS.toDays(diff)`, `toHours`, `toMinutes`, `toSeconds`. Split a duration into parts with division and remainder, or use `Duration.ofMillis(diff)` and its `toDaysPart`, `toHoursPart` methods (Java 9).",
      ],
      [
        "Calendar days vs 24-hour periods",
        "Millisecond subtraction counts elapsed 24-hour periods. For calendar days (\"how many dates apart\"), use `ChronoUnit.DAYS.between(localDate1, localDate2)`, which ignores time of day and daylight-saving shifts. `Period.between` gives years, months and days.",
      ],
      [
        "Checking whether a date lies between two dates",
        "`!date.before(start) && !date.after(end)` for an inclusive range with legacy Dates, or `!d.isBefore(start) && !d.isAfter(end)` with java.time. Decide explicitly whether the ends are inclusive.",
      ],
      [
        "Two approaches for \"more than N days apart\"",
        "Approach 1: compute the difference in milliseconds and compare it with `N * 24 * 60 * 60 * 1000`. Approach 2: add N days to the earlier date with Calendar (or `plusDays`) and check whether the later date is after it. The second respects calendar rules such as daylight-saving changes; the first is simpler for pure elapsed time.",
      ],
    ],
    code: String.raw`import java.text.SimpleDateFormat;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Main {
    static boolean moreThanNDaysByMillis(Date a, Date b, int n) {
        return Math.abs(b.getTime() - a.getTime()) > TimeUnit.DAYS.toMillis(n);
    }

    static boolean moreThanNDaysByCalendar(Date a, Date b, int n) {
        Date earlier = a.before(b) ? a : b, later = a.before(b) ? b : a;
        Calendar limit = Calendar.getInstance();
        limit.setTime(earlier);
        limit.add(Calendar.DAY_OF_MONTH, n);
        return later.after(limit.getTime());
    }

    public static void main(String[] args) throws Exception {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date start = f.parse("2026-11-01 08:15:00");
        Date end = f.parse("2026-11-19 17:42:30");

        long diff = end.getTime() - start.getTime();
        System.out.println("difference in ms " + diff + ", days " + TimeUnit.MILLISECONDS.toDays(diff)
                + ", hours " + TimeUnit.MILLISECONDS.toHours(diff) + ", minutes " + TimeUnit.MILLISECONDS.toMinutes(diff)
                + ", seconds " + TimeUnit.MILLISECONDS.toSeconds(diff));
        long days = diff / 86_400_000, hours = diff / 3_600_000 % 24, minutes = diff / 60_000 % 60, seconds = diff / 1000 % 60;
        System.out.println("broken down: " + days + " d " + hours + " h " + minutes + " min " + seconds + " s");
        Duration d = Duration.ofMillis(diff);
        System.out.println("Duration parts: " + d.toDaysPart() + " d " + d.toHoursPart() + " h " + d.toMinutesPart() + " min " + d.toSecondsPart() + " s (" + d + ")");

        LocalDate a = LocalDate.of(2026, 11, 1), b = LocalDate.of(2026, 11, 19);
        System.out.println("calendar days between: " + ChronoUnit.DAYS.between(a, b) + ", Period between 2024-02-29 and 2026-11-19: "
                + Period.between(LocalDate.of(2024, 2, 29), b));

        Date booking = f.parse("2026-11-10 12:00:00");
        boolean inside = !booking.before(start) && !booking.after(end);
        System.out.println("booking inside [start, end]: " + inside + ", start itself inside (inclusive): " + (!start.before(start) && !start.after(end)));
        LocalDate holiday = LocalDate.of(2026, 12, 25);
        System.out.println("25 Dec inside Nov range: " + (!holiday.isBefore(a) && !holiday.isAfter(b)));

        Date d1 = f.parse("2026-11-01 00:00:00"), d2 = f.parse("2026-11-08 00:00:01");
        System.out.println("more than 7 days apart? millis approach " + moreThanNDaysByMillis(d1, d2, 7)
                + ", calendar approach " + moreThanNDaysByCalendar(d1, d2, 7));
        System.out.println("exactly 7 days apart: " + moreThanNDaysByMillis(d1, f.parse("2026-11-08 00:00:00"), 7));
    }
}`,
    walk:
      "Between 1 November 08:15:00 and 19 November 17:42:30 there are 1,589,250,000 ms. `TimeUnit` converts that to whole days, hours, minutes and seconds (each truncated), while division and remainder, or `Duration`'s `...Part` methods, break it into 18 days, 9 hours, 27 minutes and 30 seconds.\n\n`ChronoUnit.DAYS.between` counts calendar days between two `LocalDate`s, and `Period` reports years, months and days. The range checks treat both ends as inclusive. Both \"more than N days\" approaches agree that one second past exactly seven days is more than seven days, and exactly seven days is not.",
    anim: [
      "Two ways to test 'more than 7 days'",
      [
        ["d1", "Nov 1 00:00", "earlier"],
        ["d2", "Nov 8 00:00:01", "later"],
        ["ms", "diff in ms", "> 7 x 86.4M?"],
        ["cal", "d1 + 7 days", "Nov 8 00:00"],
        ["ans", "true", "both agree"],
      ],
      [
        ["d1", "ms", "subtract", "Approach 1 subtracts the millisecond values of the two dates."],
        ["ms", "ans", "compare", "It compares the difference with 7 days expressed in milliseconds."],
        ["d1", "cal", "add", "Approach 2 adds 7 calendar days to the earlier date."],
        ["cal", "ans", "after?", "It checks whether the later date is after that limit; both say true."],
      ],
    ],
    mistakes: [
      "Counting calendar days by dividing milliseconds when daylight-saving changes are involved.",
      "Being unclear whether range boundaries are inclusive.",
      "Using `int` for millisecond differences (overflow after about 24 days).",
    ],
    qa: [
      ["How do you find the number of days between two dates?", "ChronoUnit.DAYS.between(localDate1, localDate2), or (end.getTime() - start.getTime()) converted with TimeUnit for elapsed time."],
      ["How do you check if a date lies between two dates?", "!date.before(start) && !date.after(end) for an inclusive range (isBefore/isAfter with java.time)."],
      ["What is the difference between Period and Duration?", "Period is date-based (years, months, days); Duration is time-based (seconds and nanoseconds)."],
    ],
    ex: [
      "How many full days old is someone born on 2000-05-20 on 2026-11-19, and what is their age in years, months and days?",
      "`ChronoUnit.DAYS.between(LocalDate.of(2000,5,20), LocalDate.of(2026,11,19))` gives 9679 days; `Period.between(...)` gives P26Y5M30D (26 years, 5 months, 30 days).",
    ],
  }),

  lesson("Java 8 LocalDate: Creating, Parsing, Previous and Next Dates", {
    intro:
      "Java 8 introduced the `java.time` API, designed to fix every problem of Date and Calendar: its types are immutable, thread-safe, have clear names and one-based months. `LocalDate` represents a date without time or zone, such as a birthday. This lesson creates dates with `LocalDate.of` and `now`, parses strings, navigates to previous and next dates, and uses temporal adjusters.",
    topics: [
      [
        "Creating a LocalDate",
        "`LocalDate.of(2026, 11, 19)` or `LocalDate.of(2026, Month.NOVEMBER, 19)` (months are 1 to 12), `LocalDate.now()` (or `now(clock)` for testable code), `LocalDate.ofYearDay(2026, 323)`, `LocalDate.ofEpochDay(n)`. Invalid values throw `DateTimeException`.",
      ],
      [
        "Parsing from String",
        "`LocalDate.parse(\"2026-11-19\")` accepts ISO-8601 (yyyy-MM-dd). For other formats use `LocalDate.parse(text, DateTimeFormatter.ofPattern(\"dd/MM/yyyy\"))`. Invalid input throws `DateTimeParseException`, and parsing is strict about impossible dates by default.",
      ],
      [
        "Previous and next dates",
        "`plusDays(1)`, `minusDays(1)`, `plusWeeks`, `plusMonths`, `minusYears`. Each returns a new object; the original never changes. `with(TemporalAdjusters.next(DayOfWeek.MONDAY))`, `previous`, `nextOrSame`, `firstDayOfMonth()`, `lastDayOfMonth()`, `firstDayOfNextMonth()` handle common calendar questions.",
      ],
      [
        "Querying a LocalDate",
        "`getYear()`, `getMonth()`, `getMonthValue()`, `getDayOfMonth()`, `getDayOfWeek()`, `getDayOfYear()`, `isLeapYear()`, `lengthOfMonth()`, `isBefore`, `isAfter`, `isEqual`, and `datesUntil(end)` for streams of dates.",
      ],
    ],
    code: String.raw`import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;

public class Main {
    public static void main(String[] args) {
        LocalDate date = LocalDate.of(2026, Month.NOVEMBER, 19);
        LocalDate same = LocalDate.of(2026, 11, 19);                   // months are 1-12
        System.out.println("of(): " + date + ", equals numeric version: " + date.equals(same));

        Clock fixed = Clock.fixed(Instant.parse("2026-11-19T06:00:00Z"), ZoneId.of("Asia/Kolkata"));
        System.out.println("now(clock): " + LocalDate.now(fixed) + ", ofYearDay(2026, 323): " + LocalDate.ofYearDay(2026, 323));

        System.out.println("parse ISO: " + LocalDate.parse("2026-08-15"));
        System.out.println("parse dd/MM/yyyy: " + LocalDate.parse("26/01/2027", DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        try {
            LocalDate.parse("2026-02-30");
        } catch (DateTimeParseException e) {
            System.out.println("invalid date rejected: " + e.getMessage());
        }

        System.out.println("previous day " + date.minusDays(1) + ", next day " + date.plusDays(1)
                + ", next week " + date.plusWeeks(1) + ", previous month " + date.minusMonths(1) + ", next year " + date.plusYears(1));
        System.out.println("original unchanged (immutable): " + date);

        System.out.println("next Monday " + date.with(TemporalAdjusters.next(DayOfWeek.MONDAY))
                + ", previous Friday " + date.with(TemporalAdjusters.previous(DayOfWeek.FRIDAY))
                + ", first of month " + date.with(TemporalAdjusters.firstDayOfMonth())
                + ", last of month " + date.with(TemporalAdjusters.lastDayOfMonth()));

        System.out.println("day of week " + date.getDayOfWeek() + ", day of year " + date.getDayOfYear()
                + ", month " + date.getMonth() + " (" + date.getMonthValue() + "), days in month " + date.lengthOfMonth()
                + ", leap year " + date.isLeapYear());
        System.out.println("weekdays until month end: " + date.datesUntil(date.with(TemporalAdjusters.firstDayOfNextMonth()))
                .filter(d -> d.getDayOfWeek().getValue() <= 5).count());
        try {
            LocalDate.of(2026, 13, 1);
        } catch (DateTimeException e) {
            System.out.println("month 13 -> DateTimeException");
        }
    }
}`,
    walk:
      "`LocalDate.of` accepts either the `Month` enum or the numbers 1 to 12 (no zero-based trap). `now(clock)` with a fixed clock makes \"today\" testable, and `ofYearDay` builds a date from the day number. `parse` reads ISO text by default or any pattern with a formatter, and rejects 30 February.\n\n`plusDays`, `minusMonths` and friends return new dates while the original stays unchanged. Temporal adjusters find the next Monday, the previous Friday and the first and last day of the month. Query methods report the weekday, day of year and month length, and `datesUntil` streams the dates to the end of the month, counting 8 weekdays.",
    anim: [
      "Immutable date navigation",
      [
        ["d", "2026-11-19", "Thursday"],
        ["prev", "minusDays(1)", "2026-11-18"],
        ["next", "plusDays(1)", "2026-11-20"],
        ["mon", "next(MONDAY)", "2026-11-23"],
        ["orig", "original", "still 11-19"],
      ],
      [
        ["d", "prev", "minus", "minusDays(1) returns a new LocalDate for the previous day."],
        ["d", "next", "plus", "plusDays(1) returns another new object for the next day."],
        ["d", "mon", "adjust", "with(next(MONDAY)) jumps to the following Monday."],
        ["d", "orig", "immutable", "The original object never changes, so it is safe to share."],
      ],
    ],
    mistakes: [
      "Calling `date.plusDays(1);` without using the returned value (the original does not change).",
      "Using `LocalDate.now()` directly in business logic, making tests depend on the real date; inject a Clock.",
      "Using LocalDate for instants that need a time zone.",
    ],
    qa: [
      ["What is LocalDate?", "An immutable date without time or time zone, such as 2026-11-19."],
      ["How do you get the next Monday from a date?", "date.with(TemporalAdjusters.next(DayOfWeek.MONDAY))."],
      ["Why is java.time better than Date/Calendar?", "It is immutable and thread-safe, has clear separate types (LocalDate, LocalDateTime, ZonedDateTime, Instant), one-based months and fluent methods."],
    ],
    ex: [
      "Find the date of the last Friday of February 2027.",
      "`LocalDate.of(2027, 2, 1).with(TemporalAdjusters.lastInMonth(DayOfWeek.FRIDAY))` gives 2027-02-26.",
    ],
  }),

  lesson("LocalDateTime, Clock and ISO Formatting", {
    intro:
      "`LocalDateTime` combines a date and a time of day without a time zone, like \"19 November 2026 at 14:30\" on a wall calendar. This lesson creates and parses LocalDateTime values, formats them with `ISO_DATE_TIME` and custom patterns, uses `Clock` for testable \"now\", and works through everyday examples.",
    topics: [
      [
        "Creating and parsing",
        "`LocalDateTime.of(2026, 11, 19, 14, 30)`, `LocalDateTime.of(date, time)`, `date.atTime(9, 0)`, `date.atStartOfDay()`, `LocalDateTime.now(clock)`. `LocalDateTime.parse(\"2026-11-19T14:30:00\")` reads ISO-8601 text (with a `T` separator); custom formats use `DateTimeFormatter.ofPattern(\"dd-MM-yyyy HH:mm\")`.",
      ],
      [
        "ISO formatting",
        "`toString()` prints ISO-8601. Predefined formatters include `ISO_LOCAL_DATE`, `ISO_LOCAL_DATE_TIME`, `ISO_DATE_TIME` (adds offset and zone when present), `ISO_INSTANT` and `BASIC_ISO_DATE` (`20261119`). `DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM)` produces locale-specific text.",
      ],
      [
        "Clock",
        "`Clock` supplies the current instant and zone. `Clock.systemDefaultZone()` and `systemUTC()` read the real time; `Clock.fixed(instant, zone)` always returns the same moment and `Clock.offset(clock, duration)` shifts one. Passing a Clock into your code (instead of calling `now()` without arguments) makes time-dependent logic testable.",
      ],
      [
        "Working with LocalDateTime",
        "`plusHours`, `minusMinutes`, `withHour`, `truncatedTo(ChronoUnit.HOURS)`, `toLocalDate()`, `toLocalTime()`, `isBefore`. Because it has no zone, it cannot represent a precise instant; attach a zone with `atZone(zone)` before storing or comparing moments across regions.",
      ],
    ],
    code: String.raw`import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public class Main {
    static String greeting(Clock clock) {                         // testable thanks to the Clock parameter
        int hour = LocalDateTime.now(clock).getHour();
        return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    }

    public static void main(String[] args) {
        LocalDateTime meeting = LocalDateTime.of(2026, 11, 19, 14, 30);
        LocalDateTime fromParts = LocalDate.of(2026, 11, 19).atTime(LocalTime.of(14, 30));
        System.out.println("of(): " + meeting + ", from date + time equal: " + meeting.equals(fromParts));
        System.out.println("start of day: " + LocalDate.of(2026, 11, 19).atStartOfDay());

        LocalDateTime parsedIso = LocalDateTime.parse("2026-12-31T23:59:59");
        LocalDateTime parsedCustom = LocalDateTime.parse("01-01-2027 00:00", DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
        System.out.println("parse ISO: " + parsedIso + ", parse custom: " + parsedCustom
                + ", seconds apart: " + ChronoUnit.SECONDS.between(parsedIso, parsedCustom));

        System.out.println("ISO_LOCAL_DATE_TIME: " + meeting.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        System.out.println("ISO_DATE_TIME with zone: " + meeting.atZone(ZoneId.of("Asia/Kolkata")).format(DateTimeFormatter.ISO_DATE_TIME));
        System.out.println("BASIC_ISO_DATE: " + meeting.format(DateTimeFormatter.BASIC_ISO_DATE));
        System.out.println("custom: " + meeting.format(DateTimeFormatter.ofPattern("EEE, dd MMM yyyy hh:mm a", Locale.ENGLISH)));
        System.out.println("localized MEDIUM (en-IN): " + meeting.format(DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.forLanguageTag("en-IN"))));

        Clock morning = Clock.fixed(Instant.parse("2026-11-19T03:30:00Z"), ZoneId.of("Asia/Kolkata"));   // 09:00 IST
        Clock evening = Clock.offset(morning, Duration.ofHours(10));                                     // 19:00 IST
        System.out.println("Clock.fixed now: " + LocalDateTime.now(morning) + " -> " + greeting(morning)
                + "; offset +10h -> " + greeting(evening));

        System.out.println("plusHours(3) " + meeting.plusHours(3) + ", withMinute(0) " + meeting.withMinute(0)
                + ", truncatedTo(HOURS) " + meeting.truncatedTo(ChronoUnit.HOURS));
        System.out.println("date part " + meeting.toLocalDate() + ", time part " + meeting.toLocalTime()
                + ", before New Year: " + meeting.isBefore(parsedCustom));
    }
}`,
    walk:
      "`LocalDateTime.of` and `date.atTime(time)` build the same value, and `atStartOfDay` gives midnight. `parse` reads ISO text with the `T` separator or a custom pattern; the two parsed values are one second apart across New Year.\n\nThe formatting lines show the ISO family: `ISO_LOCAL_DATE_TIME`, `ISO_DATE_TIME` (which includes offset and zone once a zone is attached) and the compact `BASIC_ISO_DATE`, plus a custom pattern and a localized Indian-English style. With `Clock.fixed` the program's notion of \"now\" is 09:00 IST, so `greeting` is deterministic, and `Clock.offset` moves it to the evening. The last lines adjust and split a LocalDateTime.",
    anim: [
      "Injecting time with Clock",
      [
        ["code", "greeting(clock)", "your logic"],
        ["sys", "system clock", "production"],
        ["fixed", "Clock.fixed", "tests: 09:00"],
        ["offset", "Clock.offset", "+10 hours"],
        ["now", "now(clock)", "LocalDateTime"],
      ],
      [
        ["sys", "code", "prod", "In production the code receives the real system clock."],
        ["fixed", "code", "test", "In tests it receives a fixed clock, so 'now' is always 09:00 IST."],
        ["offset", "code", "shift", "An offset clock simulates a later time without waiting."],
        ["code", "now", "read", "The logic only ever calls now(clock), so it is fully predictable."],
      ],
    ],
    mistakes: [
      "Storing LocalDateTime for events that happen at a specific instant across regions (use Instant or ZonedDateTime).",
      "Calling `LocalDateTime.now()` without a clock in code you want to test.",
      "Parsing ISO strings with a space instead of `T` without a custom formatter.",
    ],
    qa: [
      ["What is LocalDateTime?", "A date and time without a time zone or offset, such as 2026-11-19T14:30."],
      ["What is the purpose of Clock?", "To provide the current instant and zone in a replaceable way, so code using now(clock) can be tested with fixed or offset clocks."],
      ["What does ISO_DATE_TIME produce?", "An ISO-8601 date-time, including the offset and zone ID if the value has them, e.g. 2026-11-19T14:30:00+05:30[Asia/Kolkata]."],
    ],
    ex: [
      "Write a test-friendly method `boolean isWeekendNow(Clock clock)` and test it for Saturday 21 November 2026.",
      "`return LocalDate.now(clock).getDayOfWeek().getValue() >= 6;` and call it with `Clock.fixed(Instant.parse(\"2026-11-21T10:00:00Z\"), ZoneOffset.UTC)`, which returns true.",
    ],
  }),

  lesson("ZoneId and ZonedDateTime: Time Zones, Offsets and ISO-8601", {
    intro:
      "When people in different places are involved, you need time zones. `ZoneId` identifies a region (Asia/Kolkata, Europe/London), `ZonedDateTime` is a date-time in such a zone, and `Instant` is the universal moment underneath. This lesson converts between zones, lists all time zones sorted by name and by offset, computes the difference between zones, and converts LocalDateTime to and from ISO-8601 strings with zones.",
    topics: [
      [
        "ZoneId and ZoneOffset",
        "`ZoneId.of(\"Asia/Kolkata\")` is a region with rules (including daylight-saving history); `ZoneOffset.ofHours(5).plusMinutes...` or `ZoneOffset.of(\"+05:30\")` is a fixed offset. `ZoneId.getAvailableZoneIds()` returns all region IDs, and `zone.getRules().getOffset(instant)` gives the offset at a moment.",
      ],
      [
        "ZonedDateTime and converting zones",
        "`localDateTime.atZone(zone)` attaches a zone; `zdt.withZoneSameInstant(otherZone)` shows the same moment elsewhere, while `withZoneSameLocal` keeps the wall-clock time and changes the moment. `zdt.toInstant()` gives the UTC instant.",
      ],
      [
        "All time zones sorted by name and by offset",
        "Collect `getAvailableZoneIds()` into a sorted list for alphabetical order. For offset order, compute each zone's offset at one fixed instant (offsets change with daylight saving) and sort by `getTotalSeconds()`.",
      ],
      [
        "Difference between two time zones",
        "Compare their offsets at the same instant: `Duration.ofSeconds(offsetB.getTotalSeconds() - offsetA.getTotalSeconds())`, then read hours and minutes. The result can change during the year when one zone observes daylight saving and the other does not.",
      ],
      [
        "ISO-8601 conversion",
        "A `ZonedDateTime` prints as `2026-11-19T14:30+05:30[Asia/Kolkata]`; `OffsetDateTime` as `2026-11-19T14:30+05:30`; `Instant` as `2026-11-19T09:00:00Z`. Parse them back with `ZonedDateTime.parse`, `OffsetDateTime.parse` and `Instant.parse`, and get the LocalDateTime with `toLocalDateTime()`.",
      ],
    ],
    code: String.raw`import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ZoneId india = ZoneId.of("Asia/Kolkata"), london = ZoneId.of("Europe/London"), newYork = ZoneId.of("America/New_York");
        LocalDateTime local = LocalDateTime.of(2026, 11, 19, 14, 30);
        ZonedDateTime inIndia = local.atZone(india);
        System.out.println("meeting in India:   " + inIndia);
        System.out.println("same instant London: " + inIndia.withZoneSameInstant(london));
        System.out.println("same instant NY:     " + inIndia.withZoneSameInstant(newYork));
        System.out.println("same local time NY:  " + inIndia.withZoneSameLocal(newYork) + " (a different instant)");
        System.out.println("as UTC Instant:      " + inIndia.toInstant());

        Instant reference = Instant.parse("2026-01-15T00:00:00Z");      // fixed instant: offsets depend on the date
        List<String> zones = ZoneId.getAvailableZoneIds().stream().filter(z -> z.contains("/") && !z.startsWith("Etc") && !z.startsWith("SystemV")).sorted().toList();
        System.out.println("region zones available: more than 400 = " + (zones.size() > 400) + ", first by name: " + zones.subList(0, 3));
        List<String> byOffset = zones.stream()
                .sorted(Comparator.comparingInt((String z) -> ZoneId.of(z).getRules().getOffset(reference).getTotalSeconds()).thenComparing(z -> z))
                .toList();
        String first = byOffset.get(0), last = byOffset.get(byOffset.size() - 1);
        System.out.println("smallest offset: " + first + " " + ZoneId.of(first).getRules().getOffset(reference)
                + ", largest offset: " + last + " " + ZoneId.of(last).getRules().getOffset(reference));

        for (Instant when : new Instant[] {reference, Instant.parse("2026-07-15T00:00:00Z")}) {
            int seconds = india.getRules().getOffset(when).getTotalSeconds() - london.getRules().getOffset(when).getTotalSeconds();
            Duration diff = Duration.ofSeconds(seconds);
            System.out.println("India minus London on " + when.toString().substring(0, 10) + ": " + diff.toHoursPart() + " h " + diff.toMinutesPart() + " min");
        }

        String isoZoned = inIndia.format(DateTimeFormatter.ISO_ZONED_DATE_TIME);
        String isoOffset = inIndia.toOffsetDateTime().toString();
        System.out.println("ISO-8601 zoned:  " + isoZoned + "\nISO-8601 offset: " + isoOffset);
        ZonedDateTime parsedBack = ZonedDateTime.parse(isoZoned);
        System.out.println("parsed back to LocalDateTime: " + parsedBack.toLocalDateTime() + ", same instant: " + parsedBack.toInstant().equals(inIndia.toInstant()));
        System.out.println("OffsetDateTime.parse: " + OffsetDateTime.parse("2026-11-19T09:00Z").atZoneSameInstant(india));

        ZonedDateTime beforeGap = LocalDateTime.of(2026, 3, 8, 2, 30).atZone(newYork);    // 02:30 does not exist that night
        System.out.println("non-existent local time in DST gap is shifted: " + beforeGap);
    }
}`,
    walk:
      "The meeting at 14:30 in Asia/Kolkata is the same instant as 09:00 in London and 04:00 in New York (`withZoneSameInstant`), whereas `withZoneSameLocal` keeps 14:30 but in New York, which is a different moment. The underlying UTC instant is 09:00Z.\n\nSorting the available region IDs gives them alphabetically; sorting by offset at a fixed date shows the extremes, from UTC-11 in the Pacific to UTC+14 on the Line Islands. India is 5 h 30 min ahead of London in January but only 4 h 30 min ahead in July, when London observes summer time. The ISO-8601 strings parse back to the same instant. Finally, 02:30 on 8 March 2026 does not exist in New York (clocks jump from 02:00 to 03:00), so `atZone` shifts it to 03:30.",
    anim: [
      "One instant, three zones",
      [
        ["inst", "09:00Z", "Instant"],
        ["ist", "14:30 IST", "Asia/Kolkata"],
        ["gmt", "09:00 GMT", "Europe/London"],
        ["est", "04:00 EST", "America/New_York"],
        ["iso", "ISO-8601", "+05:30[zone]"],
      ],
      [
        ["ist", "inst", "toInstant", "The local meeting time plus its zone pins down one universal instant."],
        ["inst", "gmt", "London", "withZoneSameInstant shows that instant on London's wall clocks."],
        ["inst", "est", "New York", "And on New York's wall clocks, five hours behind UTC in November."],
        ["ist", "iso", "format", "ISO-8601 text keeps the offset and zone, so it parses back to the same instant."],
      ],
    ],
    mistakes: [
      "Storing times with fixed offsets for future events in regions with daylight saving; store the ZoneId.",
      "Using `withZoneSameLocal` when you meant the same moment.",
      "Sorting zones by offset without fixing the instant, so results change during the year.",
    ],
    qa: [
      ["What is the difference between ZoneId and ZoneOffset?", "ZoneId is a region with rules that can change (daylight saving); ZoneOffset is a fixed difference from UTC such as +05:30."],
      ["How do you convert a time from one zone to another?", "zonedDateTime.withZoneSameInstant(targetZone)."],
      ["What is the difference between LocalDateTime, ZonedDateTime and Instant?", "LocalDateTime has no zone; ZonedDateTime is a date-time in a specific zone; Instant is a point on the UTC timeline."],
    ],
    ex: [
      "A webinar starts at 18:00 in Europe/Berlin on 10 December 2026. What time is it in Asia/Tokyo and America/Los_Angeles?",
      "`LocalDateTime.of(2026,12,10,18,0).atZone(ZoneId.of(\"Europe/Berlin\"))` with `withZoneSameInstant`: 02:00 on 11 December in Tokyo and 09:00 on 10 December in Los Angeles.",
    ],
  }),
]);
