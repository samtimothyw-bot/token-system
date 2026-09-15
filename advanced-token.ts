// Advanced Token System with More Features

interface TokenData {
  id: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  userId?: string;
  scope?: string[];
  metadata?: Record<string, any>;
}

interface TokenStats {
  total: number;
  active: number;
  expired: number;
  used: number;
}

class AdvancedTokenSystem {
  private tokens: Map<string, TokenData> = new Map();
  private tokenHistory: TokenData[] = [];
  private blacklist: Set<string> = new Set();

  /**
   * Generate a new token with metadata
   */
  generateToken(
    expiresInHours: number = 1,
    userId?: string,
    scope?: string[],
    metadata?: Record<string, any>
  ): string {
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
      userId,
      scope: scope || [],
      metadata: metadata || {},
    };

    this.tokens.set(id, tokenData);
    return value;
  }

  /**
   * Validate token
   */
  validateToken(tokenValue: string, requiredScope?: string): boolean {
    for (const token of this.tokens.values()) {
      if (token.value === tokenValue && !token.used && !this.blacklist.has(tokenValue)) {
        const now = new Date();
        if (now < token.expiresAt) {
          if (requiredScope && token.scope && !token.scope.includes(requiredScope)) {
            return false;
          }
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
        this.tokenHistory.push({ ...token });
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
        this.blacklist.add(tokenValue);
        return true;
      }
    }
    return false;
  }

  /**
   * Get token by value
   */
  getToken(tokenValue: string): TokenData | null {
    for (const token of this.tokens.values()) {
      if (token.value === tokenValue) {
        return token;
      }
    }
    return null;
  }

  /**
   * Get tokens by user ID
   */
  getTokensByUser(userId: string): TokenData[] {
    const result: TokenData[] = [];
    for (const token of this.tokens.values()) {
      if (token.userId === userId && !token.used) {
        result.push(token);
      }
    }
    return result;
  }

  /**
   * Revoke all tokens for a user
   */
  revokeUserTokens(userId: string): number {
    let count = 0;
    for (const [id, token] of this.tokens.entries()) {
      if (token.userId === userId) {
        this.tokens.delete(id);
        this.blacklist.add(token.value);
        count++;
      }
    }
    return count;
  }

  /**
   * Get active tokens count
   */
  getActiveTokensCount(): number {
    let count = 0;
    const now = new Date();
    for (const token of this.tokens.values()) {
      if (!token.used && now < token.expiresAt && !this.blacklist.has(token.value)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get token statistics
   */
  getStats(): TokenStats {
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
      } else if (!this.blacklist.has(token.value)) {
        active++;
      }
    }

    return { total, active, expired, used };
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens(): number {
    let count = 0;
    const now = new Date();
    for (const [id, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        this.tokens.delete(id);
        count++;
      }
    }
    return count;
  }

  /**
   * Get token history
   */
  getTokenHistory(): TokenData[] {
    return [...this.tokenHistory];
  }

  /**
   * Verify token scope
   */
  hasScope(tokenValue: string, requiredScopes: string[]): boolean {
    const token = this.getToken(tokenValue);
    if (!token || !token.scope) return false;
    return requiredScopes.every(scope => token.scope!.includes(scope));
  }

  /**
   * Create random token value
   */
  private createTokenValue(): string {
    return Math.random().toString(36).slice(2) +
           Math.random().toString(36).slice(2) +
           Math.random().toString(36).slice(2);
  }
}

// Usage Examples
const system = new AdvancedTokenSystem();

// Generate tokens with metadata
const adminToken = system.generateToken(2, 'user123', ['read', 'write', 'admin'], { role: 'admin' });
const userToken = system.generateToken(1, 'user456', ['read'], { role: 'user' });

console.log('=== Token System Demo ===');
console.log('Admin Token:', adminToken);
console.log('User Token:', userToken);

// Validate tokens
console.log('\n=== Validation ===');
console.log('Admin Valid:', system.validateToken(adminToken));
console.log('User Valid:', system.validateToken(userToken));

// Check scopes
console.log('\n=== Scope Checking ===');
console.log('Admin has write scope:', system.hasScope(adminToken, ['write']));
console.log('User has write scope:', system.hasScope(userToken, ['write']));

// Get user tokens
console.log('\n=== User Tokens ===');
console.log('User123 tokens:', system.getTokensByUser('user123').length);

// Get statistics
console.log('\n=== Statistics ===');
console.log('Token Stats:', system.getStats());

// Use token
system.useToken(userToken);
console.log('After using user token:', system.getStats());

// Cleanup
console.log('\n=== Cleanup ===');
console.log('Cleaned up:', system.cleanupExpiredTokens(), 'expired tokens');
