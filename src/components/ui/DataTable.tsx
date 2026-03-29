import React from 'react';

interface DataTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-x-auto rounded-[9px] border border-[var(--border)]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="text-[10.5px] uppercase tracking-[1px] text-[var(--text3)] font-medium p-[9px_14px] bg-[#FAFAF8] border-b border-[var(--border)] text-left whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.map((item, i) => (
            <tr key={i} className="transition-colors duration-100 hover:bg-[#FAFAF8]">
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
