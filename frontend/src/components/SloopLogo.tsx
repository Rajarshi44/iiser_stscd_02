import React from 'react';

interface SloopLogoProps {
    className?: string;
}

export const SloopLogo: React.FC<SloopLogoProps> = ({ className = "" }) => {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* Circular Icon with minimalist design */}
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center relative">
                <div className="w-3 h-3 border-2 border-black rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
            </div>

            {/* Sloop Text - matching the exact font weight and size */}
            <span className="text-white font-medium text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Sloop
            </span>
        </div>
    );
};
