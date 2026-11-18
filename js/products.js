/**
 * FreshCart - Products Database & Catalog Engine
 * Comprehensive database covering 11 categories with stock management & LocalStorage persistence.
 */

const PRODUCTS_STORAGE_KEY = 'freshcart_products';

// Default initial catalog of 42 products across 11 categories
const INITIAL_PRODUCTS = [
  // --- Category 1: Fruits ---
  {
    id: 1,
    name: "Royal Shimla Red Apples",
    category: "Fruits",
    price: 180,
    originalPrice: 220,
    discount: "18% OFF",
    rating: 4.8,
    reviewsCount: 124,
    unit: "1 kg (approx. 4-5 pcs)",
    badge: "BESTSELLER",
    stock: 24,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Crisp, sweet, and hand-picked directly from the lush orchards of Himachal Pradesh. Rich in dietary fiber and essential antioxidants.",
    highlights: ["Hand-picked from Shimla orchards", "Wax-free natural skin", "Rich in Vitamin C and fiber", "Crisp texture with natural sweetness"],
    nutrition: { calories: "52 kcal", carbs: "14g", protein: "0.3g", fat: "0.2g" },
    origin: "Shimla, Himachal Pradesh",
    storage: "Store in a cool dry place or refrigerate to preserve crispness.",
    shelfLife: "7-10 days",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/apple.svg"
  },
  {
    id: 2,
    name: "Robusta Golden Bananas",
    category: "Fruits",
    price: 55,
    originalPrice: 70,
    discount: "21% OFF",
    rating: 4.6,
    reviewsCount: 89,
    unit: "1 kg (approx. 6-7 pcs)",
    badge: "ORGANIC",
    stock: 35,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Naturally ripened golden bananas from certified organic farms in Tamil Nadu. An instant energy booster rich in potassium.",
    highlights: ["100% naturally ripened without carbide", "Loaded with potassium & Vitamin B6", "Ideal pre-workout snack"],
    nutrition: { calories: "89 kcal", carbs: "23g", protein: "1.1g", fat: "0.3g" },
    origin: "Tiruchirappalli, Tamil Nadu",
    storage: "Keep at room temperature away from direct sunlight.",
    shelfLife: "3-5 days",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/banana.svg"
  },
  {
    id: 3,
    name: "Devgad Alphonso Mangoes",
    category: "Fruits",
    price: 650,
    originalPrice: 850,
    discount: "23% OFF",
    rating: 4.9,
    reviewsCount: 210,
    unit: "1 Dozen (12 pcs)",
    badge: "SALE",
    stock: 4, // Intentionally low stock for demonstration
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: true,
    description: "The King of Mangoes! Authentic GI-tagged Devgad Alphonso mangoes celebrated worldwide for their saffron pulp and irresistible aroma.",
    highlights: ["GI-Tagged authentic Devgad origin", "Tree-ripened, heavenly aroma", "No chemical ripening agents"],
    nutrition: { calories: "60 kcal", carbs: "15g", protein: "0.8g", fat: "0.4g" },
    origin: "Devgad, Maharashtra",
    storage: "Store at room temperature until ripe, then refrigerate.",
    shelfLife: "5-7 days",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/mango.svg"
  },
  {
    id: 4,
    name: "Nagpur Sweet Fresh Oranges",
    category: "Fruits",
    price: 90,
    originalPrice: 120,
    discount: "25% OFF",
    rating: 4.5,
    reviewsCount: 65,
    unit: "1 kg (approx. 5-6 pcs)",
    badge: "",
    stock: 18,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "Juicy, tangy-sweet oranges harvested straight from Nagpur orchards. Packed with refreshing citrus juice and 100% daily Vitamin C.",
    highlights: ["High juice content", "Direct from Nagpur farmers", "Excellent immune booster"],
    nutrition: { calories: "47 kcal", carbs: "12g", protein: "0.9g", fat: "0.1g" },
    origin: "Nagpur, Maharashtra",
    storage: "Store in a cool dry area or in the refrigerator fruit crisper.",
    shelfLife: "6-8 days",
    image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/orange.svg"
  },

  // --- Category 2: Vegetables ---
  {
    id: 5,
    name: "Farm-Fresh Green Broccoli",
    category: "Vegetables",
    price: 75,
    originalPrice: 95,
    discount: "21% OFF",
    rating: 4.7,
    reviewsCount: 94,
    unit: "500 g",
    badge: "ORGANIC",
    stock: 16,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Tender, dark green broccoli crowns grown organically without synthetic pesticides. A powerhouse of fiber, calcium, and iron.",
    highlights: ["Pesticide-free organic cultivation", "Crisp florets rich in folate & iron", "Washed & quality inspected"],
    nutrition: { calories: "34 kcal", carbs: "7g", protein: "2.8g", fat: "0.4g" },
    origin: "Ooty, Tamil Nadu",
    storage: "Refrigerate in a perforated bag.",
    shelfLife: "4-6 days",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/broccoli.svg"
  },
  {
    id: 6,
    name: "Vine-Ripened Hybrid Tomatoes",
    category: "Vegetables",
    price: 40,
    originalPrice: 55,
    discount: "27% OFF",
    rating: 4.4,
    reviewsCount: 156,
    unit: "1 kg",
    badge: "",
    stock: 40,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Plump, red tomatoes picked ripe from the vine. Ideal for rich curries, salads, homemade sauces, and soups.",
    highlights: ["Firm texture with rich pulp", "High lycopene content", "Daily farm harvest"],
    nutrition: { calories: "18 kcal", carbs: "3.9g", protein: "0.9g", fat: "0.2g" },
    origin: "Kolar, Karnataka",
    storage: "Store at room temperature stem side down.",
    shelfLife: "5-7 days",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/tomato.svg"
  },
  {
    id: 7,
    name: "Ooty Tender Sweet Carrots",
    category: "Vegetables",
    price: 60,
    originalPrice: 80,
    discount: "25% OFF",
    rating: 4.8,
    reviewsCount: 78,
    unit: "1 kg",
    badge: "BESTSELLER",
    stock: 22,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "Sweet, crunchy Nilgiri carrots celebrated for their vibrant orange hue and natural sweetness. Loaded with beta-carotene.",
    highlights: ["Nilgiri mountain grown", "Crisp and juicy for salads or cooking", "Rich in Vitamin A"],
    nutrition: { calories: "41 kcal", carbs: "10g", protein: "0.9g", fat: "0.2g" },
    origin: "Nilgiris, Tamil Nadu",
    storage: "Trim greens and refrigerate in plastic wrap.",
    shelfLife: "10-14 days",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/carrot.svg"
  },
  {
    id: 8,
    name: "Hydroponic Baby Spinach",
    category: "Vegetables",
    price: 45,
    originalPrice: 60,
    discount: "25% OFF",
    rating: 4.9,
    reviewsCount: 112,
    unit: "250 g bunch",
    badge: "ORGANIC",
    stock: 12,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Pre-washed, soil-less hydroponic baby spinach leaves. Mild, tender, and ready-to-eat in healthy green smoothies and salads.",
    highlights: ["Soil-free hydroponic cultivation", "Pre-washed & ozone cleaned", "Zero pesticide residue"],
    nutrition: { calories: "23 kcal", carbs: "3.6g", protein: "2.9g", fat: "0.4g" },
    origin: "Pune, Maharashtra",
    storage: "Keep refrigerated in sealed container.",
    shelfLife: "4-5 days",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/spinach.svg"
  },

  // --- Category 3: Dairy ---
  {
    id: 9,
    name: "Pure A2 Gir Cow Fresh Milk",
    category: "Dairy",
    price: 85,
    originalPrice: 100,
    discount: "15% OFF",
    rating: 4.9,
    reviewsCount: 340,
    unit: "1 Litre bottle",
    badge: "ORGANIC",
    stock: 28,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Farm-fresh, single-source A2 milk from grass-fed indigenous Gir cows. Non-homogenized, pasteurized, and free from antibiotics or hormones.",
    highlights: ["100% Desi Gir Cow milk", "Easier on digestion (A2 Beta-Casein)", "Delivered within 6 hours of morning milking"],
    nutrition: { calories: "65 kcal", carbs: "4.8g", protein: "3.4g", fat: "4.1g" },
    origin: "Anand, Gujarat",
    storage: "Store refrigerated below 4°C.",
    shelfLife: "2-3 days",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/milk.svg"
  },
  {
    id: 10,
    name: "Artisan Salted Farm Butter",
    category: "Dairy",
    price: 240,
    originalPrice: 280,
    discount: "14% OFF",
    rating: 4.8,
    reviewsCount: 88,
    unit: "500 g pack",
    badge: "",
    stock: 14,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Slow-churned traditional cultured butter made with fresh cream and a dash of natural sea salt. Creamy, rich, and melts smoothly on warm toast.",
    highlights: ["Slow-churned traditional method", "Pure sweet cream & sea salt", "No artificial colors or preservatives"],
    nutrition: { calories: "717 kcal", carbs: "0.1g", protein: "0.9g", fat: "81g" },
    origin: "Satara, Maharashtra",
    storage: "Refrigerate between 2°C to 6°C.",
    shelfLife: "6 months",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/butter.svg"
  },
  {
    id: 11,
    name: "Aged English Cheddar Cheese",
    category: "Dairy",
    price: 320,
    originalPrice: 399,
    discount: "20% OFF",
    rating: 4.7,
    reviewsCount: 65,
    unit: "200 g block",
    badge: "SALE",
    stock: 8,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Sharp, crumbly cheddar aged for 9 months to develop deep nutty notes and rich complexity. Perfect for gourmet sandwiches and charcuterie boards.",
    highlights: ["Aged for 9 months", "100% vegetarian microbial rennet", "Rich in calcium and protein"],
    nutrition: { calories: "402 kcal", carbs: "1.3g", protein: "25g", fat: "33g" },
    origin: "Kodaikanal, Tamil Nadu",
    storage: "Keep wrapped in parchment in the refrigerator.",
    shelfLife: "90 days",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/cheese.svg"
  },
  {
    id: 12,
    name: "Greek Probiotic Natural Yogurt",
    category: "Dairy",
    price: 110,
    originalPrice: 135,
    discount: "18% OFF",
    rating: 4.8,
    reviewsCount: 145,
    unit: "400 g tub",
    badge: "BESTSELLER",
    stock: 20,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Thick, creamy strained Greek yogurt packed with 12g of protein per serving and millions of live active gut-friendly probiotic cultures.",
    highlights: ["Triple strained authentic texture", "12g protein per cup", "No added sugar or gelatin"],
    nutrition: { calories: "97 kcal", carbs: "3.9g", protein: "10g", fat: "5g" },
    origin: "Bengaluru, Karnataka",
    storage: "Keep refrigerated below 5°C.",
    shelfLife: "14 days",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/yogurt.svg"
  },

  // --- Category 4: Bakery ---
  {
    id: 13,
    name: "Artisan Whole Wheat Sourdough",
    category: "Bakery",
    price: 140,
    originalPrice: 175,
    discount: "20% OFF",
    rating: 4.8,
    reviewsCount: 92,
    unit: "450 g loaf",
    badge: "ORGANIC",
    stock: 15,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Slow-fermented for 36 hours using stone-ground wheat flour and a heritage wild starter culture. Golden blistered crust with an airy crumb.",
    highlights: ["36-hour slow fermentation", "Easy on digestion", "Zero commercial yeast or chemicals"],
    nutrition: { calories: "240 kcal", carbs: "48g", protein: "9g", fat: "1.2g" },
    origin: "Fresh Bakery Bengaluru",
    storage: "Store in a bread box or freeze sliced.",
    shelfLife: "4-5 days",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/bread.svg"
  },
  {
    id: 14,
    name: "French Golden Butter Croissant",
    category: "Bakery",
    price: 120,
    originalPrice: 150,
    discount: "20% OFF",
    rating: 4.9,
    reviewsCount: 168,
    unit: "Pack of 2 pcs",
    badge: "BESTSELLER",
    stock: 18,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Flaky, layered pastry handcrafted with 100% pure butter following timeless Parisian baking methods. Crisp on the outside, tender inside.",
    highlights: ["Handcrafted laminated dough", "100% pure butter", "Baked fresh daily at 6 AM"],
    nutrition: { calories: "406 kcal", carbs: "45g", protein: "8.2g", fat: "21g" },
    origin: "Fresh Bakery Bengaluru",
    storage: "Store in an airtight container at room temperature.",
    shelfLife: "2-3 days",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/croissant.svg"
  },
  {
    id: 15,
    name: "Dark Chocolate Chocochip Cookies",
    category: "Bakery",
    price: 160,
    originalPrice: 195,
    discount: "18% OFF",
    rating: 4.7,
    reviewsCount: 110,
    unit: "250 g box (8 cookies)",
    badge: "",
    stock: 22,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "Chunky gourmet cookies loaded with 55% Belgian dark chocolate chunks and roasted oats. The ultimate accompaniment to your afternoon coffee.",
    highlights: ["Belgian dark chocolate chunks", "Made with brown butter & rolled oats", "Crisp edges, chewy center"],
    nutrition: { calories: "480 kcal", carbs: "62g", protein: "6g", fat: "24g" },
    origin: "Fresh Bakery Bengaluru",
    storage: "Store in a cool dry container.",
    shelfLife: "2 weeks",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/cookies.svg"
  },
  {
    id: 16,
    name: "Blueberry Crumble Muffins",
    category: "Bakery",
    price: 130,
    originalPrice: 160,
    discount: "19% OFF",
    rating: 4.6,
    reviewsCount: 54,
    unit: "Pack of 2 pcs",
    badge: "SALE",
    stock: 3, // Low stock demo
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Soft vanilla muffins bursting with whole wild blueberries and topped with a buttery cinnamon streusel crumble.",
    highlights: ["Real wild blueberries inside", "Cinnamon butter crumble topping", "No artificial flavorings"],
    nutrition: { calories: "360 kcal", carbs: "50g", protein: "5g", fat: "16g" },
    origin: "Fresh Bakery Bengaluru",
    storage: "Refrigerate after 2 days.",
    shelfLife: "4 days",
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/muffins.svg"
  },

  // --- Category 5: Snacks ---
  {
    id: 17,
    name: "Roasted California Almonds",
    category: "Snacks",
    price: 380,
    originalPrice: 480,
    discount: "21% OFF",
    rating: 4.9,
    reviewsCount: 185,
    unit: "500 g pouch",
    badge: "BESTSELLER",
    stock: 30,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Premium jumbo nonpareil California almonds, slowly dry-roasted and lightly sprinkled with pink Himalayan rock salt.",
    highlights: ["Jumbo size grade almonds", "Dry roasted without oil", "Rich in Vitamin E & magnesium"],
    nutrition: { calories: "579 kcal", carbs: "22g", protein: "21g", fat: "50g" },
    origin: "California, USA (Packed in India)",
    storage: "Store in a cool dry airtight jar.",
    shelfLife: "9 months",
    image: "https://images.unsplash.com/photo-1508061252445-8450f65ec8d8?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/almonds.svg"
  },
  {
    id: 18,
    name: "Kettle Cooked Sea Salt Chips",
    category: "Snacks",
    price: 80,
    originalPrice: 100,
    discount: "20% OFF",
    rating: 4.5,
    reviewsCount: 76,
    unit: "150 g pack",
    badge: "",
    stock: 25,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "Hand-cooked in small batches using premium farm potatoes and cold-pressed sunflower oil, finished with sea salt crystals.",
    highlights: ["Extra crunchy kettle cooked", "Zero trans fat & zero cholesterol", "Gluten-free snacking"],
    nutrition: { calories: "520 kcal", carbs: "56g", protein: "6g", fat: "30g" },
    origin: "Delhi NCR",
    storage: "Seal tightly after opening to retain crunch.",
    shelfLife: "4 months",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/chips.svg"
  },
  {
    id: 19,
    name: "70% Single Origin Dark Chocolate",
    category: "Snacks",
    price: 195,
    originalPrice: 245,
    discount: "20% OFF",
    rating: 4.8,
    reviewsCount: 140,
    unit: "80 g bar",
    badge: "ORGANIC",
    stock: 14,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Single-origin cacao harvested from shade-grown estates in Idukki, Kerala. Smooth, bittersweet profile with fruity undertones.",
    highlights: ["70% Indian single origin cacao", "Stone-ground for 48 hours", "100% vegan & dairy-free"],
    nutrition: { calories: "580 kcal", carbs: "35g", protein: "8g", fat: "44g" },
    origin: "Idukki, Kerala",
    storage: "Store between 16°C and 20°C in a dry place.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/dark-chocolate.svg"
  },
  {
    id: 20,
    name: "Berry & Nut Superfood Granola",
    category: "Snacks",
    price: 290,
    originalPrice: 350,
    discount: "17% OFF",
    rating: 4.7,
    reviewsCount: 88,
    unit: "350 g jar",
    badge: "SALE",
    stock: 10,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Oven-toasted rolled oats, chia seeds, pumpkin seeds, cranberries, and raw organic forest honey. Perfect for breakfast parfaits.",
    highlights: ["Loaded with whole nuts & berries", "Sweetened with wild honey", "High fiber & high protein"],
    nutrition: { calories: "440 kcal", carbs: "60g", protein: "12g", fat: "16g" },
    origin: "Goa, India",
    storage: "Store in an airtight jar in a cool pantry.",
    shelfLife: "6 months",
    image: "https://images.unsplash.com/photo-1517093157656-b9ec81615cb8?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/granola.svg"
  },

  // --- Category 6: Beverages ---
  {
    id: 21,
    name: "Cold-Pressed Valencia Orange Juice",
    category: "Beverages",
    price: 130,
    originalPrice: 160,
    discount: "19% OFF",
    rating: 4.8,
    reviewsCount: 160,
    unit: "500 ml bottle",
    badge: "BESTSELLER",
    stock: 22,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "100% raw, cold-pressed Valencia oranges without added water, sugar, or preservatives. High-pressure processed (HPP) to lock in raw nutrients.",
    highlights: ["100% cold pressed raw juice", "Zero added sugar or water", "No heat pasteurization (HPP)"],
    nutrition: { calories: "45 kcal", carbs: "10.4g", protein: "0.7g", fat: "0.2g" },
    origin: "FreshJuice Co, Bengaluru",
    storage: "Keep refrigerated below 4°C at all times.",
    shelfLife: "10 days",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/orange-juice.svg"
  },
  {
    id: 22,
    name: "Darjeeling Whole Leaf Green Tea",
    category: "Beverages",
    price: 260,
    originalPrice: 320,
    discount: "19% OFF",
    rating: 4.7,
    reviewsCount: 75,
    unit: "100 g tin",
    badge: "ORGANIC",
    stock: 19,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "First-flush Darjeeling organic green tea hand-plucked at 6,000 feet. Features subtle floral notes and an abundance of purifying EGCG catechins.",
    highlights: ["Single-estate high altitude tea", "Whole uncrushed tender leaves", "High in EGCG antioxidant catechins"],
    nutrition: { calories: "2 kcal", carbs: "0g", protein: "0g", fat: "0g" },
    origin: "Darjeeling, West Bengal",
    storage: "Store in an airtight opaque container.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/green-tea.svg"
  },
  {
    id: 23,
    name: "Artisan Arabica Coffee Beans",
    category: "Beverages",
    price: 360,
    originalPrice: 450,
    discount: "20% OFF",
    rating: 4.9,
    reviewsCount: 118,
    unit: "250 g pouch",
    badge: "SALE",
    stock: 12,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Medium-dark roasted 100% Arabica beans grown under natural shade in Chikmagalur. Tastes of dark caramel, hazelnut, and cocoa nibs.",
    highlights: ["Shade grown 100% Arabica", "Freshly roasted in small batches", "Foil valved freshness packaging"],
    nutrition: { calories: "2 kcal", carbs: "0.2g", protein: "0.1g", fat: "0g" },
    origin: "Chikmagalur, Karnataka",
    storage: "Store in an airtight container away from light.",
    shelfLife: "6 months",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/coffee.svg"
  },
  {
    id: 24,
    name: "Natural Tender Coconut Water",
    category: "Beverages",
    price: 65,
    originalPrice: 80,
    discount: "19% OFF",
    rating: 4.7,
    reviewsCount: 190,
    unit: "300 ml bottle",
    badge: "",
    stock: 35,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Naturally sweet and packed with electrolytes. Harvested from Pollachi green coconuts and bottled with zero additives.",
    highlights: ["Natural source of potassium & electrolytes", "Zero concentrate, zero preservatives", "Nature's sports hydration drink"],
    nutrition: { calories: "19 kcal", carbs: "3.7g", protein: "0.7g", fat: "0.2g" },
    origin: "Pollachi, Tamil Nadu",
    storage: "Serve chilled.",
    shelfLife: "3 months",
    image: "https://images.unsplash.com/photo-1544860707-c352cc5a92e3?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/coconut-water.svg"
  },

  // --- Category 7: Rice and Grains ---
  {
    id: 25,
    name: "Royal Aged Long Grain Basmati",
    category: "Rice and Grains",
    price: 340,
    originalPrice: 420,
    discount: "19% OFF",
    rating: 4.9,
    reviewsCount: 310,
    unit: "2 kg bag",
    badge: "BESTSELLER",
    stock: 25,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Aged for two full years in Himalayan foothills to yield exceptionally long, fragrant, non-sticky grains upon cooking.",
    highlights: ["Aged 2 years for signature aroma", "Cooks to twice its grain length", "Ideal for celebratory biryanis and pulaos"],
    nutrition: { calories: "356 kcal", carbs: "78g", protein: "8.5g", fat: "0.6g" },
    origin: "Dehradun, Uttarakhand",
    storage: "Store in a cool dry place.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/basmati-rice.svg"
  },
  {
    id: 26,
    name: "Organic Royal White Quinoa",
    category: "Rice and Grains",
    price: 240,
    originalPrice: 300,
    discount: "20% OFF",
    rating: 4.8,
    reviewsCount: 95,
    unit: "500 g pouch",
    badge: "ORGANIC",
    stock: 17,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Saponin-washed, high-protein ancient seed grain. A complete plant-based protein with all 9 essential amino acids and a pleasant nutty flavor.",
    highlights: ["Complete protein with all 9 amino acids", "Pre-washed to remove bitterness", "Low glycemic index grain alternative"],
    nutrition: { calories: "368 kcal", carbs: "64g", protein: "14g", fat: "6g" },
    origin: "Anantapur, Andhra Pradesh",
    storage: "Store in an airtight container.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/quinoa.svg"
  },
  {
    id: 27,
    name: "Whole Grain Rolled Breakfast Oats",
    category: "Rice and Grains",
    price: 180,
    originalPrice: 220,
    discount: "18% OFF",
    rating: 4.7,
    reviewsCount: 142,
    unit: "1 kg pack",
    badge: "",
    stock: 19,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "100% whole grain jumbo rolled oats that provide sustained energy and beta-glucan soluble fiber for healthy cholesterol control.",
    highlights: ["Rich in heart-healthy beta-glucan", "Thick cut for hearty texture", "Zero added sugars or salts"],
    nutrition: { calories: "389 kcal", carbs: "66g", protein: "16.9g", fat: "6.9g" },
    origin: "Punjab, India",
    storage: "Keep in a cool dry pantry.",
    shelfLife: "9 months",
    image: "https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/rolled-oats.svg"
  },
  {
    id: 28,
    name: "Unpolished Organic Toor Dal",
    category: "Rice and Grains",
    price: 190,
    originalPrice: 235,
    discount: "19% OFF",
    rating: 4.8,
    reviewsCount: 180,
    unit: "1 kg pack",
    badge: "SALE",
    stock: 26,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Naturally grown, unpolished yellow pigeon peas. Free from chemical polishing, water treatment, or added colors.",
    highlights: ["Unpolished with natural fiber intact", "Rich plant-based protein source", "Cooks to a rich comforting sambar/dal"],
    nutrition: { calories: "343 kcal", carbs: "63g", protein: "22g", fat: "1.5g" },
    origin: "Latur, Maharashtra",
    storage: "Keep in an airtight container.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/toor-dal.svg"
  },

  // --- Category 8: Spices (NEW) ---
  {
    id: 29,
    name: "Kashmiri Red Chilli Powder",
    category: "Spices",
    price: 145,
    originalPrice: 185,
    discount: "21% OFF",
    rating: 4.8,
    reviewsCount: 132,
    unit: "200 g pack",
    badge: "BESTSELLER",
    stock: 22,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Vibrant natural red color with mild gentle warmth. Ground from sun-dried Kashmiri chillies with zero added artificial colors.",
    highlights: ["100% pure sun-dried Kashmiri chillies", "Rich ruby red hue for gravies", "Cold ground to preserve essential spice oils"],
    nutrition: { calories: "282 kcal", carbs: "32g", protein: "12g", fat: "14g" },
    origin: "Srinagar, Kashmir",
    storage: "Keep in an airtight spice container away from heat.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/chilli-powder.svg"
  },
  {
    id: 30,
    name: "Organic Royal Salem Turmeric",
    category: "Spices",
    price: 110,
    originalPrice: 140,
    discount: "21% OFF",
    rating: 4.9,
    reviewsCount: 165,
    unit: "250 g jar",
    badge: "ORGANIC",
    stock: 18,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "High curcumin Salem turmeric powder with 5%+ natural curcumin. Known for powerful anti-inflammatory and culinary properties.",
    highlights: ["High natural Curcumin content (5%+)", "Tested free of heavy metals & lead chromate", "Vibrant golden aroma"],
    nutrition: { calories: "354 kcal", carbs: "65g", protein: "7.8g", fat: "9.8g" },
    origin: "Salem, Tamil Nadu",
    storage: "Store in a cool dry cabinet.",
    shelfLife: "18 months",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/turmeric.svg"
  },
  {
    id: 31,
    name: "Malabar Whole Black Pepper",
    category: "Spices",
    price: 210,
    originalPrice: 260,
    discount: "19% OFF",
    rating: 4.8,
    reviewsCount: 88,
    unit: "150 g pouch",
    badge: "",
    stock: 15,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "Garbled grade Tellicherry extra bold whole black peppercorns. Pungent, complex, and filled with spicy piperine heat.",
    highlights: ["Tellicherry extra bold grade", "Sun-dried in Malabar coast", "Intense aroma when freshly cracked"],
    nutrition: { calories: "251 kcal", carbs: "64g", protein: "10g", fat: "3.3g" },
    origin: "Wayanad, Kerala",
    storage: "Store in a pepper mill or airtight glass jar.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/black-pepper.svg"
  },
  {
    id: 32,
    name: "Green Cardamom Pods (Elaichi)",
    category: "Spices",
    price: 290,
    originalPrice: 360,
    discount: "19% OFF",
    rating: 4.9,
    reviewsCount: 94,
    unit: "100 g zip pouch",
    badge: "SALE",
    stock: 2, // Low stock demo
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "8mm jumbo green cardamom pods from the cardamom hills of Idukki. Intensely fragrant pods bursting with black seeds.",
    highlights: ["8mm extra bold green pods", "Intense eucalyptus-mint aroma", "Perfect for chai, biryani, and Indian sweets"],
    nutrition: { calories: "311 kcal", carbs: "68g", protein: "11g", fat: "6.7g" },
    origin: "Idukki, Kerala",
    storage: "Store in a cool dry dark container.",
    shelfLife: "18 months",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/cardamom.svg"
  },

  // --- Category 9: Personal Care (NEW) ---
  {
    id: 33,
    name: "Herbal Aloe & Neem Bath Soap",
    category: "Personal Care",
    price: 95,
    originalPrice: 120,
    discount: "21% OFF",
    rating: 4.7,
    reviewsCount: 110,
    unit: "Pack of 3 bars (100g each)",
    badge: "ORGANIC",
    stock: 20,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Cold-processed handmade soap bar enriched with pure organic aloe vera gel and antibacterial neem oil. Free of sulfates and artificial fragrances.",
    highlights: ["Cold-processed handmade soap", "100% natural plant oils", "Grade 1 TFM 76% skin nourishing"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: "Auroville, Tamil Nadu",
    storage: "Keep in a dry drained soap dish.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1607006314180-d6689d0422c5?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/soap.svg"
  },
  {
    id: 34,
    name: "Cold-Pressed Virgin Coconut Oil",
    category: "Personal Care",
    price: 250,
    originalPrice: 310,
    discount: "19% OFF",
    rating: 4.9,
    reviewsCount: 175,
    unit: "500 ml glass bottle",
    badge: "BESTSELLER",
    stock: 14,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Extracted from fresh coconut milk without heat or chemicals. Multi-purpose nourishing elixir for hair, skin hydration, and oil pulling.",
    highlights: ["Cold extracted from fresh coconut milk", "Zero mineral oils or preservatives", "Food grade and cosmetic grade"],
    nutrition: { calories: "862 kcal", carbs: "0g", protein: "0g", fat: "100g" },
    origin: "Pollachi, Tamil Nadu",
    storage: "Store at room temperature.",
    shelfLife: "18 months",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/coconut-oil.svg"
  },
  {
    id: 35,
    name: "Natural Eco Bamboo Toothbrush Set",
    category: "Personal Care",
    price: 130,
    originalPrice: 170,
    discount: "23% OFF",
    rating: 4.6,
    reviewsCount: 68,
    unit: "Pack of 4 brushes",
    badge: "",
    stock: 25,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "100% biodegradable bamboo handles infused with activated charcoal soft bristles. Gentle on gums and environmentally friendly.",
    highlights: ["Biodegradable moso bamboo", "Charcoal infused soft bristles", "Zero plastic packaging"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: "Assam, India",
    storage: "Dry thoroughly after each use.",
    shelfLife: "Replace every 3 months",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/toothbrush.svg"
  },

  // --- Category 10: Household Essentials ---
  {
    id: 36,
    name: "Lemon Sparkle Herbal Dishwash",
    category: "Household Essentials",
    price: 145,
    originalPrice: 180,
    discount: "19% OFF",
    rating: 4.8,
    reviewsCount: 175,
    unit: "750 ml bottle",
    badge: "BESTSELLER",
    stock: 22,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Plant-derived dishwashing liquid formulated with real lemon oil and soapnuts. Cuts stubborn grease effortlessly while staying gentle on hands.",
    highlights: ["Plant-based degreaser with real lemon", "Non-toxic & eco-friendly biodegradable", "Gentle on skin, tough on burnt stains"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: "EcoClean Labs, Bengaluru",
    storage: "Keep away from direct sunlight.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/dishwash.svg"
  },
  {
    id: 37,
    name: "Bio-Enzyme Liquid Detergent",
    category: "Household Essentials",
    price: 299,
    originalPrice: 380,
    discount: "21% OFF",
    rating: 4.7,
    reviewsCount: 110,
    unit: "1 Litre bottle",
    badge: "ORGANIC",
    stock: 16,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Multi-enzyme concentrated formula that removes tough stains at low temperatures without fading fabrics or leaving chemical residue.",
    highlights: ["Enzyme powered stain removal", "Fabric safe & color safe", "Phosphate-free eco formulation"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: "EcoClean Labs, Bengaluru",
    storage: "Store upright in cool conditions.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/detergent.svg"
  },
  {
    id: 38,
    name: "Neem & Aloe Foaming Handwash",
    category: "Household Essentials",
    price: 120,
    originalPrice: 150,
    discount: "20% OFF",
    rating: 4.8,
    reviewsCount: 95,
    unit: "250 ml dispenser",
    badge: "",
    stock: 19,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: false,
    description: "Antibacterial foaming handwash enriched with pure neem leaf extracts and hydrating organic aloe vera gel.",
    highlights: ["99.9% germ protection", "Enriched with aloe vera & neem", "Sulphate and paraben-free"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: "EcoClean Labs, Bengaluru",
    storage: "Keep in a cool dry area.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1608248597359-009138096fbb?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/handwash.svg"
  },
  {
    id: 39,
    name: "Citrus Multi-Surface Cleaner",
    category: "Household Essentials",
    price: 160,
    originalPrice: 200,
    discount: "20% OFF",
    rating: 4.6,
    reviewsCount: 84,
    unit: "500 ml spray",
    badge: "SALE",
    stock: 0, // Out of stock demo
    lowStockThreshold: 5,
    inStock: false,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Natural surface disinfectant spray powered by cold-pressed orange peel oil and grain alcohol. Leaves surfaces streak-free and citrus-fresh.",
    highlights: ["Kills 99.9% household bacteria", "Streak-free shine on glass, tiles, countertops", "Natural zesty orange aroma"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: "EcoClean Labs, Bengaluru",
    storage: "Keep tightly closed away from heat.",
    shelfLife: "24 months",
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/surface-cleaner.svg"
  },

  // --- Category 11: Frozen Foods (NEW) ---
  {
    id: 40,
    name: "Farm-Frozen Tender Green Peas",
    category: "Frozen Foods",
    price: 85,
    originalPrice: 110,
    discount: "22% OFF",
    rating: 4.8,
    reviewsCount: 142,
    unit: "500 g pouch",
    badge: "BESTSELLER",
    stock: 25,
    lowStockThreshold: 5,
    inStock: true,
    featured: true,
    popular: true,
    specialOffer: false,
    description: "Individual Quick Frozen (IQF) sweet green peas frozen within 2 hours of harvest. Retains all natural sugar, crisp sweetness, and vibrant color.",
    highlights: ["Individual Quick Frozen (IQF)", "Frozen within 2 hours of picking", "Zero preservatives or artificial color"],
    nutrition: { calories: "81 kcal", carbs: "14g", protein: "5.4g", fat: "0.4g" },
    origin: "Punjab, India",
    storage: "Keep frozen at -18°C or below.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/frozen-peas.svg"
  },
  {
    id: 41,
    name: "Sweet Golden Corn Kernels",
    category: "Frozen Foods",
    price: 90,
    originalPrice: 115,
    discount: "21% OFF",
    rating: 4.7,
    reviewsCount: 96,
    unit: "500 g pouch",
    badge: "",
    stock: 18,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: true,
    specialOffer: false,
    description: "Crisp and juicy sweet corn kernels harvested at peak sugar balance. Great for steaming, butter corn, chaats, and salads.",
    highlights: ["100% natural non-GMO sweet corn", "Steam ready in 3 minutes", "Naturally sweet without sugar syrup"],
    nutrition: { calories: "86 kcal", carbs: "19g", protein: "3.2g", fat: "1.2g" },
    origin: "Karnataka, India",
    storage: "Store frozen below -18°C.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/sweet-corn.svg"
  },
  {
    id: 42,
    name: "Frozen Wild Mixed Berries",
    category: "Frozen Foods",
    price: 380,
    originalPrice: 470,
    discount: "19% OFF",
    rating: 4.9,
    reviewsCount: 115,
    unit: "400 g zip pack",
    badge: "SALE",
    stock: 7,
    lowStockThreshold: 5,
    inStock: true,
    featured: false,
    popular: false,
    specialOffer: true,
    description: "Gourmet medley of wild blueberries, raspberries, and blackberries. Flash-frozen to preserve intense berry flavor for smoothies and desserts.",
    highlights: ["Blend of blueberries, raspberries & blackberries", "Rich in anthocyanin antioxidants", "No added sugar or syrup"],
    nutrition: { calories: "57 kcal", carbs: "12g", protein: "0.9g", fat: "0.5g" },
    origin: "Himachal Pradesh",
    storage: "Keep frozen at -18°C.",
    shelfLife: "12 months",
    image: "https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?auto=format&fit=crop&w=600&q=80",
    localImage: "images/products/frozen-berries.svg"
  }
];

// --- LocalStorage Persistence Engine for Products & Stock ---
function getProductsFromStorage() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading products from localStorage', e);
  }

  // Seed default catalog
  saveProductsToStorage(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

function saveProductsToStorage(products) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('freshcart_products_updated', { detail: products }));
  } catch (e) {
    console.error('Error saving products to localStorage', e);
  }
}

// Reset products to default seed (useful for testing)
function resetProductsToDefault() {
  saveProductsToStorage(INITIAL_PRODUCTS);
  if (typeof showToast === 'function') {
    showToast('Catalog Reset', 'Products reset to default inventory.', 'info');
  }
}

// --- Product Query Utilities ---
function getAllProducts() {
  return getProductsFromStorage();
}

function getProductById(id) {
  const numericId = parseInt(id, 10);
  const products = getAllProducts();
  return products.find(p => p.id === numericId) || products[0];
}

function getRelatedProducts(currentId, limit = 4) {
  const curr = getProductById(currentId);
  const products = getAllProducts();
  return products
    .filter(p => p.id !== curr.id && p.category.toLowerCase() === curr.category.toLowerCase())
    .slice(0, limit);
}

// --- Stock Management Utilities ---
function updateProductStock(productId, newStock) {
  const products = getAllProducts();
  const prod = products.find(p => p.id === parseInt(productId, 10));
  if (prod) {
    prod.stock = Math.max(0, parseInt(newStock, 10));
    prod.inStock = prod.stock > 0;
    saveProductsToStorage(products);
    return true;
  }
  return false;
}

// Deduct stock after checkout confirmation
function deductStockForOrder(orderItems) {
  const products = getAllProducts();
  orderItems.forEach(item => {
    const prod = products.find(p => p.id === parseInt(item.id, 10));
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.inStock = prod.stock > 0;
    }
  });
  saveProductsToStorage(products);
}

// Restock items if an order is cancelled
function restockCancelledOrder(orderItems) {
  const products = getAllProducts();
  orderItems.forEach(item => {
    const prod = products.find(p => p.id === parseInt(item.id, 10));
    if (prod) {
      prod.stock += item.quantity;
      prod.inStock = prod.stock > 0;
    }
  });
  saveProductsToStorage(products);
}

// --- Owner Product CRUD Utilities ---
function addProductToCatalog(productData) {
  const products = getAllProducts();
  const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newProduct = {
    id: maxId + 1,
    name: productData.name.trim(),
    category: productData.category.trim(),
    price: parseFloat(productData.price),
    originalPrice: parseFloat(productData.originalPrice || productData.price),
    discount: productData.discount || "",
    rating: 5.0,
    reviewsCount: 1,
    unit: productData.unit.trim(),
    badge: productData.badge || "",
    stock: parseInt(productData.stock, 10) || 0,
    lowStockThreshold: 5,
    inStock: (parseInt(productData.stock, 10) || 0) > 0,
    featured: false,
    popular: false,
    specialOffer: false,
    description: productData.description || "Fresh premium grocery staple.",
    highlights: [productData.description || "Fresh and farm inspected"],
    nutrition: { calories: "N/A", carbs: "N/A", protein: "N/A", fat: "N/A" },
    origin: productData.origin || "India",
    storage: "Store in a cool dry place.",
    shelfLife: productData.shelfLife || "10 days",
    image: productData.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    localImage: "images/categories/fruits.svg"
  };

  products.push(newProduct);
  saveProductsToStorage(products);
  return newProduct;
}

function updateProductInCatalog(id, updatedFields) {
  const products = getAllProducts();
  const idx = products.findIndex(p => p.id === parseInt(id, 10));
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updatedFields };
    if ('stock' in updatedFields) {
      products[idx].inStock = products[idx].stock > 0;
    }
    saveProductsToStorage(products);
    return true;
  }
  return false;
}

