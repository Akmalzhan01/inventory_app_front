import React from 'react';

const StatsCard = ({ title, value, icon, color = 'bg-blue-100 text-blue-800', trend, loading = false }) => {
  // Trend uchun klass va ikonka aniqlash
  const getTrendClasses = () => {
    if (!trend) return '';
    if (trend.direction === 'up') {
      return 'text-green-500';
    } else if (trend.direction === 'down') {
      return 'text-red-500';
    }
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') {
      return (
        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    } else if (trend.direction === 'down') {
      return (
        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm ${color.split(' ')[0]} ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium truncate">{title}</p>
          {loading ? (
            <div className="h-8 w-3/4 bg-gray-300 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-semibold mt-1">
              {value}
              {trend && (
                <span className={`text-xs ml-2 ${getTrendClasses()}`}>
                  {trend.value}
                  {getTrendIcon()}
                </span>
              )}
            </p>
          )}
        </div>
        {icon && !loading && (
          <div className={`p-3 rounded-full ${color.split(' ')[1].replace('text-', 'bg-')} bg-opacity-20`}>
            {typeof icon === 'string' ? (
              <span className="text-xl">{icon}</span>
            ) : (
              <icon className="h-6 w-6" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;