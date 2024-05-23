document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

let currentData = [];
let originalData = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                originalData = results.data;
                const filteredData = filterValidData(results.data);
                const aggregatedData = aggregateData(filteredData);
                currentData = aggregatedData;
                populateTable(currentData);
                drawLineGraph(currentData);
            }
        });
    }
}

function filterValidData(data) {
    return data.filter(item => item.work_year && !isNaN(item.salary_in_usd));
}

function aggregateData(data) {
    const aggregatedData = {};
    data.forEach(item => {
        const year = item.work_year;
        const salary = item.salary_in_usd;

        if (!aggregatedData[year]) {
            aggregatedData[year] = { total_jobs: 0, total_salary: 0 };
        }

        aggregatedData[year].total_jobs += 1;
        aggregatedData[year].total_salary += salary;
    });

    return Object.keys(aggregatedData).map(year => ({
        year: parseInt(year),
        total_jobs: aggregatedData[year].total_jobs,
        average_salary: aggregatedData[year].total_salary / aggregatedData[year].total_jobs
    })).filter(item => !isNaN(item.year) && !isNaN(item.total_jobs) && !isNaN(item.average_salary));
}

function populateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; 

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.year}</td>
            <td>${item.total_jobs}</td>
            <td>${item.average_salary.toFixed(2)}</td>
        `;
        row.addEventListener('click', () => showDetails(item.year));
        tableBody.appendChild(row);
    });
}

function sortTable(columnIndex, button) {
    const isAscending = button.classList.toggle('asc');
    button.classList.toggle('desc', !isAscending);
    currentData.sort((a, b) => {
        const cellA = Object.values(a)[columnIndex];
        const cellB = Object.values(b)[columnIndex];
        return isAscending ? cellA - cellB : cellB - cellA;
    });
    populateTable(currentData);
}

function drawLineGraph(data) {
    const ctx = document.getElementById('lineGraph').getContext('2d');
    const labels = data.map(item => item.year);
    const totalJobsData = data.map(item => item.total_jobs);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Jobs',
                data: totalJobsData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function showDetails(year) {
    const detailsTable = document.getElementById('detailsTable');
    const detailsTableBody = document.getElementById('detailsTableBody');
    detailsTableBody.innerHTML = ''; 

    const jobsForYear = originalData.filter(item => item.work_year === year);
    const jobCounts = jobsForYear.reduce((acc, job) => {
        acc[job.job_title] = (acc[job.job_title] || 0) + 1;
        return acc;
    }, {});

    Object.keys(jobCounts).forEach(jobTitle => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${jobTitle}</td>
            <td>${jobCounts[jobTitle]}</td>
        `;
        detailsTableBody.appendChild(row);
    });

    detailsTable.style.display = 'table';
}
