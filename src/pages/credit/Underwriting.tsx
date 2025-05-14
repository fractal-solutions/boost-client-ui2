import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, CheckCircle, AlertCircle, Upload, Building2, UserRound } from "lucide-react";
import  CreditStatus  from "./Status";
import { useAuth } from '@/contexts/AuthContext';

export default function CreditUnderwriting() {
  const [step, setStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [govId, setGovId] = useState<File | null>(null);
  const [registration, setRegistration] = useState<File | null>(null);
  const [bankStatements, setBankStatements] = useState<File | null>(null);
  const [bankStatementsPassword, setBankStatementsPassword] = useState<string>("");
  const [hasPassword, setHasPassword] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    personalInfo: {
      fullName: '',
      idNumber: '',
      phone: '',
      address: ''
    },
    businessDetails: {
      businessName: '',
      businessType: '',
      monthlyRevenue: '',
      yearsOperation: 0
    },
    documents: {
      govId: null,
      registration: null,
      bankStatements: null,
      bankStatementsPassword: ''
    }
  });

  const totalSteps = 3;

  // Calculate actual completion percentage
  const calculateCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Personal Info
    totalFields += 4;
    if (formValues.personalInfo.fullName) completedFields++;
    if (formValues.personalInfo.idNumber) completedFields++;
    if (formValues.personalInfo.phone) completedFields++;
    if (formValues.personalInfo.address) completedFields++;

    // Business Details
    totalFields += 4;
    if (formValues.businessDetails.businessName) completedFields++;
    if (formValues.businessDetails.businessType) completedFields++;
    if (formValues.businessDetails.monthlyRevenue) completedFields++;
    if (formValues.businessDetails.yearsOperation > 0) completedFields++;

    // Document Uploads
    totalFields += 3;
    if (govId) completedFields++;
    if (registration) completedFields++;
    if (bankStatements) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const progress = calculateCompletion();
  const actualProgress = calculateCompletion();

  const PersonalInfoForm = memo(({ values, onChange }: {
    values: typeof formValues.personalInfo,
    onChange: (newValues: typeof formValues.personalInfo) => void
  }) => {
    const fullNameRef = useRef<HTMLInputElement>(null);
    
    const handleChange = useCallback((field: keyof typeof values) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...values, [field]: e.target.value });
        // Maintain focus after state update
        if (field === 'fullName' && fullNameRef.current) {
          setTimeout(() => fullNameRef.current?.focus(), 0);
        }
      }, [values, onChange]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            ref={fullNameRef}
            placeholder="Enter your full name"
            defaultValue={values.fullName}
            onBlur={handleChange('fullName')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idNumber">National ID Number</Label>
          <Input
            id="idNumber"
            placeholder="Enter ID number"
            defaultValue={values.idNumber}
            onBlur={handleChange('idNumber')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+254 7XX XXX XXX"
            defaultValue={values.phone}
            onBlur={handleChange('phone')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Physical Address</Label>
          <Input
            id="address"
            placeholder="Enter your address"
            defaultValue={values.address}
            onBlur={handleChange('address')}
          />
        </div>
      </div>
    )
  });

  const BusinessDetailsForm = () => {
    const [years, setYears] = useState(formValues.businessDetails.yearsOperation);
    const businessTypes = [
      {
        category: "High-Risk Industries",
        types: [
          "Hospitality & Tourism",
          "Retail",
          "Manufacturing",
          "Oil & Gas"
        ]
      },
      {
        category: "Moderate-Risk Industries",
        types: [
          "Financial Services",
          "Healthcare",
          "Transportation & Logistics",
          "Technology"
        ]
      },
      {
        category: "Low-Risk Industries",
        types: [
          "Utilities",
          "Education",
          "Government & Public Services",
          "Agriculture"
        ]
      }
    ];

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Enter business name"
            defaultValue={formValues.businessDetails.businessName}
            onBlur={(e) => {
              const value = e.target.value;
              setFormValues(prev => ({
                ...prev,
                businessDetails: {
                  ...prev.businessDetails,
                  businessName: value
                }
              }));
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <select
            id="businessType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formValues.businessDetails.businessType}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              businessDetails: {
                ...prev.businessDetails,
                businessType: e.target.value
              }
            }))}
          >
            <option value="">Select business type</option>
            {businessTypes.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyRevenue">Average Monthly Revenue</Label>
          <select
            id="monthlyRevenue"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formValues.businessDetails.monthlyRevenue}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              businessDetails: {
                ...prev.businessDetails,
                monthlyRevenue: e.target.value
              }
            }))}
          >
            <option value="">Select revenue range</option>
            <option value="below-50k">Below KES 50,000</option>
            <option value="50k-100k">KES 50,000 - 100,000</option>
            <option value="100k-250k">KES 100,000 - 250,000</option>
            <option value="250k-500k">KES 250,000 - 500,000</option>
            <option value="500k-1m">KES 500,000 - 1,000,000</option>
            <option value="1m-5m">KES 1,000,000 - 5,000,000</option>
            <option value="above-5m">Above KES 5,000,000</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsOperation">Years in Operation</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newYears = Math.max(0, years - 1);
                setYears(newYears);
                setFormValues(prev => ({
                  ...prev,
                  businessDetails: {
                    ...prev.businessDetails,
                    yearsOperation: newYears
                  }
                }));
              }}
              disabled={years <= 0}
            >
              -
            </Button>
            <Input
              id="yearsOperation"
              value={years}
              onChange={(e) => {
                const newYears = Number(e.target.value);
                setYears(newYears);
                setFormValues(prev => ({
                  ...prev,
                  businessDetails: {
                    ...prev.businessDetails,
                    yearsOperation: newYears
                  }
                }));
              }}
              className="text-center w-20"
              type="number"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newYears = years + 1;
                setYears(newYears);
                setFormValues(prev => ({
                  ...prev,
                  businessDetails: {
                    ...prev.businessDetails,
                    yearsOperation: newYears
                  }
                }));
              }}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const DocumentUploadForm = () => {
    const handleFileUpload = async (file: File, type: 'govId' | 'registration' | 'bankStatements') => {
      if (type === 'govId' && !file.type.startsWith('image/')) {
        alert('Please upload an image file for Government ID');
        return;
      }
      if ((type === 'registration' || type === 'bankStatements') && file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }

      switch (type) {
        case 'govId': setGovId(file); break;
        case 'registration': setRegistration(file); break;
        case 'bankStatements': setBankStatements(file); break;
      }
    };

    const handleSubmit = async () => {
      if (!govId || !registration || !bankStatements) {
        alert('Please upload all required documents');
        return;
      }

      const formData = new FormData();
      formData.append('govId', govId);
      formData.append('registration', registration);
      formData.append('bankStatements', bankStatements);
      if (hasPassword && bankStatementsPassword) {
        formData.append('bankStatementsPassword', bankStatementsPassword);
      }

      try {
        const response = await fetch('http://localhost:5678/webhook-test/655ed40e-d08e-4124-91f6-d82cf637ff62', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        alert('Documents uploaded successfully');
        setUploadSuccess(true);
      } catch (error) {
        alert('Error uploading documents');
        console.error(error);
        setUploadSuccess(false);
      }
    };

    // Add a ref for the password input
    const passwordInputRef = useRef<HTMLInputElement>(null);
    
    // Use useEffect to force focus back to the input on every render if hasPassword is true
    useEffect(() => {
      if (hasPassword && passwordInputRef.current) {
        // Set a timeout to ensure focus happens after any other potential focus events
        const timeoutId = setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 0);
        
        return () => clearTimeout(timeoutId);
      }
    }, [hasPassword, bankStatementsPassword]);

    // Create a special handler for the password input that prevents event bubbling
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setBankStatementsPassword(e.target.value);
      
      // Ensure the cursor position is maintained
      const cursorPosition = e.target.selectionStart;
      setTimeout(() => {
        if (passwordInputRef.current) {
          passwordInputRef.current.selectionStart = cursorPosition;
          passwordInputRef.current.selectionEnd = cursorPosition;
        }
      }, 0);
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Government ID</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                 onClick={(e) => {
                   if (e.target === e.currentTarget) {
                     document.getElementById('govId')?.click();
                   }
                 }}>
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload ID (Image)</p>
              <input
                id="govId"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'govId')}
              />
              {govId && <p className="text-xs text-green-600 mt-1">{govId.name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business Registration</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                 onClick={(e) => {
                   if (e.target === e.currentTarget) {
                     document.getElementById('registration')?.click();
                   }
                 }}>
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload Registration (PDF)</p>
              <input
                id="registration"
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'registration')}
              />
              {registration && <p className="text-xs text-green-600 mt-1">{registration.name}</p>}
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Bank Statements</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                 onClick={(e) => {
                   if (e.target === e.currentTarget) {
                     document.getElementById('bankStatements')?.click();
                   }
                 }}>
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload Statements (PDF)</p>
              <input
                id="bankStatements"
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bankStatements')}
              />
              {bankStatements && <p className="text-xs text-green-600 mt-1">{bankStatements.name}</p>}
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Additional Options</h4>
          
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="hasPassword"
              checked={hasPassword}
              onChange={(e) => {
                e.stopPropagation();
                setHasPassword(e.target.checked);
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label 
              htmlFor="hasPassword" 
              className="text-sm cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              Bank statement PDF is password protected
            </label>
          </div>
          
          {hasPassword && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <label 
                htmlFor="pdfPassword" 
                className="block text-sm font-medium mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                Enter PDF password:
              </label>
              <input
                ref={passwordInputRef}
                id="pdfPassword"
                type="text"
                value={bankStatementsPassword}
                onChange={handlePasswordInputChange}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md"
                autoFocus
              />
            </div>
          )}
        </div>

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Upload Documents
        </Button>
      </div>
    );
  };

  const steps = [
    {
      title: "Personal Information",
      icon: <UserRound className="h-5 w-5" />,
      component: <PersonalInfoForm
        values={formValues.personalInfo}
        onChange={(newValues) => setFormValues(prev => ({
          ...prev,
          personalInfo: newValues
        }))}
      />
    },
    {
      title: "Business Details",
      icon: <Building2 className="h-5 w-5" />,
      component: <BusinessDetailsForm />
    },
    {
      title: "Document Upload",
      icon: <Upload className="h-5 w-5" />,
      component: <DocumentUploadForm />
    }
  ];

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to view Underwriting
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Application Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Personal Information</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Business Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span>Document Verification (Pending)</span>
                </div>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setUploadSuccess(false);
              }} modal={false}>
                <DialogTrigger asChild>
                  <Button className="w-full">Boost Credit Application</Button>
                </DialogTrigger>
                <DialogContent
                 className="sm:max-w-[600px] h-[90vh] overflow-hidden flex flex-col"
               >
                  <DialogHeader className="flex-none">
                    <DialogTitle className="flex items-center gap-2">
                      {steps[step - 1].icon}
                      {steps[step - 1].title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 flex-1 min-h-0 flex flex-col">
                    <div className="space-y-2 mb-6 bg-background pt-2">
                      <div className="flex justify-between text-sm">
                        <span>Step {step} of {totalSteps}</span>
                        {/* <span>{progress}%</span> */}
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="flex-1 overflow-y-auto pb-20 mb-12 px-2">
                      {steps[step - 1].component}
                    </div>
                  </div>
                  <div className="flex justify-between mt-6 pt-4 border-t flex-none">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(step > 1 ? step - 1 : step);
                        setUploadSuccess(false);
                      }}
                      disabled={step === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        if (step < totalSteps) {
                          setStep(step + 1);
                          setUploadSuccess(false);
                        } else {
                          setIsDialogOpen(false);
                          setStep(1);
                        }
                      }}
                      disabled={step === totalSteps && !uploadSuccess}
                    >
                      {step === totalSteps ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Government ID</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Proof of Address</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Bank Statements (Last 6 months)</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Business Registration</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    <CreditStatus />
    </div>
  );
}