// JavaScript Document
const zoomButton = document.getElementById('zoom');
const currentPage = document.getElementById('current_page');
const viewer = document.querySelector('.pdf-viewer');
let currentPDF = {};

const mainElement = document.querySelector('main');
const pdfURL = mainElement.getAttribute('data-pdf-url');

function resetCurrentPDF() {
    currentPDF = {
        file: null,
        countOfPages: 0,
        currentPage: 1,
        zoom: 1.00
    };
}

function loadPDF(url) {
    const pdfFile = pdfjsLib.getDocument(url);
    resetCurrentPDF();
    pdfFile.promise.then((doc) => {
        currentPDF.file = doc;
        currentPDF.countOfPages = doc.numPages;
        viewer.classList.remove('hidden');
        document.querySelector('main h3').classList.add("hidden");
        zoomButton.disabled = false;
        renderCurrentPage();
    });
}

zoomButton.addEventListener('input', () => {
    if (currentPDF.file) {
        document.getElementById('zoomValue').innerHTML = zoomButton.value + "%";
        currentPDF.zoom = parseInt(zoomButton.value) / 100;
        renderCurrentPage();
    }
});

document.getElementById('next').addEventListener('click', () => {
    const isValidPage = currentPDF.currentPage < currentPDF.countOfPages;
    if (isValidPage) {
        currentPDF.currentPage += 1;
        renderCurrentPage();
    }
});

document.getElementById('previous').addEventListener('click', () => {
    const isValidPage = currentPDF.currentPage - 1 > 0;
    if (isValidPage) {
        currentPDF.currentPage -= 1;
        renderCurrentPage();
    }
});

function renderCurrentPage() {
    currentPDF.file.getPage(currentPDF.currentPage).then((page) => {
        const context = viewer.getContext('2d');
        const viewport = page.getViewport({ scale: currentPDF.zoom });
        viewer.height = viewport.height;
        viewer.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);
    });
    currentPage.innerHTML = currentPDF.currentPage + ' of ' + currentPDF.countOfPages;
}

// Load the specified PDF
loadPDF(pdfURL);

// Javascript adjustments for Zoom and Pan
let isPanning = false;
let startX, startY;

viewer.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX - viewer.offsetLeft;
    startY = e.clientY - viewer.offsetTop;
    viewer.style.cursor = 'grabbing';
});

viewer.addEventListener('mouseup', () => {
    isPanning = false;
    viewer.style.cursor = 'grab';
});

viewer.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const x = e.clientX - startX;
    const y = e.clientY - startY;
    viewer.style.transform = `translate(${x}px, ${y}px) scale(${currentPDF.zoom})`;
});

// Ensure zoom maintains the proper canvas scaling and position
zoomButton.addEventListener('input', () => {
    if (currentPDF.file) {
        document.getElementById('zoomValue').innerHTML = zoomButton.value + "%";
        currentPDF.zoom = parseInt(zoomButton.value) / 100;

        // Update scaling and keep panning reset
        viewer.style.transform = `scale(${currentPDF.zoom})`;
        viewer.style.transformOrigin = "center center"; // Keep scaling centered
        renderCurrentPage();
    }
});
