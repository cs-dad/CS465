// dom needs to be loaded
document.addEventListener('DOMContentLoaded', () => {

    // get the container where cards will be rendered
    const container = document.getElementById('projects-container');

    // fetech the projects from the API
    fetch("/api/projects")
        .then((res) => res.json()) // convert to json
        .then((data) => {
            // ensure the response indicates success and the data is returned as an array.
            if (!data.success || !Array.isArray(data.data)) {
                showError("Failed to load projects");
                return;
            }

            // loop through the projects and create cards for each
            data.data.forEach(project => {

                // standard ajax dom injection
                const card = document.createElement("div");
                card.className = "project-card";

                const title = document.createElement("h3");
                title.className = "project-title";
                title.textContent = project.title || "Untitled Project";

                const desc = document.createElement("p");
                desc.className = "project-description";
                desc.textContent = project.description || "No description provided.";

                const tags = document.createElement("div");
                tags.className = "project-tags";
                
                // if the tech stack is an array/not empty, loop through it and create tags
                if (Array.isArray(project.techStack) && project.techStack.length > 0) {
                    project.techStack
                        .filter(tech => typeof tech === "string" && tech.trim() !== "") // filter out any empty strings or non-string values
                        .forEach(tech => { 
                            // for each filtered tech, create a new tag.
                            const tag = document.createElement("span");
                            tag.className = "project-tag";
                            tag.textContent = tech.trim();
                            tags.appendChild(tag);
                        });
                } else { // no tech inputted
                    const noTech = document.createElement("span");
                    noTech.className = "project-tag";
                    noTech.textContent = "No Tech";
                    tags.appendChild(noTech);
                }

                // append the render elements to the card
                card.appendChild(title);
                card.appendChild(desc);
                card.appendChild(tags);

                // add an event listener that will redirect to the project's page when clicked
                card.addEventListener("click", () => {
                    window.location.href = `/project/${project.id}`;
                });

                container.appendChild(card);
            });
        });
});

const showError = (message) => {
    const container = document.getElementById("notification-container");
    const box = document.createElement("div");
    box.className = "notification";
    box.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&#10005;</button>
  `;

    container.appendChild(box);

    void box.offsetWidth;
    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
        setTimeout(() => box.remove(), 400);
    }, 5000);
};