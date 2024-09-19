import React from 'react';

export default function Loader() {
  return (
    <div className="svg-wrapper">
      <svg width="75" height="75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g className="loading-animation">
          <circle fill="#E8BE39" cx="3" cy="12" r="2" />
          <circle fill="#E8BE38" cx="21" cy="12" r="2" />
          <circle fill="#E8BE39" cx="12" cy="21" r="2" />
          <circle fill="#E8BE39" cx="12" cy="3" r="2" />
          <circle fill="#E8BE33" cx="5.64" cy="5.64" r="2" />
          <circle fill="#E8BE39" cx="18.36" cy="18.36" r="2" />
          <circle cx="5.64" fill="#E8BE34" cy="18.36" r="2" />
          <circle fill="#E8BE39" cx="18.36" cy="5.64" r="2" />
        </g>
      </svg>
    </div>
  );
}
