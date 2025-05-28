export const ENDPOINTS = {
  Auth: {
    Signin: "/auth/signin",
    Signup: "/auth/signup",
    VerifyEmail: "/auth/verify-email",
    ResendCode: "/auth/resend-code",
    ForgotPassword: "/auth/forgot-password",
    ResetPassword: "/auth/reset-password",
    RefreshToken: "/auth/refresh-token",
    Me: "/auth/me", // Get current user
  },

  Products: {
    GetAll: "/user/products", // supports filters
    GetAllAdmin: "/admin/products",
    GetByIdAdmin: (id: string) => `/admin/product/${id}`,
    Perfume: {
      Base: "/perfumes",
      GetAll: "/perfumes",
      GetById: (id: string) => `/perfumes/${id}`,
      GetMen: "/perfumes/men",
      GetWomen: "/perfumes/women",
      Create: "/admin/perfumes",
      Update: (id: string) => `/admin/perfumes/${id}`,
      Delete: (id: string) => `/admin/perfumes/${id}`,
    },
    Sample: {
      Base: "/samples",
      GetAll: "/samples",
      GetById: (id: string) => `/samples/${id}`,
      GetMen: "/samples/men",
      GetWomen: "/samples/women",
      Create: "/admin/samples",
      Update: (id: string) => `/admin/samples/${id}`,
      Delete: (id: string) => `/admin/samples/${id}`,
    },
  },

  Cart: {
    Base: "/cart",
    AddItem: "/cart/add",
    UpdateItem: (itemId: string) => `/cart/update/${itemId}`,
    RemoveItem: (itemId: string) => `/cart/remove/${itemId}`,
    Clear: "/cart/clear",
  },

  Orders: {
    UserOrders: "/orders",
    GetById: (orderId: string) => `/orders/${orderId}`,
    PlaceOrder: "/orders",
    AdminAll: "/admin/orders",
    UpdateStatus: (orderId: string) => `/admin/orders/${orderId}/status`,
    OrderDetails: (orderId: string) => `/admin/orders/${orderId}/status`,
    DeleteOrder: (orderId: string) => `/admin/orders/${orderId}`,
  },

  Notifications: {
    Base: "/notifications",
    MarkAsRead: (id: string) => `/notifications/${id}/read`,
  },

  User: {
    Profile: "/user/profile",
    UpdateProfile: "/user/profile",
    Survey: "/survey",
  },

  Admin: {
    Users: "/admin/users",
    ChangeRole: (id: string) => `/admin/users/${id}/role`,
    MakeAdmin: (id: string) => `/admin/users/${id}/make-admin`,
    RevokeAdmin: (id: string) => `/admin/users/${id}/revoke-admin`,
    Suspend: (id: string) => `/admin/users/${id}/suspend`,
    Unsuspend: (id: string) => `/admin/users/${id}/unsuspend`,
  },

  Homepage: {
    Get: "/homepage",
    Collections: {
      GetAll: "/collections",
      GetById: (id: string) => `/collections/${id}`,
      Create: "/collections",
      Update: (id: string) => `/collections/${id}`,
      Delete: (id: string) => `/collections/${id}`,
    },
    Testimonials: {
      GetAll: "/testimonials",
      GetById: (id: string) => `/testimonials/${id}`,
      Create: "/testimonials",
      Update: (id: string) => `/testimonials/${id}`,
      Delete: (id: string) => `/testimonials/${id}`,
    },
  },

  Feedbacks: {
    GetAll: "/admin/feedbacks",
    Upload: "/admin/feedbacks",
    Delete: (id: string) => `/admin/feedbacks/${id}`,
  },

  Upload: {
    Image: "/upload",
  },
};
