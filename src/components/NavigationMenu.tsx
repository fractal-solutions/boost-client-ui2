import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Wallet, Contact as FileContract, LineChart, Bell, Settings, User, Store, Scale, Home, LogIn, LogOut, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function NavigationMenuDemo() {
  const [menuVisibility, setMenuVisibility] = useState({
    vendor: true,
    payments: true,
    contracts: true,
    investments: true,
    credit: true,
  });

  const toggleVisibility = (menu: 'vendor' | 'payments' | 'contracts' | 'investments' | 'credit') => {
    setMenuVisibility(prev => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const { user, isAuthenticated, login, logout, register, verifyPhone, confirmPhone } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginData, setLoginData] = useState({ phoneNumber: '', password: '' });
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    phoneNumber: '',
    code: '',
    username: '',
    password: '',
    isPhoneVerified: false
  });

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-2 sm:px-4 py-2 flex justify-between items-center">
        <NavigationMenu className="relative w-full">
          <NavigationMenuList className="flex justify-start gap-0 sm:gap-1">
            {menuVisibility.vendor && (
              <NavigationMenuItem className="flex-1 sm:flex-none">
                <NavigationMenuTrigger className="w-full sm:w-auto px-2 sm:px-4">
                  <Store className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Vendor</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[calc(100vw-1rem)] sm:w-full gap-2 p-2 sm:p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem
                      href="/vendor"
                      title="Dashboard"
                      description="Combined vendor management view"
                    />
                    <ListItem
                      href="/vendor/pos"
                      title="Quick POS"
                      description="Generate QR codes for payments"
                    />
                    <ListItem
                      href="/vendor/balance"
                      title="Balance"
                      description="View account balance and transactions"
                    />
                    <ListItem
                      href="/vendor/analytics"
                      title="Analytics"
                      description="View business transaction analytics"
                    />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {menuVisibility.payments && (
              <NavigationMenuItem className="flex-1 sm:flex-none">
                <NavigationMenuTrigger className="w-full sm:w-auto px-2 sm:px-4">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Payments</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 p-2 sm:p-4 w-[calc(100vw-1rem)] sm:w-full md:w-[400px] md:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 md:p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">Quick Pay</div>
                          <p className="text-sm leading-tight text-muted-foreground hidden md:block">
                            Send money instantly to your contacts
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href="/history"
                      title="History"
                      description="View your transaction history"
                    />
                    <ListItem
                      href="/scheduled"
                      title="Scheduled"
                      description="Manage scheduled payments"
                    />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {menuVisibility.contracts && (
              <NavigationMenuItem className="flex-1 sm:flex-none">
                <NavigationMenuTrigger className="w-full sm:w-auto px-2 sm:px-4">
                  <FileContract className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Contracts</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[calc(100vw-1rem)] sm:w-full gap-2 p-2 sm:p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem
                      href="/contracts/create"
                      title="Create"
                      description="Set up a new smart contract"
                    />
                    <ListItem
                      href="/contracts/manage"
                      title="Manage"
                      description="View and manage existing contracts"
                    />
                    <ListItem
                      href="/contracts/templates"
                      title="Templates"
                      description="Use pre-made contract templates"
                    />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {menuVisibility.investments && (
              <NavigationMenuItem className="flex-1 sm:flex-none">
                <NavigationMenuTrigger className="w-full sm:w-auto px-2 sm:px-4">
                  <LineChart className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Investments</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[calc(100vw-1rem)] sm:w-full gap-2 p-2 sm:p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem
                      href="/investments/market"
                      title="Market"
                      description="Explore investment opportunities"
                    />
                    <ListItem
                      href="/investments/portfolio"
                      title="Portfolio"
                      description="Track your investments"
                    />
                    <ListItem
                      href="/investments/calculator"
                      title="Calculator"
                      description="Calculate potential returns"
                    />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {menuVisibility.credit && (
              <NavigationMenuItem className="flex-1 sm:flex-none">
                <NavigationMenuTrigger className="w-full sm:w-auto px-2 sm:px-4">
                  <Scale className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Credit</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[calc(100vw-1rem)] sm:w-full gap-2 p-2 sm:p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem
                      href="/credit/underwriting"
                      title="Underwriting"
                      description="Apply for credit and view origination status"
                    />
                    <ListItem
                      href="/credit/status"
                      title="Credit Status"
                      description="View credit scores and FICO report"
                    />
                    <ListItem
                      href="/credit/loans"
                      title="Loans"
                      description="Manage loans and repayments"
                    />
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
          <div className="absolute left-0 top-full w-screen">
            <NavigationMenuViewport
              className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-[calc(100vw-1rem)] sm:w-auto overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90"
            />
          </div>
        </NavigationMenu>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/home"
            className="flex items-center justify-center rounded-md hover:bg-accent"
          >
            <Home className="h-4 w-4 text-foreground" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className='bg-white dark:bg-black'>
              <Settings className="h-4 w-4 cursor-pointer bg-white dark:bg-black" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Menu Visibility</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={menuVisibility.vendor}
                onCheckedChange={() => toggleVisibility('vendor')}
              >
                Vendor Menu
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={menuVisibility.payments}
                onCheckedChange={() => toggleVisibility('payments')}
              >
                Payments Menu
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={menuVisibility.contracts}
                onCheckedChange={() => toggleVisibility('contracts')}
              >
                Contracts Menu
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={menuVisibility.investments}
                onCheckedChange={() => toggleVisibility('investments')}
              >
                Investments Menu
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={menuVisibility.credit}
                onCheckedChange={() => toggleVisibility('credit')}
              >
                Credit Menu
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>User Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">@{user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.phoneNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-xs font-mono">
                            {truncateKey(user?.publicKey || '')}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(user?.publicKey || '');
                              toast.success('Public key copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                <>
                  <DropdownMenuItem onSelect={() => setIsLoginOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsRegisterOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <Bell className="h-4 w-4 cursor-pointer text-foreground" /> */}
          {/* <User className="h-4 w-4 cursor-pointer text-foreground" /> */}
          <ModeToggle />
        </div>


        {/* Login Dialog */}
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+XXX XXXXXXXXX"
                  value={loginData.phoneNumber}
                  onChange={(e) => setLoginData({ ...loginData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
              <Button onClick={async () => {
                try {
                  await login(loginData.phoneNumber, loginData.password);
                  setIsLoginOpen(false);
                } catch {}
              }}>
                Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Registration Dialog */}
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register</DialogTitle>
            </DialogHeader>
            {registrationStep === 1 && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reg-phone">Phone Number</Label>
                  <Input
                    id="reg-phone"
                    placeholder="+XXX XXXXXXXXX"
                    value={registrationData.phoneNumber}
                    onChange={(e) => setRegistrationData({ ...registrationData, phoneNumber: e.target.value })}
                  />
                </div>
                <Button onClick={async () => {
                  try {
                    await verifyPhone(registrationData.phoneNumber);
                    setRegistrationStep(2);
                  } catch {}
                }}>
                  Send Verification Code
                </Button>
              </div>
            )}

            {registrationStep === 2 && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="Enter 6-digit code"
                    value={registrationData.code}
                    onChange={(e) => setRegistrationData({ ...registrationData, code: e.target.value })}
                  />
                </div>
                <Button onClick={async () => {
                  try {
                    const verified = await confirmPhone(registrationData.phoneNumber, registrationData.code);
                    if (verified) {
                      setRegistrationData({ ...registrationData, isPhoneVerified: true });
                      setRegistrationStep(3);
                    }
                  } catch {}
                }}>
                  Verify Code
                </Button>
              </div>
            )}

            {registrationStep === 3 && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={registrationData.username}
                    onChange={(e) => setRegistrationData({ ...registrationData, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
                  />
                </div>
                <Button onClick={async () => {
                  try {
                    await register(registrationData);
                    setIsRegisterOpen(false);
                    setRegistrationStep(1);
                  } catch {}
                }}>
                  Complete Registration
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ListItem({
  className,
  title,
  description,
  href, // we keep href in props but use it as "to" for Link
}: {
  className?: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <li className="w-full">
      <NavigationMenuLink asChild>
        <Link
          to={href} // Use "to" instead of "href" for React Router navigation
          className={cn(
            'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full',
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function truncateKey(key: string) {
  if (!key) return '';
  const keyParts = key.split('-----');
  const keyBody = keyParts[2].trim();
  return `${keyBody.slice(0, 6)}...${keyBody.slice(-4)}`;
}
