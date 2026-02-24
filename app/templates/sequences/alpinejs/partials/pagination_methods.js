// Pagination
nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredSequences.length) {
        this.currentPage++;
    }
},

previousPage() {
    if (this.currentPage > 1) {
        this.currentPage--;
    }
},

// Computed properties
get paginatedSequences() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredSequences.slice(start, end);
}