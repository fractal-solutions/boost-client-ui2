import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';
import { Wallet, Contact as FileContract, LineChart, Bell, Settings, User, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NavigationMenuDemo() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <NavigationMenu className="relative w-full md:w-auto">
          <NavigationMenuList className="flex justify-start gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Store className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Vendor</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2">
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
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Wallet className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Payments</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-full md:w-[400px] md:grid-cols-2">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 md:p-6 no-underline outline-none focus:shadow-md"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Quick Pay
                        </div>
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
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <FileContract className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Contracts</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2">
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
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <LineChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Investments</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2">
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
          </NavigationMenuList>
          <div className="perspective-[2000px] absolute top-full left-0 flex w-full justify-start">
            <NavigationMenuViewport className="relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" />
          </div>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          <Bell className="h-4 w-4 cursor-pointer" />
          <Settings className="h-4 w-4 cursor-pointer" />
          <User className="h-4 w-4 cursor-pointer" />
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
  href 
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
          to={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full',
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground hidden md:block">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}