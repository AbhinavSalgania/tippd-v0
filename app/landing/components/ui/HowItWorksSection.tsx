import { Card, CardContent } from "@/app/landing/components/ui/card";
import { ImageWithFallback } from "@/app/landing/components/figma/ImageWithFallback";

const steps = [
  {
    number: "1",
    title: "Enter Sales & Tips",
    description: "At the end of each shift, input total sales and tips collected. Takes less than 30 seconds.",
  },
  {
    number: "2",
    title: "Auto-Calculate Distribution",
    description: "Tippd automatically distributes tips based on your preset rules, roles, and hours worked.",
  },
  {
    number: "3",
    title: "Review & Approve",
    description: "Quick review of the breakdown. Everything looks good? Approve and you're done.",
  },
  {
    number: "4",
    title: "Staff Gets Notified",
    description: "Employees receive notifications and can view their tip breakdown instantly on their phones.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            So Simple, You'll Wonder Why You Waited
          </h2>
          <p className="text-lg text-gray-600">
            From setup to daily use, Tippd is designed to save you time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index} className="border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="size-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1609159127964-ef8fc6bc0625?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwa2l0Y2hlbiUyMHRlYW13b3JrfGVufDF8fHx8MTc2OTEwNzA4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Restaurant team working together"
                className="w-full h-auto"
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2 min</div>
                <div className="text-sm text-gray-600">Average processing time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">5 min</div>
            <div className="text-gray-600">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">90%</div>
            <div className="text-gray-600">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">Learning Curve</div>
          </div>
        </div>
      </div>
    </section>
  );
}