function deleteProductFromCatalog(id) {
  let products = getAllProducts();
  products = products.filter(p => p.id !== parseInt(id, 10));
  saveProductsToStorage(products);
  return true;
}

// Generate HTML Card for Product
function renderProductCard(product) {
  let badgeHtml = '';
  if (!product.inStock || product.stock === 0) {
    badgeHtml = `<span class="product-badge" style="background: #757575;">Out of Stock</span>`;
  } else if (product.stock <= (product.lowStockThreshold || 5)) {
    badgeHtml = `<span class="product-badge" style="background: #E65100;">Only ${product.stock} left!</span>`;
  } else if (product.badge === 'ORGANIC') {
    badgeHtml = `<span class="product-badge badge-organic">Organic</span>`;
  } else if (product.badge === 'SALE' || product.discount) {
    badgeHtml = `<span class="product-badge badge-deal">${product.discount || 'Deal'}</span>`;
  } else if (product.badge === 'BESTSELLER') {
    badgeHtml = `<span class="product-badge">Bestseller</span>`;
  }

  // Stock button state
  const isOutOfStock = !product.inStock || product.stock === 0;
  const buttonHtml = isOutOfStock
    ? `<button class="btn-add-cart disabled" disabled style="background: #BDBDBD; cursor: not-allowed;"><i class="fas fa-ban"></i> Out of Stock</button>`
    : `<button class="btn-add-cart" onclick="handleAddToCartClick(event, ${product.id})" title="Add to Cart"><i class="fas fa-shopping-basket"></i> Add</button>`;

  return `
    <div class="product-card" data-category="${product.category}" data-id="${product.id}">
      <div class="product-thumb">
        ${badgeHtml}
        <button class="btn-wishlist" onclick="toggleWishlist(this, ${product.id})" title="Add to Wishlist">
          <i class="far fa-heart"></i>
        </button>
        <a href="product-details.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='${product.localImage}';">
        </a>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">
          <a href="product-details.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-rating">
          <i class="fas fa-star"></i>
          <span class="score">${product.rating}</span>
          <span class="count">(${product.reviewsCount})</span>
          <span style="margin-left: auto; font-size: 0.72rem; color: ${product.stock > 5 ? 'var(--success)' : (product.stock > 0 ? '#E65100' : 'var(--danger)')}; font-weight: 700;">
            ${product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
          </span>
        </div>
        <div class="product-bottom">
          <div class="product-price-box">
            <span class="price-current">₹${product.price}</span>
            <div class="d-flex align-items-center gap-1">
              <span class="price-original">₹${product.originalPrice}</span>
              <span class="unit-label">/ ${product.unit}</span>
            </div>
          </div>
          ${buttonHtml}
        </div>
      </div>
    </div>
  `;
}

