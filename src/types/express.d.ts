declare global {
  namespace Express { interface Request { user?: { id: string; role: 'customer'|'partner'|'admin' } } }
}
export {};
