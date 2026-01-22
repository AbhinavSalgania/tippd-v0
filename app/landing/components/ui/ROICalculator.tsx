"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/landing/components/ui/card";
import { Slider } from "@/app/landing/components/ui/slider";

export function ROICalculator() {
  const [employees, setEmployees] = useState(15);
  const [shiftsPerWeek, setShiftsPerWeek] = useState(10);

  // Calculations
  const hoursPerShift = 2; // Average time spent on manual calculations
  const hoursSavedPerWeek = shiftsPerWeek * hoursPerShift * 0.9; // 90% time saved
  const hoursSavedPerYear = hoursSavedPerWeek * 52;
  const managerHourlyRate = 35; // Average manager hourly rate
  const costSavings = Math.round(hoursSavedPerYear * managerHourlyRate);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-[#E3F5EC]/50 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-6 leading-tight">
              Calculate Your Time Savings
            </h2>
            <p className="text-xl text-[#0B1F18]/70">
              See exactly how much Tippd could save your restaurant
            </p>
          </div>

          <Card className="bg-white border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-8">
                {/* Input: Number of Employees */}
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="font-display font-semibold text-lg text-[#0B1F18]">
                      Number of Employees
                    </label>
                    <span className="font-mono-data text-3xl font-bold text-[#26D07C]">
                      {employees}
                    </span>
                  </div>
                  <Slider
                    value={[employees]}
                    onValueChange={(value) => setEmployees(value[0])}
                    min={5}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-[#26D07C] [&_[role=slider]]:border-[#26D07C]"
                  />
                  <div className="flex justify-between text-sm text-[#0B1F18]/50 mt-2">
                    <span>5</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Input: Shifts per Week */}
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <label className="font-display font-semibold text-lg text-[#0B1F18]">
                      Service Periods per Week
                    </label>
                    <span className="font-mono-data text-3xl font-bold text-[#26D07C]">
                      {shiftsPerWeek}
                    </span>
                  </div>
                  <Slider
                    value={[shiftsPerWeek]}
                    onValueChange={(value) => setShiftsPerWeek(value[0])}
                    min={5}
                    max={35}
                    step={1}
                    className="[&_[role=slider]]:bg-[#26D07C] [&_[role=slider]]:border-[#26D07C]"
                  />
                  <div className="flex justify-between text-sm text-[#0B1F18]/50 mt-2">
                    <span>5</span>
                    <span>35</span>
                  </div>
                </div>

                {/* Results */}
                <div className="pt-8 border-t border-[#0B1F18]/10">
                  <div className="bg-gradient-to-br from-[#26D07C]/10 to-[#D4F49C]/10 rounded-2xl p-8 space-y-6">
                    <div className="text-center">
                      <div className="text-[#0B1F18]/60 font-medium mb-2">Estimated Annual Savings</div>
                      <div className="font-mono-data text-6xl md:text-7xl font-bold text-[#26D07C] mb-4">
                        ${costSavings.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#26D07C]/20">
                      <div className="text-center">
                        <div className="font-mono-data text-3xl font-bold text-[#0B1F18] mb-1">
                          {Math.round(hoursSavedPerYear).toLocaleString()}
                        </div>
                        <div className="text-sm text-[#0B1F18]/60">Hours Saved Per Year</div>
                      </div>
                      <div className="text-center">
                        <div className="font-mono-data text-3xl font-bold text-[#0B1F18] mb-1">
                          {Math.round(hoursSavedPerWeek)}
                        </div>
                        <div className="text-sm text-[#0B1F18]/60">Hours Saved Per Week</div>
                      </div>
                    </div>

                    <p className="text-center text-sm text-[#0B1F18]/60 pt-4">
                      Based on 2 hours per shift for manual calculations and ${managerHourlyRate}/hour manager time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
