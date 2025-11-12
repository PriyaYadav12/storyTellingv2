import { Card } from "@/components/ui/card";
import { Award, Star } from "lucide-react";
import { testimonials } from "@/lib/feature-testimonial";

export function TestimonialsSection() {
  return (
    <section className="py-6 md:py-12 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-6 space-y-2 md:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs md:text-sm font-bold text-primary mb-2 md:mb-3">
            <Award className="w-3 md:w-4 h-3 md:h-4" />
            <span>Trusted by 10,000+ Families</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground">
            Real Stories from
            <br />
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Happy Parents
            </span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-5 md:gap-5 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-4 md:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
            >
              <div className="flex gap-1 mb-3 md:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 md:w-5 h-4 md:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-sm md:text-base italic mb-4 md:mb-5 text-card-foreground leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-white font-bold text-base md:text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm md:text-base">{testimonial.name}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

