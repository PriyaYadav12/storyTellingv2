import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export function ShopSection() {
  const products = [
    {
      title: "Lalli's Creative Adventure Kit",
      description: "Coloring books, stickers, and activity sheets",
      price: "₹499",
      image: "/LalliKit.jpg",
      status: "coming-soon",
      testId: "lalli-kit"
    },
    {
      title: "Monthly Story Box",
      description: "New adventures + activities delivered monthly",
      price: "₹999/month",
      image: "/subscriptionBox.jpg",
      status: "coming-soon",
      featured: true,
      testId: "subscription-box"
    },
    {
      title: "Fafa's Building Adventure Kit",
      description: "STEM activities and building challenges",
      price: "₹599",
      image: "/FafaKit.jpg",
      status: "coming-soon",
      testId: "fafa-kit"
    }
  ];

  return (
    <section 
      id="shop" 
      className="py-6 md:py-12 relative overflow-hidden" 
      style={{ backgroundColor: '#F5F3FF' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-6 space-y-2 md:space-y-3">
          <h2 className="text-3xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Bring the Magic Home
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories are just the beginning of the adventure!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-5 max-w-6xl mx-auto mb-8">
          {products.map((product) => (
            <Card 
              key={product.testId}
              className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-[20px] bg-white dark:bg-background ${
                product.featured ? 'border-2 border-primary/30' : ''
              }`}
            >
              <div className="overflow-hidden rounded-t-[20px]">
                <img 
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  data-testid={`img-product-${product.testId}`}
                />
              </div>
              <div className="p-5 space-y-4">
                <h3 className="text-xl font-black text-foreground">{product.title}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="text-2xl font-black" style={{ color: '#C77DFF' }}>
                  {product.price}
                </div>
                {product.status === 'coming-soon' ? (
                  <Button 
                    disabled
                    className="w-full rounded-[30px] hover:scale-105 transition-all duration-300"
                    style={{ backgroundColor: '#A0AEC0', color: '#FFFFFF', cursor: 'not-allowed' }}
                    data-testid={`button-${product.testId}-coming-soon`}
                  >
                    Coming Soon
                  </Button>
                ) : (
                  <Button 
                    className="w-full rounded-[30px] transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#C77DFF' }}
                    data-testid={`button-${product.testId}-waitlist`}
                  >
                    Join Waitlist
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            className="rounded-[30px] transition-all duration-300 hover:scale-105 shadow-xl"
            style={{ backgroundColor: '#C77DFF' }}
            data-testid="button-explore-products"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            🛍️ Explore All Products
          </Button>
        </div>
      </div>
    </section>
  );
}

