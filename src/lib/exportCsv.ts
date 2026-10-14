/**
 * Utility function to export tabular datasets to CSV files in the browser.
 * Handles proper escaping, UTF-8 BOM encoding for Excel/Numbers compatibility,
 * and intelligent formatting for nested objects and dates.
 */

export interface ExportCsvOptions<T = any> {
  data: T[];
  filename?: string;
  formatter?: (item: T, index: number) => Record<string, any>;
  columns?: { key: string; label: string }[];
}

/**
 * Format an individual cell value safely for CSV export.
 */
function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().replace('T', ' ').substring(0, 19);
  }

  if (Array.isArray(value)) {
    // If it's an array of primitives, join by comma; if array of objects, extract names or JSON
    const mapped = value.map((item) => {
      if (item === null || item === undefined) return '';
      if (typeof item === 'object') {
        return item.fullName || item.name || item.title || item.email || JSON.stringify(item);
      }
      return String(item);
    });
    return mapped.join('; ');
  }

  if (typeof value === 'object') {
    // If it's a MongoDB-style populated document or nested object
    if (value.fullName || value.name || value.email) {
      const parts = [value.fullName || value.name, value.email].filter(Boolean);
      return parts.join(' - ');
    }
    if (value.title) {
      return String(value.title);
    }
    // Address object check
    if (value.city || value.country || value.street) {
      return [value.street, value.city, value.state, value.country].filter(Boolean).join(', ');
    }
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Escape a CSV field according to RFC 4180 rules.
 */
function escapeCsvField(val: string): string {
  const needsQuotes = /[",\n\r]/.test(val);
  const escaped = val.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/**
 * Exports data array to a CSV file downloaded directly in the client browser.
 * Returns the count of exported records.
 */
export function exportToCsv<T = any>({
  data,
  filename = 'export',
  formatter,
  columns,
}: ExportCsvOptions<T>): number {
  if (!data || data.length === 0) {
    throw new Error('No records available to export.');
  }

  // Generate rows as key-value records
  let formattedRows: Record<string, any>[] = [];

  if (formatter) {
    formattedRows = data.map((item, idx) => formatter(item, idx));
  } else if (columns && columns.length > 0) {
    formattedRows = data.map((item: any) => {
      const row: Record<string, any> = {};
      columns.forEach((col) => {
        row[col.label] = item[col.key];
      });
      return row;
    });
  } else {
    // Derive keys automatically from first object
    formattedRows = data.map((item: any) => {
      const row: Record<string, any> = {};
      Object.keys(item).forEach((key) => {
        // Skip private or action identifiers like __v, internal methods, or image data URLs
        if (key.startsWith('_') && key !== '_id') return;
        if (key === 'profileImage' || key === 'avatar') return;
        row[key] = item[key];
      });
      return row;
    });
  }

  if (formattedRows.length === 0) {
    throw new Error('No valid columns found for CSV export.');
  }

  // Extract header names
  const headers = Object.keys(formattedRows[0]);

  // Build CSV content
  const headerLine = headers.map(escapeCsvField).join(',');
  const rowLines = formattedRows.map((row) => {
    return headers
      .map((header) => {
        const rawVal = row[header];
        const formatted = formatCellValue(rawVal);
        return escapeCsvField(formatted);
      })
      .join(',');
  });

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 encoded text properly
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  // Trigger file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  const cleanFilename = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}.csv`;

  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', cleanFilename);
  downloadLink.style.display = 'none';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  return formattedRows.length;
}
