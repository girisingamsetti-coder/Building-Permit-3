import * as React from "react";
import { X, Calendar, Eye, Image as ImageIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LtpRegistrationWizardProps {
  onClose: () => void;
}

export function LtpRegistrationWizard({ onClose }: LtpRegistrationWizardProps) {
  const [step, setStep] = React.useState(1);
  const totalSteps = 4;

  const STEPS = [
    "Personal Information",
    "Contact Information",
    "Attach Mandatory Documents",
    "Login Information"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-5xl h-[650px] max-h-[90vh] bg-white shadow-2xl flex flex-col border border-gray-300 rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 shrink-0">
          <h2 className="text-[15px] font-bold text-black">Welcome to Professional/ Consultant Registration Portal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-300 rounded transition-colors text-black">
            <X className="size-4" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          {STEPS.map((s, i) => {
            const current = i + 1;
            const isActive = current === step;
            const isCompleted = current < step;
            return (
              <React.Fragment key={current}>
                <div className="flex flex-col items-center gap-1.5 flex-1 relative z-10">
                  <div 
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                      isActive ? "border-[#2980b9] bg-[#2980b9] text-white" : 
                      isCompleted ? "border-green-500 bg-green-500 text-white" : "border-gray-300 bg-white text-gray-400"
                    )}
                  >
                    {current}
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold text-center",
                    isActive ? "text-[#2980b9]" : 
                    isCompleted ? "text-green-600" : "text-gray-400"
                  )}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-gray-300 relative top-[-10px]">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white text-[12px] text-gray-800">
          
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 font-bold px-3 py-1.5 border border-gray-300 mb-4 text-[13px]">
                Personal Information
              </div>
              
              <div className="grid grid-cols-[200px_1fr_150px] gap-x-4 gap-y-1 mb-6">
                {/* Name Row */}
                <div className="bg-gray-50 px-3 py-1.5 flex items-center border border-transparent">
                  <span className="text-red-500 mr-1">*</span> Name
                </div>
                <div className="flex gap-2 py-1 relative">
                  <Select defaultValue="mr">
                    <SelectTrigger className="w-24 h-7 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="First Name" className="h-7 flex-1 text-[12px]" />
                  <Input placeholder="Middle Name" className="h-7 flex-1 text-[12px]" />
                  <Input placeholder="Last Name" className="h-7 flex-1 text-[12px]" />
                  
                  {/* Photo Upload Area - Absolute positioned to the right column */}
                  <div className="absolute right-[-166px] top-0 flex flex-col items-center gap-2">
                    <div className="w-24 h-28 border border-gray-300 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="size-12 mb-1 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                    </div>
                    <Button variant="outline" className="h-6 text-[11px] px-4 w-full">Upload Photo</Button>
                  </div>
                </div>
                <div></div>

                {/* Professional Category */}
                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Professional Category
                </div>
                <div className="py-1">
                  <Select>
                    <SelectTrigger className="h-7 text-[12px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div></div>

                {/* Qualification & Experience */}
                <div className="bg-gray-50 px-3 py-1.5 flex items-center leading-tight">
                  Qualification / Exp. (Yrs)
                </div>
                <div className="py-1 flex gap-4">
                  <Input placeholder="Qualification" className="h-7 text-[12px] flex-1" />
                  <Input placeholder="Total Experience" className="h-7 text-[12px] w-[140px]" />
                </div>
                <div></div>

                {/* Firm Name & PAN */}
                <div className="bg-gray-50 px-3 py-1.5 flex items-center leading-tight">
                  Firm Name / PAN Number
                </div>
                <div className="py-1 flex gap-4">
                  <Input placeholder="Firm Name (Employed or Self Registered)" className="h-7 text-[12px] flex-1" />
                  <Input placeholder="PAN Number" className="h-7 text-[12px] w-[140px]" />
                </div>
                <div></div>

                {/* Short Profile */}
                <div className="bg-gray-50 px-3 py-1.5 flex items-start pt-2">
                  Short Profile <span className="italic text-gray-500 ml-1 text-[11px]">(Experience)</span>
                </div>
                <div className="py-1">
                  <Textarea className="min-h-[40px] text-[12px] resize-none" />
                </div>
                <div></div>

                {/* Aadhaar Number */}
                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Aadhaar Number
                </div>
                <div className="py-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input className="h-7 text-[12px] pr-8" type="password" />
                    <Eye className="absolute right-2 top-1.5 size-4 text-gray-500" />
                  </div>
                  <div className="flex-1 flex items-center gap-4 px-4">
                    <div className="font-bold whitespace-nowrap">Nationality</div>
                    <div className="font-bold whitespace-nowrap ml-4">Date Of Birth</div>
                    <div className="relative flex-1">
                      <Input className="h-7 text-[12px] pr-8 bg-gray-100" readOnly />
                      <Calendar className="absolute right-2 top-1.5 size-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 font-bold px-3 py-1.5 border border-gray-300 mb-4 text-[13px]">
                Contact Information
              </div>
              
              <div className="grid grid-cols-[200px_1fr] gap-x-4 gap-y-1 mb-6">
                <div className="bg-gray-50 px-3 py-1.5 flex items-center">Postal Address</div>
                <div className="py-1">
                  <Input className="h-7 text-[12px]" />
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">State</div>
                <div className="py-1 flex gap-4">
                  <Select>
                    <SelectTrigger className="h-7 text-[12px] flex-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-[120px] bg-gray-50 flex items-center justify-center font-medium">City</div>
                  <Input className="h-7 text-[12px] flex-1" />
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> PIN Code
                </div>
                <div className="py-1 flex gap-4">
                  <Input className="h-7 text-[12px] flex-1" />
                  <div className="w-[120px] bg-gray-50 flex items-center justify-center font-medium">
                    <span className="text-red-500 mr-1">*</span> Mobile Number
                  </div>
                  <Input className="h-7 text-[12px] flex-1" />
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> E-mail
                </div>
                <div className="py-1">
                  <Input className="h-7 text-[12px]" />
                  <div className="text-[10px] text-right text-black mt-1 font-medium">
                    <span className="text-red-500">*</span>Mobile No. & E-mail used for notifications.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Attach Mandatory Documents */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 font-bold px-3 py-1.5 border border-gray-300 mb-6 text-[13px]">
                Attach Mandatory Documents
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <ImageIcon className="size-12 mb-4 opacity-50" />
                <p className="font-bold text-lg mb-1">Drag and drop your documents here</p>
                <p className="text-sm mb-4">or click to browse from your computer</p>
                <Button variant="outline" className="border-gray-400">Browse Files</Button>
              </div>
            </div>
          )}

          {/* Step 4: Login Information */}
          {step === 4 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 font-bold px-3 py-1.5 border border-gray-300 mb-4 text-[13px]">
                Login Information
              </div>
              
              <div className="grid grid-cols-[200px_1fr] gap-x-4 gap-y-1 mb-8 max-w-2xl">
                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Login Name
                </div>
                <div className="py-1 flex items-center">
                  <div className="bg-gray-200 h-7 px-3 flex items-center border border-r-0 border-gray-300 text-gray-600">1168_</div>
                  <Input className="h-7 text-[12px] rounded-l-none" />
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Password
                </div>
                <div className="py-1">
                  <Input className="h-7 text-[12px]" type="password" />
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Re-Enter Password
                </div>
                <div className="py-1">
                  <Input className="h-7 text-[12px]" type="password" />
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Security Question
                </div>
                <div className="py-1">
                  <Select>
                    <SelectTrigger className="h-7 text-[12px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 px-3 py-1.5 flex items-center">
                  <span className="text-red-500 mr-1">*</span> Answer
                </div>
                <div className="py-1">
                  <Input className="h-7 text-[12px]" />
                </div>

                <div className="col-start-2 pt-4">
                  <div className="text-[11px] text-gray-500 mb-1">Retype characters from picture:</div>
                  <div className="flex gap-2 items-start">
                    <div className="w-48 h-12 border border-gray-300 bg-gray-100 flex items-center justify-center font-serif text-2xl tracking-widest text-gray-700 select-none overflow-hidden relative">
                      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                      BYC5CW
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="outline" className="h-5 px-2 text-[10px]">↻</Button>
                      <Button variant="outline" className="h-5 px-2 text-[10px]">🔊</Button>
                    </div>
                  </div>
                  <Input className="h-7 w-48 mt-2 text-[12px]" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-gray-100 border-t border-gray-300 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(s => s - 1)}
                className="border-gray-400 font-bold px-6"
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {step < totalSteps ? (
              <Button 
                onClick={() => setStep(s => s + 1)}
                className="bg-[#2980b9] hover:bg-[#1a5a85] text-white font-bold px-8 shadow-sm flex items-center gap-2"
              >
                Next <ChevronRight className="size-4" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="px-6 font-bold border-gray-400"
                >
                  Reset
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-sm"
                >
                  Submit Registration
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
