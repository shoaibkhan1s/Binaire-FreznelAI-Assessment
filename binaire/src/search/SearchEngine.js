class SearchEngine {
  constructor(data) {
    this.data = data || []; // The full dataset
  }

  setData(data) {
    this.data = data;
  }

  // Throttle wrapper (as requested)
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Debounce wrapper (as requested)
  debounce(func, delay) {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  search(query, searchType = 'start') {
    if (!query) return this.data;
    const lowerQuery = query.toLowerCase();

    return this.data.filter(model => {
      const name = (model.display_name || model.id || '').toLowerCase();
      const family = (model.family || '').toLowerCase();

      if (searchType === 'start') {
        return name.startsWith(lowerQuery) || family.startsWith(lowerQuery);
      } else { // 'middle' or general substring
        return name.includes(lowerQuery) || family.includes(lowerQuery);
      }
    });
  }

  filter(dataset, filters) {
    return dataset.filter(model => {
      // Tags matching
      if (filters.pipeline && model.hf_tags?.pipeline_tag !== filters.pipeline) return false;
      if (filters.family && model.family !== filters.family) return false;
      if (filters.architecture && model.architecture_category !== filters.architecture) return false;
      if (filters.weight && model.weight_format !== filters.weight) return false;

      // Safetensor min-max
      const safeTensorCount = parseInt(model.safetensor_file_count || '0', 10);
      if (filters.safetensorMin && safeTensorCount < filters.safetensorMin) return false;
      if (filters.safetensorMax && safeTensorCount > filters.safetensorMax) return false;

      return true;
    });
  }

  sort(dataset, sortBy) {
    return [...dataset].sort((a, b) => {
      const aCount = parseInt(a.safetensor_file_count || '0', 10);
      const bCount = parseInt(b.safetensor_file_count || '0', 10);
      
      if (sortBy === 'safetensorAsc') {
        return aCount - bCount;
      } else if (sortBy === 'safetensorDesc') {
        return bCount - aCount;
      } else if (sortBy === 'nameAsc') {
        return (a.display_name || a.id || '').localeCompare(b.display_name || b.id || '');
      } else if (sortBy === 'nameDesc') {
        return (b.display_name || b.id || '').localeCompare(a.display_name || a.id || '');
      }
      return 0;
    });
  }

  // Combined execution
  execute(query, searchType, filters, sortBy) {
    let result = this.search(query, searchType);
    if (filters) result = this.filter(result, filters);
    if (sortBy) result = this.sort(result, sortBy);
    return result;
  }
}

export default SearchEngine;
