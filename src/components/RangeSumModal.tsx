import React, { useState, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import { parseMultiSource } from '../lib/appUtils';
import { resolveChipRender } from '../lib/colorRender';
import { formatCellDisplay } from '../lib/formatCellDisplay';
import { getSourcesFromTotalQty, getSumForSourceAcrossKeys } from '../lib/rangeSumUtils';
import { useOverviewColumnPin } from '../hooks/useOverviewColumnPin';
import { Modal, Button, Input } from './ui';
import { useToast } from './ToastProvider';
import { Search } from 'lucide-react';

export function RangeSumModal({
  isOpen,
  onClose,
  rows,
  columns,
  pageName,
  getImageUrl,
  onApply
}: {
  isOpen: boolean;
  onClose: () => void;
  rows: any[];
  columns: any[];
  pageName: string;
  getImageUrl: (val: any, isThumb?: boolean) => string;
  onApply: (res: { startName: string, endName: string, keys: string[], selectedSources: string[] }) => void;
}) {
  const { toast } = useToast();
  const saleCols = useMemo(() => columns.filter(c => c.type === 'sale_tracker'), [columns]);

  const [checkedSaleCols, setCheckedSaleCols] = useState<Set<string>>(new Set());
  const [startCol, setStartCol] = useState<string | null>(null);
  const [endCol, setEndCol] = useState<string | null>(null);

  const [lastClickedCol, setLastClickedCol] = useState<string | null>(null);

  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  
  const [startSearch, setStartSearch] = useState("");
  const [endSearch, setEndSearch] = useState("");
  const [rowSearch, setRowSearch] = useState("");
  const deferredRowSearch = useDeferredValue(rowSearch);

  const startDropdownRef = useRef<HTMLDivElement>(null);
  const endDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCheckedSaleCols(new Set(saleCols.map(c => c.key)));
      setStartCol(null);
      setEndCol(null);
      setStartSearch("");
      setEndSearch("");
      setRowSearch("");
      setLastClickedCol(null);
      setShowStartDropdown(false);
      setShowEndDropdown(false);
    }
  }, [isOpen, saleCols]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showStartDropdown && startDropdownRef.current && !startDropdownRef.current.contains(e.target as Node)) {
        setShowStartDropdown(false);
      }
      if (showEndDropdown && endDropdownRef.current && !endDropdownRef.current.contains(e.target as Node)) {
        setShowEndDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStartDropdown, showEndDropdown]);

  const applyRangeToSet = (st: string, en: string) => {
    const idx1 = saleCols.findIndex(c => c.key === st);
    const idx2 = saleCols.findIndex(c => c.key === en);
    if (idx1 !== -1 && idx2 !== -1) {
      const min = Math.min(idx1, idx2);
      const max = Math.max(idx1, idx2);
      const nextSet = new Set<string>();
      for (let i = min; i <= max; i++) {
        nextSet.add(saleCols[i].key);
      }
      setCheckedSaleCols(nextSet);
    }
  };

  const handleStartSelect = (colKey: string) => {
    setStartCol(colKey);
    setShowStartDropdown(false);
    if (endCol) applyRangeToSet(colKey, endCol);
  };

  const handleEndSelect = (colKey: string) => {
    setEndCol(colKey);
    setShowEndDropdown(false);
    if (startCol) applyRangeToSet(startCol, colKey);
  };

  const filterCols = (cols: typeof saleCols, query: string, currentVal: string | null) => {
    const q = query.toLowerCase().trim();
    if (!q) return cols;
    const terms = q.split(/\s+/);
    return cols.filter(c => {
      if (currentVal && c.key === currentVal) return true;
      return terms.every(term => c.name.toLowerCase().includes(term));
    });
  };

  const startFiltered = filterCols(saleCols, startSearch, startCol);
  const endFiltered = filterCols(saleCols, endSearch, endCol);

  const startObj = saleCols.find(c => c.key === startCol);
  const endObj = saleCols.find(c => c.key === endCol);

  const filteredRows = useMemo(() => {
    if (!deferredRowSearch.trim()) return rows;
    const lowerQ = deferredRowSearch.toLowerCase();
    return rows.filter(row => {
      // Check sources
      const sources = getSourcesFromTotalQty(row);
      if (sources.some(s => s.toLowerCase().includes(lowerQ))) return true;
      // Check text cols
      for (const col of columns) {
        if (col.type === 'text' || col.type === 'number') {
          const val = String(row[col.key] || '').toLowerCase();
          if (val.includes(lowerQ)) return true;
        }
      }
      return false;
    });
  }, [rows, deferredRowSearch, columns]);

  // Col sizes and pinning
  const tableCols = useMemo(() => {
    const res: any[] = [];
    res.push({ key: '__index', name: '#', type: 'system' });
    const imageCol = columns.find(c => c.type === 'image');
    if (imageCol) res.push(imageCol);
    for (const c of columns) {
      if (c.type !== 'sale_tracker' && c.type !== 'image' && c.key !== 'total_qty' && c.key !== 'remaining_qty' && c.key !== 'sr' && c.type !== 'system_serial') {
        res.push(c);
      }
    }
    const tCol = columns.find(c => c.key === 'total_qty');
    if (tCol) res.push(tCol);
    const rCol = columns.find(c => c.key === 'remaining_qty');
    if (rCol) res.push(rCol);
    res.push({ key: '__range_sum', name: 'Range Sum', type: 'system' });
    for (const sc of saleCols) {
      res.push(sc);
    }
    return res;
  }, [columns, saleCols]);

  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const colWidthsRef = useRef(colWidths);
  useEffect(() => { colWidthsRef.current = colWidths; }, [colWidths]);

  const getColWidth = (id: string) => {
    if (colWidths[id]) return colWidths[id];
    if (id === '__index') return 60;
    if (id === '__range_sum') return 160;
    const c = columns.find(col => col.key === id);
    if (c?.type === 'image') return 80;
    if (id === 'total_qty' || id === 'remaining_qty' || c?.type === 'sale_tracker') return 150;
    return 180;
  };

  const colIds = tableCols.map(c => c.key);
  const { pinnedCols, togglePin, pinnedOffsets, lastPinnedColId } = useOverviewColumnPin([], undefined, getColWidth, colWidths, isOpen, colIds);

  const startResize = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const th = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    const startX = e.clientX;
    const startW = colWidths[id] ?? th.offsetWidth;
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      const newW = Math.max(60, startW + (ev.clientX - startX));
      setColWidths(prev => ({ ...prev, [id]: newW }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const resetCol = (id: string) => {
    setColWidths(prev => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const handleHeaderCheck = (e: React.MouseEvent, colKey: string) => {
    e.stopPropagation();
    const isChecked = !checkedSaleCols.has(colKey);
    const newSet = new Set(checkedSaleCols);

    if (e.shiftKey && lastClickedCol) {
      const idx1 = saleCols.findIndex(c => c.key === lastClickedCol);
      const idx2 = saleCols.findIndex(c => c.key === colKey);
      if (idx1 !== -1 && idx2 !== -1) {
        const min = Math.min(idx1, idx2);
        const max = Math.max(idx1, idx2);
        for (let i = min; i <= max; i++) {
          if (isChecked) newSet.add(saleCols[i].key);
          else newSet.delete(saleCols[i].key);
        }
      }
    } else {
      if (isChecked) newSet.add(colKey);
      else newSet.delete(colKey);
    }
    setCheckedSaleCols(newSet);
    setLastClickedCol(colKey);
  };

  const renderPinBtn = (colId: string) => {
    const isPinned = pinnedCols.includes(colId);
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); togglePin(colId); }}
        className={`p-0 m-0 ml-1 bg-transparent border-0 cursor-pointer transition-opacity ${isPinned ? 'opacity-100 hover:opacity-80' : 'opacity-40 hover:opacity-100 grayscale-[0.5]'}`}
        title={isPinned ? "Unpin column (unfreeze)" : "Pin column (freeze)"}
      >
        📌
      </button>
    );
  };

  const getHeaderCls = (colId: string, baseClass: string) => {
    const isPinned = pinnedCols.includes(colId);
    const offset = pinnedOffsets[colId] || 0;
    const isLastPinned = isPinned && colId === lastPinnedColId;
    return `${baseClass} ${isPinned ? 'sticky z-20' : 'relative'} ${isLastPinned ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`;
  };

  const getCellCls = (colId: string, baseClass: string) => {
    const isPinned = pinnedCols.includes(colId);
    const offset = pinnedOffsets[colId] || 0;
    const isLastPinned = isPinned && colId === lastPinnedColId;
    return `${baseClass} ${isPinned ? 'sticky z-10' : 'relative'} ${isLastPinned ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`;
  };

  const renderDropdown = (
    show: boolean,
    search: string,
    setSearch: (s: string) => void,
    filtered: typeof saleCols,
    selected: string | null,
    onSelect: (k: string) => void,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    if (!show) return null;
    return (
      <div ref={ref} className="absolute top-full mt-1 left-0 w-[280px] bg-white border border-gray-300 rounded shadow-lg z-50 p-2">
        <input 
          type="text" 
          placeholder="Search columns..." 
          className="w-full border border-gray-300 rounded p-1.5 text-sm mb-2 outline-none focus:border-purple-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-400 italic">No matching columns</div>
          ) : (
            filtered.map(c => (
              <div 
                key={c.key} 
                onClick={() => onSelect(c.key)}
                className={`p-1.5 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-purple-50 ${selected === c.key ? 'bg-purple-100 font-bold' : ''}`}
              >
                {c.name}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderSourceChip = (sourceName: string, val: any, color?: string) => {
    const render = resolveChipRender(color || sourceName);
    return (
      <span
        key={sourceName}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm mb-1 mr-1 border ${render.kind === "class" ? render.className : ""}`}
        style={render.kind === "style" ? render.style : undefined}
      >
        <span className="opacity-90">{sourceName}:</span>
        <span className="font-extrabold">{val}</span>
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📈 Calculate Range Sum (${pageName})`}
      width="95vw"
      noScroll={true}
    >
      <div className="flex flex-col h-[calc(90vh-90px)]">
        
        {/* Range bar */}
        <div className="flex items-center gap-4 mb-4 mt-2">
          <div className="relative inline-flex items-center gap-3 bg-purple-50 p-2 rounded border border-purple-100">
            <div className="relative">
              <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-0.5">Start</div>
              <button 
                className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm font-semibold hover:bg-gray-50 min-w-[120px] justify-between"
                onClick={() => { setShowStartDropdown(!showStartDropdown); setShowEndDropdown(false); }}
              >
                <span>{startObj ? startObj.name : <span className="text-gray-400 font-normal">Select column</span>}</span>
                <span className="text-[10px]">▼</span>
              </button>
              {renderDropdown(showStartDropdown, startSearch, setStartSearch, startFiltered, startCol, handleStartSelect, startDropdownRef)}
            </div>
            
            <div className="text-gray-400 font-bold text-lg mt-4">→</div>

            <div className="relative">
              <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-0.5">End</div>
              <button 
                className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm font-semibold hover:bg-gray-50 min-w-[120px] justify-between"
                onClick={() => { setShowEndDropdown(!showEndDropdown); setShowStartDropdown(false); }}
              >
                <span>{endObj ? endObj.name : <span className="text-gray-400 font-normal">Select column</span>}</span>
                <span className="text-[10px]">▼</span>
              </button>
              {renderDropdown(showEndDropdown, endSearch, setEndSearch, endFiltered, endCol, handleEndSelect, endDropdownRef)}
            </div>

            <button 
              className="mt-4 ml-2 px-3 py-1 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 transition-colors"
              onClick={() => {
                setStartCol(null);
                setEndCol(null);
                setCheckedSaleCols(new Set(saleCols.map(c => c.key)));
              }}
            >
              Clear Range
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCheckedSaleCols(new Set(saleCols.map(c => c.key)))}>Select All Sale Columns</Button>
            <Button variant="outline" size="sm" onClick={() => setCheckedSaleCols(new Set())}>Select None</Button>
          </div>
        </div>

        {/* Row search */}
        <div className="relative w-full mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search rows by any text or source name..."
            className="w-full pl-9 pr-4 py-2 border-2 border-green-500 rounded outline-none focus:border-green-600 text-sm font-medium"
            value={rowSearch}
            onChange={(e) => setRowSearch(e.target.value)}
          />
        </div>

        <div className="text-xs text-gray-500 mb-3 font-medium flex items-center justify-between">
          <span>
            <strong className="text-purple-700">{checkedSaleCols.size}</strong> of {saleCols.length} sale columns are currently checked. 
            A header checkbox includes or excludes a column. <span className="italic">Shift+click</span> selects a range.
          </span>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-auto border border-gray-200 rounded relative bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <tr>
                {tableCols.map(col => {
                  let bgCls = "bg-gray-100";
                  if (col.key === 'total_qty' || col.key === 'remaining_qty') bgCls = "bg-blue-50 text-blue-900";
                  else if (col.key === '__range_sum') bgCls = "bg-green-100 text-green-900";
                  else if (col.type === 'sale_tracker') bgCls = "bg-purple-50 text-purple-900";
                  
                  return (
                    <th 
                      key={col.key}
                      style={{ 
                        width: getColWidth(col.key),
                        minWidth: getColWidth(col.key),
                        maxWidth: getColWidth(col.key),
                        left: pinnedCols.includes(col.key) ? pinnedOffsets[col.key] : undefined 
                      }}
                      className={getHeaderCls(col.key, `p-2 border-b border-r border-gray-200 font-bold ${bgCls} align-middle truncate`)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1 overflow-hidden">
                          {col.type === 'sale_tracker' && (
                            <input 
                              type="checkbox" 
                              checked={checkedSaleCols.has(col.key)}
                              onChange={() => {}}
                              onClick={(e) => handleHeaderCheck(e, col.key)}
                              className="mr-1 cursor-pointer w-3.5 h-3.5 accent-purple-600 flex-shrink-0"
                            />
                          )}
                          <span className="truncate">{col.name}</span>
                          {renderPinBtn(col.key)}
                        </div>
                        <div 
                          className="w-1.5 h-6 cursor-col-resize hover:bg-purple-400 rounded-full flex-shrink-0 opacity-50 ml-1"
                          onMouseDown={(e) => startResize(e, col.key)}
                          onDoubleClick={() => resetCol(col.key)}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const totalSources = parseMultiSource(row.total_qty);
                const keys = Array.from(checkedSaleCols) as string[];

                let allSourcesSum = 0;

                return (
                  <tr key={row.id} className="hover:bg-gray-50 group border-b border-gray-100">
                    {tableCols.map(col => {
                      let cellContent: React.ReactNode = null;
                      
                      const isUncheckedSale = col.type === 'sale_tracker' && !checkedSaleCols.has(col.key);
                      const tdStyle = { 
                        width: getColWidth(col.key),
                        minWidth: getColWidth(col.key),
                        maxWidth: getColWidth(col.key),
                        left: pinnedCols.includes(col.key) ? pinnedOffsets[col.key] : undefined,
                        opacity: isUncheckedSale ? 0.4 : 1
                      };
                      
                      let bgCls = "bg-white group-hover:bg-gray-50";

                      if (col.key === '__index') {
                        cellContent = <div className="text-gray-400 font-mono">{idx + 1}</div>;
                      } else if (col.type === 'image') {
                        const imgVal = row[col.key];
                        cellContent = imgVal ? (
                          <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={getImageUrl(imgVal, true)} className="w-full h-full object-cover" />
                          </div>
                        ) : <div className="text-gray-300 text-xs">-</div>;
                      } else if (col.key === 'total_qty') {
                        bgCls = "bg-blue-50/30 group-hover:bg-blue-50";
                        cellContent = (
                          <div className="flex flex-col items-start w-full">
                            {totalSources.map((s: any) => renderSourceChip(s.source, s.qty, s.color))}
                            {totalSources.length === 0 && <span className="text-gray-400 font-medium text-xs">0</span>}
                          </div>
                        );
                      } else if (col.key === 'remaining_qty') {
                        bgCls = "bg-blue-50/30 group-hover:bg-blue-50";
                        const allSaleKeys = saleCols.map(c => String(c.key)) as string[];
                        cellContent = (
                          <div className="flex flex-col items-start w-full">
                            {totalSources.map((s: any) => {
                              const used = getSumForSourceAcrossKeys(row, s.source, allSaleKeys);
                              const remain = parseFloat(String(s.qty)) - used;
                              return renderSourceChip(s.source, remain, s.color);
                            })}
                            {totalSources.length === 0 && <span className="text-gray-400 font-medium text-xs">0</span>}
                          </div>
                        );
                      } else if (col.key === '__range_sum') {
                        bgCls = "bg-green-50/30 group-hover:bg-green-50";
                        cellContent = (
                          <div className="flex flex-col items-start w-full">
                            {totalSources.map((s: any) => {
                              const sum = getSumForSourceAcrossKeys(row, s.source, keys);
                              allSourcesSum += sum;
                              return renderSourceChip(s.source, sum, s.color);
                            })}
                            {totalSources.length === 0 && <span className="text-gray-400 font-medium text-xs">0</span>}
                            <div className="mt-2 w-full pt-1 border-t border-green-200/50">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-200 text-green-900 shadow-sm border border-green-300">
                                Total: {allSourcesSum}
                              </span>
                            </div>
                          </div>
                        );
                      } else if (col.type === 'sale_tracker') {
                        bgCls = isUncheckedSale ? "bg-gray-100 group-hover:bg-gray-200" : "bg-purple-50/30 group-hover:bg-purple-50";
                        const raw = row[col.key];
                        if (!raw) {
                          cellContent = <span className="text-gray-300 text-xs font-medium">0</span>;
                        } else {
                          const parsed = parseMultiSource(raw);
                          if (parsed.length === 0) {
                            cellContent = <span className="text-gray-300 text-xs font-medium">0</span>;
                          } else {
                            cellContent = (
                              <div className="flex flex-col items-start w-full">
                                {parsed.map((s: any) => renderSourceChip(s.source, s.qty, s.color))}
                              </div>
                            );
                          }
                        }
                      } else {
                        // text / number / date / options
                        cellContent = (
                          <div className="truncate text-gray-700">
                            {formatCellDisplay(row[col.key])}
                          </div>
                        );
                      }

                      return (
                        <td 
                          key={col.key} 
                          style={tdStyle}
                          className={getCellCls(col.key, `p-2 border-r border-gray-200 align-top ${bgCls}`)}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={tableCols.length} className="p-8 text-center text-gray-400 italic">
                    No rows match the search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (checkedSaleCols.size === 0) {
                toast("Please select at least one column.");
                return;
              }
              const checkedList = saleCols.filter(c => checkedSaleCols.has(c.key));
              onApply({
                startName: checkedList[0].name,
                endName: checkedList[checkedList.length - 1].name,
                keys: checkedList.map(c => c.key),
                selectedSources: []
              });
              onClose();
            }}
          >
            Calculate Sum
          </Button>
        </div>
      </div>
    </Modal>
  );
}
