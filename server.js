const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public_html"));

// Helper function to check leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// API route to show today's dates
app.get("/today", (req, res) => {
  const now = new Date();
  const unix = now.getTime();
  const regularCalendar = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const year = now.getFullYear();
  const dayOfYear = Math.floor(
    (now - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24)
  );

  let fixedCalendar;
  if (dayOfYear <= 364) {
    const fixedMonth = Math.floor((dayOfYear - 1) / 28) + 1;
    const fixedDay = ((dayOfYear - 1) % 28) + 1;
    fixedCalendar = `${year}-M${
      fixedMonth < 10 ? "0" + fixedMonth : fixedMonth
    }-${fixedDay < 10 ? "0" + fixedDay : fixedDay}`;
  } else if (dayOfYear === 365) {
    fixedCalendar = `${year}-I`;
  } else if (dayOfYear === 366 && isLeapYear(year)) {
    fixedCalendar = `${year}-II`;
  }

  res.json({ fixedCalendar, regularCalendar, unix });
});

// API route to calculate date conversions
app.get("/convert", (req, res) => {
  const { date, toCalendar } = req.query;

  // Validate input
  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }
  if (!toCalendar || !["fixed", "regular"].includes(toCalendar)) {
    return res
      .status(400)
      .json({ error: 'toCalendar parameter must be "fixed" or "regular"' });
  }

  let inputDate;

  // Parse the date parameter (UNIX timestamp or date string)
  if (!isNaN(date) && Number(date) > 0) {
    // UNIX timestamp in milliseconds
    inputDate = new Date(Number(date));
  } else {
    // ISO date string or fixed format
    inputDate = new Date(date);
  }

  if (
    isNaN(inputDate.getTime()) &&
    !date.match(/^(\d{4})-M(\d{2})-(\d{2})$/) &&
    !date.match(/^(\d{4})-(I|II)$/)
  ) {
    return res
      .status(400)
      .json({
        error:
          "Invalid date format. Use UNIX timestamp, ISO date (YYYY-MM-DD), or Fixed format (YYYY-MMM-DD, YYYY-I, YYYY-II)",
      });
  }

  if (toCalendar === "fixed") {
    // Convert from Gregorian (regular) to Fixed
    const year = inputDate.getFullYear();
    const dayOfYear = Math.floor(
      (inputDate - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    let fixedCalendar;
    if (dayOfYear <= 364) {
      const fixedMonth = Math.floor((dayOfYear - 1) / 28) + 1;
      const fixedDay = ((dayOfYear - 1) % 28) + 1;
      fixedCalendar = `${year}-M${
        fixedMonth < 10 ? "0" + fixedMonth : fixedMonth
      }-${fixedDay < 10 ? "0" + fixedDay : fixedDay}`;
    } else if (dayOfYear === 365) {
      fixedCalendar = `${year}-I`;
    } else if (dayOfYear === 366 && isLeapYear(year)) {
      fixedCalendar = `${year}-II`;
    } else {
      return res
        .status(400)
        .json({ error: "Invalid date: day 366 only exists in leap years" });
    }

    res.json({
      input: {
        regularCalendar: `${inputDate.getFullYear()}-${String(
          inputDate.getMonth() + 1
        ).padStart(2, "0")}-${String(inputDate.getDate()).padStart(2, "0")}`,
        unix: inputDate.getTime(),
      },
      result: {
        fixedCalendar,
        unix: inputDate.getTime(),
      },
    });
  } else if (toCalendar === "regular") {
    // Convert from Fixed to Gregorian (regular)
    if (date.endsWith("-I")) {
      const year = parseInt(date.split("-")[0], 10);
      const gregDate = new Date(year, 0, 1);
      gregDate.setDate(365); // Day 365
      res.json({
        input: {
          fixedCalendar: date,
          unix: gregDate.getTime(),
        },
        result: {
          regularCalendar: `${gregDate.getFullYear()}-${String(
            gregDate.getMonth() + 1
          ).padStart(2, "0")}-${String(gregDate.getDate()).padStart(2, "0")}`,
          unix: gregDate.getTime(),
        },
      });
    } else if (date.endsWith("-II")) {
      const year = parseInt(date.split("-")[0], 10);
      if (!isLeapYear(year)) {
        return res
          .status(400)
          .json({ error: "Day II only exists in leap years" });
      }
      const gregDate = new Date(year, 0, 1);
      gregDate.setDate(366); // Day 366
      res.json({
        input: {
          fixedCalendar: date,
          unix: gregDate.getTime(),
        },
        result: {
          regularCalendar: `${gregDate.getFullYear()}-${String(
            gregDate.getMonth() + 1
          ).padStart(2, "0")}-${String(gregDate.getDate()).padStart(2, "0")}`,
          unix: gregDate.getTime(),
        },
      });
    } else {
      const fixedDateMatch = date.match(/^(\d{4})-M(\d{2})-(\d{2})$/);
      if (!fixedDateMatch) {
        return res
          .status(400)
          .json({
            error:
              "Invalid Fixed calendar format. Use YYYY-MMM-DD, YYYY-I, or YYYY-II",
          });
      }

      const [_, fixedYear, fixedMonthStr, fixedDayStr] = fixedDateMatch;
      const fixedMonth = parseInt(fixedMonthStr, 10);
      const fixedDay = parseInt(fixedDayStr, 10);

      if (fixedMonth < 1 || fixedMonth > 13 || fixedDay < 1 || fixedDay > 28) {
        return res
          .status(400)
          .json({ error: "Fixed month must be 1-13 and day must be 1-28" });
      }

      const dayOfYear = (fixedMonth - 1) * 28 + fixedDay;
      const gregDate = new Date(parseInt(fixedYear, 10), 0, 1);
      gregDate.setDate(dayOfYear);

      res.json({
        input: {
          fixedCalendar: date,
          unix: gregDate.getTime(),
        },
        result: {
          regularCalendar: `${gregDate.getFullYear()}-${String(
            gregDate.getMonth() + 1
          ).padStart(2, "0")}-${String(gregDate.getDate()).padStart(2, "0")}`,
          unix: gregDate.getTime(),
        },
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
