'use client'; // Required for client-side interactivity

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS

const CustomDatePicker = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  return (
    <DatePicker
      selected={startDate}
      onChange={(date: Date | null) => setStartDate(date)}
      dateFormat="MM/dd/yyyy" // Customize date format
      isClearable
      placeholderText="Select a date"
    />
  );
};

export default CustomDatePicker;
