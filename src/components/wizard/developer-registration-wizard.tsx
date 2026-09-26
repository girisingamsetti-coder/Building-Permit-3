import * as React from "react";
import { X, RefreshCw, Volume2, EyeOff, ChevronUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface DeveloperRegistrationWizardProps {
  onClose: () => void;
}

const FormRow = ({ 
  label, 
  required, 
  children 
}: { 
  label: React.ReactNode, 
  required?: boolean, 
  children: React.ReactNode 
}) => (
  <div className="grid grid-cols-[1fr_1.5fr] items-start gap-2">
    <div className="bg-gray-100 p-2 h-9 flex items-center border border-gray-100 text-gray-700 text-[13px]">
      {required && <span className="text-red-500 mr-1">*</span>}
      {label}
    </div>
    <div className="flex items-center h-full">
      {children}
    </div>
  </div>
);

export function DeveloperRegistrationWizard({ onClose }: DeveloperRegistrationWizardProps) {
  const submitRegistration = useAppStore((s) => s.submitRegistration);
  const [submitted, setSubmitted] = React.useState(false);
  const [companyName, setCompanyName] = React.useState("");
  const [authorizedPerson, setAuthorizedPerson] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pan, setPan] = React.useState("");
  const [reraNumber, setReraNumber] = React.useState("");

  function handleSubmit() {
    submitRegistration({
      type: "DEVELOPER",
      name: authorizedPerson || companyName || "(Unknown)",
      email,
      phone,
      companyName,
      pan,
      reraNumber,
      authorizedPerson,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl p-10 flex flex-col items-center gap-4 max-w-md w-full">
          <CheckCircle2 className="size-16 text-green-500" />
          <h2 className="text-xl font-bold text-slate-800">Registration Submitted!</h2>
          <p className="text-sm text-slate-500 text-center">
            Your developer registration has been submitted. The concerned authority will review and approve it. You will be notified once your account is activated.
          </p>
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white px-8 mt-2">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-300 shrink-0">
          <h2 className="text-lg font-bold text-black">Developer Registration</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors text-black">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Firm Information Section */}
          <div>
            <div className="flex items-center gap-1 text-[#2563eb] text-[15px] font-medium border-b border-gray-200 pb-1 mb-3">
              <ChevronUp className="size-4" />
              Firm Information
            </div>
            
            <div className="text-[12px] space-y-1.5 mb-4">
              <p className="text-[#2563eb]">Items marked with <span className="text-red-500">*</span> are mandatory.</p>
              <p className="text-red-500"># Your email ID will be your permanent Login ID, any changes made on the email ID in future will not affect the login ID.</p>
            </div>

            <RadioGroup defaultValue="firm" className="flex items-center gap-6 mb-6">
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="builder" id="builder" />
                <Label htmlFor="builder" className="text-gray-700 font-normal text-[13px]">In case of Builder</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="firm" id="firm" />
                <Label htmlFor="firm" className="text-gray-700 font-normal text-[13px]">In case of Real Estate Developer / Firm</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <FormRow label="Firm/Developer Name" required>
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>
              <FormRow label="Type" required>
                <Select>
                  <SelectTrigger className="h-9 rounded-sm border-gray-300">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>

              <FormRow label="Firm Registration No." required>
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>
              <FormRow label="Shop Act License No.">
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>

              <FormRow label="PAN Card No." required>
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>
              <FormRow label="AADHAAR Card No.">
                <div className="relative w-full">
                  <Input className="h-9 rounded-sm border-gray-300 pr-8" type="password" />
                  <EyeOff className="size-4 absolute right-2 top-2.5 text-gray-500" />
                </div>
              </FormRow>

              <FormRow label="Contact No./ Telephone No.">
                <div className="flex gap-2 w-full">
                  <Input className="h-9 rounded-sm border-gray-300 w-16" />
                  <Input className="h-9 rounded-sm border-gray-300 flex-1" />
                </div>
              </FormRow>
              <FormRow label="Email Id" required>
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>

              <FormRow label="Address" required>
                <Textarea className="min-h-[72px] rounded-sm border-gray-300 resize-none" />
              </FormRow>
              <div className="flex flex-col justify-start">
                <FormRow label="Pin Code" required>
                  <Input className="h-9 rounded-sm border-gray-300" />
                </FormRow>
              </div>

              <FormRow label="Mobile No." required>
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>
              <div></div>

              <FormRow label="No. of Proprietors / Partners / Directors">
                <Select defaultValue="1">
                  <SelectTrigger className="h-9 rounded-sm border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>
              <div></div>
            </div>
          </div>

          {/* Bank Information Section */}
          <div className="pt-2">
            <div className="flex items-center gap-1 text-[#2563eb] text-[15px] font-medium border-b border-gray-200 pb-1 mb-4">
              <ChevronUp className="size-4" />
              Bank Information
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <FormRow label="Name of Bank">
                <Select>
                  <SelectTrigger className="h-9 rounded-sm border-gray-300">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No options</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Branch">
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>

              <FormRow label="A/C No.">
                <Input className="h-9 rounded-sm border-gray-300" />
              </FormRow>
            </div>
          </div>
          
        </div>

        {/* Footer / Captcha / Submit */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 shrink-0 flex flex-col items-center">
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="flex gap-2 items-center w-full justify-center mb-2">
              <div className="w-[200px] h-14 bg-[#e8d5e5] border border-gray-400 flex items-center justify-center relative overflow-hidden select-none">
                <span className="text-4xl font-serif text-[#0b331f] tracking-[0.2em] font-bold italic transform relative z-10 strike-through">
                  NVJVAS
                </span>
                {/* Scratches/lines over text for captcha effect */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="20" x2="200" y2="20" stroke="#000" strokeWidth="1" />
                    <line x1="0" y1="40" x2="200" y2="40" stroke="#000" strokeWidth="1" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="icon" className="h-6 w-6 border-gray-400">
                  <RefreshCw className="size-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-6 w-6 border-gray-400">
                  <Volume2 className="size-3" />
                </Button>
              </div>
            </div>

            <Input placeholder="E N T E R  C A P T C H A" className="h-9 bg-white text-[13px] border-gray-400 rounded-sm text-center tracking-[0.2em] w-[200px] mb-6" />
            
            <Button
              className="bg-[#428bca] hover:bg-[#3071a9] text-white font-medium px-8 h-9 rounded-sm shadow-sm transition-colors w-[200px]"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
