import { useState } from 'react';

const SimpleBarChart = ({ data, isAnimate }) => {
  const maxVal = Math.max(...data.map(d => d.earnings));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="w-100 h-100 d-flex flex-column justify-content-end">
      <div className="flex-grow-1 d-flex align-items-end justify-content-between px-2" style={{ gap: '8px' }}>
        {data.map((item, index) => {
          const heightPercent = (item.earnings / maxVal) * 100;
          const isLast = index === data.length - 1;
          
          return (
            <div 
              key={index} 
              className="flex-grow-1 d-flex flex-column align-items-center position-relative h-100 justify-content-end"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on hover */}
              <div 
                className={`position-absolute translate-middle-x top-0 bg-dark text-white p-1 rounded border border-white-50 small shadow-lg z-3 transition-opacity ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`} 
                style={{ 
                  fontSize: '10px', 
                  pointerEvents: 'none', 
                  whiteSpace: 'nowrap', 
                  top: '-30px' 
                }}
              >
                ${item.earnings.toLocaleString()}
              </div>
              
              {/* Bar */}
              <div 
                className={`w-100 rounded-top transition-all cursor-pointer ${isLast ? 'bg-primary' : ''}`}
                style={{ 
                  height: isAnimate ? `${heightPercent}%` : '0%', 
                  backgroundColor: isLast ? '#0d6efd' : 'rgba(255, 255, 255, 0.1)',
                  transition: 'height 1s ease-out',
                  transitionDelay: `${index * 50}ms`,
                  boxShadow: isLast ? '0 0 15px rgba(59,130,246,0.5)' : 'none'
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* X-Axis Labels */}
      <div className="d-flex justify-content-between mt-3 px-2 border-top border-secondary pt-2">
        {data.map((item, index) => (
          <span 
            key={index} 
            className="text-secondary fw-bold text-uppercase" 
            style={{ fontSize: '10px' }}
          >
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;
