export const ENDPOINTS = {
  Auth: {
    Signin: "/auth/signin",
    Signup: "/auth/signup",
    VerifyEmail: "/auth/verify-email",
    ResendCode: "/auth/resend-code",
    ForgotPassword: "/auth/forgot-password",
    ResetPassword: "/auth/reset-password",
    RefreshToken: "/auth/refresh",
  },
  Products:{
    Perfume: {
      Base: "/perfume",
      GetAll: "/perfume",
      GetById: (id: string) => `/perfume/${id}`,
      Create: "/perfume",
      Update: (id: string) => `/perfume/${id}`,
      Delete: (id: string) => `/perfume/${id}`,
    },
  },
  Notifications: {
    Base: "/notifications",
    MarkAsRead: (id: string) => `/notifications/${id}/read`,
  },
  User: {
    Profile: "/user/profile",
  },
  Admin: {
    Users: "/admin/users",
    MakeAdmin: (id: string) => `/admin/users/${id}/make-admin`,
    RevokeAdmin: (id: string) => `/admin/users/${id}/revoke-admin`,
    Suspend: (id: string) => `/admin/users/${id}/suspend`,
    Unsuspend: (id: string) => `/admin/users/${id}/unsuspend`,
  },
};
