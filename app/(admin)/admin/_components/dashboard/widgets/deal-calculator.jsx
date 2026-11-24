"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Copy } from "lucide-react";

export function DealCalculatorWidget({ availableCars = [] }) {
  const [selectedCarId, setSelectedCarId] = useState("");
  const [price, setPrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(5000);
  const [apr, setApr] = useState(6.5);
  const [termMonths, setTermMonths] = useState(48);
  const [salesTaxPct, setSalesTaxPct] = useState(5.0);

  // When car selected from dropdown, update price
  const handleCarSelect = (id) => {
    setSelectedCarId(id);
    if (!id) return;
    const found = availableCars.find((c) => c.id === id);
    if (found) {
      setPrice(found.price);
      setDownPayment(Math.round(found.price * 0.15));
    }
  };

  // Calculations
  const taxAmount = price * (salesTaxPct / 100);
  const totalVehicleCost = price + taxAmount;
  const loanAmount = Math.max(0, totalVehicleCost - downPayment);
  const monthlyInterestRate = apr / 100 / 12;

  let monthlyPayment = 0;
  if (loanAmount > 0 && monthlyInterestRate > 0) {
    monthlyPayment =
      (loanAmount *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, termMonths))) /
      (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
  } else if (loanAmount > 0) {
    monthlyPayment = loanAmount / termMonths;
  }

  const totalLoanRepayment = monthlyPayment * termMonths;
  const totalInterestPaid = Math.max(0, totalLoanRepayment - loanAmount);
  const totalOutflow = downPayment + totalLoanRepayment;

  // Copy customer quote to clipboard
  const handleCopyQuote = () => {
    const carObj = availableCars.find((c) => c.id === selectedCarId);
    const carTitle = carObj
      ? `${carObj.year} ${carObj.make} ${carObj.model}`
      : "Selected Vehicle";

    const quoteText = `🚗 ${carTitle} - Dealership Financing Estimate
━━━━━━━━━━━━━━━━━━━━━━━━━
• Vehicle Price: $${price.toLocaleString()}
• Estimated Tax (${salesTaxPct}%): $${Math.round(taxAmount).toLocaleString()}
• Total Drive-Off Cost: $${Math.round(totalVehicleCost).toLocaleString()}
• Down Payment: $${downPayment.toLocaleString()}
• Amount Financed: $${Math.round(loanAmount).toLocaleString()}
─────────────────────────
• Estimated Monthly Payment: $${Math.round(monthlyPayment).toLocaleString()} / mo
• Term: ${termMonths} Months (${(termMonths / 12).toFixed(0)} Years)
• APR Interest Rate: ${apr}%
• Total Interest Payable: $${Math.round(totalInterestPaid).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━
Quoted by CarsAi Sales Team. Subject to credit approval.`;

    navigator.clipboard.writeText(quoteText);
    toast.success("Financing quote copied to clipboard!");
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-600" />
              Staff Financing & Deal Sheet Simulator
            </CardTitle>
            <CardDescription>
              Calculate estimated loan payments, APR interest, and deal
              structures on the fly for customers
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleCopyQuote}
            className="rounded-full text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Customer Quote
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Car Selector */}
            {availableCars.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Select Showroom Vehicle (Optional)
                </label>
                <select
                  value={selectedCarId}
                  onChange={(e) => handleCarSelect(e.target.value)}
                  className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-200 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="">Custom Price / Manual Input</option>
                  {availableCars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.year} {c.make} {c.model} - ${c.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Vehicle Price ($)
                </label>
                <Input
                  type="number"
                  min="1000"
                  step="500"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="h-9 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Down Payment ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="h-9 text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  APR Rate (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={apr}
                  onChange={(e) => setApr(Number(e.target.value))}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Term (Months)
                </label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value={24}>24 mo (2 yrs)</option>
                  <option value={36}>36 mo (3 yrs)</option>
                  <option value={48}>48 mo (4 yrs)</option>
                  <option value={60}>60 mo (5 yrs)</option>
                  <option value={72}>72 mo (6 yrs)</option>
                  <option value={84}>84 mo (7 yrs)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Sales Tax (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={salesTaxPct}
                  onChange={(e) => setSalesTaxPct(Number(e.target.value))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Quick down payment presets */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">
                Quick Down Payment %:
              </span>
              <div className="flex gap-2">
                {[10, 15, 20, 25].map((pctNum) => (
                  <button
                    key={pctNum}
                    type="button"
                    onClick={() => setDownPayment(Math.round(price * (pctNum / 100)))}
                    className="text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors"
                  >
                    {pctNum}% (${Math.round(price * (pctNum / 100)).toLocaleString()})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white flex flex-col justify-between shadow-inner">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Estimated Monthly Payment
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                ${Math.round(monthlyPayment).toLocaleString()}
                <span className="text-xs font-normal text-slate-300 ml-1">
                  / month
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Based on {termMonths} monthly payments at {apr}% APR
              </p>
            </div>

            <div className="space-y-2.5 pt-4 mt-4 border-t border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Loan Principal:</span>
                <span className="font-semibold text-white">
                  ${Math.round(loanAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Sales Tax:</span>
                <span className="font-semibold text-white">
                  ${Math.round(taxAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Interest Payable:</span>
                <span className="font-semibold text-amber-300">
                  +${Math.round(totalInterestPaid).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700/80 font-bold text-sm">
                <span className="text-slate-300">Total Loan Cost:</span>
                <span className="text-white">
                  ${Math.round(totalOutflow).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

