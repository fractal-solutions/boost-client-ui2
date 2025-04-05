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
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';
import { Wallet, Contact as FileContract, LineChart, Bell, Settings, User, Store, Scale, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <Bell className="h-4 w-4 cursor-pointer text-foreground" /> */}
          {/* <User className="h-4 w-4 cursor-pointer text-foreground" /> */}
          <ModeToggle />
        </div>
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