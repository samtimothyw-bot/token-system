// Express Server with Token System

import express, { Request, Response } from 'express';

interface TokenData {
  id: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  userId?: string;
  scope?: string[];
}

class TokenServer {
  private app = express();
  private tokens: Map<string, TokenData> = new Map();
  private port = 3000;

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check
    this.app.get('/', (req: Request, res: Response) => {
      res.json({ message: 'Token System Server Running ✅' });
    });

    // Generate token
    this.app.post('/generate-token', (req: Request, res: Response) => {
      const { userId, expiresInHours = 1, scope = ['read'] } = req.body;
      const token = this.generateToken(userId, expiresInHours, scope);
      res.json({ token, expiresInHours });
    });

    // Validate token
    this.app.post('/validate-token', (req: Request, res: Response) => {
      const { token } = req.body;
      const isValid = this.validateToken(token);
      res.json({ token, isValid });
    });

    // Get tokens for user
    this.app.get('/user-tokens/:userId', (req: Request, res: Response) => {
      const { userId } = req.params;
      const userTokens = this.getTokensByUser(userId);
      res.json({ userId, tokenCount: userTokens.length, tokens: userTokens });
    });

    // Use token
    this.app.post('/use-token', (req: Request, res: Response) => {
      const { token } = req.body;
      const used = this.useToken(token);
      res.json({ token, used });
    });

    // Revoke token
    this.app.post('/revoke-token', (req: Request, res: Response) => {
      const { token } = req.body;
      const revoked = this.revokeToken(token);
      res.json({ token, revoked });
    });

    // Get statistics
    this.app.get('/stats', (req: Request, res: Response) => {
      const stats = this.getStats();
      res.json(stats);
    });
  }

  private generateToken(userId: string, expiresInHours: number, scope: string[]): string {
    const id = Math.random().toString(36).slice(2, 11);
    const value = this.createRandomToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 3600000);

    const tokenData: TokenData = {
      id,
      value,
      createdAt: now,
      expiresAt,
      used: false,
      userId,
      scope,
    };

    this.tokens.set(id, tokenData);
    return value;
  }

  private validateToken(tokenValue: string): boolean {
    for (const token of this.tokens.values()) {
      if (token.value === tokenValue && !token.used) {
        const now = new Date();
        if (now < token.expiresAt) {
          return true;
        }
      }
    }
    return false;
  }

  private useToken(tokenValue: string): boolean {
    for (const token of this.tokens.values()) {
      if (token.value === tokenValue && !token.used) {
        token.used = true;
        return true;
      }
    }
    return false;
  }

  private revokeToken(tokenValue: string): boolean {
    for (const [id, token] of this.tokens.entries()) {
      if (token.value === tokenValue) {
        this.tokens.delete(id);
        return true;
      }
    }
    return false;
  }

  private getTokensByUser(userId: string): TokenData[] {
    const result: TokenData[] = [];
    for (const token of this.tokens.values()) {
      if (token.userId === userId && !token.used) {
        result.push(token);
      }
    }
    return result;
  }

  private getStats() {
    const now = new Date();
    let total = 0;
    let active = 0;
    let expired = 0;
    let used = 0;

    for (const token of this.tokens.values()) {
      total++;
      if (token.used) {
        used++;
      } else if (now > token.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return { total, active, expired, used };
  }

  private createRandomToken(): string {
    return Math.random().toString(36).slice(2) +
           Math.random().toString(36).slice(2) +
           Math.random().toString(36).slice(2);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Token Server running on http://localhost:${this.port}`);
      console.log('\nEndpoints:');
      console.log('  POST   /generate-token - Generate a new token');
      console.log('  POST   /validate-token - Validate a token');
      console.log('  POST   /use-token      - Use/consume a token');
      console.log('  POST   /revoke-token   - Revoke a token');
      console.log('  GET    /user-tokens/:userId - Get user tokens');
      console.log('  GET    /stats          - Get system statistics');
    });
  }
}

// Start server
const server = new TokenServer();
server.start();
