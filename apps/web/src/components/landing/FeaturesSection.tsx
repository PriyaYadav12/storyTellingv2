import { Card } from "@/components/ui/card";
import { features } from "@/lib/feature-testimonial";

export function FeaturesSection() {
  return (
    <section className="py-6 md:py-12 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-chart-2/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-6 space-y-2 md:space-y-3">
          <h2 className="text-3xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">What Makes Our Stories</span>
            <br />
            <span className="text-foreground">Special?</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Combining technology with timeless storytelling magic
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-5 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group relative p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 rounded-[20px]"
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                
                <h3 className="font-black text-base md:text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

