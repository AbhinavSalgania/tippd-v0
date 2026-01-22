import { Card, CardContent } from "@/app/landing/components/ui/card";

const problems = [
  {
    title: "Manual Calculation Errors",
    description: "Hours spent on spreadsheets leading to countless mistakes and frustrated staff questioning accuracy.",
    icon: "📊",
  },
  {
    title: "Wage Disputes",
    description: "Constant questions about distribution fairness creating tension, mistrust, and operational friction.",
    icon: "⚖️",
  },
  {
    title: "Wasted Managerial Bandwidth",
    description: "Managers spending 2+ hours per shift on tip math instead of focusing on operations and guest experience.",
    icon: "⏱️",
  },
  {
    title: "Staff Turnover",
    description: "Top performers leaving due to perceived inequity in tip distribution, costing you recruitment and training.",
    icon: "🚪",
  },
  {
    title: "Compliance Exposure",
    description: "Lack of proper audit trails and labor law documentation creating regulatory risk and liability.",
    icon: "⚠️",
  },
  {
    title: "Payroll Integration Pain",
    description: "Manual data entry errors when transferring tip data to your payroll system, multiplying mistakes.",
    icon: "💸",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B1F18] mb-6 leading-tight">
            Spreadsheets Are Costing You Your Best Staff
          </h2>
          <p className="text-xl text-[#0B1F18]/70 leading-relaxed">
            Managing tip distribution shouldn't be the hardest part of your day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <Card 
              key={index} 
              className="border-2 border-[#0B1F18]/5 hover:border-[#26D07C]/30 transition-all hover:shadow-lg bg-white"
            >
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{problem.icon}</div>
                <h3 className="font-display font-semibold text-lg text-[#0B1F18] mb-3">
                  {problem.title}
                </h3>
                <p className="text-[#0B1F18]/60 leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
