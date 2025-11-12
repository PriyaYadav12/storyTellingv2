import { Button } from "@/components/ui/button";
import { Sparkles, Globe, Shield, Heart, TrendingUp, Play, Star } from "lucide-react";

interface HeroProps {
  onGetStarted?: () => void;
  isAuthenticated?: boolean;
}

export default function Hero({ onGetStarted, isAuthenticated }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FFE5D9] to-[#F5F3FF] dark:from-purple-950/20 dark:via-pink-950/20 dark:to-lavender-950/20"></div>
      
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-gradient-to-br from-[#FFEB99]/40 to-[#FFE5D9]/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-[#FFB6D9]/30 to-[#C77DFF]/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-br from-[#A8D8FF]/30 to-[#B8F3D1]/30 rounded-full blur-3xl"></div>
        
        <div className="hidden md:block absolute top-10 right-1/4">
          <Star className="w-8 md:w-12 h-8 md:h-12 text-yellow-400 fill-yellow-400 opacity-30" />
        </div>
        <div className="hidden md:block absolute bottom-1/4 left-1/4">
          <Sparkles className="w-8 md:w-10 h-8 md:h-10 text-pink-400 opacity-30" />
        </div>
        <div className="hidden md:block absolute top-1/3 right-10">
          <Star className="w-6 md:w-8 h-6 md:h-8 text-purple-400 fill-purple-400 opacity-30" />
        </div>
        <div className="hidden md:block absolute bottom-10 right-1/3">
          <Sparkles className="w-8 md:w-10 h-8 md:h-10 text-orange-400 opacity-30" />
        </div>
      </div>
      
      <div className="container relative mx-auto px-4 md:px-6 py-6 md:py-12 z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="text-center lg:text-left space-y-3 md:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-primary/20 to-chart-2/20 backdrop-blur-sm border border-primary/20 rounded-full text-xs md:text-sm font-semibold text-primary shadow-lg">
              <TrendingUp className="w-3 md:w-4 h-3 md:h-4" />
              <span>10,000+ Happy Families</span>
              <Star className="w-3 md:w-4 h-3 md:h-4 fill-current" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Magical Stories
              </span>
              <span className="block text-foreground mt-1 md:mt-2">Come to Life!</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground/90 font-medium leading-relaxed">
              Join <span className="text-primary font-bold">Lalli & Fafa</span> on personalized adventures that spark imagination and teach valuable life lessons
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center lg:justify-start pt-2 md:pt-4">
              <Button 
                size="lg" 
                className="rounded-[30px] shadow-xl shadow-primary/50 hover:scale-105 transition-all duration-300"
                onClick={onGetStarted}
              >
                <Sparkles className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                {isAuthenticated ? "Go to Dashboard" : "Start Your Adventure"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-[30px] backdrop-blur-sm hover:scale-105 transition-all duration-300"
                onClick={onGetStarted}
              >
                <Heart className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                {isAuthenticated ? "View Your Stories" : "See How It Works"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 md:pt-6 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-2 md:p-3 bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-[20px] border border-border/50 hover-elevate transition-all duration-300">
                <Globe className="w-6 h-6 mx-auto mb-1 text-primary" />
                <div className="text-xs md:text-sm font-black text-primary mb-0.5">English & Hindi</div>
                <div className="text-xs font-semibold text-muted-foreground">Languages</div>
              </div>
              <div className="text-center p-2 md:p-3 bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-[20px] border border-border/50 hover-elevate transition-all duration-300">
                <Shield className="w-6 h-6 mx-auto mb-1 text-chart-2" />
                <div className="text-2xl md:text-3xl font-black text-chart-2 mb-0.5 md:mb-1">100%</div>
                <div className="text-xs font-semibold text-muted-foreground">Safe</div>
              </div>
              <div className="text-center p-2 md:p-3 bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-[20px] border border-border/50 hover-elevate transition-all duration-300">
                <Heart className="w-6 h-6 mx-auto mb-1" style={{ color: '#5A189A' }} />
                <div className="text-xs md:text-sm font-black mb-0.5" style={{ color: '#5A189A' }}>Ages 2-8</div>
                <div className="text-xs font-semibold text-muted-foreground">Years Old</div>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFEB99]/30 via-[#FFE5D9]/20 to-[#FFB6D9]/30 rounded-full blur-3xl"></div>
            
            <div className="relative w-full h-full flex items-center justify-center group/hero">
              <div className="absolute left-[10%] md:left-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-700 group-hover/hero:translate-x-8">
                <div className="relative cursor-pointer">
                  <div className="absolute -inset-4 bg-gradient-to-br from-[#FFEB99]/40 to-[#FFB5A7]/40 rounded-full blur-2xl transition-all duration-500"></div>
                  <img 
                    src="/Lalli_2.png" 
                    alt="Lalli - A caring 6-year-old girl character" 
                    className="relative w-48 md:w-64 h-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover/hero:scale-105"
                    style={{mixBlendMode: 'multiply'}}
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-[30px] text-xs md:text-sm font-bold shadow-lg border border-border/50">
                    <Star className="w-3 h-3 inline mr-1 text-yellow-500 fill-yellow-500" />
                    Lalli, 6
                  </div>
                </div>
              </div>
              
              <div className="absolute right-[10%] md:right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-700 group-hover/hero:-translate-x-8">
                <div className="relative cursor-pointer">
                  <div className="absolute -inset-4 bg-gradient-to-br from-[#A8D8FF]/40 to-[#B8F3D1]/40 rounded-full blur-2xl transition-all duration-500"></div>
                  <img 
                    src="/Fafa_1.jpg" 
                    alt="Fafa - A playful 3-year-old boy character" 
                    className="relative w-40 md:w-56 h-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover/hero:scale-105"
                    style={{mixBlendMode: 'multiply'}}
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-[30px] text-xs md:text-sm font-bold shadow-lg border border-border/50">
                    <Heart className="w-3 h-3 inline mr-1 text-red-500 fill-red-500" />
                    Fafa, 3
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className="text-center space-y-2">
                  <Button
                    size="icon"
                    className="w-20 h-20 rounded-[30px] bg-[#C77DFF] hover:bg-[#C77DFF] hover:scale-110 transition-all duration-300 shadow-[0_4px_20px_rgba(199,125,255,0.4)] hover:shadow-[0_0_20px_rgba(199,125,255,0.6)] mx-auto"
                    aria-label="Meet Lalli and Fafa - Play introduction video"
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </Button>
                  <div className="text-xs md:text-sm font-bold text-foreground bg-white/90 dark:bg-background/90 backdrop-blur-sm px-4 py-2 rounded-[30px] border border-border/50 shadow-lg">
                    Meet Lalli & Fafa
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

