document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("id");
    const container = document.getElementById("job-details-container");
    const breadcrumbTitle = document.getElementById("breadcrumb-title");

    if (!jobId) {
        showError("Job ID not provided.");
        return;
    }

    // CAREERS_DATA is loaded from js/careers-data.js
    if (typeof CAREERS_DATA === 'undefined') {
        showError("Unable to load job data.");
        return;
    }

    const job = CAREERS_DATA.find(j => j.id === jobId);

    if (!job) {
        showError("Job not found.");
        return;
    }

    // Update Page Title
    document.title = `${job.title} • Careers at Crecientech`;
    breadcrumbTitle.textContent = job.title;

    // Render Content
    container.innerHTML = `
        <h1 class="font-38-josefin secondary-black mb-2">${job.title}</h1>
        <div class="d-flex flex-wrap gap-3 mb-4 text-muted small">
            <span><i class="fa fa-briefcase me-1"></i> ${job.department}</span>
            <span><i class="fa fa-map-marker me-1"></i> ${job.location}</span>
            <span><i class="fa fa-clock-o me-1"></i> ${job.type}</span>
            <span><i class="fa fa-graduation-cap me-1"></i> ${job.experience}</span>
        </div>
        
        <div class="job-content primary-gray">
            ${job.fullDescription}
        </div>

        <div class="mt-5 pt-3 border-top">
            <h3 class="font-24-josefin mb-3">Interested?</h3>
            <p>Send your resume and portfolio to <a href="mailto:ambassador@crecientech.com">ambassador@crecientech.com</a></p>
        </div>
        
        <div class="mt-4">
            <a href="careers.html" class="text-decoration-none"><i class="fa fa-arrow-left me-2"></i> Back to Careers</a>
        </div>
    `;

    function showError(message) {
        container.innerHTML = `
            <div class="alert alert-warning text-center">
                <h3>${message}</h3>
                <p>Please check the URL or return to the <a href="careers.html">Careers page</a>.</p>
            </div>
        `;
        breadcrumbTitle.textContent = "Error";
    }

    function formatDate(dateString) {
        if (!dateString) return "Open until filled";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});
