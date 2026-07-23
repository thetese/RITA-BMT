// Mock Supabase client that actually fetches from the Desktop App's local Express API (http://localhost:4000)
// This is to avoid ENOTFOUND errors while testing locally when a real Supabase project is paused or unreachable.

const API_BASE = 'http://localhost:4000/api';

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.isSingle = false;
    this.limitCount = null;
    this.sortField = null;
    this.sortAscending = true;
  }

  select() {
    return this;
  }

  eq(field, value) {
    this.filters.push({ field, value });
    return this;
  }

  order(field, options) {
    this.sortField = field;
    if (options && options.ascending !== undefined) {
      this.sortAscending = options.ascending;
    }
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve, reject) {
    try {
      const response = await fetch(`${API_BASE}/${this.table}`);
      if (!response.ok) throw new Error('Network response was not ok');
      let data = await response.json();

      // Apply filters
      for (const filter of this.filters) {
        data = data.filter(item => item[filter.field] == filter.value);
      }

      // Apply sort
      if (this.sortField) {
        data.sort((a, b) => {
          if (a[this.sortField] < b[this.sortField]) return this.sortAscending ? -1 : 1;
          if (a[this.sortField] > b[this.sortField]) return this.sortAscending ? 1 : -1;
          return 0;
        });
      }

      // Apply limit
      if (this.limitCount !== null) {
        data = data.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        if (data.length === 0) {
          resolve({ data: null, error: new Error('Row not found') });
        } else {
          resolve({ data: data[0], error: null });
        }
      } else {
        resolve({ data, error: null });
      }
    } catch (error) {
      resolve({ data: null, error });
    }
  }
}

export const supabase = {
  from: (table) => new MockQueryBuilder(table),
};