// Wishlist toggle helper connected to persistent WishlistEngine
function toggleWishlist(btn, productId) {
  const prod = getProductById(productId);
  if (prod && window.WishlistEngine) {
    const isAdded = WishlistEngine.toggle(prod);
    if (btn) {
      const icon = btn.querySelector('i');
      if (isAdded) {
        btn.classList.add('active');
        if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); icon.style.color = '#e53935'; }
      } else {
        btn.classList.remove('active');
        if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); icon.style.color = ''; }
      }
    }
  }
}

// Global button click handler for Add to Cart with stock boundary check
function handleAddToCartClick(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  const btn = event.currentTarget;
  const product = getProductById(productId);

  if (!product || product.stock <= 0) {
    if (typeof showToast === 'function') {
      showToast('Out of Stock', 'This item is currently sold out.', 'error');
    }
    return;
  }

  if (typeof addToCart === 'function') {
    const success = addToCart(productId, 1);
    if (success !== false) {
      const originalHtml = btn.innerHTML;
      btn.classList.add('added');
      btn.innerHTML = `<i class="fas fa-check"></i> Added`;
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = originalHtml;
      }, 1200);
    }
  }
}

// --- Home Page Section Initializers ---
function initHomePageProducts() {
  const products = getAllProducts();

  // Popular Products Section
  const popularContainer = document.getElementById('popular-products-grid');
  if (popularContainer) {
    const popularItems = products.filter(p => p.popular).slice(0, 8);
    popularContainer.innerHTML = popularItems.map(renderProductCard).join('');
  }

  // Today's Deals Section
  const dealsContainer = document.getElementById('deals-products-grid');
  if (dealsContainer) {
    const dealItems = products.filter(p => p.specialOffer || p.badge === 'SALE').slice(0, 4);
    dealsContainer.innerHTML = dealItems.map(renderProductCard).join('');
  }

  // Tab Filtering on Home Page
  const tabBtns = document.querySelectorAll('.tab-btn[data-cat]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      if (popularContainer) {
        let filtered;
        if (cat === 'all') {
          filtered = products.filter(p => p.popular).slice(0, 8);
        } else {
          filtered = products.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
        }
        popularContainer.innerHTML = filtered.map(renderProductCard).join('');
      }
    });
  });
}

