import {
  decimal,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { orderStatusEnum, paymentMethodEnum, paymentStatusEnum, productTypeEnum } from './enums';
import { farmers } from './farmers';

/** Orders — fertilizer, seed, spray purchases */
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'restrict' }),
    orderNumber: varchar('order_number', { length: 30 }).notNull().unique(),
    status: orderStatusEnum('status').notNull().default('pending'),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    shippingAddress: jsonb('shipping_address').$type<Record<string, unknown>>(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('orders_farmer_idx').on(t.farmerId),
    index('orders_status_idx').on(t.status),
    index('orders_created_idx').on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productType: productTypeEnum('product_type').notNull(),
    productName: varchar('product_name', { length: 160 }).notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 30 }).notNull().default('unit'),
    unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
);

/** Payments — linked to orders */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    method: paymentMethodEnum('method').notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    transactionId: varchar('transaction_id', { length: 120 }),
    gatewayResponse: jsonb('gateway_response').$type<Record<string, unknown>>(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('payments_order_idx').on(t.orderId),
    index('payments_farmer_idx').on(t.farmerId),
    index('payments_status_idx').on(t.status),
  ],
);
