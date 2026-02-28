import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!MONGODB_URI || !ADMIN_EMAIL) {
  console.error('Missing environment variables: MONGODB_URI or ADMIN_EMAIL');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      console.error('Admin user not found. Run "npm run seed" first.');
      process.exit(1);
    }

    // Clear existing data? Maybe not, just add if not exists.
    // For simplicity, I'll clear categories and transactions for this user.
    const userFilter = { userId: admin._id };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mongoose filter types are strict; filter is valid at runtime
    await Category.deleteMany(userFilter as any);
    await Transaction.deleteMany(userFilter as any);
    console.log('Cleared existing data for admin');

    const categories = [
      { name: 'Salary', type: 'income', color: '#22c55e', icon: 'DollarSign' },
      { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'Briefcase' },
      { name: 'Rent', type: 'expense', color: '#ef4444', icon: 'Home' },
      { name: 'Groceries', type: 'expense', color: '#f97316', icon: 'ShoppingCart' },
      { name: 'Transport', type: 'expense', color: '#eab308', icon: 'Bus' },
      { name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: 'Film' },
    ];

    const createdCategories = await Category.insertMany(
      categories.map(c => ({ ...c, userId: admin._id }))
    );
    console.log('Categories created');

    const transactions: any[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Create transactions for current year and next year so /dashboard/month/2026/2 etc. have data
    const years = [currentYear, currentYear + 1];
    for (const year of years) {
      for (let month = 0; month < 12; month++) {
        // Income
        transactions.push({
          amount: 5000,
          type: 'income',
          categoryId: createdCategories.find(c => c.name === 'Salary')?._id,
          note: 'Monthly Salary',
          date: new Date(year, month, 1),
          userId: admin._id,
        });

        // Rent
        transactions.push({
          amount: 1500,
          type: 'expense',
          categoryId: createdCategories.find(c => c.name === 'Rent')?._id,
          note: 'Monthly Rent',
          date: new Date(year, month, 5),
          userId: admin._id,
        });

        // Groceries (random amount)
        transactions.push({
          amount: 300 + Math.random() * 200,
          type: 'expense',
          categoryId: createdCategories.find(c => c.name === 'Groceries')?._id,
          note: 'Grocery shopping',
          date: new Date(year, month, 10 + Math.floor(Math.random() * 10)),
          userId: admin._id,
        });

        // Transport
        transactions.push({
          amount: 100 + Math.random() * 50,
          type: 'expense',
          categoryId: createdCategories.find(c => c.name === 'Transport')?._id,
          note: 'Uber/Bus',
          date: new Date(year, month, 15),
          userId: admin._id,
        });

        // Entertainment (random)
        if (Math.random() > 0.3) {
          transactions.push({
            amount: 50 + Math.random() * 100,
            type: 'expense',
            categoryId: createdCategories.find(c => c.name === 'Entertainment')?._id,
            note: 'Movies/Dinner',
            date: new Date(year, month, 20),
            userId: admin._id,
          });
        }
      }
    }

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions (${years[0]} + ${years[1]})`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
