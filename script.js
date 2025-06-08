document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const writeModeBtn = document.querySelector('.write-mode');
    const drawModeBtn = document.querySelector('.draw-mode');
    const writeArea = document.getElementById('writeArea');
    const drawArea = document.getElementById('drawArea');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const noteTextarea = document.querySelector('.note-textarea');
    const canvas = document.getElementById('drawCanvas');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const toolBtns = document.querySelectorAll('.tool-btn');

    // Canvas setup
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let currentSize = 5;

    // Set canvas size
    function resizeCanvas() {
        const container = drawArea.getBoundingClientRect();
        canvas.width = container.width - 40; // accounting for padding
        canvas.height = 400;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mode switching
    function switchMode(mode) {
        if (mode === 'write') {
            writeModeBtn.classList.add('active');
            drawModeBtn.classList.remove('active');
            writeArea.classList.add('active');
            drawArea.classList.remove('active');
        } else {
            writeModeBtn.classList.remove('active');
            drawModeBtn.classList.add('active');
            writeArea.classList.remove('active');
            drawArea.classList.add('active');
        }
    }

    writeModeBtn.addEventListener('click', () => switchMode('write'));
    drawModeBtn.addEventListener('click', () => switchMode('draw'));

    // Drawing functionality
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!isDrawing) return;

        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentTool === 'eraser' ? '#f3f4f6' : currentColor;

        // Get position (mouse or touch)
        let x, y;
        if (e.type.includes('touch')) {
            const rect = canvas.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.offsetX;
            y = e.offsetY;
        }

        if (currentTool === 'pen' || currentTool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        startDrawing(e);
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        draw(e);
    });

    canvas.addEventListener('touchend', stopDrawing);

    // Tool selection
    toolBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('.tool-btn.active')?.classList.remove('active');
            this.classList.add('active');
            currentTool = this.dataset.tool;
        });
    });

    // Color picker
    colorPicker.addEventListener('input', function() {
        currentColor = this.value;
    });

    // Brush size
    brushSize.addEventListener('input', function() {
        currentSize = this.value;
    });

    // Clear functionality
    clearBtn.addEventListener('click', function() {
        if (writeArea.classList.contains('active')) {
            noteTextarea.value = '';
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    // Save functionality
    saveBtn.addEventListener('click', function() {
        if (writeArea.classList.contains('active')) {
            const text = noteTextarea.value;
            if (text.trim() === '') {
                alert('Please write something before saving!');
                return;
            }
            localStorage.setItem('smartNoteText', text);
            alert('Note saved successfully!');
        } else {
            // For drawing, we'll save as image
            const dataURL = canvas.toDataURL('image/png');
            localStorage.setItem('smartNoteDrawing', dataURL);
            alert('Drawing saved successfully!');
        }
    });

    // Download functionality
    downloadBtn.addEventListener('click', function() {
        if (writeArea.classList.contains('active')) {
            const text = noteTextarea.value;
            if (text.trim() === '') {
                alert('Please write something before downloading!');
                return;
            }
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'smart-note.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            const dataURL = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'smart-note-drawing.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });

    // Load saved content
    function loadSavedContent() {
        const savedText = localStorage.getItem('smartNoteText');
        if (savedText) {
            noteTextarea.value = savedText;
        }

        const savedDrawing = localStorage.getItem('smartNoteDrawing');
        if (savedDrawing) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedDrawing;
        }
    }

    loadSavedContent();
});
// Enhanced save function with rename capability
saveBtn.addEventListener('click', function() {
    if (writeArea.classList.contains('active')) {
        saveContent('note', noteTextarea.value);
    } else {
        const dataURL = canvas.toDataURL('image/png');
        saveContent('drawing', dataURL);
    }
});

function saveContent(type, content) {
    // Get existing files
    let savedFiles = JSON.parse(localStorage.getItem('smartNoteFiles')) || [];
    
    // Default title based on type and date
    const defaultTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} ${new Date().toLocaleString()}`;
    
    // Prompt for file name with default suggestion
    const title = prompt('Name your file:', defaultTitle);
    if (title === null) return; // User cancelled
    
    // Create file object
    const file = {
        id: Date.now().toString(),
        type: type,
        title: title,
        content: content,
        date: new Date().toISOString()
    };
    
    // Add to beginning of array and save
    savedFiles.unshift(file);
    localStorage.setItem('smartNoteFiles', JSON.stringify(savedFiles));
    
    alert(`${type === 'note' ? 'Note' : 'Drawing'} saved successfully!`);
}