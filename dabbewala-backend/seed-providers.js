const mongoose = require("mongoose");
const Provider = require("./models/Provider");
const bcrypt = require("bcryptjs");

// Sample providers data
const sampleProviders = [
  {
    actualName: "Priya Sharma",
    providerName: "Priya's Home Kitchen",
    email: "priya@example.com",
    password: "password123",
    phone: "9876543210",
    menu: [
      {
        name: "North Indian Thali",
        price: 120,
        type: "Vegetarian",
        category: "Lunch",
        description: "Dal, Rice, 2 Roti, Sabzi, Salad, Pickle",
        available: true
      },
      {
        name: "Punjabi Special",
        price: 150,
        type: "Vegetarian",
        category: "Dinner",
        description: "Rajma, Rice, Naan, Paneer, Raita",
        available: true
      }
    ],
    prices: "₹120-150 per thali",
    location: "Andheri West, Mumbai",
    address: { city: "Mumbai", street: "Andheri West" },
    description: "Authentic North Indian home-cooked meals",
    rating: 4.5,
    totalRatings: 25,
    isActive: true
  },
  {
    actualName: "Rajesh Patel",
    providerName: "Gujarati Tiffin Service",
    email: "rajesh@example.com",
    password: "password123",
    phone: "9876543211",
    menu: [
      {
        name: "Gujarati Thali",
        price: 100,
        type: "Vegetarian",
        category: "Lunch",
        description: "Thepla, Dal, Khichdi, Shrikhand",
        available: true
      },
      {
        name: "Dhokla & Fafda",
        price: 80,
        type: "Vegetarian",
        category: "Breakfast",
        description: "Fresh dhokla with chutney and fafda",
        available: true
      }
    ],
    prices: "₹80-100 per meal",
    location: "Navrangpura, Ahmedabad",
    address: { city: "Ahmedabad", street: "Navrangpura" },
    description: "Traditional Gujarati cuisine",
    rating: 4.8,
    totalRatings: 18,
    isActive: true
  },
  {
    actualName: "Anitha Reddy",
    providerName: "South Indian Delights",
    email: "anitha@example.com",
    password: "password123",
    phone: "9876543212",
    menu: [
      {
        name: "South Indian Meal",
        price: 110,
        type: "Vegetarian",
        category: "Lunch",
        description: "Idli, Sambar, Coconut Chutney, Lemon Rice",
        available: true
      },
      {
        name: "Dosa Combo",
        price: 90,
        type: "Vegetarian",
        category: "Breakfast",
        description: "Masala Dosa with sambar and chutney",
        available: true
      }
    ],
    prices: "₹90-110 per meal",
    location: "Koramangala, Bangalore",
    address: { city: "Bangalore", street: "Koramangala" },
    description: "Authentic South Indian flavors",
    rating: 4.6,
    totalRatings: 32,
    isActive: true
  },
  {
    actualName: "Sunita Singh",
    providerName: "Bengali Home Kitchen",
    email: "sunita@example.com",
    password: "password123",
    phone: "9876543213",
    menu: [
      {
        name: "Bengali Thali",
        price: 130,
        type: "Non-Vegetarian",
        category: "Lunch",
        description: "Fish Curry, Rice, Dal, Vegetables, Mishti",
        available: true
      },
      {
        name: "Vegetarian Bengali",
        price: 110,
        type: "Vegetarian",
        category: "Lunch",
        description: "Aloo Posto, Rice, Dal, Vegetables",
        available: true
      }
    ],
    prices: "₹110-130 per thali",
    location: "Salt Lake, Kolkata",
    address: { city: "Kolkata", street: "Salt Lake" },
    description: "Traditional Bengali cuisine",
    rating: 4.7,
    totalRatings: 28,
    isActive: true
  },
  {
    actualName: "Meera Joshi",
    providerName: "Rajasthani Kitchen",
    email: "meera@example.com",
    password: "password123",
    phone: "9876543214",
    menu: [
      {
        name: "Rajasthani Thali",
        price: 140,
        type: "Vegetarian",
        category: "Lunch",
        description: "Dal Baati, Churma, Gatte ki Sabzi, Rice",
        available: true
      },
      {
        name: "Rajasthani Snacks",
        price: 70,
        type: "Vegetarian",
        category: "Snack",
        description: "Kachori, Samosa, Mirchi Vada",
        available: true
      }
    ],
    prices: "₹70-140 per meal",
    location: "Pink City, Jaipur",
    address: { city: "Jaipur", street: "Pink City" },
    description: "Royal Rajasthani flavors",
    rating: 4.4,
    totalRatings: 22,
    isActive: true
  },
  {
    actualName: "Kavitha Nair",
    providerName: "Kerala Spice Kitchen",
    email: "kavitha@example.com",
    password: "password123",
    phone: "9876543215",
    menu: [
      {
        name: "Kerala Sadya",
        price: 160,
        type: "Vegetarian",
        category: "Lunch",
        description: "Rice, Sambar, Avial, Thoran, Payasam",
        available: true
      },
      {
        name: "Kerala Breakfast",
        price: 85,
        type: "Vegetarian",
        category: "Breakfast",
        description: "Puttu, Kadala Curry, Appam",
        available: true
      }
    ],
    prices: "₹85-160 per meal",
    location: "Kochi, Kerala",
    address: { city: "Kochi", street: "Marine Drive" },
    description: "Authentic Kerala cuisine",
    rating: 4.9,
    totalRatings: 35,
    isActive: true
  },
  {
    actualName: "Rohit Kumar",
    providerName: "Punjabi Dhaba",
    email: "rohit@example.com",
    password: "password123",
    phone: "9876543216",
    menu: [
      {
        name: "Punjabi Thali",
        price: 180,
        type: "Non-Vegetarian",
        category: "Lunch",
        description: "Butter Chicken, Naan, Dal Makhani, Rice",
        available: true
      },
      {
        name: "Vegetarian Punjabi",
        price: 140,
        type: "Vegetarian",
        category: "Lunch",
        description: "Chole, Naan, Dal, Rice, Lassi",
        available: true
      }
    ],
    prices: "₹140-180 per thali",
    location: "Chandigarh",
    address: { city: "Chandigarh", street: "Sector 17" },
    description: "Hearty Punjabi meals",
    rating: 4.3,
    totalRatings: 19,
    isActive: true
  },
  {
    actualName: "Deepa Iyer",
    providerName: "Tamil Nadu Kitchen",
    email: "deepa@example.com",
    password: "password123",
    phone: "9876543217",
    menu: [
      {
        name: "Tamil Thali",
        price: 95,
        type: "Vegetarian",
        category: "Lunch",
        description: "Sambar Rice, Rasam, Curd Rice, Pickle",
        available: true
      },
      {
        name: "Tamil Breakfast",
        price: 75,
        type: "Vegetarian",
        category: "Breakfast",
        description: "Idli, Dosa, Pongal, Chutney",
        available: true
      }
    ],
    prices: "₹75-95 per meal",
    location: "T. Nagar, Chennai",
    address: { city: "Chennai", street: "T. Nagar" },
    description: "Traditional Tamil cuisine",
    rating: 4.6,
    totalRatings: 26,
    isActive: true
  }
];

async function seedProviders() {
  try {
    console.log("🌱 Starting to seed providers...");
    
    // Connect to database
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/dabbewala";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to database");

    // Clear existing providers
    await Provider.deleteMany({});
    console.log("🗑️ Cleared existing providers");

    // Hash passwords
    for (let provider of sampleProviders) {
      provider.password = await bcrypt.hash(provider.password, 10);
    }

    // Insert sample providers
    const createdProviders = await Provider.insertMany(sampleProviders);
    console.log(`✅ Created ${createdProviders.length} sample providers`);

    // List created providers
    createdProviders.forEach(provider => {
      console.log(`   - ${provider.providerName} (${provider.location})`);
    });

    console.log("🎉 Provider seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding providers:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedProviders();
