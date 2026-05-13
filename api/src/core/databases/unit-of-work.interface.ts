declare const databaseTransactionBrand: unique symbol;

export interface DatabaseTransaction {
  readonly [databaseTransactionBrand]: 'DatabaseTransaction';
}

export interface UnitOfWork {
  execute<T>(fn: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
}
