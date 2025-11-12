import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Sparkles, Star, Smile } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-6 md:py-12 bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="hidden md:block absolute top-10 left-10">
          <Heart className="w-10 md:w-12 h-10 md:h-12 text-pink-400 opacity-20" />
        </div>
        <div className="hidden md:block absolute top-20 right-20">
          <Sparkles className="w-8 md:w-10 h-8 md:h-10 text-yellow-400 opacity-20" />
        </div>
        <div className="hidden md:block absolute bottom-20 left-1/4">
          <BookOpen className="w-10 md:w-12 h-10 md:h-12 text-blue-400 opacity-20" />
        </div>
        <div className="hidden md:block absolute bottom-10 right-10">
          <Star className="w-8 md:w-10 h-8 md:h-10 text-purple-400 opacity-20" />
        </div>
      </div>
      
      <div className="container relative mx-auto px-6 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-black text-foreground leading-tight">
            Ready to Create
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Magical Memories?
            </span>
          </h2>
          
          <p className="text-2xl text-muted-foreground font-medium">
            Join thousands of families making bedtime stories extraordinary
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="rounded-[30px] shadow-2xl shadow-primary/50 hover:scale-105 transition-all duration-300"
              onClick={onGetStarted}
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Start Free Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-[30px] backdrop-blur-sm hover:scale-105 transition-all duration-300"
              onClick={onGetStarted}
            >
              <Smile className="w-6 h-6 mr-2" />
              See Demo Stories
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • 100% Free to start • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

