// dropdown toggle
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const toggleThemeBtn = document.getElementById("toggleThemeBtn");

dropdownBtn.addEventListener("click", () => {
    dropdownMenu.style.display =
    dropdownMenu.style.display === "flex" ? "none" : "flex";
});

toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
});

// close the dropdown when clicking outside of it
document.addEventListener("click", (event) => {
    if (!dropdownBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none";
    }
});