"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArchiveFilter({ initialDate, initialMonth, initialYear }) {
    const router = useRouter();
    const [filterType, setFilterType] = useState(initialDate ? 'date' : 'month');
    
    // For Month/Year picker
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];
    
    const [selectedDate, setSelectedDate] = useState(initialDate || '');
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || (new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(initialYear || currentYear.toString());

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        
        if (filterType === 'date' && selectedDate) {
            router.push(`/archive?date=${selectedDate}`);
        } else if (filterType === 'month') {
            router.push(`/archive?month=${selectedMonth}&year=${selectedYear}`);
        }
    };

    return (
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex gap-4 items-center w-full sm:w-auto">
                <label className="flex items-center gap-1 cursor-pointer font-medium text-gray-700">
                    <input 
                        type="radio" 
                        name="filterType" 
                        value="date" 
                        checked={filterType === 'date'} 
                        onChange={() => setFilterType('date')}
                        className="accent-[#da0000]"
                    />
                    <span>Date</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-medium text-gray-700">
                    <input 
                        type="radio" 
                        name="filterType" 
                        value="month" 
                        checked={filterType === 'month'} 
                        onChange={() => setFilterType('month')} 
                        className="accent-[#da0000]"
                    />
                    <span>Month</span>
                </label>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto items-center">
                {filterType === 'date' ? (
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#da0000] focus:ring-1 focus:ring-[#da0000] flex-grow sm:flex-grow-0"
                        required
                    />
                ) : (
                    <>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#da0000] focus:ring-1 focus:ring-[#da0000] flex-grow sm:flex-grow-0"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-[#da0000] focus:ring-1 focus:ring-[#da0000] flex-grow sm:flex-grow-0"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </>
                )}
                <button type="submit" className="bg-[#da0000] text-white px-5 py-2 rounded font-bold hover:bg-red-700 transition-colors shadow-sm">
                    Filter
                </button>
            </div>
        </form>
    );
}
