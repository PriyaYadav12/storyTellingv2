import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const characters = [
  {
    id: "lalli",
    name: "Lalli",
    emoji: "💖",
    title: "The Dreamer",
    quote: "I love: Art, colors, rainbows, making new friends!",
    image: "/Lalli_2.png",
    gradientFrom: "#FFB6D9",
    gradientTo: "#C77DFF",
    borderColor: "pink-500",
    buttonBg: "#C77DFF",
    buttonText: "💜 Lalli's Stories",
    adventures: [
      { emoji: "🌈", name: "Rainbow Valley" },
      { emoji: "🎨", name: "Art Studio" },
      { emoji: "🦋", name: "Butterfly Garden" },
    ],
  },
  {
    id: "fafa",
    name: "Fafa",
    emoji: "⚡",
    title: "The Inventor",
    quote: "I love: Building, puzzles, discovering how things work!",
    image: "/Fafa_1.jpg",
    gradientFrom: "#A8D8FF",
    gradientTo: "#B8F3D1",
    borderColor: "blue-500",
    buttonBg: "#A8D8FF",
    buttonColor: "#2D3748",
    buttonText: "💙 Fafa's Stories",
    adventures: [
      { emoji: "🔧", name: "Gadget Workshop" },
      { emoji: "🚀", name: "Space Station" },
      { emoji: "🏗️", name: "Builder's Bay" },
    ],
  },
];

export function CharactersSection() {
  return (
    <section className="py-6 md:py-12 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-6 space-y-2 md:space-y-3">
          <h2 className="text-3xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Your New Best Friends
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get to know Lalli and Fafa, your child's adventure companions!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-5 max-w-5xl mx-auto">
          {characters.map((character) => (
            <Card 
              key={character.id}
              className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-[${character.gradientFrom}]/20 to-[${character.gradientTo}]/20 dark:from-${character.id === "lalli" ? "pink" : "blue"}-950/20 dark:to-${character.id === "lalli" ? "purple" : "cyan"}-950/20 border-2 hover:border-${character.borderColor}/50 cursor-pointer rounded-[20px]`}
            >
              <div className="p-5 md:p-5 flex flex-col items-center text-center space-y-4 md:space-y-6">
                <div className="text-4xl mb-2">{character.emoji}</div>
                <div className="relative">
                  <div className={`absolute inset-0 bg-${character.id === "lalli" ? "pink" : "blue"}-400/20 blur-3xl rounded-full`}></div>
                  <img 
                    src={character.image} 
                    alt={character.name} 
                    className="relative w-48 md:w-60 h-48 md:h-60 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                    style={{mixBlendMode: 'multiply'}}
                  />
                </div>
                <div className="space-y-3 md:space-y-4 w-full">
                  <h3 className={`text-2xl md:text-3xl font-black bg-gradient-to-r from-${character.id === "lalli" ? "pink" : "blue"}-500 to-${character.id === "lalli" ? "purple" : "cyan"}-500 bg-clip-text text-transparent flex items-center justify-center gap-2`}>
                    {character.id === "lalli" && <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-pink-500" />}
                    {character.name}
                  </h3>
                  <p className="text-base md:text-lg font-semibold text-foreground">
                    {character.title}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic">
                    "{character.quote}"
                  </p>
                  <div className="bg-white/50 dark:bg-background/50 rounded-[20px] p-4 space-y-2">
                    <p className="text-xs font-bold text-foreground mb-2">Favorite Adventures:</p>
                    <div className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
                      {character.adventures.map((adventure, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span>{adventure.emoji}</span>
                          <span>{adventure.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full group-hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-[30px]"
                    style={{ backgroundColor: character.buttonBg, color: character.buttonColor }}
                  >
                    {character.buttonText}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

