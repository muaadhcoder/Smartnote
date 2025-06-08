document.addEventListener('DOMContentLoaded', function() {
    // ... (keep existing filter and display code)
    
    // Add rename functionality to file cards
    savedFilesGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('rename-btn')) {
            const fileCard = e.target.closest('.saved-file-card');
            const fileId = fileCard.dataset.id;
            openRenameModal(fileId);
        }
    });
    
    // Rename modal functionality
    const renameModal = document.getElementById('renameModal');
    const newFileNameInput = document.getElementById('newFileName');
    let currentFileId = null;
    
    function openRenameModal(fileId) {
        const savedFiles = JSON.parse(localStorage.getItem('smartNoteFiles'));
        const file = savedFiles.find(f => f.id === fileId);
        
        if (file) {
            currentFileId = fileId;
            newFileNameInput.value = file.title;
            renameModal.style.display = 'flex';
            newFileNameInput.focus();
        }
    }
    
    function closeRenameModal() {
        renameModal.style.display = 'none';
        currentFileId = null;
    }
    
    function renameFile() {
        if (!currentFileId || !newFileNameInput.value.trim()) return;
        
        const savedFiles = JSON.parse(localStorage.getItem('smartNoteFiles'));
        const fileIndex = savedFiles.findIndex(f => f.id === currentFileId);
        
        if (fileIndex !== -1) {
            savedFiles[fileIndex].title = newFileNameInput.value.trim();
            localStorage.setItem('smartNoteFiles', JSON.stringify(savedFiles));
            displayFiles(document.querySelector('.filter-btn.active').dataset.filter);
        }
        
        closeRenameModal();
    }
    
    // Event listeners for modal
    document.getElementById('confirmRename').addEventListener('click', renameFile);
    document.getElementById('cancelRename').addEventListener('click', closeRenameModal);
    renameModal.addEventListener('click', function(e) {
        if (e.target === renameModal) closeRenameModal();
    });
    
    // ... (rest of existing code)
});