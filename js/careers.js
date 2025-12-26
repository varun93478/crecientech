document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("jobs-container");
    const noJobsMessage = document.getElementById("no-jobs-message");
    const paginationContainer = document.getElementById("pagination-container");

    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;
    let filteredJobs = [];

    // Initialize
    if (typeof CAREERS_DATA !== 'undefined') {
        filteredJobs = CAREERS_DATA; // In future, can filter by status 'open' if added to data
        renderJobs();
        renderPagination();
    } else {
        console.error("CAREERS_DATA not loaded");
    }

    function renderJobs() {
        container.innerHTML = "";

        if (filteredJobs.length === 0) {
            noJobsMessage.classList.remove("d-none");
            paginationContainer.innerHTML = "";
            return;
        }
        noJobsMessage.classList.add("d-none");

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const jobsToShow = filteredJobs.slice(start, end);

        jobsToShow.forEach(job => {
            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4";
            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0 job-card">
                    <div class="card-body d-flex flex-column p-4">
                        <div class="mb-3">
                            <span class="badge bg-light text-dark border">${job.department}</span>
                            <span class="badge bg-light text-dark border ms-1">${job.type}</span>
                        </div>
                        <h3 class="h5 mb-2 font-weight-bold">
                            <a href="career-details.html?id=${job.id}" class="text-decoration-none text-dark stretched-link">${job.title}</a>
                        </h3>
                        <p class="text-muted small mb-3"><i class="fa fa-map-marker me-1"></i> ${job.location}</p>
                        <p class="mb-4 card-text flex-grow-1">${job.description}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="small text-muted p-2">Exp: ${job.experience}</span>
                            <span class="btn btn-outline-primary btn-sm rounded-pill">View Details</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

        if (totalPages <= 1) return;

        const nav = document.createElement("nav");
        const ul = document.createElement("ul");
        ul.className = "pagination justify-content-center";

        // Previous
        ul.appendChild(createPageItem("Previous", currentPage > 1, () => {
            if (currentPage > 1) {
                currentPage--;
                renderJobs();
                renderPagination();
                window.scrollTo(0, 0);
            }
        }));

        // Numbers
        for (let i = 1; i <= totalPages; i++) {
            ul.appendChild(createPageItem(i, true, () => {
                currentPage = i;
                renderJobs();
                renderPagination();
                window.scrollTo(0, 0);
            }, i === currentPage));
        }

        // Next
        ul.appendChild(createPageItem("Next", currentPage < totalPages, () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderJobs();
                renderPagination();
                window.scrollTo(0, 0);
            }
        }));

        nav.appendChild(ul);
        paginationContainer.appendChild(nav);
    }

    function createPageItem(text, enabled, onClick, isActive = false) {
        const li = document.createElement("li");
        li.className = `page-item ${!enabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        
        const a = document.createElement("button");
        a.className = "page-link";
        a.textContent = text;
        a.type = "button";
        
        if (enabled) {
            a.onclick = onClick;
        }

        li.appendChild(a);
        return li;
    }
});
