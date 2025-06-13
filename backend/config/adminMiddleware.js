export const isAdmin = (req, res, next) => {
    // Middleware này chạy SAU authenticateToken, nên chúng ta sẽ có req.user
    if (!req.user) {
      return res.status(403).json({ message: "Forbidden: User not authenticated." });
    }
  
    // KIỂM TRA QUYỀN ADMIN
    // Cách 1: User có vai trò là 'admin' trong database.
    const hasAdminRole = req.user.role === 'admin';
  
    // Cách 2: Email của user khớp với email admin trong file .env của backend.
    const isSuperAdminByEmail = req.user.email === process.env.ADMIN_EMAIL;
  
    // Nếu user thỏa mãn MỘT TRONG HAI điều kiện thì được đi tiếp
    if (hasAdminRole || isSuperAdminByEmail) {
      next(); 
    } else {
      // Nếu không phải admin, trả về lỗi 403
      res.status(403).json({ message: "Forbidden: You do not have administrative privileges." });
    }
  };