// --- Products Catalog Page Engine (products.html) ---
function initCatalogPage() {
  const gridContainer = document.getElementById('catalog-products-grid');
  if (!gridContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  const initialSearch = urlParams.get('search');

  // DOM Elements
  const searchInput = document.getElementById('catalog-search-input');
  const priceSlider = document.getElementById('price-range');
  const priceDisplay = document.getElementById('price-max-display');
  const sortSelect = document.getElementById('sort-select');
  const resultsCountEl = document.getElementById('results-count');
  const resetBtn = document.getElementById('reset-filters-btn');
  const categoryRadios = document.querySelectorAll('input[name="filter-cat"]');
  const ratingCheckboxes = document.querySelectorAll('input[name="filter-rating"]');
  const inStockCheckbox = document.getElementById('filter-in-stock');

  // Set initial category radio if present in URL
  if (initialCategory) {
    categoryRadios.forEach(radio => {
      if (radio.value.toLowerCase() === initialCategory.toLowerCase() ||
          radio.value.toLowerCase().includes(initialCategory.toLowerCase())) {
        radio.checked = true;
      }
    });
  }

  // Set initial search input if present in URL
  if (initialSearch && searchInput) {
    searchInput.value = initialSearch;
  }

  function applyFilters() {
    let list = getAllProducts();

    // 1. Category Filter
    let selectedCat = 'all';
    categoryRadios.forEach(r => {
      if (r.checked) selectedCat = r.value;
    });
    if (selectedCat !== 'all') {
      list = list.filter(p => p.category.toLowerCase().includes(selectedCat.toLowerCase()));
    }

    // 2. Search Keyword
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchVal) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchVal) ||
        p.category.toLowerCase().includes(searchVal) ||
        p.description.toLowerCase().includes(searchVal)
      );
    }

    // 3. Price Filter
    if (priceSlider) {
      const maxPrice = parseInt(priceSlider.value, 10);
      if (priceDisplay) priceDisplay.textContent = `₹${maxPrice}`;
      list = list.filter(p => p.price <= maxPrice);
    }

    // 4. Rating Filter
    const checkedRatings = [];
    ratingCheckboxes.forEach(cb => {
      if (cb.checked) checkedRatings.push(parseFloat(cb.value));
    });
    if (checkedRatings.length > 0) {
      const minRating = Math.min(...checkedRatings);
      list = list.filter(p => p.rating >= minRating);
    }

    // 5. In Stock Only
    if (inStockCheckbox && inStockCheckbox.checked) {
      list = list.filter(p => p.inStock && p.stock > 0);
    }

    // 6. Sorting
    const sortVal = sortSelect ? sortSelect.value : 'featured';
    if (sortVal === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortVal === 'name-az') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Update Result Counter
    if (resultsCountEl) {
      resultsCountEl.textContent = list.length;
    }

    // Render Grid
    if (list.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 12px; border: 1px solid var(--border-color);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🔍</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No matching groceries found</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Try adjusting your search terms, clearing filters, or browsing other categories.</p>
          <button class="btn btn-primary" onclick="resetAllFilters()">Reset All Filters</button>
        </div>
      `;
    } else {
      gridContainer.innerHTML = list.map(renderProductCard).join('');
    }
  }

  // Bind Events
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (priceSlider) priceSlider.addEventListener('input', applyFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (inStockCheckbox) inStockCheckbox.addEventListener('change', applyFilters);
  categoryRadios.forEach(r => r.addEventListener('change', applyFilters));
  ratingCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

  // Reset Filters Handler
  window.resetAllFilters = function() {
    if (searchInput) searchInput.value = '';
    if (priceSlider) priceSlider.value = priceSlider.max;
    if (priceDisplay) priceDisplay.textContent = `₹${priceSlider.max}`;
    categoryRadios.forEach(r => {
      r.checked = (r.value === 'all');
    });
    ratingCheckboxes.forEach(cb => { cb.checked = false; });
    if (inStockCheckbox) inStockCheckbox.checked = false;
    if (sortSelect) sortSelect.value = 'featured';
    applyFilters();
  };

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetAllFilters();
    });
  }

  // Listen for product catalog updates (e.g. from owner dashboard)
  window.addEventListener('freshcart_products_updated', () => {
    applyFilters();
  });

  // Initial Filter Run
  applyFilters();
}

// --- Product Details Page Engine (product-details.html) ---
function initProductDetailsPage() {
  const detailsRoot = document.getElementById('product-details-container');
  if (!detailsRoot) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 1;
  const product = getProductById(productId);

  // Set Page Title
  document.title = `${product.name} - FreshCart`;

  // Breadcrumbs
  const breadcrumbCat = document.getElementById('breadcrumb-cat');
  const breadcrumbProduct = document.getElementById('breadcrumb-product');
  if (breadcrumbCat) {
    breadcrumbCat.textContent = product.category;
    breadcrumbCat.href = `products.html?category=${encodeURIComponent(product.category)}`;
  }
  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = product.name;
  }

  const stockStatusHtml = product.stock > 0
    ? `<span style="color: var(--success); font-weight: 700;">● In Stock (${product.stock} available)</span>`
    : `<span style="color: var(--danger); font-weight: 700;">● Out of Stock</span>`;

  // Details Section Render
  detailsRoot.innerHTML = `
    <div class="details-layout">
      <!-- Left: Image Gallery -->
      <div class="details-gallery">
        <div class="main-image-wrap">
          <img id="detail-main-img" src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='${product.localImage}';">
        </div>
      </div>

      <!-- Right: Product Info -->
      <div class="details-content">
        <span class="details-badge">${product.category}</span>
        <h1 class="details-title">${product.name}</h1>
        
        <div class="details-rating">
          <div style="color: var(--warning); display: flex; gap: 4px;">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star-half-alt"></i>
          </div>
          <span style="font-weight: 700;">${product.rating}</span>
          <span style="color: var(--text-muted);">(${product.reviewsCount} verified customer reviews)</span>
        </div>

        <div class="details-price-wrap">
          <span class="price-now">₹${product.price}</span>
          <span class="price-was">₹${product.originalPrice}</span>
          <span class="save-badge">Save ₹${product.originalPrice - product.price} (${product.discount || 'Special'})</span>
        </div>

        <p class="details-desc">${product.description}</p>

        <div class="details-specs">
          <div class="spec-item"><strong>Unit:</strong> ${product.unit}</div>
          <div class="spec-item"><strong>Origin:</strong> ${product.origin}</div>
          <div class="spec-item"><strong>Shelf Life:</strong> ${product.shelfLife}</div>
          <div class="spec-item"><strong>Stock Status:</strong> ${stockStatusHtml}</div>
        </div>

        <!-- Quantity and Actions -->
        <div class="details-action-box">
          <div class="qty-control">
            <button type="button" class="qty-btn" id="detail-qty-minus">-</button>
            <input type="text" class="qty-input" id="detail-qty-input" value="1" readonly>
            <button type="button" class="qty-btn" id="detail-qty-plus">+</button>
          </div>

          <button class="btn btn-primary btn-lg" id="detail-add-cart-btn" ${product.stock <= 0 ? 'disabled style="background:#BDBDBD; cursor:not-allowed;"' : ''}>
            <i class="fas fa-shopping-basket"></i> ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button class="btn btn-secondary btn-lg" id="detail-buy-now-btn" ${product.stock <= 0 ? 'disabled style="background:#BDBDBD; cursor:not-allowed;"' : ''}>
            <i class="fas fa-bolt"></i> Buy Now
          </button>
        </div>

        <!-- Trust & Guarantee -->
        <div class="details-guarantee">
          <div class="dg-item"><i class="fas fa-truck-fast"></i> 2-Hour Express Delivery</div>
          <div class="dg-item"><i class="fas fa-shield-halved"></i> 100% Quality Guarantee</div>
          <div class="dg-item"><i class="fas fa-rotate-left"></i> Easy Doorstep Return</div>
        </div>
      </div>
    </div>

    <!-- Product Tabs -->
    <div class="details-tabs-wrap">
      <div class="tabs-header">
        <button class="dtab-btn active" data-tab="desc">Full Description</button>
        <button class="dtab-btn" data-tab="nutrition">Nutritional Facts</button>
        <button class="dtab-btn" data-tab="shipping">Storage &amp; Delivery</button>
        <button class="dtab-btn" data-tab="reviews">Customer Reviews (${product.reviewsCount})</button>
      </div>

      <div class="dtab-content active" id="tab-desc">
        <h4 style="margin-bottom: 12px; font-weight: 700;">Why You Will Love This:</h4>
        <p style="margin-bottom: 16px;">${product.description}</p>
        <ul style="list-style: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
          ${(product.highlights || []).map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>

      <div class="dtab-content" id="tab-nutrition">
        <h4 style="margin-bottom: 12px; font-weight: 700;">Nutritional Information (Approx per 100g):</h4>
        <div style="max-width: 400px; background: var(--bg-cream); border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; padding: 10px 16px; border-bottom: 1px solid var(--border-light);"><span>Energy</span><strong>${product.nutrition.calories}</strong></div>
          <div style="display:flex; justify-content:space-between; padding: 10px 16px; border-bottom: 1px solid var(--border-light);"><span>Carbohydrates</span><strong>${product.nutrition.carbs}</strong></div>
          <div style="display:flex; justify-content:space-between; padding: 10px 16px; border-bottom: 1px solid var(--border-light);"><span>Protein</span><strong>${product.nutrition.protein}</strong></div>
          <div style="display:flex; justify-content:space-between; padding: 10px 16px;"><span>Total Fat</span><strong>${product.nutrition.fat}</strong></div>
        </div>
      </div>

      <div class="dtab-content" id="tab-shipping">
        <h4 style="margin-bottom: 12px; font-weight: 700;">Storage Guidelines:</h4>
        <p style="margin-bottom: 16px;">${product.storage}</p>
        <h4 style="margin-bottom: 12px; font-weight: 700;">FreshCart Cold-Chain Logistics:</h4>
        <p>All perishables are packed in insulated temperature-controlled pouches ensuring optimum freshness from our climate-controlled micro-fulfilment centers right to your doorstep.</p>
      </div>

      <div class="dtab-content" id="tab-reviews">
        <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 24px; flex-wrap: wrap;">
          <div style="text-align: center; background: var(--bg-cream); padding: 20px 30px; border-radius: 12px;">
            <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${product.rating}</div>
            <div style="color: var(--warning); margin-bottom: 6px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Based on ${product.reviewsCount} reviews</div>
          </div>
          <div>
            <p><strong>98% of customers</strong> recommend this grocery product based on quality, taste, and freshness.</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="padding: 16px; background: var(--bg-cream); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <strong>Rajesh Sharma</strong> <span style="color: var(--text-muted); font-size: 0.85rem;">2 days ago</span>
            </div>
            <div style="color: var(--warning); margin-bottom: 6px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <p style="font-size: 0.9rem;">Extremely fresh and top quality! Delivered in under an hour in an insulated bag. FreshCart is now my go-to store.</p>
          </div>
          <div style="padding: 16px; background: var(--bg-cream); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <strong>Priya Sundaram</strong> <span style="color: var(--text-muted); font-size: 0.85rem;">1 week ago</span>
            </div>
            <div style="color: var(--warning); margin-bottom: 6px;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <p style="font-size: 0.9rem;">Superb packaging and authentic farm taste. Definitely worth every rupee.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Details Quantity Controls
  const qtyInput = document.getElementById('detail-qty-input');
  const minusBtn = document.getElementById('detail-qty-minus');
  const plusBtn = document.getElementById('detail-qty-plus');
  const addCartBtn = document.getElementById('detail-add-cart-btn');
  const buyNowBtn = document.getElementById('detail-buy-now-btn');

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
  }

  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      const maxAllowed = Math.min(20, product.stock);
      if (val < maxAllowed) {
        qtyInput.value = val + 1;
      } else {
        if (typeof showToast === 'function') {
          showToast('Stock Limit', `Only ${product.stock} units available in stock.`, 'warning');
        }
      }
    });
  }

  if (addCartBtn && qtyInput) {
    addCartBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value, 10) || 1;
      if (typeof addToCart === 'function') {
        addToCart(product.id, qty);
      }
    });
  }

  if (buyNowBtn && qtyInput) {
    buyNowBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value, 10) || 1;
      if (typeof addToCart === 'function') {
        const added = addToCart(product.id, qty);
        if (added !== false) {
          window.location.href = 'checkout.html';
        }
      }
    });
  }

  // Tab switching
  const tabButtons = detailsRoot.querySelectorAll('.dtab-btn');
  const tabContents = detailsRoot.querySelectorAll('.dtab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = `tab-${btn.getAttribute('data-tab')}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Render Related Products
  const relatedContainer = document.getElementById('related-products-grid');
  if (relatedContainer) {
    const related = getRelatedProducts(product.id, 4);
    relatedContainer.innerHTML = related.map(renderProductCard).join('');
  }
}

// Global initialization upon DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initHomePageProducts();
  initCatalogPage();
  initProductDetailsPage();
});
