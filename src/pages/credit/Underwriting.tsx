import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, CheckCircle, AlertCircle, Upload, Building2, UserRound } from "lucide-react";

export default function CreditUnderwriting() {
  const [step, setStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const PersonalInfoForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="Enter your full name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="idNumber">National ID Number</Label>
        <Input id="idNumber" placeholder="Enter ID number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+254 7XX XXX XXX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Physical Address</Label>
        <Input id="address" placeholder="Enter your address" />
      </div>
    </div>
  );

  const BusinessDetailsForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input id="businessName" placeholder="Enter business name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <Input id="businessType" placeholder="e.g. Retail, Services" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="monthlyRevenue">Average Monthly Revenue</Label>
        <Input id="monthlyRevenue" placeholder="Enter amount" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="yearsOperation">Years in Operation</Label>
        <Input id="yearsOperation" placeholder="Number of years" type="number" />
      </div>
    </div>
  );

  const DocumentUploadForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Government ID</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Upload a clear photo of your ID
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <Label>Business Registration</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Upload business registration documents
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <Label>Bank Statements</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Upload last 6 months statements
          </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    {
      title: "Personal Information",
      icon: <UserRound className="h-5 w-5" />,
      component: <PersonalInfoForm />
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

  return (
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
                  <span>75%</span>
                </div>
                <Progress value={75} />
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
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Continue Application</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-none">
                    <DialogTitle className="flex items-center gap-2">
                      {steps[step - 1].icon}
                      {steps[step - 1].title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 flex-1 min-h-0">
                    <div className="space-y-2 mb-6 bg-background pt-2">
                      <div className="flex justify-between text-sm">
                        <span>Step {step} of {totalSteps}</span>
                        {/* <span>{progress}%</span> */}
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="h-full overflow-auto scrollbar-none overflow-y-hidden">
                      {steps[step - 1].component}
                    </div>
                  </div>
                  <div className="flex justify-between mt-6 pt-4 border-t flex-none">
                    <Button
                      variant="outline"
                      onClick={() => setStep(step > 1 ? step - 1 : step)}
                      disabled={step === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        if (step < totalSteps) {
                          setStep(step + 1);
                        } else {
                          setIsDialogOpen(false);
                          setStep(1);
                        }
                      }}
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
  );
}