// Token System - 67 Lines

interface TokenData {
  id: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

class TokenSystem {
  private tokens: Map<string, TokenData> = new Map();

  /**
   * Generate a new token
   */
  generateToken(expiresInHours: number = 1): string {
    const id = Math.random().toString(36).slice(2, 11);
    const value = this.createTokenValue();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 3600000);

    const tokenData: TokenData = {
      id,
      value,
      createdAt: now,
      expiresAt,
      used: false,
    };

    this.tokens.set(id, tokenData);
    return value;
  }

  /**
   * Validate token
   */
  validateToken(tokenValue: string): boolean {
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

  /**
   * Use token (mark as used)
   */
  useToken(tokenValue: string): boolean {
    for (const token of this.tokens.values()) {
      if (token.value === tokenValue && !token.used) {
        token.used = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Revoke token
   */
  revokeToken(tokenValue: string): boolean {
    for (const [id, token] of this.tokens.entries()) {
      if (token.value === tokenValue) {
        this.tokens.delete(id);
        return true;
      }
    }
    return false;
  }

  /**
   * Get active tokens count
   */
  getActiveTokensCount(): number {
    let count = 0;
    const now = new Date();
    for (const token of this.tokens.values()) {
      if (!token.used && now < token.expiresAt) {
        count++;
      }
    }
    return count;
  }

  /**
   * Create random token value
   */
  private createTokenValue(): string {
    return Math.random().toString(36).slice(2) + 
           Math.random().toString(36).slice(2);
  }
}

// Usage
const system = new TokenSystem();
const token = system.generateToken(2);
console.log('Token:', token);
console.log('Valid:', system.validateToken(token));
console.log('Active:', system.getActiveTokensCount());
