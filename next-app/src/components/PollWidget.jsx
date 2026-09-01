 'use client';
import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2 } from 'lucide-react';

const getActiveClasses = (text) => {
    if (text === 'हाँ') return { text: 'text-green-600', border: 'border-green-600' };
    if (text === 'नहीं') return { text: 'text-red-600', border: 'border-red-600' };
    if (text === 'NOTA') return { text: 'text-orange-500', border: 'border-orange-500' };
    return { text: 'text-[#da0000]', border: 'border-[#da0000]' };
};

export default function PollWidget() {
    const [pollData, setPollData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = '' || ''; // Assumes '' is provided via Vite

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch('/api/poll/active');
                if (res.ok) {
                    const data = await res.json();
                    setPollData(data);
                    
                    // Check if already voted
                    const pollId = data.id || data._id;
                    const votedPollId = typeof window !== 'undefined' && pollId ? localStorage.getItem(`voted_poll_${pollId}`) : null;
                    if (votedPollId) {
                        setSelectedOption(parseInt(votedPollId));
                        setShowResults(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching poll:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPoll();
    }, []);

    const handleVote = async (optionId) => {
        if (!pollData || showResults) return;
        
        const currentPollId = pollData.id || pollData._id;

        // Optimistic UI update
        setSelectedOption(optionId);
        setShowResults(true);
        if (typeof window !== 'undefined' && currentPollId) {
            localStorage.setItem(`voted_poll_${currentPollId}`, optionId);
        }

        try {
            const res = await fetch(`/api/poll/${currentPollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId, pollId: currentPollId })
            });
            if (res.ok) {
                const updatedData = await res.json();
                setPollData(prev => ({
                    ...prev,
                    totalVotes: updatedData.totalVotes,
                    options: updatedData.options
                }));
            }
        } catch (error) {
            console.error("Error submitting vote:", error);
        }
    };

    if (isLoading) return <div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl"></div>;
    if (!pollData) return null; // Or return a message if no active poll

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 border-t-4 border-t-[#da0000] p-6 rounded-xl w-full h-full flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 text-gray-100/50 pointer-events-none transform rotate-12">
                <BarChart2 size={120} />
            </div>

            <div className="flex items-start gap-3 mb-6 relative z-10">
                <BarChart2 className="text-[#da0000] animate-pulse flex-shrink-0 mt-1" size={22} />
                <h3 className="text-[18px] font-black text-[#222] leading-[1.35]">
                    {pollData.question}
                </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 relative z-10">
                {pollData.options.map((option) => {
                    const activeClasses = getActiveClasses(option.text);
                    return (
                        <div key={option.id} className="relative w-full col-span-1">
                            {!showResults ? (
                                <button
                                    onClick={() => handleVote(option.id)}
                                    className="w-full min-h-[48px] flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:border-[#da0000]/50 hover:bg-red-50/30 transition-all duration-300 font-bold bg-white"
                                >
                                    <div className="flex items-center gap-2 text-left">
                                        <span className="text-[14px] md:text-[15px] leading-tight text-[#4b5563]">{option.text}</span>
                                        <span className="text-[16px] md:text-[18px] flex-shrink-0">{option.emoji}</span>
                                    </div>
                                </button>
                            ) : (
                                <div className={`w-full bg-white border ${selectedOption === option.id ? activeClasses.border : 'border-gray-200'} rounded-lg min-h-[48px] relative overflow-hidden flex items-center`}>
                                    <div 
                                        className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out bg-gray-100" 
                                        style={{ width: `${option.percentage}%`, opacity: selectedOption === option.id ? 0.3 : 1 }}
                                    ></div>
                                    <div className="relative z-10 flex items-center justify-between w-full px-3 py-2 font-bold">
                                        <div className="flex items-center gap-1.5 max-w-[65%]">
                                            <span className={`text-[14px] md:text-[15px] leading-tight text-left ${selectedOption === option.id ? activeClasses.text : 'text-[#4b5563]'}`}>{option.text}</span>
                                            <span className="text-[16px] md:text-[18px] flex-shrink-0">{option.emoji}</span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <span className={`text-[14px] md:text-[16px] ${selectedOption === option.id ? activeClasses.text : 'text-[#6b7280]'}`}>{option.percentage}%</span>
                                            {selectedOption === option.id && <CheckCircle2 size={16} className={`${activeClasses.text} ml-0.5`} />}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* Stats / Thank you message placed next to NOTA */}
                <div className="col-span-1 flex flex-col justify-center items-start pl-1 md:pl-3 overflow-hidden mt-3">
                    {showResults && (
                        <div className="flex flex-col w-full">
                            <span className="text-[#22c55e] font-bold flex items-center gap-1 text-[11px] md:text-[13px] whitespace-nowrap">
                                <CheckCircle2 size={13} strokeWidth={2.5} className="flex-shrink-0" /> 
                                <span>Thanks for vote!</span>
                            </span>
                            <span className="text-[#9ca3af] font-bold text-[10px] md:text-[12px] mt-0.5 whitespace-nowrap">
                                (Total Votes: {pollData.totalVotes.toLocaleString('en-IN')})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





