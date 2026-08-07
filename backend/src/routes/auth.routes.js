import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const token = jwt.sign(
    {
      id: 1,
      email,
      role: 'admin',
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: { id: 1, email, role: 'admin' },
    },
  });
});

export default router;
