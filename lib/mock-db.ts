// Mock database for testing without a real PostgreSQL connection
export interface Contestant {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  voteCount: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  contestantId: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Settings {
  id: string;
  votePrice: number;
  platformName: string;
  description: string;
  isActive: boolean;
  maxVotesPerUser: number;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

class MockDatabase {
  private contestants: Map<string, Contestant> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private settings: Settings | null = null;
  private adminUsers: Map<string, AdminUser> = new Map();
  private votes: Map<string, number> = new Map(); // email -> vote count

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Default contestants
    const defaultContestants: Contestant[] = [
      {
        id: 'c1',
        name: 'Alice Johnson',
        description: 'Rising tech entrepreneur with innovative ideas',
        imageUrl: 'https://i.pravatar.cc/150?img=1',
        voteCount: 145,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'c2',
        name: 'Bob Smith',
        description: 'Creative designer passionate about user experience',
        imageUrl: 'https://i.pravatar.cc/150?img=2',
        voteCount: 198,
        createdAt: new Date('2024-01-02'),
      },
      {
        id: 'c3',
        name: 'Carol White',
        description: 'Data scientist revolutionizing analytics',
        imageUrl: 'https://i.pravatar.cc/150?img=3',
        voteCount: 87,
        createdAt: new Date('2024-01-03'),
      },
      {
        id: 'c4',
        name: 'David Brown',
        description: 'Full-stack developer with global experience',
        imageUrl: 'https://i.pravatar.cc/150?img=4',
        voteCount: 234,
        createdAt: new Date('2024-01-04'),
      },
      {
        id: 'c5',
        name: 'Emma Davis',
        description: 'Product manager building next-gen solutions',
        imageUrl: 'https://i.pravatar.cc/150?img=5',
        voteCount: 156,
        createdAt: new Date('2024-01-05'),
      },
    ];

    defaultContestants.forEach(c => this.contestants.set(c.id, c));

    // Default settings
    this.settings = {
      id: 'settings-1',
      votePrice: 100,
      platformName: 'Vote & Win',
      description: 'Vote for your favorite contestant and make a difference!',
      isActive: true,
      maxVotesPerUser: 10,
    };

    // Default admin user (email: admin@example.com, password: admin123)
    this.adminUsers.set('admin@example.com', {
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash: '$2b$10$R0w1IeJoApZFhIMg5ZUcBe31Tr6zik2JKhxpd.n3oHnOALIqsjtJ2',
      createdAt: new Date(),
    });
  }

  // Contestant methods
  getContestants() {
    return Array.from(this.contestants.values()).sort(
      (a, b) => b.voteCount - a.voteCount
    );
  }

  getContestant(id: string) {
    return this.contestants.get(id);
  }

  createContestant(name: string, description: string, imageUrl?: string) {
    const id = 'c' + Date.now();
    const contestant: Contestant = {
      id,
      name,
      description,
      imageUrl,
      voteCount: 0,
      createdAt: new Date(),
    };
    this.contestants.set(id, contestant);
    return contestant;
  }

  updateContestant(id: string, data: Partial<Contestant>) {
    const contestant = this.contestants.get(id);
    if (!contestant) return null;
    const updated = { ...contestant, ...data };
    this.contestants.set(id, updated);
    return updated;
  }

  deleteContestant(id: string) {
    return this.contestants.delete(id);
  }

  // Transaction methods
  getTransactions() {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  createTransaction(
    reference: string,
    amount: number,
    contestantId: string,
    email: string,
    phone: string
  ) {
    const id = 't' + Date.now();
    const transaction: Transaction = {
      id,
      reference,
      amount,
      status: 'pending',
      contestantId,
      email,
      phone,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  getTransaction(reference: string) {
    return Array.from(this.transactions.values()).find(
      t => t.reference === reference
    );
  }

  updateTransaction(reference: string, status: Transaction['status']) {
    const transaction = Array.from(this.transactions.values()).find(
      t => t.reference === reference
    );
    if (!transaction) return null;

    transaction.status = status;

    // If completed, increment vote count
    if (status === 'completed') {
      const contestant = this.contestants.get(transaction.contestantId);
      if (contestant) {
        contestant.voteCount += 1;
      }
    }

    return transaction;
  }

  // Settings methods
  getSettings() {
    return this.settings;
  }

  updateSettings(data: Partial<Settings>) {
    if (!this.settings) {
      this.settings = {
        id: 'settings-1',
        votePrice: data.votePrice || 100,
        platformName: data.platformName || 'Vote & Win',
        description: data.description || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        maxVotesPerUser: data.maxVotesPerUser || 10,
      };
    } else {
      this.settings = { ...this.settings, ...data };
    }
    return this.settings;
  }

  // Admin user methods
  getAdminUser(email: string) {
    return this.adminUsers.get(email);
  }

  createAdminUser(email: string, passwordHash: string) {
    const id = 'admin-' + Date.now();
    const user: AdminUser = {
      id,
      email,
      passwordHash,
      createdAt: new Date(),
    };
    this.adminUsers.set(email, user);
    return user;
  }

  // Vote tracking
  recordVote(email: string) {
    const count = this.votes.get(email) || 0;
    this.votes.set(email, count + 1);
    return count + 1;
  }

  getVoteCount(email: string) {
    return this.votes.get(email) || 0;
  }
}

// Singleton instance
export const mockDb = new MockDatabase()

// For SSE broadcasting (import broadcastUpdate from leaderboard stream route)
export const broadcastUpdate = () => {
  // This will be called from webhook to trigger SSE updates
  // Implementation is in app/api/leaderboard/stream/route.ts
};
