/* ==========================================================================
   FoodiVerse Data Module
   Contains food catalog, categories, promo codes, and customer reviews
   ========================================================================== */

const FOOD_CATEGORIES = [
  { id: 'all', name: 'All Dishes', icon: 'fa-utensils', count: 12 },
  { id: 'pizza', name: 'Pizza', icon: 'fa-pizza-slice', count: 2 },
  { id: 'burger', name: 'Burger', icon: 'fa-burger', count: 2 },
  { id: 'pasta', name: 'Pasta', icon: 'fa-bowl-food', count: 2 },
  { id: 'bbq', name: 'BBQ', icon: 'fa-drumstick-bite', count: 2 },
  { id: 'drinks', name: 'Drinks', icon: 'fa-glass-water', count: 2 },
  { id: 'desserts', name: 'Desserts', icon: 'fa-ice-cream', count: 2 }
];

const FOOD_ITEMS = [
  {
    id: 'p1',
    name: 'Artisanal Pepperoni Supreme',
    category: 'pizza',
    price: 18.99,
    rating: 4.9,
    reviewsCount: 142,
    prepTime: '20-25 min',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    description: 'Freshly baked sourdough crust topped with rich San Marzano tomato sauce, mozzarella, and spicy cured pepperoni.',
    tags: ['Spicy', 'Chef Special'],
    sizes: [
      { name: 'Medium (10")', priceOffset: 0 },
      { name: 'Large (14")', priceOffset: 4.5 },
      { name: 'Family (18")', priceOffset: 8.0 }
    ],
    toppings: [
      { name: 'Extra Cheese', price: 2.0 },
      { name: 'Jalapeños', price: 1.5 },
      { name: 'Truffle Oil Drizzle', price: 2.5 }
    ]
  },
  {
    id: 'p2',
    name: 'Margherita Burrata Special',
    category: 'pizza',
    price: 16.99,
    rating: 4.88,
    reviewsCount: 180,
    prepTime: '18 min',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    description: 'Classic Neapolitan pizza crowned with creamy fresh Burrata cheese, fresh basil leaves, and extra virgin olive oil.',
    tags: ['Veg', 'Classic'],
    sizes: [
      { name: 'Medium (10")', priceOffset: 0 },
      { name: 'Large (14")', priceOffset: 4.0 }
    ],
    toppings: [
      { name: 'Prosciutto Di Parma', price: 3.5 }
    ]
  },
  {
    id: 'b1',
    name: 'Truffle Angus Beast Burger',
    category: 'burger',
    price: 15.49,
    rating: 4.8,
    reviewsCount: 98,
    prepTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    description: 'Double 100% Black Angus beef patty, aged cheddar, caramelised onions, black truffle aioli on a toasted brioche bun.',
    tags: ['Popular'],
    sizes: [
      { name: 'Single Patty', priceOffset: 0 },
      { name: 'Double Patty', priceOffset: 3.5 },
      { name: 'Triple Monster', priceOffset: 6.0 }
    ],
    toppings: [
      { name: 'Crispy Bacon', price: 2.5 },
      { name: 'Fried Egg', price: 1.5 },
      { name: 'Avocado Slices', price: 2.0 }
    ]
  },
  {
    id: 'b2',
    name: 'Smokey Bacon & Cheddar Burger',
    category: 'burger',
    price: 14.99,
    rating: 4.8,
    reviewsCount: 115,
    prepTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    description: 'Charbroiled beef patty, thick applewood smoked bacon, sharp cheddar cheese, house BBQ sauce, and crispy onion straws.',
    tags: ['Smokey', 'Best Value'],
    sizes: [
      { name: 'Single', priceOffset: 0 },
      { name: 'Double', priceOffset: 3.5 }
    ],
    toppings: [
      { name: 'Extra BBQ Sauce', price: 0.75 }
    ]
  },
  {
    id: 'pas1',
    name: 'Classic Creamy Carbonara',
    category: 'pasta',
    price: 16.50,
    rating: 4.92,
    reviewsCount: 165,
    prepTime: '15 min',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh Fettuccine pasta tossed with crispy Guanciale bacon, egg yolk emulsion, black pepper, and Pecorino Romano.',
    tags: ['Italian', 'Chef Special'],
    sizes: [
      { name: 'Standard Bowl', priceOffset: 0 },
      { name: 'Large Bowl', priceOffset: 3.5 }
    ],
    toppings: [
      { name: 'Extra Pecorino Cheese', price: 1.5 },
      { name: 'Garlic Bread Slice', price: 2.0 }
    ]
  },
  {
    id: 'pas2',
    name: 'Truffle Mushroom Penne',
    category: 'pasta',
    price: 17.25,
    rating: 4.85,
    reviewsCount: 88,
    prepTime: '15-18 min',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    description: 'Al dente penne pasta with wild sauteed mushrooms, garlic cream sauce, white truffle oil, and fresh parsley.',
    tags: ['Veg', 'Creamy'],
    sizes: [
      { name: 'Regular Portion', priceOffset: 0 },
      { name: 'Large Portion', priceOffset: 4.0 }
    ],
    toppings: [
      { name: 'Grilled Chicken Breast', price: 3.5 }
    ]
  },
  {
    id: 'bbq1',
    name: 'Smoked Honey Glazed BBQ Ribs',
    category: 'bbq',
    price: 22.99,
    rating: 4.95,
    reviewsCount: 240,
    prepTime: '20-25 min',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: 'Slow-smoked pork ribs glazed with signature honey bourbon BBQ sauce, served with seasoned fries and slaw.',
    tags: ['Best Seller', 'Smokey'],
    sizes: [
      { name: 'Half Rack', priceOffset: 0 },
      { name: 'Full Rack', priceOffset: 9.0 }
    ],
    toppings: [
      { name: 'Extra BBQ Glaze', price: 1.0 },
      { name: 'Crispy Onion Rings Side', price: 3.0 }
    ]
  },
  {
    id: 'bbq2',
    name: 'Flame Grilled Chicken Skewers',
    category: 'bbq',
    price: 15.99,
    rating: 4.78,
    reviewsCount: 110,
    prepTime: '15 min',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    description: 'Marinated tender chicken skewers grilled over charcoal flames, served with garlic pita bread and tzatziki dip.',
    tags: ['High Protein'],
    sizes: [
      { name: '4 Skewers', priceOffset: 0 },
      { name: '7 Skewers Feast', priceOffset: 5.5 }
    ],
    toppings: [
      { name: 'Tzatziki Dip', price: 1.5 }
    ]
  },
  {
    id: 'dr1',
    name: 'Wild Berry Superfood Smoothie',
    category: 'drinks',
    price: 6.99,
    rating: 4.85,
    reviewsCount: 88,
    prepTime: '5 min',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    description: 'Blend of organic blueberries, raspberries, banana, chia seeds, and almond milk. 100% natural sugars.',
    tags: ['Vegan', 'Refresh'],
    sizes: [
      { name: '16 oz (Medium)', priceOffset: 0 },
      { name: '24 oz (Large)', priceOffset: 1.5 }
    ],
    toppings: [
      { name: 'Add Whey Protein', price: 2.0 }
    ]
  },
  {
    id: 'dr2',
    name: 'Iced Matcha Green Tea Latte',
    category: 'drinks',
    price: 5.99,
    rating: 4.8,
    reviewsCount: 75,
    prepTime: '5 min',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    description: 'Ceremonial grade Uji matcha whisked with oat milk and served over ice with vanilla bean syrup.',
    tags: ['Organic', 'Chilled'],
    sizes: [
      { name: 'Medium (16 oz)', priceOffset: 0 },
      { name: 'Large (24 oz)', priceOffset: 1.25 }
    ],
    toppings: [
      { name: 'Add Espresso Shot', price: 1.5 }
    ]
  },
  {
    id: 'd1',
    name: 'Molten Chocolate Lava Cake',
    category: 'desserts',
    price: 8.99,
    rating: 4.9,
    reviewsCount: 165,
    prepTime: '10 min',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Warm dark Belgian chocolate cake with a molten center, served with Madagascan vanilla bean ice cream.',
    tags: ['Sweet', 'Best Seller'],
    sizes: [
      { name: 'Single Slice', priceOffset: 0 },
      { name: 'Double Portion', priceOffset: 4.0 }
    ],
    toppings: [
      { name: 'Extra Vanilla Ice Cream', price: 2.0 }
    ]
  },
  {
    id: 'd2',
    name: 'Classic Italian Tiramisu Cup',
    category: 'desserts',
    price: 7.99,
    rating: 4.88,
    reviewsCount: 130,
    prepTime: '5 min',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    description: 'Layers of espresso-soaked savoiardi ladyfingers and whipped mascarpone cream topped with cocoa powder.',
    tags: ['Classic', 'Sweet'],
    sizes: [
      { name: 'Individual Cup', priceOffset: 0 },
      { name: 'Double Cup', priceOffset: 3.5 }
    ],
    toppings: [
      { name: 'Chocolate Shavings', price: 1.0 }
    ]
  }
];

const PROMO_CODES = {
  'FOODI10': { type: 'percent', discount: 10, minOrder: 15, text: '10% OFF' },
  'TASTY20': { type: 'percent', discount: 20, minOrder: 30, text: '20% OFF' },
  'FREESHIP': { type: 'shipping', discount: 2.99, minOrder: 20, text: 'FREE DELIVERY' }
};

const CUSTOMER_REVIEWS = [
  {
    name: 'Sarah Jenkins',
    role: 'Food Blogger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    stars: 5,
    text: 'The Truffle Angus Burger was delivered steaming hot! Delivery was unbelievably fast under 20 mins and the packaging kept everything super fresh.'
  },
  {
    name: 'Michael Chang',
    role: 'Verified Foodie',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    stars: 5,
    text: 'Hands down the freshest food in town! Premium quality ingredients and elegant presentation.'
  },
  {
    name: 'Elena Rostova',
    role: 'Regular Customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    stars: 5,
    text: 'Loved the live order tracking feature! I watched my artisan pizza transition from oven prep to rider delivery in real time.'
  }
];
