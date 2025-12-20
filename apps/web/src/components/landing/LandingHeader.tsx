import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingBag, Star, Menu, X } from "lucide-react";
import { useState } from "react";

interface LandingHeaderProps {
  onGetStarted: () => void;
}

const navItems = [
  {
    label: "Home",
    icon: null,
    style: { backgroundColor: "#309898", color: "#fff" },
    action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
  {
    label: "Shop",
    icon: <ShoppingBag className="w-4 h-4 mr-2" />,
    style: { backgroundColor: "#FF9F00", color: "#fff" },
    action: () => {
      const shopSection = document.getElementById("shop");
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
  {
    label: "Blog",
    icon: <BookOpen className="w-4 h-4 mr-2" />,
    style: { backgroundColor: "#F4631E", color: "#fff" },
    action: () => {
      // TODO: Add blog link or scroll to blog section
      console.log("Blog clicked");
    },
  },
];

function NavButton({
  label,
  icon,
  style,
  className = "",
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="default"
      onClick={onClick}
      style={style}
      className={`rounded-[25px] hover:scale-105 transition-all duration-300 ${className}`}
    >
      {icon}
      {label}
    </Button>
  );
}

export function LandingHeader({ onGetStarted }: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (action?: () => void) => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    action?.();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover-elevate rounded-lg p-2">
          <img
            src="/logoNoBg.png"
            alt="LalliFafa"
            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            LalliFafa
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex gap-2">
            {navItems.map(item => (
              <NavButton
                key={item.label}
                label={item.label}
                icon={item.icon}
                style={item.style}
                onClick={item.action}
              />
            ))}

            <Button
              onClick={onGetStarted}
              size="sm"
              className="rounded-[30px] shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: "#CB0404", color: "#fff" }}
            >
              <Star className="w-3 md:w-4 h-3 md:h-4 mr-2 fill-current" />
              Log In / Sign Up
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map(item => (
              <NavButton
                key={item.label}
                label={item.label}
                icon={item.icon}
                style={item.style}
                className="w-full justify-center"
                onClick={() => handleNavClick(item.action)}
              />
            ))}

            <NavButton
              label="Log In / Sign Up"
              icon={<Star className="w-4 h-4 mr-2 fill-current" />}
              style={{ backgroundColor: "#CB0404", color: "#fff" }}
              className="rounded-[30px] w-full justify-center shadow-lg shadow-primary/30"
              onClick={() => handleNavClick(onGetStarted)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
