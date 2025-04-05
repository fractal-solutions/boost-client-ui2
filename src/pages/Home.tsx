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
      bgColor: "bg-blue-950",
      iconColor: "bg-blue-500/20 text-blue-400",
      titleColor: "text-blue-200"
    },
    {
      title: "Scheduled",
      description: "Manage scheduled payments",
      icon: <Clock className="h-6 w-6" />,
      href: "/scheduled",
      bgColor: "bg-orange-950",
      iconColor: "bg-orange-500/20 text-orange-400",
      titleColor: "text-orange-200"
    },
    {
      title: "Markets",
      description: "Explore investment opportunities",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/investments/market",
      bgColor: "bg-emerald-950",
      iconColor: "bg-emerald-500/20 text-emerald-400",
      titleColor: "text-emerald-200"
    },
    {
      title: "Portfolio",
      description: "Track your investments",
      icon: <BarChart4 className="h-6 w-6" />,
      href: "/investments/portfolio",
      bgColor: "bg-purple-950",
      iconColor: "bg-purple-500/20 text-purple-400",
      titleColor: "text-purple-200"
    },
    {
      title: "Calculator",
      description: "Calculate potential returns",
      icon: <Calculator className="h-6 w-6" />,
      href: "/investments/calculator",
      bgColor: "bg-pink-950",
      iconColor: "bg-pink-500/20 text-pink-400",
      titleColor: "text-pink-200"
    },
    {
      title: "Credit Status",
      description: "View credit score and reports",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/credit/status",
      bgColor: "bg-amber-950",
      iconColor: "bg-amber-500/20 text-amber-400",
      titleColor: "text-amber-200"
    },
    {
      title: "Vendor Dashboard",
      description: "Manage your business",
      icon: <Store className="h-6 w-6" />,
      href: "/vendor",
      bgColor: "bg-indigo-950",
      iconColor: "bg-indigo-500/20 text-indigo-400",
      titleColor: "text-indigo-200"
    },
    {
      title: "Balance",
      description: "View your account balance",
      icon: <Wallet className="h-6 w-6" />,
      href: "/vendor/balance",
      bgColor: "bg-teal-950",
      iconColor: "bg-teal-500/20 text-teal-400",
      titleColor: "text-teal-200"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Boost</h1>
        <p className="text-muted-foreground">Quick access to your favorite features</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-3/4">
        {shortcuts.map((shortcut) => (
          <Link to={shortcut.href} key={shortcut.title}>
            <WobbleCard className={`${shortcut.bgColor} hover:brightness-110 transition-all`}>
              <div className="p-6 flex flex-col items-start space-y-2">
                <div className={`p-2 rounded-md ${shortcut.iconColor}`}>
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className={`font-semibold ${shortcut.titleColor}`}>
                    {shortcut.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/80">
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