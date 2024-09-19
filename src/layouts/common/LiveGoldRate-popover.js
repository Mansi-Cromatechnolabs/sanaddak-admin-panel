/* eslint-disable radix */

'use client';

import axios from 'axios';
import React, { useState, useEffect } from 'react';

import ChangeHistoryTwoToneIcon from '@mui/icons-material/ChangeHistoryTwoTone';

export default function LiveGoldRatePopover() {
  const [goldRate, setGoldRate] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const fetchGoldRate = () => {
    axios
      .get('https://data-asg.goldprice.org/GetData/EGP-XAU/1')
      .then((res) => {
        const dataString = res?.data[0];
        const goldRateString = dataString.split(',')[1];
        const convertedToGrams = parseFloat(goldRateString) / 31.1034;
        const roundedGoldRate = parseFloat(convertedToGrams).toFixed(2);
        setGoldRate(roundedGoldRate);
        setIsSliding(true);
        setTimeout(() => {
          setIsSliding(false);
        }, 500);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  useEffect(() => {
    fetchGoldRate();
    const interval = setInterval(() => {
      fetchGoldRate();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-gold-container">
      <div className={`live-gold-content ${isSliding ? 'slide-up-out' : 'slide-down-in'}`}>
        <div className="small-text">24k gold</div>
        <div className="d-flex align-items-center gap-2">
          <h6 className="m-0">EGP {goldRate}</h6>
          <ChangeHistoryTwoToneIcon fontSize="small" sx={{ color: 'green' }} />
          (in gram)
        </div>
      </div>
    </div>
  );
}
