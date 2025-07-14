// Wait until the entire page's DOM is fully loaded before running any of this script
document.addEventListener("DOMContentLoaded", () => {
  // Example: if URL is /projects/123, then projectId = "123"
  const projectId = window.location.pathname.split("/").pop();

  // Fetch the project data from our API using the project ID
  fetch(`/api/projects/${projectId}`)
    .then((res) => res.json()) // Parse the JSON response
    .then((data) => {
      // If the API returned success: false, display an error
      if (!data.success) {
        showError(data.message || "Failed to load project details.");
        return;
      }

      // Otherwise, store the returned project data
      const project = data.data;

      // Populate all the basic project text info onto the page
      // If any field is missing, fallback to a default "no data" string
      document.getElementById("project-title").textContent = project.title || "Untitled Project";
      document.getElementById("project-summary").textContent = project.description || "No description provided.";
      document.getElementById("project-overview").textContent = project.overview || "No overview provided.";
      document.getElementById("project-challenges").textContent = project.challenges || "No challenges provided.";
      document.getElementById("project-contributions").textContent = project.contributions || "No contributions provided.";

      // Populate the features list if any features were provided
      const featuresList = document.getElementById("project-features");
      if (project.features?.trim()) {
        // Split the features by comma and create a <li> for each
        project.features.split(",").forEach(feature => {
          if (feature.trim()) {
            const li = document.createElement("li");
            li.textContent = feature.trim();
            featuresList.appendChild(li);
          }
        });
      }

      // Handle the screenshots section
      const screenshotsSection = document.getElementById('screenshots-section');
      const screenshots = document.getElementById('project-screenshots');

      if (Array.isArray(project.screenshots) && project.screenshots.length > 0) {
        // For each screenshot, create an image and optional caption
        project.screenshots.forEach(screenshot => {
          if (!screenshot?.path) return; // Skip if screenshot path is missing

          const wrapper = document.createElement('div');
          wrapper.className = 'screenshot-wrapper';

          const img = document.createElement('img');
          img.src = screenshot.path;
          img.alt = screenshot.label || 'Screenshot';
          img.className = 'screenshot';

          wrapper.appendChild(img);

          // If the screenshot has a label, add a caption underneath
          if (screenshot.label) {
            const caption = document.createElement('p');
            caption.textContent = screenshot.label;
            caption.className = 'screenshot-caption';
            wrapper.appendChild(caption);
          }

          screenshots.appendChild(wrapper);
        });
      } else {
        // No screenshots? Just remove the whole section
        screenshotsSection?.remove();
      }

      // Populate any important links (e.g. GitHub, live demo, etc.)
      const links = document.getElementById('project-links');
      if (Array.isArray(project.important_links) && project.important_links.length > 0) {
        project.important_links.forEach(link => {
          // Each link must have a label and a URL to be valid
          if (link.label && link.url) {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.label;
            a.target = '_blank'; // Opens in new tab
            a.className = 'link-card';
            links.appendChild(a);
          }
        });
      }
    })
    .catch((err) => {
      // If the API call failed
      console.error("Error fetching project details:", err);
      showError("Failed to load project details.");
    });

});


// Scrolls the screenshot carousel left or right based on direction
const scrollCarousel = (direction) => {
  const container = document.getElementById('project-screenshots');
  const slideWidth = container.offsetWidth;

  container.scrollBy({
    left: direction === 'left' ? -slideWidth : slideWidth,
    behavior: 'smooth'
  });
}


// Show an error message using a toast-style popup
const showError = (message) => {
  const container = document.getElementById("notification-container");

  const box = document.createElement("div");
  box.className = "notification";
  box.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&#10005;</button>
  `;

  container.appendChild(box);

  // Trigger CSS transition for fade-in
  void box.offsetWidth;
  box.classList.add("show");

  // Automatically remove the notification after 5 seconds
  setTimeout(() => {
    box.classList.remove("show");
    setTimeout(() => box.remove(), 400); // Allow fade-out to finish
  }, 5000);
}
