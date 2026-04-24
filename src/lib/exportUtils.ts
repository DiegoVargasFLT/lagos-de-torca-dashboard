import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React from 'react';

/**
 * Exports a DOM element as a PNG image.
 */
export const exportAsImage = async (ref: React.RefObject<HTMLDivElement | null>, fileName: string) => {
  if (ref.current === null) return;
  
  const element = ref.current;
  const originalStyle = element.style.cssText;
  
  try {
    // 1. Ensure all charts and elements are rendered and visible.
    // We force the element to expand to its full content height for the snapshot.
    const scrollHeight = element.scrollHeight;
    const scrollWidth = element.scrollWidth;
    
    // Temporarily apply styles to capture the full CONTENT, not just visible window
    element.style.height = `${scrollHeight}px`;
    element.style.width = scrollWidth > 1200 ? `${scrollWidth}px` : '1200px';
    element.style.padding = '40px';
    element.style.backgroundColor = '#ffffff';
    element.style.overflow = 'visible';
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.zIndex = '-9999';

    const dataUrl = await toPng(element, { 
      backgroundColor: '#ffffff', 
      cacheBust: true,
      pixelRatio: 2, 
      width: scrollWidth > 1200 ? scrollWidth + 80 : 1280, // Adding padding factor
      height: scrollHeight + 80,
      style: {
        borderRadius: '0',
        boxShadow: 'none',
        margin: '0',
      }
    });

    const link = document.createElement('a');
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export image', err);
  } finally {
    // Restore original styles
    if (element) {
      element.style.cssText = originalStyle;
    }
  }
};

/**
 * Exports data to an Excel file with basic professional formatting.
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = "Data") => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns (rough approximation)
    const objectMaxLength: number[] = [];
    data.forEach((row: any) => {
      Object.keys(row).forEach((key, index) => {
        const value = row[key] ? row[key].toString() : '';
        const columnLength = Math.max(key.length, value.length);
        objectMaxLength[index] = Math.max(objectMaxLength[index] || 0, columnLength);
      });
    });
    
    worksheet['!cols'] = objectMaxLength.map(w => ({ wch: w + 2 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Buffer to binary
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    saveAs(dataBlob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (err) {
    console.error('Failed to export excel', err);
  }
};
