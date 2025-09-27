interface KaggleSalesData {
  transactionId: string;
  date: string;
  customerId: string;
  gender: string;
  age: number;
  productCategory: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
}

interface SalesAnalysis {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topCategories: Array<{
    category: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;
  customerDemographics: {
    ageGroups: { [key: string]: number };
    genderDistribution: { [key: string]: number };
  };
  timeTrends: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
  topProducts: Array<{
    category: string;
    totalSales: number;
    averagePrice: number;
  }>;
}

export class KaggleSalesService {
  private data: KaggleSalesData[] = [];
  private isLoaded: boolean = false;

  constructor() {
    this.loadMockData(); // For now, use mock data that mimics the Kaggle dataset
  }

  private async loadMockData(): Promise<void> {
    // Generate realistic mock data that mimics the Kaggle Retail Sales Dataset
    const categories = [
      'Food & Beverages',
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Health & Beauty',
      'Sports & Outdoors',
      'Books & Media',
      'Toys & Games'
    ];

    const genders = ['Male', 'Female'];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2024-10-31');

    this.data = [];

    // Generate 1000 transactions
    for (let i = 0; i < 1000; i++) {
      const randomDate = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );

      const category = categories[Math.floor(Math.random() * categories.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = 18 + Math.floor(Math.random() * 50); // 18-68 years old
      
      // Price varies by category
      const basePrice = this.getBasePriceForCategory(category);
      const pricePerUnit = basePrice + (Math.random() - 0.5) * basePrice * 0.3; // ±30% variation
      
      const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
      const totalAmount = pricePerUnit * quantity;

      this.data.push({
        transactionId: `TXN${String(i + 1).padStart(6, '0')}`,
        date: randomDate.toISOString().split('T')[0],
        customerId: `CUST${String(Math.floor(Math.random() * 500) + 1).padStart(4, '0')}`,
        gender,
        age,
        productCategory: category,
        quantity,
        pricePerUnit: Math.round(pricePerUnit * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      });
    }

    this.isLoaded = true;
  }

  private getBasePriceForCategory(category: string): number {
    const priceMap: { [key: string]: number } = {
      'Food & Beverages': 15.50,
      'Electronics': 299.99,
      'Clothing': 45.00,
      'Home & Garden': 89.99,
      'Health & Beauty': 25.00,
      'Sports & Outdoors': 75.00,
      'Books & Media': 19.99,
      'Toys & Games': 35.00
    };
    return priceMap[category] || 50.00;
  }

  async getSalesData(): Promise<KaggleSalesData[]> {
    if (!this.isLoaded) {
      await this.loadMockData();
    }
    return this.data;
  }

  async getSalesAnalysis(): Promise<SalesAnalysis> {
    const data = await this.getSalesData();
    
    const totalRevenue = data.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalTransactions = data.length;
    const averageOrderValue = totalRevenue / totalTransactions;

    // Category analysis
    const categoryStats: { [key: string]: { revenue: number; transactions: number } } = {};
    data.forEach(item => {
      if (!categoryStats[item.productCategory]) {
        categoryStats[item.productCategory] = { revenue: 0, transactions: 0 };
      }
      categoryStats[item.productCategory].revenue += item.totalAmount;
      categoryStats[item.productCategory].transactions += 1;
    });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        transactions: stats.transactions,
        percentage: (stats.revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Demographics
    const ageGroups: { [key: string]: number } = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    };

    const genderDistribution: { [key: string]: number } = {};

    data.forEach(item => {
      // Age groups
      if (item.age >= 18 && item.age <= 25) ageGroups['18-25']++;
      else if (item.age >= 26 && item.age <= 35) ageGroups['26-35']++;
      else if (item.age >= 36 && item.age <= 45) ageGroups['36-45']++;
      else if (item.age >= 46 && item.age <= 55) ageGroups['46-55']++;
      else ageGroups['55+']++;

      // Gender
      genderDistribution[item.gender] = (genderDistribution[item.gender] || 0) + 1;
    });

    // Time trends (monthly)
    const monthlyStats: { [key: string]: { revenue: number; transactions: number } } = {};
    data.forEach(item => {
      const month = item.date.substring(0, 7); // YYYY-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = { revenue: 0, transactions: 0 };
      }
      monthlyStats[month].revenue += item.totalAmount;
      monthlyStats[month].transactions += 1;
    });

    const timeTrends = Object.entries(monthlyStats)
      .map(([period, stats]) => ({
        period,
        revenue: stats.revenue,
        transactions: stats.transactions
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Top products
    const topProducts = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        totalSales: stats.revenue,
        averagePrice: stats.revenue / data.filter(item => item.productCategory === category).reduce((sum, item) => sum + item.quantity, 0)
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topCategories,
      customerDemographics: {
        ageGroups,
        genderDistribution
      },
      timeTrends,
      topProducts
    };
  }

  async getCategoryPerformance(category: string): Promise<{
    category: string;
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    topCustomers: Array<{
      customerId: string;
      totalSpent: number;
      transactionCount: number;
    }>;
  }> {
    const data = await this.getSalesData();
    const categoryData = data.filter(item => item.productCategory === category);

    const totalRevenue = categoryData.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalTransactions = categoryData.length;
    const averageOrderValue = totalRevenue / totalTransactions;

    // Top customers for this category
    const customerStats: { [key: string]: { totalSpent: number; transactionCount: number } } = {};
    categoryData.forEach(item => {
      if (!customerStats[item.customerId]) {
        customerStats[item.customerId] = { totalSpent: 0, transactionCount: 0 };
      }
      customerStats[item.customerId].totalSpent += item.totalAmount;
      customerStats[item.customerId].transactionCount += 1;
    });

    const topCustomers = Object.entries(customerStats)
      .map(([customerId, stats]) => ({
        customerId,
        totalSpent: Math.round(stats.totalSpent * 100) / 100,
        transactionCount: stats.transactionCount
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      category,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topCustomers
    };
  }

  async getTimeSeriesData(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<Array<{
    period: string;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
  }>> {
    const data = await this.getSalesData();
    const periodStats: { [key: string]: { revenue: number; transactions: number } } = {};

    data.forEach(item => {
      let periodKey: string;
      const date = new Date(item.date);

      if (period === 'daily') {
        periodKey = item.date;
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
      } else {
        periodKey = item.date.substring(0, 7); // YYYY-MM
      }

      if (!periodStats[periodKey]) {
        periodStats[periodKey] = { revenue: 0, transactions: 0 };
      }
      periodStats[periodKey].revenue += item.totalAmount;
      periodStats[periodKey].transactions += 1;
    });

    return Object.entries(periodStats)
      .map(([period, stats]) => ({
        period,
        revenue: Math.round(stats.revenue * 100) / 100,
        transactions: stats.transactions,
        averageOrderValue: Math.round((stats.revenue / stats.transactions) * 100) / 100
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  async getCustomerSegments(): Promise<Array<{
    segment: string;
    criteria: string;
    customerCount: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>> {
    const data = await this.getSalesData();
    const customerStats: { [key: string]: { totalSpent: number; transactionCount: number; age: number; gender: string } } = {};

    // Aggregate customer data
    data.forEach(item => {
      if (!customerStats[item.customerId]) {
        customerStats[item.customerId] = {
          totalSpent: 0,
          transactionCount: 0,
          age: item.age,
          gender: item.gender
        };
      }
      customerStats[item.customerId].totalSpent += item.totalAmount;
      customerStats[item.customerId].transactionCount += 1;
    });

    const customers = Object.values(customerStats);
    const segments = [
      {
        segment: 'High Value',
        criteria: 'Total spent > $500',
        customers: customers.filter(c => c.totalSpent > 500)
      },
      {
        segment: 'Frequent Buyers',
        criteria: '> 10 transactions',
        customers: customers.filter(c => c.transactionCount > 10)
      },
      {
        segment: 'Young Adults',
        criteria: 'Age 18-30',
        customers: customers.filter(c => c.age >= 18 && c.age <= 30)
      },
      {
        segment: 'Mature Customers',
        criteria: 'Age 45+',
        customers: customers.filter(c => c.age >= 45)
      },
      {
        segment: 'Female Customers',
        criteria: 'Gender = Female',
        customers: customers.filter(c => c.gender === 'Female')
      }
    ];

    return segments.map(segment => ({
      segment: segment.segment,
      criteria: segment.criteria,
      customerCount: segment.customers.length,
      totalRevenue: Math.round(segment.customers.reduce((sum, c) => sum + c.totalSpent, 0) * 100) / 100,
      averageOrderValue: segment.customers.length > 0 
        ? Math.round((segment.customers.reduce((sum, c) => sum + c.totalSpent, 0) / segment.customers.reduce((sum, c) => sum + c.transactionCount, 0)) * 100) / 100
        : 0
    }));
  }
}
