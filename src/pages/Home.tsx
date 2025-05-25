import { Card } from "@/components/ui/card";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Button } from "@/components/ui/button";
import { Vortex } from "@/components/ui/vortex";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Send, 
  Clock, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  Store, 
  BarChart4,
  Wallet,
  Settings,
  Banknote,
  ArrowRight,
  ArrowUpRight
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const shortcuts = [
    {
      title: "Quick Pay",
      description: "Send money instantly",
      icon: <Send className="h-8 w-8 text-amber-400" />,  // Changed to amber/gold
      href: "/",
      iconColor: "bg-amber-400/20 text-amber-400"  // Using amber for gold effect
    },
    {
      title: "Scheduled",
      description: "Manage scheduled payments",
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      href: "/scheduled",
      iconColor: "bg-purple-500/20 text-purple-500"
    },
    {
      title: "Markets",
      description: "Explore investment opportunities",
      icon: <TrendingUp className="h-8 w-8 text-pink-500" />,
      href: "/investments/market",
      iconColor: "bg-pink-500/20 text-pink-500"
    },
    {
      title: "Portfolio",
      description: "Track your investments",
      icon: <BarChart4 className="h-8 w-8 text-primary" />,
      href: "/investments/portfolio",
      iconColor: "bg-primary/20 text-primary"
    },
    {
      title: "Calculator",
      description: "Calculate potential returns",
      icon: <Calculator className="h-8 w-8 text-purple-500" />,
      href: "/investments/calculator",
      iconColor: "bg-purple-500/20 text-purple-500"
    },
    {
      title: "Credit Status",
      description: "View credit score and reports",
      icon: <CreditCard className="h-8 w-8 text-pink-500" />,
      href: "/credit/status",
      iconColor: "bg-pink-500/20 text-pink-500"
    },
    {
      title: "Vendor Dashboard",
      description: "Manage your business",
      icon: <Store className="h-8 w-8 text-primary" />,
      href: "/vendor",
      iconColor: "bg-primary/20 text-primary"
    },
    {
      title: "Balance",
      description: "View your account balance",
      icon: <Wallet className="h-8 w-8 text-purple-500" />,
      href: "/vendor/balance",
      iconColor: "bg-purple-500/20 text-purple-500"
    }
  ];


  if (!user?.publicKey) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 px-4">
      {/* Hero Section */}
      <div className="space-y-4 text-center max-w-3xl relative">
 
        <h1 className=" text-7xl md:text-8xl font-bold tracking-tighter">
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient">
            Boost
          </span>
        </h1>
        <p className="text-2xl font-light text-muted-foreground/80">
          The Future of Digital Finance
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-8 md:grid-cols-3 w-full max-w-4xl">
        <Card className="group relative overflow-hidden border-primary/10 bg-primary/5 backdrop-blur transition-all hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="mb-3 inline-block rounded-lg bg-primary/20 p-3">
              <Banknote className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-primary">Instant Transfers</h3>
            <p className="text-sm text-muted-foreground">
              Lightning-fast payments with 1% fees
            </p>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border-purple-500/10 bg-purple-500/5 backdrop-blur transition-all hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="mb-3 inline-block rounded-lg bg-purple-500/20 p-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="mb-2 font-semibold text-purple-500">Smart Investments</h3>
            <p className="text-sm text-muted-foreground">
              Grow your wealth intelligently with creditized debt assets
            </p>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border-pink-500/10 bg-pink-500/5 backdrop-blur transition-all hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="mb-3 inline-block rounded-lg bg-pink-500/20 p-3">
              <CreditCard className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="mb-2 font-semibold text-pink-500">Easy Credit</h3>
            <p className="text-sm text-muted-foreground">
              Instant access to credit facilities for SMEs
            </p>
          </div>
        </Card>
      </div>

      {/* Login Prompt */}
      <div className="relative">
        <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/20 bg-muted/50 px-4 py-2 backdrop-blur">
          <Settings className="h-4 w-4 animate-spin-slow text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click the settings icon to begin your journey
          </span>
          <ArrowUpRight className="h-4 w-4 animate-bounce text-muted-foreground" />
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
          will-change: background-position;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Add the shimmer animation */
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        .shimmer-gold {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-gold::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            120deg,
            transparent 20%,
            rgba(251, 191, 36, 0.1) 30%,
            rgba(251, 191, 36, 0.15) 40%,
            transparent 50%
          );
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .shimmer-gold:hover::before {
          opacity: 1;
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
}

const getCardStyles = (baseColor: string) => {
  const styles = {
    primary: 'border-primary/10 bg-primary/5',
    purple: 'border-purple-500/20 bg-purple-500/20',
    pink: 'border-pink-500/20 bg-pink-500/20',
    amber: 'border-amber-400/10 bg-amber-400/5 hover:shadow-amber-400/20'  // Enhanced amber style
  };

  const baseStyles = `group relative overflow-hidden ${styles[baseColor]} backdrop-blur transition-all hover:scale-105 h-full`;
  
  // Add shimmer class if it's amber/gold
  return baseColor === 'amber' 
    ? `${baseStyles} hover:shadow-lg hover:border-amber-400/30 shimmer-gold` 
    : baseStyles;
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight -mt-4">Welcome to Boost</h1>
        <p className="text-muted-foreground">Quick access to your favorite features</p>
      </div>

      <div className="grid gap-8 md:grid-cols-4 sm:grid-cols-2 w-full">
        {shortcuts.map((shortcut) => {
          // Extract color from iconColor safely
          const baseColor = shortcut.title === "Quick Pay" ? "amber" :
                       shortcut.iconColor.includes('primary') ? 'primary' : 
                       shortcut.iconColor.includes('purple') ? 'purple-500' : 
                       'pink-500';
          
          return (
            <Link to={shortcut.href} key={shortcut.title}>
              <Card className={getCardStyles(baseColor)}>
                <div className={`
                  absolute inset-0 bg-gradient-to-br 
                  ${baseColor === 'amber' 
                    ? 'from-amber-400/40 via-amber-300/20 to-transparent' 
                    : `from-${baseColor}/30 via-transparent to-transparent`
                  }
                  opacity-0 
                  group-hover:opacity-100 transition-opacity
                `} />
                <div className="relative p-6">
                  <div className={`mb-3 inline-block rounded-lg bg-${baseColor}/20 p-3`}>
                    {shortcut.icon}
                  </div>
                  <h3 className={`mb-2 font-semibold text-${baseColor}`}>
                    {shortcut.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}