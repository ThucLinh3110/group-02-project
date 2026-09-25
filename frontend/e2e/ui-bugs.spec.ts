import { expect, test } from '@playwright/test';

// TC-166: Kiểm tra UI Chat - Tin nhắn của mình nằm bên phải, người khác nằm bên trái
test('TC-166: UI Chat renders sender messages on the right and receiver on the left', async ({ page }) => {
  // Mock login as Customer
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'customer-token', role: 'Employee', full_name: 'Customer 1' }),
    });
  });

  // Mock Ticket Details API
  await page.route('**/api/tickets/1', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        ticket_code: 'INC-123',
        title: 'Lỗi mạng',
        description: 'Mạng bị rớt',
        status: 'New',
        priority: 'High',
        category: 'Network',
        created_at: new Date().toISOString(),
        messages: [
          {
            id: 1,
            ticket_id: 1,
            sender_id: 'emp_1',
            sender_name: 'Customer 1',
            role: 'Employee', // MessageRole.EMPLOYEE (Customer)
            content: 'Giúp tôi với',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            ticket_id: 1,
            sender_id: 'agent_1',
            sender_name: 'IT Support',
            role: 'Agent', // MessageRole.AGENT
            content: 'Bạn khởi động lại router nhé',
            created_at: new Date().toISOString()
          }
        ]
      }),
    });
  });

  // Execute
  await page.goto('/login');
  await page.locator('input[type="text"]').fill('customer');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  
  await page.goto('/tickets/1');
  
  // Verify UI rendering logic (Customer's view)
  const messageRows = page.locator('.flex.gap-3.max-w-\\[85\\%\\]');
  
  // First message (from Customer) should be aligned right (flex-row-reverse)
  const firstMsgClass = await messageRows.nth(0).getAttribute('class');
  expect(firstMsgClass).toContain('flex-row-reverse');
  
  // Second message (from Agent) should be aligned left (NOT flex-row-reverse)
  const secondMsgClass = await messageRows.nth(1).getAttribute('class');
  expect(secondMsgClass).not.toContain('flex-row-reverse');
});


// TC-167: Kiểm tra tab All Tickets trên Dashboard có hiển thị vé Done
test('TC-167: Dashboard All Tickets filter shows Closed and Resolved tickets', async ({ page }) => {
  // Mock login as Agent
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'agent-token', role: 'Agent', full_name: 'IT Admin' }),
    });
  });

  // Mock Dashboard Metrics
  await page.route('**/api/dashboard/sla-metrics', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // Mock Ticket List API with a Closed ticket
  await page.route('**/api/tickets', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 99,
          ticket_code: 'INC-099',
          title: 'Ticket đã xử lý xong',
          status: 'Closed',
          priority: 'Medium',
          created_at: new Date().toISOString()
        },
        {
          id: 100,
          ticket_code: 'INC-100',
          title: 'Ticket đang mở',
          status: 'New',
          priority: 'High',
          created_at: new Date().toISOString()
        }
      ]),
    });
  });

  // Execute
  await page.goto('/login');
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  
  await expect(page).toHaveURL(/\/$/); // Dashboard

  // Click on "All Tickets" tab (It's already default, but click to be sure if needed)
  await page.getByRole('button', { name: 'All Tickets' }).click();

  // Verify that the Closed ticket is visible in the table
  await expect(page.getByText('Ticket đã xử lý xong')).toBeVisible();
  await expect(page.getByText('Ticket đang mở')).toBeVisible();
});
