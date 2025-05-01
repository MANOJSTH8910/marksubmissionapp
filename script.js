const scriptURL = "https://script.google.com/macros/s/AKfycbx6CWaO4Ny5Ig9dFx9cV7Ap4H5cOe0dhWcXsvWunbY7w9uIF6H6r-XeEVcd5C8FfXln2g/exec";

const classSelect = document.getElementById("class");
const marksArea = document.getElementById("marksArea");
const markForm = document.getElementById("markForm");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");

// Load class options
window.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL)
    .then(res => res.json())
    .then(classes => {
      classSelect.innerHTML = '<option value="">Select Class</option>';
      classes.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        classSelect.appendChild(opt);
      });
    });
});

// Load student names when class is selected
classSelect.addEventListener("change", () => {
  const className = classSelect.value;
  if (!className) return;

  fetch(`${scriptURL}?class=${className}`)
    .then(res => res.json())
    .then(names => {
      marksArea.innerHTML = "";
      names.forEach(name => {
        const row = document.createElement("div");
        row.className = "student-mark";
        row.innerHTML = `
          <label>${name}</label>
          <input type="number" min="0" max="100" pattern="\\d*" inputmode="numeric" name="${name}" required>
        `;
        marksArea.appendChild(row);
      });
    });
});

// Handle submission
markForm.addEventListener("submit", e => {
  e.preventDefault();

  const className = classSelect.value;
  const subject = document.getElementById("subject").value.trim();
  const type = document.getElementById("type").value;

  if (!className || !subject) {
    statusMsg.textContent = "Please fill all fields.";
    return;
  }

  const inputs = marksArea.querySelectorAll("input");
  const marks = [];

  for (let input of inputs) {
    const mark = parseInt(input.value);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      statusMsg.textContent = `Invalid mark for ${input.name}`;
      return;
    }
    marks.push({ name: input.name, mark });
  }

  if (!confirm("Are you sure you want to submit?")) return;

  submitBtn.disabled = true;
  statusMsg.textContent = "Submitting...";

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify({ class: className, subject, type, marks }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(response => {
    statusMsg.textContent = "Submitted successfully!";
    markForm.reset();
    marksArea.innerHTML = "";
    setTimeout(() => window.location.reload(), 1500);
  })
  .catch(err => {
    console.error(err);
    statusMsg.textContent = "Submission failed.";
    submitBtn.disabled = false;
  });
});
