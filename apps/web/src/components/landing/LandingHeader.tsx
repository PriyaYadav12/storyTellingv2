import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingBag, Star } from "lucide-react";

interface LandingHeaderProps {
  onGetStarted: () => void;
}

export function LandingHeader({ onGetStarted }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover-elevate rounded-lg p-2">
          <img 
            src="/logo.jpg" 
            alt="LalliFafa" 
            className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full" 
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            LalliFafa
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            variant="ghost"
            size="default"
            className="rounded-[25px] hidden sm:flex hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: '#309898', color: '#fff' }}
          >
            Home
          </Button>
          <Button 
            variant="ghost"
            size="default"
            className="rounded-[25px] hidden sm:flex hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: '#FF9F00', color: '#fff' }}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shop
          </Button>
          <Button 
            variant="ghost"
            size="default"
            className="rounded-[25px] hidden sm:flex hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: '#F4631E', color: '#fff' }}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Blog
          </Button>
          <Button 
            onClick={onGetStarted}
            size="sm"
            className="rounded-[30px] shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: '#CB0404', color: '#fff' }}
          >
            <Star className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2 fill-current" />
            <span className="hidden sm:inline">Log In / Sign Up</span>
            <span className="sm:hidden">Login</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

