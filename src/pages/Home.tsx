import { Card } from "@/components/ui/card";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Button } from "@/components/ui/button";
import { Vortex } from "@/components/ui/vortex";
import { Link } from "react-router-dom";
import { 
  Send, 
  Clock, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  Store, 
  BarChart4,
  Wallet
} from "lucide-react";

export default function Home() {
  const shortcuts = [
    {
      title: "Quick Pay",
      description: "Send money instantly",
      icon: <Send className="h-6 w-6" />,
      href: "/",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Scheduled",
      description: "Manage scheduled payments",
      icon: <Clock className="h-6 w-6" />,
      href: "/scheduled",
      color: "bg-orange-500/10 text-orange-500"
    },
    {
      title: "Markets",
      description: "Explore investment opportunities",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/investments/market",
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: "Portfolio",
      description: "Track your investments",
      icon: <BarChart4 className="h-6 w-6" />,
      href: "/investments/portfolio",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      title: "Calculator",
      description: "Calculate potential returns",
      icon: <Calculator className="h-6 w-6" />,
      href: "/investments/calculator",
      color: "bg-pink-500/10 text-pink-500"
    },
    {
      title: "Credit Status",
      description: "View credit score and reports",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/credit/status",
      color: "bg-yellow-500/10 text-yellow-500"
    },
    {
      title: "Vendor Dashboard",
      description: "Manage your business",
      icon: <Store className="h-6 w-6" />,
      href: "/vendor",
      color: "bg-indigo-500/10 text-indigo-500"
    },
    {
      title: "Balance",
      description: "View your account balance",
      icon: <Wallet className="h-6 w-6" />,
      href: "/vendor/balance",
      color: "bg-teal-500/10 text-teal-500"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Boost</h1>
        <p className="text-muted-foreground">Quick access to your favorite features</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Link to={shortcut.href} key={shortcut.title}>
            <WobbleCard className="bg-gray-800 hover:bg-accent transition-colors">
              <div className="p-6 flex flex-col items-start space-y-2">
                <div className={`p-2 rounded-md ${shortcut.color}`}>
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{shortcut.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </p>
                </div>
              </div>
            </WobbleCard>
          </Link>
        ))}
      </div>
    </div>
  );
}