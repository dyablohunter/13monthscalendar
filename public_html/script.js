document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  let gregMonth = now.getMonth();
  let gregYear = now.getFullYear();
  let fixedMonth =
    Math.floor(
      (Math.floor((now - new Date(gregYear, 0, 0)) / (1000 * 60 * 60 * 24)) -
        1) /
        28
    ) + 1;
  let fixedYear = gregYear;

  // Helper function to check leap year
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // Generate Gregorian Calendar
  function generateGregorianCalendar(month, year) {
    const container = document.getElementById("gregorian-calendar");
    document.getElementById("greg-title").textContent = `${new Date(
      year,
      month
    ).toLocaleString("default", { month: "long" })} ${year}`;
    let html = '<div class="days">';
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
      html += `<div class="day-header">${day}</div>`;
    });
    html += '</div><div class="days">';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="day"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrent =
        year === now.getFullYear() &&
        month === now.getMonth() &&
        day === now.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const classes = isCurrent ? "day current-day" : "day";
      html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }
    html += "</div>";
    container.innerHTML = html;
  }

  // Generate International Fixed Calendar
  function generateFixedCalendar(month, year) {
    const container = document.getElementById("fixed-calendar");
    document.getElementById(
      "fixed-title"
    ).textContent = `Month ${month} / ${year}`;
    let html = '<div class="days">';
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
      html += `<div class="day-header">${day}</div>`;
    });
    html += '</div><div class="days">';

    // Each month starts on Sunday (since 28 % 7 = 0)
    const firstDay = 0;

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="day"></div>';
    }

    // Regular days 1-28
    for (let day = 1; day <= 28; day++) {
      const dayOfYear = (month - 1) * 28 + day;
      const gregDate = new Date(year, 0, 1);
      gregDate.setDate(dayOfYear);
      const gregYear = gregDate.getFullYear();
      const gregMonth = String(gregDate.getMonth() + 1).padStart(2, "0");
      const gregDay = String(gregDate.getDate()).padStart(2, "0");
      const gregDateStr = `${gregYear}-${gregMonth}-${gregDay}`;
      const isCurrent =
        gregDateStr ===
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")}`;
      const dateStr = `${year}-M${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const classes = isCurrent ? "day current-day" : "day";
      html += `<div class="${classes}" data-date="${dateStr}" data-greg="${gregDateStr}">${day}</div>`;
    }

    // Add intermission days for month 13
    if (month === 13) {
      const isLeap = isLeapYear(year);
      // "I" day (day 365)
      const gregDateI = new Date(year, 0, 1);
      gregDateI.setDate(365);
      const gregYearI = gregDateI.getFullYear();
      const gregMonthI = String(gregDateI.getMonth() + 1).padStart(2, "0");
      const gregDayI = String(gregDateI.getDate()).padStart(2, "0");
      const gregDateStrI = `${gregYearI}-${gregMonthI}-${gregDayI}`;
      const isCurrentI =
        gregDateStrI ===
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")}`;
      const iClasses = isCurrentI
        ? "day current-day extra-day"
        : "day extra-day";
      html += `<div class="${iClasses}" data-date="${year}-I" data-greg="${gregDateStrI}">I</div>`;

      if (isLeap) {
        // "II" day (day 366)
        const gregDateII = new Date(year, 0, 1);
        gregDateII.setDate(366);
        const gregYearII = gregDateII.getFullYear();
        const gregMonthII = String(gregDateII.getMonth() + 1).padStart(2, "0");
        const gregDayII = String(gregDateII.getDate()).padStart(2, "0");
        const gregDateStrII = `${gregYearII}-${gregMonthII}-${gregDayII}`;
        const isCurrentII =
          gregDateStrII ===
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(now.getDate()).padStart(2, "0")}`;
        const iiClasses = isCurrentII
          ? "day current-day extra-day"
          : "day extra-day";
        html += `<div class="${iiClasses}" data-date="${year}-II" data-greg="${gregDateStrII}">II</div>`;
      }
    }

    html += "</div>";
    container.innerHTML = html;
  }

  // Convert Gregorian to Fixed date
  function gregToFixed(gregDateStr) {
    const date = new Date(gregDateStr);
    const year = date.getFullYear();
    const dayOfYear = Math.floor(
      (date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    if (dayOfYear <= 364) {
      const fixedMonth = Math.floor((dayOfYear - 1) / 28) + 1;
      const fixedDay = ((dayOfYear - 1) % 28) + 1;
      return `${year}-M${String(fixedMonth).padStart(2, "0")}-${String(
        fixedDay
      ).padStart(2, "0")}`;
    } else if (dayOfYear === 365) {
      return `${year}-I`;
    } else if (dayOfYear === 366 && isLeapYear(year)) {
      return `${year}-II`;
    } else {
      throw new Error("Invalid date for the year");
    }
  }

  // Convert Fixed to Gregorian date
  function fixedToGreg(fixedDate) {
    if (fixedDate.endsWith("-I")) {
      const year = parseInt(fixedDate.split("-")[0], 10);
      const gregDate = new Date(year, 0, 1);
      gregDate.setDate(365);
      const gregYear = gregDate.getFullYear();
      const gregMonth = String(gregDate.getMonth() + 1).padStart(2, "0");
      const gregDay = String(gregDate.getDate()).padStart(2, "0");
      return `${gregYear}-${gregMonth}-${gregDay}`;
    } else if (fixedDate.endsWith("-II")) {
      const year = parseInt(fixedDate.split("-")[0], 10);
      if (!isLeapYear(year)) {
        throw new Error("Day II only exists in leap years");
      }
      const gregDate = new Date(year, 0, 1);
      gregDate.setDate(366);
      const gregYear = gregDate.getFullYear();
      const gregMonth = String(gregDate.getMonth() + 1).padStart(2, "0");
      const gregDay = String(gregDate.getDate()).padStart(2, "0");
      return `${gregYear}-${gregMonth}-${gregDay}`;
    } else {
      const [yearStr, monthStr, dayStr] = fixedDate.split("-");
      const month = parseInt(monthStr.replace("M", ""), 10);
      const day = parseInt(dayStr, 10);
      const dayOfYear = (month - 1) * 28 + day;
      const gregDate = new Date(parseInt(yearStr, 10), 0, 1);
      gregDate.setDate(dayOfYear);
      const gregYear = gregDate.getFullYear();
      const gregMonth = String(gregDate.getMonth() + 1).padStart(2, "0");
      const gregDay = String(gregDate.getDate()).padStart(2, "0");
      return `${gregYear}-${gregMonth}-${gregDay}`;
    }
  }

  // Highlight selected dates
  function highlightSelectedDates(gregDate, fixedDate) {
    const allDays = document.querySelectorAll(".day");
    allDays.forEach((d) => d.classList.remove("selected-day"));
    const gregDay = document.querySelector(`.day[data-date="${gregDate}"]`);
    const fixedDay = document.querySelector(`.day[data-date="${fixedDate}"]`);
    if (gregDay) gregDay.classList.add("selected-day");
    if (fixedDay) fixedDay.classList.add("selected-day");
  }

  // Date selection handling with month syncing
  function handleDateSelection(event) {
    if (
      !event.target.classList.contains("day") ||
      event.target.classList.contains("day-header")
    )
      return;

    const day = event.target;
    let gregDate, fixedDate;

    if (day.closest(".gregorian")) {
      gregDate = day.dataset.date;
      fixedDate = gregToFixed(gregDate);
      const fixedDateParts = fixedDate.split("-");
      const targetFixedYear = parseInt(fixedDateParts[0], 10);
      if (fixedDateParts[1] === "I" || fixedDateParts[1] === "II") {
        if (fixedMonth !== 13 || targetFixedYear !== fixedYear) {
          fixedMonth = 13;
          fixedYear = targetFixedYear;
          generateFixedCalendar(fixedMonth, fixedYear);
        }
      } else {
        const targetFixedMonth = parseInt(
          fixedDateParts[1].replace("M", ""),
          10
        );
        if (targetFixedMonth !== fixedMonth || targetFixedYear !== fixedYear) {
          fixedMonth = targetFixedMonth;
          fixedYear = targetFixedYear;
          generateFixedCalendar(fixedMonth, fixedYear);
        }
      }
    } else if (day.closest(".fixed")) {
      fixedDate = day.dataset.date;
      gregDate = fixedToGreg(fixedDate);
      const gregDateObj = new Date(gregDate);
      if (
        gregDateObj.getMonth() !== gregMonth ||
        gregDateObj.getFullYear() !== gregYear
      ) {
        gregMonth = gregDateObj.getMonth();
        gregYear = gregDateObj.getFullYear();
        generateGregorianCalendar(gregMonth, gregYear);
      }
    }

    highlightSelectedDates(gregDate, fixedDate);
  }

  // Attach event listeners using delegation
  document
    .querySelector(".gregorian")
    .addEventListener("click", handleDateSelection);
  document
    .querySelector(".fixed")
    .addEventListener("click", handleDateSelection);

  // Navigation handlers
  document.getElementById("greg-prev").addEventListener("click", () => {
    gregMonth--;
    if (gregMonth < 0) {
      gregMonth = 11;
      gregYear--;
    }
    generateGregorianCalendar(gregMonth, gregYear);
  });

  document.getElementById("greg-next").addEventListener("click", () => {
    gregMonth++;
    if (gregMonth > 11) {
      gregMonth = 0;
      gregYear++;
    }
    generateGregorianCalendar(gregMonth, gregYear);
  });

  document.getElementById("fixed-prev").addEventListener("click", () => {
    fixedMonth--;
    if (fixedMonth < 1) {
      fixedMonth = 13;
      fixedYear--;
    }
    generateFixedCalendar(fixedMonth, fixedYear);
  });

  document.getElementById("fixed-next").addEventListener("click", () => {
    fixedMonth++;
    if (fixedMonth > 13) {
      fixedMonth = 1;
      fixedYear++;
    }
    generateFixedCalendar(fixedMonth, fixedYear);
  });

  // Reset to today handler for multiple buttons
  document.querySelectorAll(".reload").forEach((btn) => {
    btn.addEventListener("click", () => {
      const today = new Date();
      gregMonth = today.getMonth();
      gregYear = today.getFullYear();
      const dayOfYear = Math.floor(
        (today - new Date(gregYear, 0, 0)) / (1000 * 60 * 60 * 24)
      );
      fixedMonth = dayOfYear <= 364 ? Math.floor((dayOfYear - 1) / 28) + 1 : 13;
      fixedYear = gregYear;

      generateGregorianCalendar(gregMonth, gregYear);
      generateFixedCalendar(fixedMonth, fixedYear);
    });
  });

  // Tab functionality for code examples
  function setupTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabButtons = container.querySelectorAll(".tab-button");
    const tabPanes = container.querySelectorAll(".tab-pane");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabPanes.forEach((pane) => pane.classList.remove("active"));
        button.classList.add("active");
        const tabId = button.dataset.tab;
        container.querySelector(`#${tabId}`).classList.add("active");
      });
    });
  }

  setupTabs("today-examples");
  setupTabs("convert-examples");

  // Initialize
  generateGregorianCalendar(gregMonth, gregYear);
  generateFixedCalendar(fixedMonth, fixedYear);
});
