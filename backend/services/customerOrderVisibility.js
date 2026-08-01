const CUSTOMER_ORDER_RETENTION_DAYS = 3;
const CUSTOMER_ORDER_RETENTION_MS = CUSTOMER_ORDER_RETENTION_DAYS * 24 * 60 * 60 * 1000;

// This clause is intentionally server-controlled. Customers cannot increase
// the retention window with a query parameter, while admin routes remain
// unaffected for fulfilment, payment, refund and accounting requirements.
const CUSTOMER_ORDER_VISIBILITY_CLAUSE = `
  o.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${CUSTOMER_ORDER_RETENTION_DAYS} DAY)
`;

const isOrderVisibleToCustomer = (createdAt, now = new Date()) => {
  const createdTime = new Date(createdAt).getTime();
  const nowTime = new Date(now).getTime();
  if (!Number.isFinite(createdTime) || !Number.isFinite(nowTime)) return false;
  const age = nowTime - createdTime;
  return age >= 0 && age <= CUSTOMER_ORDER_RETENTION_MS;
};

module.exports = {
  CUSTOMER_ORDER_RETENTION_DAYS,
  CUSTOMER_ORDER_VISIBILITY_CLAUSE,
  isOrderVisibleToCustomer,
};
