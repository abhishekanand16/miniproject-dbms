import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const FinancialDataContext = createContext(null);

export function FinancialDataProvider({ children }) {
  const [currency, setCurrency] = useState('INR');
  const [salaryAmount, setSalaryAmount] = useState(0);
  const [monthlyExpenseAmount, setMonthlyExpenseAmount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('financial_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrency(parsed.currency ?? 'INR');
        setSalaryAmount(Number(parsed.salaryAmount) || 0);
        setMonthlyExpenseAmount(Number(parsed.monthlyExpenseAmount) || 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const payload = { currency, salaryAmount, monthlyExpenseAmount };
    localStorage.setItem('financial_data', JSON.stringify(payload));
  }, [currency, salaryAmount, monthlyExpenseAmount]);

  const clearUserData = useCallback(() => {
    localStorage.removeItem('financial_data');
    setSalaryAmount(0);
    setMonthlyExpenseAmount(0);
  }, []);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    salaryAmount,
    setSalaryAmount,
    monthlyExpenseAmount,
    setMonthlyExpenseAmount,
    clearUserData,
  }), [currency, salaryAmount, monthlyExpenseAmount, clearUserData]);

  return (
    <FinancialDataContext.Provider value={value}>{children}</FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const ctx = useContext(FinancialDataContext);
  if (!ctx) throw new Error('useFinancialData must be used within FinancialDataProvider');
  return ctx;
}


