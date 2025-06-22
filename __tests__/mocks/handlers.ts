import { http, HttpResponse } from 'msw'

// Mock Kinde API responses
export const handlers = [
  // Mock Kinde authentication endpoints
  http.get('*/oauth2/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
    })
  }),

  http.post('*/oauth2/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
    })
  }),

  // Mock Kinde user management endpoints
  http.get('*/api/v1/users/:userId', ({ params }) => {
    const { userId } = params
    return HttpResponse.json({
      id: userId,
      email: 'test@vetfamily.com',
      given_name: 'Test',
      family_name: 'User',
      profile: {
        given_name: 'Test',
        family_name: 'User',
      },
      identities: [
        {
          type: 'email',
          details: {
            email: 'test@vetfamily.com',
          },
        },
      ],
    })
  }),

  http.post('*/api/v1/users', () => {
    return HttpResponse.json({
      id: 'new-user-id',
      email: 'newuser@vetfamily.com',
      given_name: 'New',
      family_name: 'User',
      created_on: new Date().toISOString(),
    }, { status: 201 })
  }),

  http.delete('*/api/v1/users/:userId', () => {
    return HttpResponse.json({
      message: 'User deleted successfully',
    })
  }),

  http.post('*/api/v1/users/:userId/invite', () => {
    return HttpResponse.json({
      message: 'Invitation sent successfully',
    })
  }),

  // Mock external payment processing
  http.post('*/api/payments/process', () => {
    return HttpResponse.json({
      transaction_id: 'mock-transaction-123',
      status: 'completed',
      amount: 150.00,
      currency: 'USD',
    })
  }),

  // Mock email service
  http.post('*/api/v3/mail/send', () => {
    return HttpResponse.json({
      message_id: 'mock-email-id-123',
    })
  }),

  // Mock SMS service
  http.post('*/api/sms/send', () => {
    return HttpResponse.json({
      message_id: 'mock-sms-id-123',
      status: 'sent',
    })
  }),

  // Mock external inventory supplier API
  http.get('*/api/inventory/suppliers', () => {
    return HttpResponse.json([
      {
        id: 'supplier-1',
        name: 'VetSupply Co',
        contact: 'contact@vetsupply.com',
        products: [
          {
            id: 'product-1',
            name: 'Dog Vaccination',
            price: 25.99,
            stock: 100,
          },
        ],
      },
    ])
  }),

  // Mock lab results API
  http.get('*/api/lab/results/:testId', ({ params }) => {
    const { testId } = params
    return HttpResponse.json({
      test_id: testId,
      patient_id: 'pet-123',
      results: {
        blood_count: 'normal',
        glucose: '95 mg/dL',
        protein: '6.8 g/dL',
      },
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
  }),

  // Mock error scenarios
  http.get('*/api/error/500', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('*/api/error/401', () => {
    return HttpResponse.json({
      error: 'Unauthorized',
      message: 'Invalid credentials',
    }, { status: 401 })
  }),

  http.get('*/api/error/timeout', () => {
    return new Promise(() => {
      // Never resolves, simulating timeout
    })
  }),
]

export default handlers 