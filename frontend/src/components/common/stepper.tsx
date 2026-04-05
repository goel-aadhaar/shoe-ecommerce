interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="mx-auto w-full max-w-3xl mb-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          
          return (
            <div key={step} className="flex flex-col items-center relative w-full">
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div 
                  className={`absolute left-1/2 top-4 w-full h-0.5 -z-10 transition-colors duration-300 ${
                    isCompleted ? 'bg-copper' : 'bg-brown-200'
                  }`}
                />
              )}
              
              {/* Step Circle */}
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'border-copper bg-copper text-white' 
                    : isCurrent 
                      ? 'border-copper bg-white text-copper' 
                      : 'border-brown-200 bg-white text-brown-400'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              
              {/* Step Label */}
              <span 
                className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                  isCurrent ? 'text-brown-900' : 'text-brown-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
