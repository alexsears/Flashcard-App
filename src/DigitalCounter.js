import React from 'react';

const DigitalCounter = ({ value }) => {
  const paddedValue = value.toString().padStart(4, '0');

  return (
    <div className="digital-counter">
      {paddedValue.split('').map((digit, index) => (
        <div key={index} className="digit">
          {digit}
        </div>
      ))}
    </div>
  );
};

export default DigitalCounter;