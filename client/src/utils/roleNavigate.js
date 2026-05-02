export const getRolePath = (role) => {
  switch (role) {
    case "admin":    return "/admin/dashboard";
    case "employer": return "/employer/dashboard";
    case "worker":   return "/worker/dashboard";
    default:         return "/login";
  }
};